<template>
  <div>
    <PageHeader :title="t('publicIp.publicIp')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" :area-disabled="isFirst" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box" :body-style="bodyStyle" style="overflow: visible">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <el-button v-if="checkPermission(permMap.eip.CREATE_EIP)" type="primary" @click="changeShow(setBuyRef)">
              {{ t('publicIp.apply') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.eip.RELEASE_EIP)"
              :disabled="releaseBtnType"
              type=""
              @click="changeShow(setReleaseRef)"
            >
              {{ t('publicIp.release') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.eip.MODIFY_EIP_RENEW_FLAG)"
              :disabled="autoRenewFlag"
              type=""
              @click="setAutoRenew()"
            >
              {{ t('publicIp.setAutoRenew') }}
            </el-button>
          </div>
          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('publicIp.placeholder')"
              :filter-list="filterList"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" :disabled="state.loading" @click="refreshFn">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table
          ref="EIPTable"
          v-loading="state.loading"
          :data="state.list"
          class="mt20 table"
          @selection-change="handleRowSelectChange"
          @row-click="row => console.log(row)"
        >
          <el-table-column type="selection" width="40" />
          <!-- ID 名称 -->
          <el-table-column min-width="210" :label="t('publicIp.idOrName')">
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary">
                  <Copy :text="row.eipUuid" />
                </div>
                <div class="df ac">
                  <el-tooltip effect="light" :content="row.name" placement="top">
                    <div class="editNameBox">
                      {{ row.name }}
                    </div>
                  </el-tooltip>
                  <SvgIcon name="edit" style="cursor: pointer" @click="editRowNameFn(row)" />
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 监控 -->
          <el-table-column min-width="140" :label="t('publicIp.monitor')">
            <template #default="{ row }">
              <div class="text-primary cursor-pointer" @click="viewMonitor(row)">
                {{ t('publicIp.viewMonitoring') }}
              </div>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column min-width="140" :label="t('publicIp.state')">
            <template #header>
              <TableHeadFilter
                ref="tableHeadFilterRef"
                v-model="state.status"
                :label="t('publicIp.state')"
                show-all
                :list="typeList"
                @update:model-value="tableFilter"
              />
            </template>
            <template #default="{ row }">
              <div class="df ac">
                <span>{{ typeList.find(item => item.value === row.state)?.label }}</span>
                <SvgIcon v-if="row.loadingState" class="ml4" name="loading" />
              </div>
            </template>
          </el-table-column>
          <!-- 公网IP地址 -->
          <el-table-column min-width="200" :label="t('publicIp.eipArea')">
            <template #default="{ row }">
              <Copy :text="row.eip" />
            </template>
          </el-table-column>
          <!-- 计费模式 -->
          <el-table-column
            :min-width="chargeTypeClass"
            :label="t('publicIp.chargeType')"
            class-name="chargeTypeColumn"
            :show-overflow-tooltip="false"
          >
            <template #default="{ row }">
              <el-badge v-if="row?.renewFlag === 2" :value="t('publicIp.renewBadeg')" class="item" type="warning">
                <div class="changeTypeText">
                  {{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}
                </div>
              </el-badge>
              <div v-else class="changeTypeText">
                {{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}
              </div>
            </template>
          </el-table-column>
          <!-- 带宽上限 -->
          <el-table-column v-if="state.showEipBandwidth" min-width="160" :label="t('publicIp.bandwidthLimit')">
            <template #default="{ row }">
              <div>{{ row.size }} Mbps</div>
            </template>
          </el-table-column>
          <!-- 绑定资源 -->
          <el-table-column min-width="330" :label="t('publicIp.bindResources')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div v-if="row.bindInstanceType === 1 && row.insUuid">
                  <div class="text-primary cursor-pointer">
                    <Copy :text="row.insUuid" @handle-click="goExample(row.insId, row.insUuid, row.insName)" />
                  </div>
                  <div class="text-over">
                    {{ row.insName }}
                  </div>
                </div>
                <div v-else-if="row.bindInstanceType === 2 && row.insUuid">
                  <div class="text-primary cursor-pointer">
                    <Copy :text="row.insUuid" @handle-click="goNetworkCard(row.eniId, row.insUuid)" />
                  </div>
                  <div class="text-over">
                    {{ row.insName }}
                  </div>
                </div>
                <div v-else>-</div>
              </div>
            </template>
          </el-table-column>
          <!-- 线路类型 -->
          <el-table-column min-width="160" :label="t('publicIp.lineType')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ lineTypeList.find(item => item.value === row.lineType)?.label }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 申请时间 -->
          <el-table-column min-width="220" :label="t('publicIp.applyTime')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('publicIp.applyTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row?.createTime ? maoYunDayJs(row?.createTime).format(FORMAT_TIME) : '-' }}</div>
            </template>
          </el-table-column>
          <!-- 过期时间 **仅当为包年包月才生效-->
          <el-table-column min-width="220" :label="t('publicIp.deadlineTime')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('publicIp.deadlineTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>
                {{
                  row?.deadlineTime && row.chargeType === 2
                    ? row?.deadlineTime
                      ? maoYunDayJs(row?.deadlineTime).format(FORMAT_TIME)
                      : ''
                    : '-'
                }}
              </div>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column :min-width="operateClass" :label="t('publicIp.operate')" fixed="right">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 创建中和释放中或者共享流量包类型的禁用调整网络 -->
                <span
                  v-if="checkPermission(permMap.eip.UPDATE_EIP)"
                  class="text-primary cursor-pointer mr20"
                  :class="[1, 6].includes(row.state) || row.chargeType === 3 ? 'disabled-btn' : ''"
                  @click="[1, 6].includes(row.state) || row.chargeType === 3 ? () => {} : adjustmentNetwork(row)"
                  >{{ t('publicIp.adjustmentNetwork') }}</span
                >
                <div v-if="PUBLIC_IP_MORE_OPTS.filter(i => checkPermission(i.perm))?.length > 0" style="width: 130px">
                  <el-select
                    class="select-tr"
                    :placeholder="t('flowPacket.more')"
                    suffix-icon=""
                    @change="
                      v => {
                        handleOperatechange(v, row)
                      }
                    "
                  >
                    <template v-for="item in PUBLIC_IP_MORE_OPTS">
                      <el-option
                        v-if="checkPermission(item.perm) ? (item?.hasFn ? item.hasFn(row) : true) : false"
                        :key="item.value"
                        :value="item"
                        :label="item.label"
                        :disabled="item?.disabledFn && item.disabledFn(row)"
                      />
                    </template>
                  </el-select>
                </div>
                <!-- 解绑 -->
                <!-- <span v-if="row.state === 4" class="text-primary cursor-pointer mr20" @click="unbindFn(row)">{{
                  t('publicIp.unbind')
                }}</span> -->
                <!-- 绑定 -->
                <!-- <span v-if="row.state === 2" class="text-primary cursor-pointer mr20" @click="bindFn(row)">{{
                  t('publicIp.bind')
                }}</span> -->
                <!-- 续费 -->
                <!-- <span class="text-primary cursor-pointer mr20" v-if="row.chargeType === 2" @click="renewFn(row)">{{
                  t('publicIp.renew')
                }}</span> -->
                <!-- 释放 -->
                <!-- <span
                  class="text-primary cursor-pointer"
                  :class="row.state !== 2 ? 'disabled-btn' : ''"
                  @click="row.state !== 2 ? () => {} : releaseEIP(row)"
                  >{{ t('publicIp.release') }}</span
                > -->
              </div>
            </template>
          </el-table-column>
        </el-table>

        <CatPagination
          v-model:pagination="paginationConfig.pagination"
          :total="paginationConfig.total"
          :custom-keys="['page', 'pageSize']"
          @change="paginationChange"
        />
      </el-card>
    </div>

    <!-- 调整带宽 -->
    <SetAdjustingBroadband ref="setAdjustingBroadbandRef" @success="refreshLoadingList(false)" />
    <!-- 绑定实例 -->
    <SetBindResources ref="setBindResourcesRef" :region-id="area.id" @success="refreshLoadingList(false)" />
    <!-- 解绑实例 -->
    <SetUnbind ref="setUnbindRef" @success="refreshLoadingList(false)" />
    <!-- 确定释放所选弹性公网IP？ -->
    <SetRelease
      ref="setReleaseRef"
      :list="state.selectList"
      @success="refreshLoadingList(false)"
      @close="closeCallBack"
    />
    <!-- 购买弹性公网IP -->
    <SetBuy ref="setBuyRef" :use-num="state.useNum" :max-num="state.maxNum" @success="getList" />
    <!-- 续费 -->
    <SetRenew ref="setRenewRef" />
    <!-- 监控 -->
    <ViewMonitoring
      v-if="state.ViewMonitoringShow"
      ref="viewMonitoringRef"
      v-model:show="state.ViewMonitoringShow"
      :detail-id="state.ViewMonitoringDetailId"
    />
    <!-- 设置自动续费 -->
    <EIPAutoRenew ref="EIPAutoRenewRef" :ins-list="state.selectList" @success="refreshLoadingList(false)" />
    <!-- 修改弹性公网IP名称 -->
    <EditEipName ref="editEipNameRef" :list="state.selectList" @success="getList()" @close="closeCallBack" />
    <!-- 申请变更计费模式 -->
    <ApplyChange ref="applyChangeRef" />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useTempStore } from '@/store'
import { useCvmStore } from '@/store'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import SetBindResources from './components/set-bind-resources/index.vue'
import SetAdjustingBroadband from './components/set-adjusting-broadband/index.vue'
import SetUnbind from './components/set-unbind/index.vue'
import SetRelease from './components/set-release/index.vue'
import EditEipName from './components/edit-eip-name/index.vue'
import SetBuy from './components/set-buy/index.vue'
import SetRenew from './components/set-renew/index.vue'
import ViewMonitoring from './components/view-monitoring/index.vue'
import EIPAutoRenew from './components/eip-auto-renew/index.vue'
import { getIpGroupList, getDefaultConfig, getEipChargeType } from '@/apis/network/public-ip'
import { message } from '@/utils/message'
import { typeList, chargeTypeList, lineTypeList, filterList, PUBLIC_IP_MORE_OPTS, eip_default_states } from './config'

import { IpGroupListType } from '@/apis/network/type/public-ip'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { Table } from 'element-plus'
import ApplyChange from './components/apply-change/index.vue'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { httpUrl } from '@/config/base-config'
import { replaceRoute, pushRoute } from '@/utils/router-jump'
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const operateMap = {
  [ja]: '350',
  [en]: '350',
  [zh]: '240',
}

const chargeTypeMap = {
  [ja]: '320',
  [en]: '320',
  [zh]: '220',
}

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.eip,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
  refreshFn(false)
}

const chargeTypeClass = useI18nStyle(chargeTypeMap)

let isFirst = ref<boolean>(true) // 是否第一次进入

const operateClass = useI18nStyle(operateMap)

const bodyStyle = { height: '100%' }

const router = useRouter()
const route = useRoute()

// 地区
const area = ref<{ id: number; locationId: number }>({ id: 1, locationId: 1 })

const paginationConfig = reactive<IPagination>({
  pagination: { pageSize: 10, page: 1 },
  total: 0,
})

const state = reactive<{
  status: any[] // 列表筛选的状态
  loading: boolean
  list: any[]
  selectList: any[] // 选中的
  useNum: number // 已使用IP个数
  maxNum: number // 最大IP个数
  refreshFnNumber: number // 创建成功后因为要10秒左右列表数据才能更新，所以新建或编辑完成后要间隔4秒刷新列表数据3次
  refreshTimeout: any // 刷新数据的定时器
  ViewMonitoringShow: boolean // 监控侧边弹窗
  ViewMonitoringDetailId: number
  showEipBandwidth: boolean
}>({
  status: [],
  loading: false,
  list: [],
  selectList: [],
  useNum: 0,
  maxNum: 0,
  refreshFnNumber: 4,
  refreshTimeout: null,
  ViewMonitoringShow: false,
  ViewMonitoringDetailId: NaN,
  showEipBandwidth: false, // 是否显示带宽上限
})

// 计算勾选的多列是否符合“释放”要求
const releaseBtnType = computed(() => {
  if (!state.selectList.length) return true
  if (state.selectList.some(i => i.state !== 2)) return true // 有绑定的需要先解绑
  const firstValue = state.selectList[0].chargeType
  return !state.selectList.every(obj => obj.chargeType === firstValue)
})

// 计算勾选的多列是否符合“自动续费”要求
const autoRenewFlag = computed(() => {
  if (!state.selectList.length) return true
  const firstValue = state.selectList[0].renewFlag
  return !state.selectList.every(obj => obj.renewFlag === firstValue && obj.chargeType === 2)
})

const filterInputRef = ref<any>()
const tableHeadFilterRef = ref<any>()
const EIPTable = ref<InstanceType<typeof Table> | null>(null)
const setBindResourcesRef = ref<InstanceType<typeof SetBindResources>>() // 绑定资源
const setAdjustingBroadbandRef = ref<InstanceType<typeof SetAdjustingBroadband>>() // 调整带宽
const setUnbindRef = ref<InstanceType<typeof SetUnbind>>() // 解绑弹性公网IP
const setReleaseRef = ref<InstanceType<typeof SetRelease>>() // 确定释放所选弹性公网IP
const editEipNameRef = ref<InstanceType<typeof EditEipName>>() // 确定释放所选弹性公网IP
const setBuyRef = ref<InstanceType<typeof SetBuy>>() // 购买弹性公网IP
const setRenewRef = ref<InstanceType<typeof SetRenew>>() // 续费
const viewMonitoringRef = ref<InstanceType<typeof ViewMonitoring>>() // 监控
const EIPAutoRenewRef = ref<InstanceType<typeof EIPAutoRenew>>() // 设置自动续费

const { notice, start } = useUpdateResources(
  {
    url: `${httpUrl}/api/vcloudBase/v1/sse/taskState/connect`,
    params: {
      modeType: 9,
    },
    resourcesStateType: 'number',
    resourcesId: 'eipId',
    deleteStateValue: 99,
  },
  toRef(state, 'list'),
  toRef(paginationConfig, 'total'),
)

// 重置
const refresh = () => {
  filterInputRef.value.searchList = []
  getList()
}

// 获取列表数据
const getList = async (search: any = filterInputRef.value?.searchParams || {}) => {
  let params = {
    regionId: cvmStore.areaSelect.id,
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    stateList: eip_default_states,
    ...search,
  } as IpGroupListType
  if (search?.state && search?.state.length > 0) {
    params.stateList = search?.state
  }
  state.loading = true
  notice(9)
  try {
    const res = await getIpGroupList(params)
    state.loading = false
    if (res.success) {
      // 过滤待回收状态
      // state.list = (res.data?.list || []).filter(el => ![7, 8].includes(el.state))
      state.list = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt || 0
    }
  } catch (err) {
    state.loading = false
    console.log('error', err)
  } finally {
    if (isFirst.value) isFirst.value = false // 第一次进来不用根据地域查询
  }
}

// 搜索的方法
const searchFn = search => {
  console.log(search, 'search')
  paginationConfig.pagination.page = 1
  // 搜索框可用区搜索项同步到表格的筛选项中
  const item = search?.state
  tableHeadFilterRef.value?.updateCheck(item)
  getList(search)
}

// 刷新的方法
// status: true表示刷新时重新开启SSERequest
const refreshFn = (status = true) => {
  if (status) start()
  paginationConfig.pagination.page = 1
  filterInputRef.value.searchList = []
  tableHeadFilterRef.value?.updateCheck()
}

// 分页
const paginationChange = () => {
  if (!isFirst.value) getList()
}

// 表格筛选
const tableFilter = list => {
  // 表格的筛选项同步到搜索框可用区搜索项中
  const index = filterInputRef.value.searchList.findIndex(item => item.fieldKey === 'state')
  if (index >= 0) {
    const filterItem = filterInputRef.value.searchList.find(item => item.fieldKey === 'state')
    filterInputRef.value.searchList.splice(index, 1, {
      ...filterItem,
      value: list,
      label: typeList.filter(item => list.indexOf(item.value) >= 0).map(item => item.label),
    })
  } else {
    filterInputRef.value.searchList.push({
      fieldName: t('publicIp.state'),
      fieldKey: 'state',
      value: list,
      label: typeList.filter(item => list.indexOf(item.value) >= 0).map(item => item.label),
    })
  }
}

// 获取默认配置
const getDefaultConfigFn = async () => {
  const params = { regionId: cvmStore.areaSelect.id }
  try {
    const res = await getDefaultConfig(params)
    state.maxNum = res.data?.maxNum
    state.useNum = res.data?.useNum
  } catch (err) {
    console.log('error', err)
  }
}

const getInitList = () => {
  state.loading = true
  state.refreshFnNumber--
  if (state.refreshTimeout) {
    clearTimeout(state.refreshTimeout)
    state.refreshTimeout = null
  }
  console.log('state.refreshFnNumber', state.refreshFnNumber)
  if (state.refreshFnNumber < 1) {
    return (state.refreshFnNumber = 4)
  }
  state.refreshTimeout = setTimeout(() => {
    getList()
    getInitList()
  }, 4000)
}

// loading刷新列表 - 更新数据
const refreshLoadingList = (status = true) => {
  state.loading = status
  state.selectList = []
  EIPTable.value.clearSelection()
  // setTimeout(() => {
  if (status) {
    getList()
  }
  // }, 4000)
}

const closeCallBack = () => {
  state.selectList = []
  EIPTable.value.clearSelection()
}

// 跳转实例详情
const goExample = (id, uuid, name) => {
  console.log(uuid)
  pushRoute({
    name: 'ins_detail',
    params: {
      id: uuid,
      uuid,
      name,
    },
  })
}
// 跳转弹性网卡详情
const goNetworkCard = (id, uuid) => {
  pushRoute({
    name: 'network_security_network_card_detail',
    query: {
      id,
      uuid,
    },
  })
}

// 绑定资源
const bindFn = row => {
  console.log('bindFn==>', row)
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).show = true
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).eipId = row.eipId
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).eipUuid = row.eipUuid
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).eipName = row.name
}

// 解绑
const unbindFn = row => {
  console.log('unbindFn==>', row)
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).show = true
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).list = [row]
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).eipId = row.eipId
}

// 调整网络
const adjustmentNetwork = row => {
  console.log('adjustmentNetwork==>', row)
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).show = true
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).detailId = row.eipId
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).enableChangeMonthly =
    row.enableChangeMonthly
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).getEipDetailFn()
}

// 续费
const renewFn = row => {
  console.log('renewFn==>', row)
  ;(setRenewRef.value as InstanceType<typeof SetRenew>).show = true
  ;(setRenewRef.value as InstanceType<typeof SetRenew>).eipId = row.eipId
  ;(setRenewRef.value as InstanceType<typeof SetRenew>).list = [row]
}

// 设置自动续费
const setAutoRenew = () => {
  console.log(state.selectList, 'state.selectList')
  ;(EIPAutoRenewRef.value as InstanceType<typeof EIPAutoRenew>).show = true
}

// 查看监控
const viewMonitor = row => {
  // ;(viewMonitoringRef.value as InstanceType<typeof ViewMonitoring>).show = true
  // ;(viewMonitoringRef.value as InstanceType<typeof ViewMonitoring>).detailId = row.eipId
  state.ViewMonitoringDetailId = row.eipId
  state.ViewMonitoringShow = true

  // ;(viewMonitoringRef.value as InstanceType<typeof ViewMonitoring>).updateChartParams('id', row.eipId)
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  state.selectList = selection
  console.log('state.selectList', state.selectList)
}

// 单个释放EIP
const releaseEIP = row => {
  state.selectList = [row]
  changeShow(setReleaseRef.value)
}
// 批量释放
const changeShow = (ins: any) => {
  if (!ins) return
  if (ins.name === 'SetBuy') getDefaultConfigFn() // 同步Eip数量config
  ins.show = true
}

// 打开修改eip名称
const editRowNameFn = row => {
  state.selectList = [row]
  ;(editEipNameRef.value as unknown as InstanceType<typeof EIPAutoRenew>).show = true
}

// 申请变更计费模式
const applyChangeRef = ref<any>()
const showApplyChange = row => {
  applyChangeRef.value.detailData = row
  applyChangeRef.value.show = true
}

// 更多操作
const handleOperatechange = (v, row) => {
  if (v.value === 'unbind') {
    unbindFn(row)
  } else if (v.value === 'bind') {
    bindFn(row)
  } else if (v.value === 'renew') {
    renewFn(row)
  } else if (v.value === 'release') {
    row.state !== 2 ? () => {} : releaseEIP(row)
  } else if (v.value === 'applyChange') {
    showApplyChange(row)
  }
}

// 更新selected地域信息 - 动态更新state
watch(
  () => area.value,
  () => {
    state.showEipBandwidth = cvmStore.areaSelect?.showEipBandwidth || false
    console.log(cvmStore.areaSelect, '当前地域数据')
  },
)

onMounted(async () => {
  useTempStore().setPageHeader(false)
  getDefaultConfigFn()
  // 订单页面跳转回来后loading延迟刷新
  if (route.query?.refreshLoading === '1') {
    replaceRoute({ name: 'network_security_public_ip_list' }) // 清空路由参数
    state.loading = true
    setTimeout(() => {
      getList()
    }, 4000)
  }
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
:deep(.el-badge__content.is-fixed) {
  right: 0;
}

:deep(.chargeTypeColumn .cell) {
  // .changeTypeText {
  //   max-width: 160px;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  //   white-space: nowrap;
  // }
  overflow: visible;
}

:deep(.el-table .el-tooltip) {
  text-overflow: initial;
}

:deep(.el-badge__content.is-fixed) {
  transform: translateY(0%) translateX(100%);
}

.disabled-btn {
  cursor: not-allowed;
  opacity: 0.5;
}

.editNameBox {
  max-width: 170px;
  margin-right: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table {
  .select-tr {
    margin-left: -12px;

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none !important;

      .el-input__inner {
        &::placeholder {
          color: var(--primary-color) !important;
        }

        color: var(--primary-color) !important;
      }
    }
  }
}
</style>
