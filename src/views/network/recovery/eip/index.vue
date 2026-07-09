<template>
  <div>
    <PageHeader :title="t('publicIp.publicIp')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" :area-disabled="isFirst" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <div class="page-box pd20">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <!-- 释放 -->
            <el-button
              v-if="checkPermission(permMap.eip.RELEASE_EIP)"
              :disabled="releaseBtnType"
              type=""
              @click="batchReleaseEIP(setReleaseRef)"
            >
              {{ t('recovery.common.release') }}
            </el-button>
          </div>
          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('recovery.eip.list.listPh')"
              :filter-list="iptFilterConfig"
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
            <template #default="{ row }">
              <div class="df ac">
                <span>{{ recoveryTypeList.find(item => item.value === row.state)?.label }}</span>
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
          <!-- 带宽上限 -->
          <el-table-column min-width="160" :label="t('recovery.eip.list.bandWidthMax')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">{{ row.size }}Mbps</div>
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

          <!-- 计费模式-->
          <el-table-column min-width="220" :label="t('recovery.eip.list.costType')">
            <template #default="{ row }">
              <div>
                {{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}
              </div>
              <RecoveryTimeFormateText
                :cost-type="row.chargeType"
                :destruction-time="row.recycleTime || ''"
                :expires-time="row.deadlineTime || ''"
              />
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column :min-width="operateClass" :label="t('publicIp.operate')" fixed="right">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 恢复 -->
                <DisableText
                  v-if="checkPermission(permMap.eipRecovery.EIP_RECYCLE_BIN_RECOVER)"
                  class="mr20"
                  :disabled="row.chargeType === 1 || [6, 8].includes(row.state)"
                  :text="t('recovery.common.renew')"
                  @click="renewFn(row)"
                />
                <!-- 释放 -->
                <DisableText
                  v-if="checkPermission(permMap.eipRecovery.EIP_RECYCLE_BIN_RELEASE)"
                  class="mr20"
                  :disabled="row.state !== 7"
                  :text="t('recovery.common.release')"
                  @click="singleReleaseEIP(row)"
                />
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
      </div>
    </div>

    <!-- 续费 -->
    <SetRenew ref="setRenewRef" />
    <!-- 确定释放所选弹性公网IP？ -->
    <SetRelease ref="setReleaseRef" :list="state.selectList" @success="refreshLoadingList" @close="closeCallBack" />

    <!-- 监控 -->
    <ViewMonitoring
      v-if="state.ViewMonitoringShow"
      ref="viewMonitoringRef"
      v-model:show="state.ViewMonitoringShow"
      :detail-id="state.ViewMonitoringDetailId"
    />
  </div>
</template>

<script setup lang="ts">
import { useTempStore, useCvmStore } from '@/store'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import ViewMonitoring from '@/views/network/public-ip/list/components/view-monitoring/index.vue'
import { getDefaultConfig, recycleBinEipPage } from '@/apis/network/public-ip'
import { message } from '@/utils/message'
import { recoveryTypeList, chargeTypeList, lineTypeList } from '@/views/network/public-ip/list/config'

import { IpGroupListType } from '@/apis/network/type/public-ip'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import SetRenew from './components/set-renew/index.vue'
import SetRelease from './components/set-release/index.vue'
import { Table } from 'element-plus'
import { useFilter } from '@/components/cvm/query-filter/use-filter'
import { httpUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'
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

const defaultIptFilterConfig = [
  { fieldName: t('publicIp.name'), fieldKey: 'name' },
  { fieldName: 'ID', fieldKey: 'eipUuid' },
  { fieldName: 'IP', fieldKey: 'ip' },
]

const { filterInputRef, iptFilterConfig, resetIptFn } = useFilter({}, defaultIptFilterConfig)

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.eipRecovery,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const chargeTypeClass = useI18nStyle(chargeTypeMap)

let isFirst = ref<boolean>(true) // 是否第一次进入

const operateClass = useI18nStyle(operateMap)

const router = useRouter()

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

const EIPTable = ref<InstanceType<typeof Table> | null>(null)
const setRenewRef = ref<InstanceType<typeof SetRenew>>() // 续费
const setReleaseRef = ref<InstanceType<typeof SetRelease>>() // 确定释放所选弹性公网IP
const viewMonitoringRef = ref<InstanceType<typeof ViewMonitoring>>() // 监控

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

// 续费
const renewFn = row => {
  console.log('renewFn==>', row)
  if (setRenewRef.value) {
    setRenewRef.value.show = true
    setRenewRef.value.eipId = row.eipId
    setRenewRef.value.list = [row]
  }
}

// 单个释放EIP
const singleReleaseEIP = row => {
  state.selectList = [row]
  changeShow(setReleaseRef.value)
}

// 批量释放EIP
const batchReleaseEIP = row => {
  state.selectList = [row]
  changeShow(setReleaseRef.value)
}

// 获取列表数据
const getList = async (search: any = filterInputRef.value?.searchParams || {}) => {
  let params = {
    regionId: cvmStore.areaSelect.id,
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    ...search,
  } as IpGroupListType
  if (search?.state && search?.state.length > 0) {
    params.stateList = search?.state
  }
  state.loading = true
  notice(9)
  try {
    const res = await recycleBinEipPage(params)
    state.loading = false
    if (res.success) {
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
  getList(search)
}

// 刷新的方法
// status: true表示刷新时重新开启SSERequest
const refreshFn = () => {
  start()
  // paginationConfig.pagination.page = 1
  resetIptFn()
}

// 分页
const paginationChange = () => {
  if (!isFirst.value) getList()
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

// loading刷新列表 - 更新数据
const refreshLoadingList = () => {
  state.selectList = []
  EIPTable.value.clearSelection()
  getList()
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

// 查看监控
const viewMonitor = row => {
  state.ViewMonitoringDetailId = row.eipId
  state.ViewMonitoringShow = true
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  state.selectList = selection
  console.log('state.selectList', state.selectList)
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 更新selected地域信息 - 动态更新state
watch(
  () => area.value,
  () => {
    resetIptFn()
    state.showEipBandwidth = cvmStore.areaSelect?.showEipBandwidth || false
    permConfig.regionId = area.value.id
  },
)

onMounted(async () => {
  useTempStore().setPageHeader(false)
  getDefaultConfigFn()
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
