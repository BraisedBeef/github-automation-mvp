<template>
  <div class="cvm-recovery-disk-v2">
    <PageBreadcrumbToolbar :items="[t('disk.list.disk')]" @doc="openHelpDoc">
      <template #title-extra>
        <div class="cvm-recovery-disk-v2__area">
          <AreaSelect v-model="area" @change-area="changeArea" />
        </div>
      </template>
    </PageBreadcrumbToolbar>

    <section class="cvm-recovery-disk-v2__panel">
      <div class="cvm-recovery-disk-v2__toolbar">
        <div class="cvm-recovery-disk-v2__tools">
          <FilterInput
            ref="filterInputRef"
            class="cvm-recovery-disk-v2__filter"
            :placeholder="t('recovery.disk.list.listPh')"
            :filter-list="iptFilterConfig"
            @search="searchFn"
          />
          <CdnIconButton class="cvm-recovery-disk-v2__icon-btn" @click="refresh">
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
        @change="paginationChange"
      >
        <el-table-column min-width="240" :label="t('disk.list.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-recovery-disk-v2__name-cell">
              <el-badge v-if="row.renewFlag === 1" :value="t('disk.list.continue')" type="warning">
                <div class="cvm-recovery-disk-v2__link">
                  <Copy :text="row.diskId" style="display: inline-block" @handle-click="toDetail(row)" />
                </div>
              </el-badge>
              <div v-else class="cvm-recovery-disk-v2__link">
                <Copy :text="row.diskId" style="display: inline-block" @handle-click="toDetail(row)" />
              </div>
              <div class="cvm-recovery-disk-v2__subtext">
                {{ row.diskName || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="180" :label="t('disk.list.state')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-recovery-disk-v2__status-cell">
              <StatusGroup :list="DISK_STATE_ARR_MAP" :value="row.state" />
              <SvgIcon v-if="row.loadingState" class="cvm-recovery-disk-v2__loading-icon" name="loading" />
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="150">
          <template #header>
            <TableHeadFilter
              ref="zoneNameThFilterRef"
              v-model="tableFilterConfig.zoneIds.value"
              :label="t('disk.list.zone')"
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

        <el-table-column min-width="150">
          <template #header>
            <TableHeadFilter
              ref="typeThFilterRef"
              v-model="tableFilterConfig.typeList.value"
              :label="t('disk.list.attr')"
              tip=""
              :field-key="tableFilterConfig.typeList.fieldKey"
              :field-type="tableFilterConfig.typeList.fieldType"
              :list="tableFilterConfig.typeList.opts"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            {{ DISK_TYPE_MAP[row.type] }}
          </template>
        </el-table-column>

        <el-table-column min-width="200">
          <template #header>
            <TableHeadFilter
              ref="diskTypeThFilterRef"
              v-model="tableFilterConfig.diskTypeList.value"
              :label="t('disk.list.diskType')"
              tip=""
              :field-key="tableFilterConfig.diskTypeList.fieldKey"
              :field-type="tableFilterConfig.diskTypeList.fieldType"
              :list="tableFilterConfig.diskTypeList.opts"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            {{ row.diskType || '-' }}
          </template>
        </el-table-column>

        <el-table-column min-width="120" sortable :label="t('disk.list.size')" :sort-method="sortMethod">
          <template #default="{ row }"> {{ row.size }}GiB </template>
        </el-table-column>

        <el-table-column min-width="220" :label="t('recovery.disk.list.beforeMontedIns')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-recovery-disk-v2__name-cell">
              <template v-if="handleAssociateIns(row).show">
                <div class="cvm-recovery-disk-v2__link">
                  {{ row.insUuid }}
                </div>
                <div class="cvm-recovery-disk-v2__subtext">
                  {{ row.instanceName || '-' }}
                </div>
              </template>
              <div v-else>-</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="220" :label="t('recovery.disk.list.costType')">
          <template #default="{ row }">
            <div class="cvm-recovery-disk-v2__name-cell">
              <div class="cvm-recovery-disk-v2__subtext">
                {{ COST_TYPE_BTN_GROUP_MAP.find(item => item.value === row.costType)?.label || '' }}
              </div>
              <RecoveryTimeFormateText
                :cost-type="row.costType"
                :destruction-time="row.destructionTime || ''"
                :expires-time="row.expiredTime || ''"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="220" :label="t('recovery.common.releaseCountdown')">
          <template #default="{ row }">
            <RecoveryTimeFormateText
              :cost-type="row.costType"
              :destruction-time="row.destructionTime || ''"
              :expires-time="row.expiredTime || ''"
              :show-detailed="true"
            />
          </template>
        </el-table-column>

        <el-table-column fixed="right" min-width="180" :label="t('disk.list.opts')">
          <template #default="{ row }">
            <div class="cvm-recovery-disk-v2__ops">
              <DisableText
                v-if="checkPermission(permMap.diskRecovery.DISK_RECYCLE_BIN_RECOVER)"
                :disabled="!isRenew(row.type, row.costType, row.state)"
                :text="t('recovery.common.renew')"
                disabled-type="hidden"
                @click="handleRenew(row)"
              />
              <DisableText
                v-if="checkPermission(permMap.diskRecovery.DISK_RECYCLE_BIN_RELEASE)"
                :disabled="!isDestruction(row.type, row.state)"
                :text="t('recovery.common.release')"
                disabled-type="hidden"
                @click="handleDestruction(row)"
              />
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <Destruction ref="destructionRef" :disk-list="destructionConfig.list" @success="listDiskFn" />
    <Renew ref="renewRef" :disk="disk" @success="listDiskFn" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { AreaSelectType } from '@/store/cvm'
import {
  DISK_TYPE_MAP,
  DISK_STATE_ARR_MAP,
  DISK_STATE_FILTER_ARR_MAP,
  DISK_TYPE_FILTER_MAP,
  isRenew,
  COST_TYPE_BTN_GROUP_MAP,
  isDestruction,
} from '@/views/cvm/disk/config'
import { useCvmStore } from '@/store'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { _getAdminDiskRecyclePage } from '@/apis/cvm/disk'
import Destruction from '@/views/cvm/recovery/disk/components/destruction.vue'
import Renew from '@/views/cvm/recovery/disk/components/renew.vue'
import { httpUrl, documentUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const defaultTableFilterConfig: TableFilterConfigType = {
  states: {
    value: [],
    opts: DISK_STATE_FILTER_ARR_MAP,
    fieldKey: 'states',
    fieldType: 'check',
  },
  zoneIds: {
    value: [],
    opts: [],
    fieldKey: 'zoneIds',
    fieldType: 'check',
  },
  typeList: {
    value: [],
    opts: DISK_TYPE_FILTER_MAP,
    fieldKey: 'typeList',
    fieldType: 'check',
  },
  diskTypeList: {
    value: [],
    opts: [],
    fieldKey: 'diskTypeList',
    fieldType: 'check',
  },
}

const defaultIptFilterConfig = [
  { fieldName: t('disk.list.diskId'), fieldKey: 'diskId' },
  { fieldName: t('disk.list.zone'), fieldKey: 'zoneIds', fieldType: 'check', list: [] },
  { fieldName: t('disk.list.attr'), fieldKey: 'typeList', fieldType: 'check', list: DISK_TYPE_FILTER_MAP },
  { fieldName: t('disk.list.diskType'), fieldKey: 'diskTypeList', fieldType: 'check', list: [] },
]

const cvmStore = useCvmStore()
const { listDiskPrice, loading } = useDisk()
const { listByRegionId } = useBaseConfig()
const { handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)

const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})

const disk = ref<any>({})
const list = ref<any[]>([])
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const destructionConfig = reactive<{ list: any[]; disabled: boolean; visible: boolean; content: string }>({
  list: [],
  disabled: true,
  visible: false,
  content: t('disk.list.destructionDesc1'),
})

const destructionRef = ref<InstanceType<typeof Destruction>>()
const renewRef = ref<InstanceType<typeof Renew>>()
const zoneNameThFilterRef = ref<any>()
const typeThFilterRef = ref<any>()
const diskTypeThFilterRef = ref<any>()

const { notice, start } = useUpdateResources(
  {
    url: `${httpUrl}/api/vcloudBase/v1/sse/taskState/connect`,
    params: {
      modeType: 2,
    },
    resourcesStateType: 'number',
    deleteStateValue: [10, 99],
  },
  list,
  toRef(paginationConfig, 'total'),
)

const permConfig = reactive({
  moduleId: moduleMap.diskRecovery,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const searchFn = (search: any) => {
  paginationConfig.pagination.page = 1
  zoneNameThFilterRef.value?.updateCheck(search?.zoneIds)
  typeThFilterRef?.value.updateCheck(search?.typeList)
  diskTypeThFilterRef?.value.updateCheck(search?.diskTypeList)
  listDiskFn(search)
}

const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  if (fieldKey === 'zoneIds') {
    handleThCheckFn(list, 'zoneIds', t('disk.list.zone'))
  }
  if (fieldKey === 'states') {
    handleThCheckFn(list, 'states', t('disk.list.state'))
  }
  if (fieldKey === 'typeList') {
    handleThCheckFn(list, 'typeList', t('disk.list.attr'))
  }
  if (fieldKey === 'diskTypeList') {
    handleThCheckFn(list, 'diskTypeList', t('disk.list.diskType'))
  }
}

const changeArea = area => {
  permConfig.regionId = area.id
}

const handleAssociateIns = (row: any) => {
  return {
    show: !!(row.insUuid || row.instanceName),
  }
}

const refresh = () => {
  start()
  resetIptFn()
}

const toDetail = (row: any) => {
  pushRoute({
    name: 'disk_detail',
    params: {
      id: row.id,
    },
  })
}

const sortMethod = (a, b) => {
  return a.size - b.size
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const paginationChange = () => {
  listDiskFn()
}

const handleRenew = (row: any) => {
  disk.value = row
  changeShow(renewRef.value)
}

const handleDestruction = (row: any) => {
  destructionConfig.list = [row]
  changeShow(destructionRef.value)
}

const listDiskFn = async (search = filterInputRef.value?.searchParams) => {
  notice(2)
  try {
    loading.value = true
    const params = {
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      regionId: cvmStore.areaSelect.id,
      states: [10],
      ...search,
    }
    const res = await _getAdminDiskRecyclePage(params)
    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const listDiskPriceFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      const opts = (res.data || []).map(el => ({ value: el.diskName, label: el.diskName }))
      iptFilterConfig.value[3].list = opts
      tableFilterConfig.diskTypeList.opts = opts
    }
  }

  const params = {
    costType: 2,
    regionId: cvmStore.areaSelect.id,
  }

  listDiskPrice(params, cb)
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
  listByRegionId(params, cb)
}

watch(
  () => cvmStore.areaSelect.id,
  () => {
    resetIptFn()
    listDiskFn()
    listByRegionIdFn()
    listDiskPriceFn()
  },
)

onMounted(() => {
  listDiskFn()
  listByRegionIdFn()
  listDiskPriceFn()
})
</script>

<style scoped lang="scss">
.cvm-recovery-disk-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-recovery-disk-v2__area {
  display: inline-flex;
  margin-left: 12px;
}

.cvm-recovery-disk-v2__panel {
  padding: 20px;
  background: #fff;
}

.cvm-recovery-disk-v2__toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.cvm-recovery-disk-v2__tools,
.cvm-recovery-disk-v2__ops {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.cvm-recovery-disk-v2__filter {
  min-width: 520px;
}

.cvm-recovery-disk-v2__name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cvm-recovery-disk-v2__link {
  color: #06f;
}

.cvm-recovery-disk-v2__subtext {
  line-height: 22px;
  color: #191c23;
}

.cvm-recovery-disk-v2__status-cell {
  display: inline-flex;
  align-items: center;
}

.cvm-recovery-disk-v2__loading-icon {
  margin-left: 4px;
}

@media (width <= 1200px) {
  .cvm-recovery-disk-v2__toolbar {
    justify-content: flex-start;
  }

  .cvm-recovery-disk-v2__tools {
    width: 100%;
  }

  .cvm-recovery-disk-v2__filter {
    width: 100%;
    min-width: 0;
  }
}

@media (width <= 768px) {
  .cvm-recovery-disk-v2__panel {
    padding: 16px;
  }

  .cvm-recovery-disk-v2__tools,
  .cvm-recovery-disk-v2__ops {
    flex-wrap: wrap;
  }
}
</style>
