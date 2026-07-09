<template>
  <div>
    <PageHeader :title="t('ins.list.ins')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <div class="page-box pd20">
        <div class="df jsb flex-wrap">
          <div class="btn-wrap mr20">
            <!-- 恢复 -->
            <el-button
              v-if="checkPermission(permMap.insRecovery.CVM_RECYCLE_BIN_RECOVER)"
              :disabled="renewConfig.disabled"
              :type="!renewConfig.disabled ? 'primary' : ''"
              class="mb20"
              @click="changeShow(renewRef)"
            >
              {{ t('recovery.common.renew') }}
            </el-button>
          </div>
          <div class="search-wrap df mb20">
            <div>
              <FilterInput
                ref="filterInputRef"
                :placeholder="t('recovery.ins.list.listPh')"
                :filter-list="iptFilterConfig"
                @search="searchFn"
              />
            </div>
            <CdnIconButton class="ml10" @click="refresh">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>
        <el-table
          v-loading="loading"
          :data="list"
          @selection-change="handleRowSelectChange"
          @row-click="row => console.log(row)"
        >
          <el-table-column type="selection" width="40" />
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('ins.list.idName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <el-badge v-if="row.autoRenew" :value="t('disk.list.continue')" class="item" type="warning">
                  <div class="text-primary pointer mr10">
                    <Copy :text="row.insUuid" style="display: inline-block" @handle-click="toDetail(row)" />
                  </div>
                </el-badge>
                <div v-else class="text-primary pointer mr4">
                  <Copy :text="row.insUuid" style="display: inline-block" @handle-click="toDetail(row)" />
                </div>
                <div class="text-over">
                  {{ row.instanceName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 监控 -->
          <el-table-column min-width="140" :label="t('ins.list.monitor')">
            <template #default="{ row }">
              <div class="text-primary pointer" @click="toMonitor(row)">
                {{ t('ins.list.seeMonitor') }}
              </div>
            </template>
          </el-table-column>
          <!-- 状态 -->
          <el-table-column min-width="140" :label="t('ins.list.state')">
            <template #default="{ row }">
              <div class="df ac state-cell">
                <div
                  v-if="getStateInfo(row.state)?.color"
                  class="state-dot"
                  :style="{ background: getStateInfo(row.state)?.color }"
                />
                <EllipsisTooltip class="state-text" :text="getStateInfo(row.state)?.text || '-'" />
                <SvgIcon v-if="row.loadingState" class="ml4" name="loading" />
              </div>
            </template>
          </el-table-column>
          <!-- 可用区 -->
          <el-table-column min-width="150">
            <template #header>
              <TableHeadFilter
                ref="zoneNameThFilterRef"
                v-model="tableFilterConfig.zoneIds.value"
                :label="t('ins.list.zone')"
                tip=""
                :field-key="tableFilterConfig.zoneIds.fieldKey"
                :field-type="tableFilterConfig.zoneIds.fieldType"
                :list="tableFilterConfig.zoneIds.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              {{ row.zoneName }}
            </template>
          </el-table-column>
          <!-- 实例类型 -->
          <el-table-column min-width="160" :label="t('ins.list.insType')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="df ac type-cell">
                  <EllipsisTooltip class="mr10 type-text" :text="row.specificationInfo?.typeName || '-'" />
                  <SvgIcon
                    style="width: 17px; height: 17px"
                    :name="INS_SYS_SVG_MAP[row.imageInfo?.platform]?.actived || ''"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 实例配置 -->
          <el-table-column min-width="200" :label="t('ins.list.config')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ row.specificationInfo?.vcpus }}vCPUs | {{ row.specificationInfo?.ram }}GB |
                  {{ row.specificationInfo?.specificationName }}
                </div>
                <div class="text-over">
                  {{ row.imageInfo?.imageName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 主IPv4地址 -->
          <el-table-column min-width="200" :label="t('ins.list.IPv4')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div v-if="handleRowIp(row).show && handleRowIp(row).mainPublicIp" class="text-over">
                  <!-- <span>{{ handleRowIp(row).mainPublicIp }}</span
                  ><span>{{ t('ins.list.eip') }}</span> -->
                  <TableCopy
                    :show-text="`${handleRowIp(row).mainPublicIp}${t('ins.list.eip')}`"
                    :text="handleRowIp(row).mainPublicIp"
                  />
                </div>
                <div v-if="handleRowIp(row).show && handleRowIp(row).mainPrivateIp" class="text-over">
                  <!-- {{ handleRowIp(row).mainPrivateIp }}<span>{{ t('ins.list.private') }}</span> -->
                  <TableCopy
                    :show-text="`${handleRowIp(row).mainPrivateIp}${t('ins.list.private')}`"
                    :text="handleRowIp(row).mainPrivateIp"
                  />
                </div>
                <span v-if="!handleRowIp(row).show">-</span>
              </div>
            </template>
          </el-table-column>
          <!-- 实例计费模式 -->
          <el-table-column min-width="220" show-overflow-tooltip>
            <template #header>
              <TableHeadFilter
                ref="instanceChargeTypeThFilterRef"
                v-model="tableFilterConfig.instanceCostTypes.value"
                :label="t('ins.list.insCostType')"
                tip=""
                :field-key="tableFilterConfig.instanceCostTypes.fieldKey"
                :field-type="tableFilterConfig.instanceCostTypes.fieldType"
                :list="tableFilterConfig.instanceCostTypes.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ COST_TYPE_MAP[row.instanceChargeType] }}
                </div>
                <RecoveryTimeFormateText
                  :cost-type="row.instanceChargeType"
                  :destruction-time="row.destructionTime || ''"
                  :expires-time="row.expiresTime || ''"
                />
              </div>
            </template>
          </el-table-column>
          <!-- 网络计费模式 -->
          <el-table-column min-width="200" show-overflow-tooltip>
            <template #header>
              <TableHeadFilter
                ref="networkChangeTypeThFilterRef"
                v-model="tableFilterConfig.networkCostTypes.value"
                :label="t('ins.list.netCostType')"
                tip=""
                show-all
                :field-key="tableFilterConfig.networkCostTypes.fieldKey"
                :field-type="tableFilterConfig.networkCostTypes.fieldType"
                :list="tableFilterConfig.networkCostTypes.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              {{ handleRowNetworkChangeType(row) }}
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column fixed="right" :min-width="optsWidth" :label="t('ins.list.opts')">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 恢复 -->
                <DisableText
                  v-if="checkPermission(permMap.insRecovery.CVM_RECYCLE_BIN_RECOVER)"
                  class="mr20"
                  :text="t('recovery.common.renew')"
                  :disabled="!isRenew(row.instanceChargeType, row.state)"
                  @click="singleRenew(row)"
                />
                <!-- 创建自定义镜像 -->
                <DisableText
                  v-if="checkPermission(permMap.insRecovery.CVM_RECYCLE_BIN_CREATE_CUSTOM_IMAGE)"
                  class="mr20"
                  :text="t('ins.config.createCustomImage')"
                  :disabled="isCreateCustomImage(row.state)"
                  @click="singleCreateCustomImage(row)"
                />
                <!-- 释放 -->
                <DisableText
                  v-if="checkPermission(permMap.insRecovery.CVM_RECYCLE_BIN_RELEASE)"
                  :text="t('recovery.common.release')"
                  :disabled="false"
                  @click="singleRelease(row)"
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
    <Renew ref="renewRef" :ins-list="renewConfig.list" @success="listInstanceFn" />
    <!-- 销毁/退还 -->
    <Destruction ref="destructionRef" :ins-list="destructionConfig.list" @success="listInstanceFn" />
    <!-- 创建自定义镜像 -->
    <CreateCustomImage ref="createCustomImageRef" :ins-list="createCustomImageConfig.list" @success="listInstanceFn" />
  </div>
</template>

<script setup lang="ts">
import { useTempStore, useCvmStore } from '@/store'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'

import {
  INS_SYS_SVG_MAP,
  INS_STATE_ARR_MAP,
  INS_NETWORK_CHANGE_TYPE_MAP,
  COST_TYPE_MAP,
  COST_TYPE_FILTER_ARR_MAP,
  INS_NETWORK_CHANGE_TYPE_FILTER_ARR_MAP,
  isRenewBatch,
  isRenew,
  isCreateCustomImage,
  isTimeCostBatch,
} from '@/views/cvm/ins/config'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { AreaSelectType } from '@/store/cvm'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import Renew from './components/renew/index.vue'
import Destruction from './components/destruction/index.vue'
import CreateCustomImage from '@/views/cvm/ins/list/components/create-custom-image/index.vue'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { httpUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'

const defaultTableFilterConfig: TableFilterConfigType = {
  zoneIds: {
    value: [],
    opts: [],
    fieldKey: 'zoneIds',
    fieldType: 'check',
  },
  instanceCostTypes: {
    value: [],
    opts: COST_TYPE_FILTER_ARR_MAP,
    fieldKey: 'instanceCostTypes',
    fieldType: 'check',
  },
  networkCostTypes: {
    value: [],
    opts: INS_NETWORK_CHANGE_TYPE_FILTER_ARR_MAP,
    fieldKey: 'networkCostTypes',
    fieldType: 'check',
  },
  projectName: {
    value: [],
    opts: [],
    fieldKey: 'projectName',
  },
}
const defaultIptFilterConfig = [
  { fieldName: t('ins.list.insId'), fieldKey: 'instanceId' }, // 实例id
  { fieldName: t('ins.list.zone'), fieldKey: 'zoneIds', fieldType: 'check', list: [] }, // 可用区
  {
    fieldName: t('ins.list.insCostType'),
    fieldKey: 'instanceCostTypes',
    fieldType: 'check',
    list: COST_TYPE_FILTER_ARR_MAP,
  }, // 实例计费模式
  {
    fieldName: t('ins.list.netCostType'),
    fieldKey: 'networkCostTypes',
    fieldType: 'check',
    list: INS_NETWORK_CHANGE_TYPE_FILTER_ARR_MAP,
  }, // 网络计费模式
  // { fieldName: t('ins.list.project'), fieldKey: 'projectName' }, // 所属项目
]

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const optsWidthWidthMap = {
  [ja]: 300,
  [en]: 300,
  [zh]: 250,
}

const cvmStore = useCvmStore()
const { handleThSelectFn, handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)
const { listByRegionId } = useBaseConfig()
const { listInstance, loading } = useIns()
const optsWidth = useI18nStyle(optsWidthWidthMap)

// 地区
const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const list = ref<any[]>([{}]) // 列表
const selectList = ref<any>([]) // 选中的
const curSearch = ref<any>({}) // 搜索条件

// 续费配置
const renewConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
}>({
  list: [],
  disabled: true,
  visible: false,
})

//创建自定义镜像
const createCustomImageConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//销毁/退还配置
const destructionConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
}>({
  list: [],
  disabled: true,
  visible: false,
})

const renewRef = ref<InstanceType<typeof Renew>>() // 续费
const createCustomImageRef = ref<InstanceType<typeof CreateCustomImage>>() // 创建自定义镜像
const destructionRef = ref<InstanceType<typeof Destruction>>() // 销毁
const zoneNameThFilterRef = ref<any>()
const instanceChargeTypeThFilterRef = ref<any>()
const networkChangeTypeThFilterRef = ref<any>()
const projectNameThFilterRef = ref<any>()

const { notice, start } = useUpdateResources(
  {
    url: `${httpUrl}/api/vcloudBase/v1/sse/taskState/connect`,
    params: {
      modeType: 1,
    },
    resourcesStateType: 'string',
    deleteStateValue: 'DELETED',
  },
  list,
  toRef(paginationConfig, 'total'),
)

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.insRecovery,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
}

// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  console.log(`searchFn===>`, search)
  curSearch.value = search
  paginationConfig.pagination.page = 1

  zoneNameThFilterRef.value?.updateCheck(search?.zoneIds)
  instanceChargeTypeThFilterRef?.value.updateCheck(search?.instanceCostTypes)
  networkChangeTypeThFilterRef?.value.updateCheck(search?.networkCostTypes)
  projectNameThFilterRef.value?.updateCheck(search?.projectName)
  listInstanceFn(search)
}

// 表格的筛选项同步到搜索框搜索项中
const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  console.log(`tableCheckFilterFn===>`, list, fieldKey)
  if (fieldKey === 'zoneIds') {
    handleThCheckFn(list, 'zoneIds', t('ins.list.zone'))
  }

  if (fieldKey === 'instanceCostTypes') {
    handleThCheckFn(list, 'instanceCostTypes', t('ins.list.insCostType'))
  }
  if (fieldKey === 'networkCostTypes') {
    handleThCheckFn(list, 'networkCostTypes', t('ins.list.netCostType'))
  }
}

// 主内ip地址
const handleRowIp = (row: any) => {
  const res = row.networkInfos?.find(el => el.primaryType === 1) // 主网卡
  const config: any = {
    show: false,
  }
  config.show = res ? true : false
  config.mainPrivateIp = res?.mainPrivateIp
  config.mainPublicIp = res?.mainPublicIp

  return config
}

// 网络计费模式
const handleRowNetworkChangeType = (row: any) => {
  console.log(`handleRowNetworkChangeType===>`, row)

  const networkInfos = row.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1) // 主网卡

  return res?.networkChangeType ? INS_NETWORK_CHANGE_TYPE_MAP[res.networkChangeType] : '-'
}

const getStateInfo = (state: string) => {
  return INS_STATE_ARR_MAP.find(item => item.value === state)
}

const refresh = () => {
  start()
  resetIptFn()
}

// 跳转详情
const toDetail = (row: any) => {
  const id = row.insUuid
  pushRoute({
    name: 'ins_detail',
    params: {
      id,
      uuid: row.insUuid,
      name: row.instanceName,
    },
  })
}

// 跳转实例监控
const toMonitor = (row: any) => {
  const id = row.insUuid

  pushRoute({
    name: 'ins_detail',
    params: {
      id,
      uuid: row.insUuid,
      name: row.instanceName,
    },
    query: {
      active: 6,
    },
  })
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection

  changeRenewConfig()
}

// 单个续费
const singleRenew = (row: any) => {
  renewConfig.list = [row]
  changeShow(renewRef.value)
}

// 释放
const singleRelease = (row: any) => {
  destructionConfig.list = [row]
  changeShow(destructionRef.value)
}

// 创建自定义镜像
const singleCreateCustomImage = (row: any) => {
  createCustomImageConfig.list = [row]
  changeShow(createCustomImageRef.value)
}

// 批量续费
const changeRenewConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    renewConfig.disabled = true
    return
  } else {
    // 勾选
    const res1 = isTimeCostBatch(selectList.value.map(el => el.instanceChargeType))

    if (!res1) {
      renewConfig.disabled = true
      return
    }

    const res2 = isRenewBatch(
      selectList.value.map(el => el.instanceChargeType),
      selectList.value.map(el => el.state),
    )

    if (!res2) {
      renewConfig.disabled = true
      return
    }

    renewConfig.list = selectList.value
    renewConfig.disabled = false
  }
}

// 分页
const paginationChange = () => {
  listInstanceFn()
}

// 处理可用区
const listByRegionIdFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      const zoneList = res.data || []
      const arr = zoneList.map(el => ({
        label: el.zoneName,
        value: el.id,
      }))

      iptFilterConfig.value[1].list = arr
      tableFilterConfig.zoneIds.opts = arr
    }
  }
  const params = {
    regionId: cvmStore.areaSelect.id,
  }
  if (params.regionId) {
    listByRegionId(params, cb)
  }
}

// 分页查询服务器列表
const listInstanceFn = async (search = filterInputRef.value?.searchParams || {}) => {
  const params = {
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    regionId: cvmStore.areaSelect.id,
    states: ['SHUTDOWN'],
    ...search,
  }

  const cb = (res: any) => {
    if (res.success) {
      list.value = res.data?.list || []

      paginationConfig.total = res.data.recordCnt
    }
  }

  notice(1)
  if (params.regionId) {
    listInstance(params, cb)
  }
}

watch(
  () => cvmStore.areaSelect.id,
  () => {
    resetIptFn()
    listInstanceFn()
    listByRegionIdFn()
  },
)

onMounted(() => {
  useTempStore().setPageHeader(false)
  listInstanceFn()
  listByRegionIdFn()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
:deep(.el-badge__content.is-fixed) {
  transform: translateY(0%) translateX(100%);
}

.mr10 {
  margin-right: 10px;
}

.state-cell {
  width: 100%;
}

.state-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  margin-right: 4px;
  border-radius: 50%;
}

:deep(.state-text) {
  flex: 1;
  min-width: 0;
}

.type-cell {
  width: 100%;
}

:deep(.type-text) {
  flex: 1;
  min-width: 0;
}

:deep(.select-input) {
  width: 650px;

  .el-select_content {
    width: 580px;

    .select_tags-list {
      max-width: 480px;
    }
  }
}
</style>
