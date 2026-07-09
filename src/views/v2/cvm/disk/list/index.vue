<template>
  <div class="cvm-disk-list-v2">
    <PageBreadcrumbToolbar :items="[t('disk.list.disk')]" @doc="openHelpDoc">
      <template #title-extra>
        <div class="cvm-disk-list-v2__area">
          <AreaSelect v-model="area" @change-area="changeArea" />
        </div>
      </template>
    </PageBreadcrumbToolbar>

    <section class="cvm-disk-list-v2__panel">
      <div class="cvm-disk-list-v2__toolbar">
        <div class="cvm-disk-list-v2__actions">
          <el-button v-if="checkPermission(permMap.disk.CREATE_HD)" type="primary" @click="changeShow(createDiskRef)">
            {{ t('disk.list.create') }}
          </el-button>
          <TooltipBtn
            v-if="checkPermission(permMap.disk.ATTACH_HD_TO_VM)"
            v-model:visible="monutConfig.visible"
            :text="t('disk.list.monut')"
            :disabled="monutConfig.disabled"
            :content="monutConfig.content"
            @click="changeShow(mountRef)"
          />
          <TooltipBtn
            v-if="checkPermission(permMap.disk.DETTACH_HD_FROM_VM)"
            v-model:visible="uninstallConfig.visible"
            :text="t('disk.list.uninstall')"
            :disabled="uninstallConfig.disabled"
            :content="uninstallConfig.content"
            @click="changeShow(uninstallRef)"
          />
          <el-button disabled>
            {{ t('disk.list.destruction') }}
          </el-button>
        </div>

        <div class="cvm-disk-list-v2__tools">
          <FilterInput
            ref="filterInputRef"
            class="cvm-disk-list-v2__filter"
            :placeholder="t('disk.list.listPh')"
            :filter-list="iptFilterConfig"
            @search="searchFn"
          />
          <CdnIconButton class="cvm-disk-list-v2__icon-btn" @click="refresh">
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

        <el-table-column min-width="220" :label="t('disk.list.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-disk-list-v2__name-cell">
              <el-badge
                v-if="row.renewFlag === 1"
                :value="t('disk.list.continue')"
                class="cvm-disk-list-v2__badge"
                type="warning"
              >
                <div class="cvm-disk-list-v2__link">
                  <Copy :text="row.diskId" style="display: inline-block" @handle-click="toDetail(row)" />
                </div>
              </el-badge>
              <div v-else class="cvm-disk-list-v2__link">
                <Copy :text="row.diskId" style="display: inline-block" @handle-click="toDetail(row)" />
              </div>
              <div class="cvm-disk-list-v2__subtext">
                {{ row.diskName || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="150">
          <template #header>
            <TableHeadFilter
              ref="stateThFilterRef"
              v-model="tableFilterConfig.states.value"
              :label="t('disk.list.state')"
              tip=""
              :field-key="tableFilterConfig.states.fieldKey"
              :field-type="tableFilterConfig.states.fieldType"
              :list="tableFilterConfig.states.opts"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            <div class="cvm-disk-list-v2__status-cell">
              <StatusGroup :list="DISK_STATE_ARR_MAP" :value="row.state" />
              <SvgIcon v-if="row.loadingState" class="cvm-disk-list-v2__status-loading" name="loading" />
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

        <el-table-column min-width="130" label="数据保护">
          <template #default> - </template>
        </el-table-column>

        <el-table-column min-width="180">
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

        <el-table-column min-width="110" sortable :sort-method="sortMethod" :label="t('disk.list.size')">
          <template #default="{ row }"> {{ row.size }}GiB </template>
        </el-table-column>

        <el-table-column min-width="180" :label="t('disk.list.associateIns')" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="handleAssociateIns(row).show" class="cvm-disk-list-v2__name-cell">
              <div class="cvm-disk-list-v2__link">
                {{ row.insUuid }}
              </div>
              <div class="cvm-disk-list-v2__subtext">
                {{ row.instanceName }}
              </div>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>

        <el-table-column fixed="right" min-width="240" :label="t('disk.list.opts')">
          <template #default="{ row }">
            <div class="cvm-disk-list-v2__ops">
              <DisableText
                v-if="checkPermission(permMap.disk.HD_RENEWAL)"
                :disabled="!isRenew(row.type, row.costType, row.state)"
                :text="t('disk.list.renew')"
                disabled-type="hidden"
                @click="handleRenew(row)"
              />
              <DisableText
                v-if="checkPermissionSnapshot(permMap.snapshot.CREATE_HD_SNAPSHOT)"
                :disabled="!isCreateSnapshot(row.type, row.state)"
                :text="t('disk.list.createSnapshot')"
                disabled-type="hidden"
                @click="handleCreateSnapshot(row)"
              />
              <Select
                v-if="diskMoreList(row).length"
                class="cvm-disk-list-v2__more"
                :one-menu-width="180"
                :select-width="92"
                :list="diskMoreList(row)"
                :ph="t('disk.list.more')"
                :no-border="true"
                @opt-click="handleOperatechange($event, row)"
              />
            </div>
          </template>
        </el-table-column>
      </TableV2>

      <CreateDisk ref="createDiskRef" @success="listDiskFn" />
      <Mount ref="mountRef" :disk-list="monutConfig.list" @success="listDiskFn" />
      <Uninstall ref="uninstallRef" :disk-list="uninstallConfig.list" @success="listDiskFn" />
      <Destruction ref="destructionRef" :disk-list="destructionConfig.list" @success="listDiskFn" />
      <Renew ref="renewRef" :disk="disk" @success="listDiskFn" />
      <CreateSnapshot ref="createSnapshotRef" :disk="disk" @success="listDiskFn" />
      <SetProject ref="setProjectRef" :disk="disk" @success="listDiskFn" />
      <SetAutoRenew ref="setAutoRenewRef" :disk="disk" @success="listDiskFn" />
      <CancelAutoRenew ref="cancelAutoRenewRef" :disk="disk" @success="listDiskFn" />
      <FlowToTime ref="flowToTimeRef" :disk="disk" />
      <TimeToFlow ref="timeToFlowRef" @success="listDiskFn" />
      <Expans ref="expansRef" :disk="disk" @success="listDiskFn" />
    </section>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { useTempStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import CreateSnapshot from '@/views/cvm/disk/list/components/create-snapshot.vue'
import SetProject from '@/views/cvm/disk/list/components/set-project.vue'
import Mount from '@/views/cvm/disk/list/components/mount.vue'
import SetAutoRenew from '@/views/cvm/disk/list/components/set-auto-renew.vue'
import CancelAutoRenew from '@/views/cvm/disk/list/components/cancel-auto-renew.vue'
import Destruction from '@/views/cvm/disk/list/components/destruction.vue'
import Uninstall from '@/views/cvm/disk/list/components/uninstall.vue'
import Renew from '@/views/cvm/disk/list/components/renew.vue'
import FlowToTime from '@/views/cvm/disk/list/components/flow-to-time.vue'
import TimeToFlow from '@/views/cvm/disk/list/components/time-to-flow.vue'
import CreateDisk from '@/views/cvm/disk/list/components/create-disk.vue'
import Expans from '@/views/cvm/disk/list/components/expans.vue'
import { useCvmStore } from '@/store'
import { AreaSelectType } from '@/store/cvm'
import {
  DISK_TYPE_MAP,
  DISK_STATE_ARR_MAP,
  DISK_MORE_OPTS,
  DISK_STATE_FILTER_ARR_MAP,
  DISK_TYPE_FILTER_MAP,
  isMount,
  isRenew,
  isExpans,
  isUninstall,
  isDestruction,
  isSetAutoRenew,
  isSetProject,
  isCreateSnapshot,
  isDataDisk,
  isMountBatch,
  isUninstallBatch,
  isDestructionBatch,
  isTimeCost,
  isFlowCost,
  isFlowToTime,
  DISK_DEFAULT_STATES,
} from '@/views/cvm/disk/config'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
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
  { fieldName: t('disk.list.state'), fieldKey: 'states', fieldType: 'check', list: DISK_STATE_FILTER_ARR_MAP },
  { fieldName: t('disk.list.zone'), fieldKey: 'zoneIds', fieldType: 'check', list: [] },
  { fieldName: t('disk.list.attr'), fieldKey: 'typeList', fieldType: 'check', list: DISK_TYPE_FILTER_MAP },
  { fieldName: t('disk.list.diskType'), fieldKey: 'diskTypeList', fieldType: 'check', list: [] },
]

const cvmStore = useCvmStore()
const { listDiskPrice, listDisk, loading } = useDisk()
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
const selectList = ref<any[]>([])

const monutConfig = reactive({
  list: [] as any[],
  disabled: true,
  visible: false,
  content: t('disk.list.monutDesc1'),
})

const uninstallConfig = reactive({
  list: [] as any[],
  disabled: true,
  visible: false,
  content: t('disk.list.uninstallDesc1'),
})

const destructionConfig = reactive({
  list: [] as any[],
  disabled: true,
  visible: false,
  content: t('disk.list.destructionDesc1'),
})

const createSnapshotRef = ref<InstanceType<typeof CreateSnapshot>>()
const setProjectRef = ref<InstanceType<typeof SetProject>>()
const mountRef = ref<InstanceType<typeof Mount>>()
const setAutoRenewRef = ref<InstanceType<typeof SetAutoRenew>>()
const cancelAutoRenewRef = ref<InstanceType<typeof CancelAutoRenew>>()
const destructionRef = ref<InstanceType<typeof Destruction>>()
const uninstallRef = ref<InstanceType<typeof Uninstall>>()
const renewRef = ref<InstanceType<typeof Renew>>()
const flowToTimeRef = ref<InstanceType<typeof FlowToTime>>()
const timeToFlowRef = ref<InstanceType<typeof TimeToFlow>>()
const createDiskRef = ref<InstanceType<typeof CreateDisk>>()
const expansRef = ref<InstanceType<typeof Expans>>()
const stateThFilterRef = ref<any>()
const zoneNameThFilterRef = ref<any>()
const typeThFilterRef = ref<any>()
const diskTypeThFilterRef = ref<any>()
let listDiskRequestId = 0

const { notice, start } = useUpdateResources(
  {
    url: `${httpUrl}/api/vcloudBase/v1/sse/taskState/connect`,
    params: { modeType: 2 },
    resourcesStateType: 'number',
    deleteStateValue: [10, 99],
  },
  list,
)

const permConfig = reactive({
  moduleId: moduleMap.disk,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const permConfigSnapshot = reactive({
  moduleId: moduleMap.snapshot,
  regionId: 0,
})
const { checkPermission: checkPermissionSnapshot } = useCvmAndNetworkPermission(permConfigSnapshot)

const diskMoreList = row => {
  return DISK_MORE_OPTS.filter(el => {
    if (el.perm) {
      return checkPermission(el.perm) && el.costType.includes(row.costType)
    }
    return el.costType.includes(row.costType)
  }).map(el => ({
    ...el,
    disabled: selectOptDisabled(el, row),
  }))
}

const searchFn = search => {
  paginationConfig.pagination.page = 1
  stateThFilterRef.value?.updateCheck(search?.states)
  zoneNameThFilterRef.value?.updateCheck(search?.zoneIds)
  typeThFilterRef.value?.updateCheck(search?.typeList)
  diskTypeThFilterRef.value?.updateCheck(search?.diskTypeList)
  listDiskFn(search)
}

const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  if (fieldKey === 'zoneIds') handleThCheckFn(list, 'zoneIds', t('disk.list.zone'))
  if (fieldKey === 'states') handleThCheckFn(list, 'states', t('disk.list.state'))
  if (fieldKey === 'typeList') handleThCheckFn(list, 'typeList', t('disk.list.attr'))
  if (fieldKey === 'diskTypeList') handleThCheckFn(list, 'diskTypeList', t('disk.list.diskType'))
}

const changeArea = area => {
  permConfig.regionId = area.id
  permConfigSnapshot.regionId = area.id
}

const handleAssociateIns = row => ({
  show: !!(row.insUuid || row.instanceName),
})

const refresh = () => {
  start()
  resetIptFn()
}

const toDetail = row => {
  pushRoute({
    name: 'disk_detail',
    params: {
      id: row.id,
    },
  })
}

const sortMethod = (a, b) => a.size - b.size

const changeShow = ins => {
  if (ins) ins.show = true
}

const handleRenew = row => {
  disk.value = row
  changeShow(renewRef.value)
}

const handleCreateSnapshot = row => {
  disk.value = row
  changeShow(createSnapshotRef.value)
}

const selectOptDisabled = (v, row) => {
  if (v.value === 'expans') return !isExpans(row.state)
  if (v.value === 'mount') return !isMount(row.type, row.state)
  if (v.value === 'uninstall') return !isUninstall(row.type, row.state)
  if (v.value === 'setAutoRenew') return !isSetAutoRenew(row.type, row.costType, row.state)
  if (v.value === 'destruction') return !isDestruction(row.type, row.state)
  if (v.value === 'setProject') return !isSetProject(row.state)
  if (v.value === 'flowToTime') return !isFlowToTime(row.type, row.costType, row.state)
  return false
}

const handleOperatechange = (item, row) => {
  const value = item?.value

  if (value === 'expans' && isExpans(row.state)) {
    disk.value = row
    changeShow(expansRef.value)
  }
  if (value === 'mount' && isMount(row.type, row.state)) {
    monutConfig.list = [row]
    changeShow(mountRef.value)
  }
  if (value === 'uninstall' && isUninstall(row.type, row.state)) {
    uninstallConfig.list = [row]
    changeShow(uninstallRef.value)
  }
  if (value === 'destruction' && isDestruction(row.type, row.state)) {
    destructionConfig.list = [row]
    changeShow(destructionRef.value)
  }
  if (value === 'setAutoRenew' && isSetAutoRenew(row.type, row.costType, row.state)) {
    disk.value = row
    changeShow(row.renewFlag === 1 ? cancelAutoRenewRef.value : setAutoRenewRef.value)
  }
  if (value === 'setProject' && isSetProject(row.state)) {
    disk.value = row
    changeShow(setProjectRef.value)
  }
  if (value === 'flowToTime' && isFlowToTime(row.type, row.costType, row.state)) {
    disk.value = row
    changeShow(flowToTimeRef.value)
  }
}

const handleRowSelectChange = selection => {
  selectList.value = selection
  changeMonutConfig()
  changeUninstallConfig()
  changeDestructionConfig()
}

const changeMonutConfig = () => {
  if (!selectList.value.length) {
    monutConfig.content = t('disk.list.monutDesc1')
    monutConfig.disabled = true
    return
  }
  if (selectList.value.length > 10) {
    monutConfig.content = t('disk.list.monutDesc2')
    monutConfig.disabled = true
    return
  }
  if (!selectList.value.every(el => isDataDisk(el.type))) {
    monutConfig.content = t('disk.list.monutDesc3')
    monutConfig.disabled = true
    return
  }
  const zoneIds = selectList.value.map(el => el.zoneId)
  if (!zoneIds.every(el => el === zoneIds[0])) {
    monutConfig.content = t('disk.list.monutDesc1')
    monutConfig.disabled = true
    return
  }
  if (
    !isMountBatch(
      selectList.value.map(el => el.type),
      selectList.value.map(el => el.state),
    )
  ) {
    monutConfig.content = t('disk.list.monutDesc4')
    monutConfig.disabled = true
    return
  }
  monutConfig.list = selectList.value
  monutConfig.disabled = false
}

const changeUninstallConfig = () => {
  if (!selectList.value.length) {
    uninstallConfig.content = t('disk.list.uninstallDesc1')
    uninstallConfig.disabled = true
    return
  }
  if (selectList.value.length > 10) {
    uninstallConfig.content = t('disk.list.uninstallDesc2')
    uninstallConfig.disabled = true
    return
  }
  if (!selectList.value.every(el => isDataDisk(el.type))) {
    uninstallConfig.content = t('disk.list.uninstallDesc3')
    uninstallConfig.disabled = true
    return
  }
  if (
    !isUninstallBatch(
      selectList.value.map(el => el.type),
      selectList.value.map(el => el.state),
    )
  ) {
    uninstallConfig.content = t('disk.list.uninstallDesc1')
    uninstallConfig.disabled = true
    return
  }
  uninstallConfig.list = selectList.value
  uninstallConfig.disabled = false
}

const changeDestructionConfig = () => {
  if (!selectList.value.length) {
    destructionConfig.content = t('disk.list.destructionDesc1')
    destructionConfig.disabled = true
    return
  }
  if (selectList.value.length > 10) {
    destructionConfig.content = t('disk.list.destructionDesc2')
    destructionConfig.disabled = true
    return
  }
  if (!selectList.value.every(el => isDataDisk(el.type))) {
    destructionConfig.content = t('disk.list.destructionDesc3')
    destructionConfig.disabled = true
    return
  }
  const timeCostRes = selectList.value.every(el => isTimeCost(el.costType))
  const flowCostRes = selectList.value.every(el => isFlowCost(el.costType))
  if (!(timeCostRes || flowCostRes)) {
    destructionConfig.content = t('disk.list.destructionDesc4')
    destructionConfig.disabled = true
    return
  }
  if (
    !isDestructionBatch(
      selectList.value.map(el => el.type),
      selectList.value.map(el => el.state),
      selectList.value.map(el => el.costType),
    )
  ) {
    destructionConfig.content = t('disk.list.destructionDesc1')
    destructionConfig.disabled = true
    return
  }
  destructionConfig.list = selectList.value
  destructionConfig.disabled = false
}

const paginationChange = () => {
  listDiskFn()
}

const listDiskFn = async (search = filterInputRef.value?.searchParams) => {
  const requestId = ++listDiskRequestId
  const params = {
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    regionId: cvmStore.areaSelect.id,
    states: DISK_DEFAULT_STATES,
    ...search,
  }
  notice(2)
  listDisk(params, res => {
    if (requestId !== listDiskRequestId) return
    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    }
  })
}

const listDiskPriceFn = async () => {
  listDiskPrice(
    {
      costType: 2,
      regionId: cvmStore.areaSelect.id,
    },
    res => {
      if (res.success) {
        const diskTypeList = (res.data || []).map(el => ({ value: el.diskName, label: el.diskName }))
        iptFilterConfig.value[4].list = diskTypeList
        tableFilterConfig.diskTypeList.opts = diskTypeList
      }
    },
  )
}

const listByRegionIdFn = () => {
  listByRegionId(
    {
      regionId: cvmStore.areaSelect.id,
    },
    res => {
      if (res.success) {
        const arr = (res.data || []).map(el => ({
          label: el.zoneName,
          value: el.id,
        }))
        iptFilterConfig.value[2].list = arr
        tableFilterConfig.zoneIds.opts = arr
      }
    },
  )
}

const openHelpDoc = () => {
  window.open(`${documentUrl}/document/product/16/104`)
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
  useTempStore().setPageHeader(false)
  listDiskFn()
  listByRegionIdFn()
  listDiskPriceFn()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style scoped lang="scss">
.cvm-disk-list-v2 {
  &__area {
    display: flex;
    align-items: center;
  }

  &__panel {
    padding: 30px;
    margin-top: 16px;
    background: #fff;
    border: 1px solid #e3eaf5;
  }

  &__toolbar {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  &__actions,
  &__tools,
  &__ops,
  &__status-cell,
  &__area,
  &__name-cell {
    display: flex;
    align-items: center;
  }

  &__actions,
  &__ops {
    flex-wrap: wrap;
    gap: 14px;
  }

  &__tools {
    gap: 12px;
    justify-content: flex-end;
  }

  &__filter {
    width: 616px;
    max-width: 100%;
  }

  &__icon-btn {
    flex: 0 0 auto;
  }

  &__name-cell {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    justify-content: center;
    min-height: 56px;
  }

  &__link {
    font-size: 16px;
    line-height: 24px;
    color: #1f6bff;
    cursor: pointer;
  }

  &__subtext {
    font-size: 14px;
    line-height: 22px;
    color: #2f3440;
    word-break: break-all;
  }

  &__badge {
    :deep(.el-badge__content) {
      border: 0;
    }
  }

  &__status-loading {
    margin-left: 6px;
  }

  &__more {
    margin-left: -8px;
  }
}
</style>
