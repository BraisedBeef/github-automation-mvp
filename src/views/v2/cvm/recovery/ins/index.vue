<template>
  <div class="cvm-recovery-ins-v2">
    <PageBreadcrumbToolbar :items="[t('ins.list.ins')]" @doc="openHelpDoc">
      <template #title-extra>
        <div class="cvm-recovery-ins-v2__area">
          <AreaSelect v-model="area" @change-area="changeArea" />
        </div>
      </template>
    </PageBreadcrumbToolbar>

    <section class="cvm-recovery-ins-v2__panel">
      <div class="cvm-recovery-ins-v2__toolbar">
        <div class="cvm-recovery-ins-v2__actions">
          <el-button
            v-if="checkPermission(permMap.insRecovery.CVM_RECYCLE_BIN_RECOVER)"
            :disabled="renewConfig.disabled"
            :type="!renewConfig.disabled ? 'primary' : ''"
            @click="changeShow(renewRef)"
          >
            {{ t('recovery.common.renew') }}
          </el-button>
        </div>

        <div class="cvm-recovery-ins-v2__tools">
          <FilterInput
            ref="filterInputRef"
            class="cvm-recovery-ins-v2__filter"
            :placeholder="t('recovery.ins.list.listPh')"
            :filter-list="iptFilterConfig"
            @search="searchFn"
          />
          <CdnIconButton class="cvm-recovery-ins-v2__icon-btn" @click="refresh">
            <SvgIcon name="refresh" />
          </CdnIconButton>
        </div>
      </div>

      <TableV2
        v-loading="loading"
        :data="list"
        :total="paginationConfig.total"
        :pagination="paginationConfig.pagination"
        :empty-min-height="420"
        show-pagination
        @selection-change="handleRowSelectChange"
        @change="paginationChange"
      >
        <el-table-column type="selection" width="54" />

        <el-table-column min-width="220" :label="t('ins.list.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-recovery-ins-v2__name-cell">
              <el-badge v-if="row.autoRenew" :value="t('disk.list.continue')" type="warning">
                <div class="cvm-recovery-ins-v2__link">
                  <Copy :text="row.insUuid" style="display: inline-block" @handle-click="toDetail(row)" />
                </div>
              </el-badge>
              <div v-else class="cvm-recovery-ins-v2__link">
                <Copy :text="row.insUuid" style="display: inline-block" @handle-click="toDetail(row)" />
              </div>
              <div class="cvm-recovery-ins-v2__subtext">
                {{ row.instanceName || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="t('ins.list.monitor')">
          <template #default="{ row }">
            <div class="cvm-recovery-ins-v2__link" @click="toMonitor(row)">
              {{ t('ins.list.seeMonitor') }}
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="150" :label="t('ins.list.state')">
          <template #default="{ row }">
            <div class="cvm-recovery-ins-v2__status-cell">
              <div
                v-if="getStateInfo(row.state)?.color"
                class="cvm-recovery-ins-v2__state-dot"
                :style="{ background: getStateInfo(row.state)?.color }"
              />
              <EllipsisTooltip class="cvm-recovery-ins-v2__state-text" :text="getStateInfo(row.state)?.text || '-'" />
              <SvgIcon v-if="row.loadingState" class="cvm-recovery-ins-v2__loading-icon" name="loading" />
            </div>
          </template>
        </el-table-column>

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
            {{ row.zoneName || '-' }}
          </template>
        </el-table-column>

        <el-table-column min-width="160" :label="t('ins.list.insType')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-recovery-ins-v2__type-cell">
              <EllipsisTooltip class="cvm-recovery-ins-v2__type-text" :text="row.specificationInfo?.typeName || '-'" />
              <SvgIcon
                style="width: 17px; height: 17px"
                :name="INS_SYS_SVG_MAP[row.imageInfo?.platform]?.actived || ''"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="220" :label="t('ins.list.config')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-recovery-ins-v2__name-cell">
              <div class="cvm-recovery-ins-v2__subtext">
                {{ row.specificationInfo?.vcpus }}vCPUs | {{ row.specificationInfo?.ram }}GB |
                {{ row.specificationInfo?.specificationName }}
              </div>
              <div class="cvm-recovery-ins-v2__subtext">
                {{ row.imageInfo?.imageName || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="220" :label="t('ins.list.IPv4')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-recovery-ins-v2__name-cell">
              <div v-if="handleRowIp(row).show && handleRowIp(row).mainPublicIp" class="cvm-recovery-ins-v2__subtext">
                <TableCopy
                  :show-text="`${handleRowIp(row).mainPublicIp}${t('ins.list.eip')}`"
                  :text="handleRowIp(row).mainPublicIp"
                />
              </div>
              <div v-if="handleRowIp(row).show && handleRowIp(row).mainPrivateIp" class="cvm-recovery-ins-v2__subtext">
                <TableCopy
                  :show-text="`${handleRowIp(row).mainPrivateIp}${t('ins.list.private')}`"
                  :text="handleRowIp(row).mainPrivateIp"
                />
              </div>
              <span v-if="!handleRowIp(row).show">-</span>
            </div>
          </template>
        </el-table-column>

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
            <div class="cvm-recovery-ins-v2__name-cell">
              <div class="cvm-recovery-ins-v2__subtext">
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

        <el-table-column fixed="right" :min-width="optsWidth" :label="t('ins.list.opts')">
          <template #default="{ row }">
            <div class="cvm-recovery-ins-v2__ops">
              <DisableText
                v-if="checkPermission(permMap.insRecovery.CVM_RECYCLE_BIN_RECOVER)"
                :text="t('recovery.common.renew')"
                :disabled="!isRenew(row.instanceChargeType, row.state)"
                disabled-type="hidden"
                @click="singleRenew(row)"
              />
              <DisableText
                v-if="checkPermission(permMap.insRecovery.CVM_RECYCLE_BIN_CREATE_CUSTOM_IMAGE)"
                :text="t('ins.config.createCustomImage')"
                :disabled="isCreateCustomImage(row.state)"
                disabled-type="hidden"
                @click="singleCreateCustomImage(row)"
              />
              <DisableText
                v-if="checkPermission(permMap.insRecovery.CVM_RECYCLE_BIN_RELEASE)"
                :text="t('recovery.common.release')"
                :disabled="false"
                disabled-type="hidden"
                @click="singleRelease(row)"
              />
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <Renew ref="renewRef" :ins-list="renewConfig.list" @success="listInstanceFn" />
    <Destruction ref="destructionRef" :ins-list="destructionConfig.list" @success="listInstanceFn" />
    <CreateCustomImage ref="createCustomImageRef" :ins-list="createCustomImageConfig.list" @success="listInstanceFn" />
  </div>
</template>

<script setup lang="ts">
import { useCvmStore } from '@/store'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
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
import Renew from '@/views/cvm/recovery/ins/components/renew/index.vue'
import Destruction from '@/views/cvm/recovery/ins/components/destruction/index.vue'
import CreateCustomImage from '@/views/cvm/ins/list/components/create-custom-image/index.vue'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { httpUrl, documentUrl } from '@/config/base-config'
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
  { fieldName: t('ins.list.insId'), fieldKey: 'instanceId' },
  { fieldName: t('ins.list.zone'), fieldKey: 'zoneIds', fieldType: 'check', list: [] },
  {
    fieldName: t('ins.list.insCostType'),
    fieldKey: 'instanceCostTypes',
    fieldType: 'check',
    list: COST_TYPE_FILTER_ARR_MAP,
  },
  {
    fieldName: t('ins.list.netCostType'),
    fieldKey: 'networkCostTypes',
    fieldType: 'check',
    list: INS_NETWORK_CHANGE_TYPE_FILTER_ARR_MAP,
  },
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
const { handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)
const { listByRegionId } = useBaseConfig()
const { listInstance, loading } = useIns()
const optsWidth = useI18nStyle(optsWidthWidthMap)

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
const list = ref<any[]>([])
const selectList = ref<any>([])

const renewConfig = reactive<{ list: any[]; disabled: boolean; visible: boolean }>({
  list: [],
  disabled: true,
  visible: false,
})

const createCustomImageConfig = reactive<{ list: any[] }>({
  list: [],
})

const destructionConfig = reactive<{ list: any[]; disabled: boolean; visible: boolean }>({
  list: [],
  disabled: true,
  visible: false,
})

const renewRef = ref<InstanceType<typeof Renew>>()
const createCustomImageRef = ref<InstanceType<typeof CreateCustomImage>>()
const destructionRef = ref<InstanceType<typeof Destruction>>()
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

const permConfig = reactive({
  moduleId: moduleMap.insRecovery,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const changeArea = area => {
  permConfig.regionId = area.id
}

const searchFn = (search: any) => {
  paginationConfig.pagination.page = 1
  zoneNameThFilterRef.value?.updateCheck(search?.zoneIds)
  instanceChargeTypeThFilterRef?.value.updateCheck(search?.instanceCostTypes)
  networkChangeTypeThFilterRef?.value.updateCheck(search?.networkCostTypes)
  projectNameThFilterRef.value?.updateCheck(search?.projectName)
  listInstanceFn(search)
}

const tableCheckFilterFn = (list: any[], fieldKey: string) => {
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

const handleRowIp = (row: any) => {
  const res = row.networkInfos?.find(el => el.primaryType === 1)
  const config: any = { show: false }
  config.show = !!res
  config.mainPrivateIp = res?.mainPrivateIp
  config.mainPublicIp = res?.mainPublicIp
  return config
}

const handleRowNetworkChangeType = (row: any) => {
  const networkInfos = row.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1)
  return res?.networkChangeType ? INS_NETWORK_CHANGE_TYPE_MAP[res.networkChangeType] : '-'
}

const getStateInfo = (state: string) => {
  return INS_STATE_ARR_MAP.find(item => item.value === state)
}

const refresh = () => {
  start()
  resetIptFn()
}

const toDetail = (row: any) => {
  pushRoute({
    name: 'ins_detail',
    params: {
      id: row.insUuid,
      uuid: row.insUuid,
      name: row.instanceName,
    },
  })
}

const toMonitor = (row: any) => {
  pushRoute({
    name: 'ins_detail',
    params: {
      id: row.insUuid,
      uuid: row.insUuid,
      name: row.instanceName,
    },
    query: {
      active: 6,
    },
  })
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const handleRowSelectChange = (selection: any) => {
  selectList.value = selection
  changeRenewConfig()
}

const singleRenew = (row: any) => {
  renewConfig.list = [row]
  changeShow(renewRef.value)
}

const singleRelease = (row: any) => {
  destructionConfig.list = [row]
  changeShow(destructionRef.value)
}

const singleCreateCustomImage = (row: any) => {
  createCustomImageConfig.list = [row]
  changeShow(createCustomImageRef.value)
}

const changeRenewConfig = () => {
  if (!selectList.value.length) {
    renewConfig.disabled = true
    return
  }

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

const paginationChange = () => {
  listInstanceFn()
}

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
  const params = { regionId: cvmStore.areaSelect.id }
  if (params.regionId) {
    listByRegionId(params, cb)
  }
}

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
  listInstanceFn()
  listByRegionIdFn()
})
</script>

<style scoped lang="scss">
.cvm-recovery-ins-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-recovery-ins-v2__area {
  display: inline-flex;
  margin-left: 12px;
}

.cvm-recovery-ins-v2__panel {
  padding: 20px;
  background: #fff;
}

.cvm-recovery-ins-v2__toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cvm-recovery-ins-v2__actions,
.cvm-recovery-ins-v2__tools,
.cvm-recovery-ins-v2__ops {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.cvm-recovery-ins-v2__filter {
  min-width: 520px;
}

.cvm-recovery-ins-v2__icon-btn {
  flex: 0 0 auto;
}

.cvm-recovery-ins-v2__name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cvm-recovery-ins-v2__link {
  color: #06f;
  cursor: pointer;
}

.cvm-recovery-ins-v2__subtext {
  line-height: 22px;
  color: #191c23;
}

.cvm-recovery-ins-v2__status-cell,
.cvm-recovery-ins-v2__type-cell {
  display: flex;
  align-items: center;
  width: 100%;
}

.cvm-recovery-ins-v2__state-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  margin-right: 4px;
  border-radius: 50%;
}

.cvm-recovery-ins-v2__loading-icon {
  margin-left: 4px;
}

:deep(.cvm-recovery-ins-v2__state-text) {
  flex: 1;
  min-width: 0;
}

:deep(.cvm-recovery-ins-v2__type-text) {
  flex: 1;
  min-width: 0;
}

@media (width <= 1200px) {
  .cvm-recovery-ins-v2__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .cvm-recovery-ins-v2__tools {
    width: 100%;
  }

  .cvm-recovery-ins-v2__filter {
    width: 100%;
    min-width: 0;
  }
}

@media (width <= 768px) {
  .cvm-recovery-ins-v2__panel {
    padding: 16px;
  }

  .cvm-recovery-ins-v2__actions,
  .cvm-recovery-ins-v2__tools,
  .cvm-recovery-ins-v2__ops {
    flex-wrap: wrap;
  }
}
</style>
