<template>
  <div class="cvm-snapshot-list-v2">
    <PageBreadcrumbToolbar :items="[t('snapshot.list.snapshot')]" @doc="openHelpDoc">
      <template #title-extra>
        <div class="cvm-snapshot-list-v2__area">
          <AreaSelect v-model="area" @change-area="changeArea" />
        </div>
      </template>
    </PageBreadcrumbToolbar>

    <section class="cvm-snapshot-list-v2__panel">
      <div class="cvm-snapshot-list-v2__toolbar">
        <div class="cvm-snapshot-list-v2__actions">
          <el-button
            v-if="checkPermission(permMap.snapshot.EXPUNGE_SNAPSHOT)"
            :type="selectList.length ? 'primary' : ''"
            :disabled="!isDeleteBatch(selectList.map(el => el.state))"
            @click="batchRemove"
          >
            {{ t('snapshot.list.delete') }}
          </el-button>
          <el-button @click="pushRoute({ name: 'snapshot_policy' })">
            {{ t('snapshot.policy.title') }}
          </el-button>
        </div>

        <div class="cvm-snapshot-list-v2__tools">
          <FilterInput
            ref="filterInputRef"
            class="cvm-snapshot-list-v2__filter"
            :placeholder="t('snapshot.list.listPh')"
            :filter-list="iptFilterConfig"
            @search="searchFn"
          />
          <CdnIconButton class="cvm-snapshot-list-v2__icon-btn" @click="refresh">
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
        <el-table-column type="selection" width="54" :selectable="row => isDelete(row.state)" />

        <el-table-column min-width="210" :label="t('snapshot.list.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-snapshot-list-v2__name-cell">
              <div class="cvm-snapshot-list-v2__link">
                <Copy :text="row.snapshotId" style="display: inline-block" @handle-click="toDetail(row)" />
              </div>
              <div class="cvm-snapshot-list-v2__subtext">
                {{ row.name || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="180">
          <template #header>
            <TableHeadFilter
              ref="stateThFilterRef"
              v-model="tableFilterConfig.states.value"
              :label="t('snapshot.list.state')"
              tip=""
              :field-key="tableFilterConfig.states.fieldKey"
              :field-type="tableFilterConfig.states.fieldType"
              :list="tableFilterConfig.states.opts"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            <div class="cvm-snapshot-list-v2__status-cell">
              <StatusGroup :list="SNAPSHOT_STATE_ARR_MAP" :value="row.state" />
              <SvgIcon v-if="row.loadingState" class="cvm-snapshot-list-v2__loading-icon" name="loading" />
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="200">
          <template #header>
            <TableHeadFilter
              ref="diskTypesThFilterRef"
              v-model="tableFilterConfig.diskTypes.value"
              :label="t('snapshot.list.diskType')"
              tip=""
              :field-key="tableFilterConfig.diskTypes.fieldKey"
              :field-type="tableFilterConfig.diskTypes.fieldType"
              :list="tableFilterConfig.diskTypes.opts"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            <div>{{ DISK_TYPE_MAP[row.diskType] }}</div>
            <div class="cvm-snapshot-list-v2__subtext">{{ row.diskSize || 0 }}GiB</div>
          </template>
        </el-table-column>

        <el-table-column min-width="220" :label="t('snapshot.list.bindDisk')" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="handleBindDisk(row).show" class="cvm-snapshot-list-v2__name-cell">
              <div class="cvm-snapshot-list-v2__link" @click="toDisk(row)">
                {{ row.serviceDiskId }}
              </div>
              <div class="cvm-snapshot-list-v2__subtext">
                {{ row.diskName }}
              </div>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>

        <el-table-column min-width="220">
          <template #header>
            <div class="cvm-snapshot-list-v2__time-head">
              <span>{{ t('snapshot.list.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="cvm-snapshot-list-v2__time-icon" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>

        <el-table-column min-width="220" fixed="right" :label="t('snapshot.list.opts')">
          <template #default="{ row }">
            <div class="cvm-snapshot-list-v2__ops">
              <DisableText
                v-if="checkPermission(permMap.snapshot.ROLLBACK_SNAPSHOT)"
                :disabled="!isRollBack(row.state)"
                :text="t('snapshot.list.rollBack')"
                :open-tooltip="!isRollBack(row.state)"
                disabled-type="hidden"
                @click="rollBack(row)"
              >
                <template #content>
                  <div style="width: 200px">
                    {{ t('snapshot.list.noRollBackDesc') }}
                  </div>
                </template>
              </DisableText>

              <DisableText
                v-if="checkPermission(permMap.snapshot.EXPUNGE_SNAPSHOT)"
                :disabled="!isDelete(row.state)"
                :text="t('snapshot.list.delete')"
                disabled-type="hidden"
                @click="singleRemove(row)"
              />

              <Select
                class="cvm-snapshot-list-v2__more"
                :one-menu-width="140"
                :select-width="92"
                :list="snapshotMoreList"
                :ph="t('snapshot.list.more')"
                :no-border="true"
                @opt-click="handleOperatechange($event, row)"
              />
            </div>
          </template>
        </el-table-column>
      </TableV2>

      <RollBack ref="rollBackRef" :snapshot-list="[snapshot]" @success="getSnapshotListFn" />
      <Delete ref="deleteRef" :snapshot-list="removeConfig.list" @success="getSnapshotListFn" />
      <CreateDisk ref="createDiskRef" :snapshot-create-config="snapshotCreateConfig" @success="getSnapshotListFn" />
    </section>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import RollBack from '@/views/cvm/snapshot/list/components/roll-back.vue'
import Delete from '@/views/cvm/snapshot/list/components/delete.vue'
import CreateDisk from '@/views/cvm/disk/list/components/create-disk.vue'
import { AreaSelectType, useCvmStore, useTempStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import { SNAPSHOT_STATE_ARR_MAP, SNAPSHOT_MORE_OPTS, SNAPSHOT_STATE_FILTER_ARR_MAP } from '@/views/cvm/snapshot/config'
import { DISK_TYPE_MAP, DISK_TYPE_FILTER_MAP } from '@/views/cvm/disk/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { useSnapshot } from '@/views/cvm/hooks/use-snapshot'
import {
  isDelete,
  isDeleteBatch,
  isRollBack,
  isCreateDisk,
  isSeeChain,
  isHasBindDisk,
} from '@/views/cvm/snapshot/config'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { httpUrl, documentUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const defaultTableFilterConfig: TableFilterConfigType = {
  states: {
    value: [],
    opts: SNAPSHOT_STATE_FILTER_ARR_MAP,
    fieldKey: 'states',
    fieldType: 'check',
  },
  diskTypes: {
    value: [],
    opts: DISK_TYPE_FILTER_MAP,
    fieldKey: 'diskTypes',
    fieldType: 'check',
  },
}

const defaultIptFilterConfig = [
  { fieldName: t('snapshot.list.snapshotId'), fieldKey: 'snapshotId' },
  { fieldName: t('snapshot.list.state'), fieldKey: 'states', fieldType: 'check', list: SNAPSHOT_STATE_FILTER_ARR_MAP },
  {
    fieldName: t('snapshot.list.diskType'),
    fieldKey: 'diskTypes',
    fieldType: 'check',
    list: DISK_TYPE_FILTER_MAP,
  },
]

const { getSnapshotList, loading } = useSnapshot()
const { handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)

const cvmStore = useCvmStore()
useTempStore().setPageHeader(false)

const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})

const list = ref<any[]>([])
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const snapshotCreateConfig = reactive<{
  checkSnapshot: boolean
  snapshotId?: string
  snapshotName?: string
  diskId?: number
}>({
  checkSnapshot: false,
  snapshotId: '',
  snapshotName: '',
  diskId: 0,
})

const selectList = ref<any[]>([])
const snapshot = ref<any>({})

const removeConfig = reactive<{
  type: 'single' | 'batch'
  list: any[]
}>({
  type: 'single',
  list: [],
})

const rollBackRef = ref<InstanceType<typeof RollBack>>()
const deleteRef = ref<InstanceType<typeof Delete>>()
const createDiskRef = ref<InstanceType<typeof CreateDisk>>()
const stateThFilterRef = ref<any>()
const diskTypesThFilterRef = ref<any>()

const { notice, start } = useUpdateResources(
  {
    url: `${httpUrl}/api/vcloudBase/v1/sse/taskState/connect`,
    params: {
      modeType: 4,
    },
    resourcesStateType: 'number',
    deleteStateValue: 7,
  },
  list,
  toRef(paginationConfig, 'total'),
)

const permConfig = reactive({
  moduleId: moduleMap.snapshot,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const snapshotMoreList = computed(() => {
  return SNAPSHOT_MORE_OPTS.filter(el => (el.perm ? checkPermission(el.perm) : true))
})

const searchFn = (search: any) => {
  paginationConfig.pagination.page = 1
  stateThFilterRef.value?.updateCheck(search?.states)
  diskTypesThFilterRef.value?.updateCheck(search?.diskTypes)
  getSnapshotListFn(search)
}

const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  if (fieldKey === 'states') {
    handleThCheckFn(list, 'states', t('snapshot.list.state'))
  }
  if (fieldKey === 'diskTypes') {
    handleThCheckFn(list, 'diskTypes', t('snapshot.list.diskType'))
  }
}

const changeArea = area => {
  permConfig.regionId = area.id
}

const refresh = () => {
  start()
  resetIptFn()
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const handleBindDisk = (row: any) => {
  const config: any = {
    show: false,
  }
  config.show = !!(row.serviceDiskId || row.diskName)
  config.serviceDiskId = row.serviceDiskId
  config.diskName = row.diskName
  return config
}

const toDisk = (row: any) => {
  if (isHasBindDisk(row.diskState)) {
    pushRoute({
      name: 'disk_detail',
      params: {
        id: row.diskId,
      },
    })
  }
}

const toDetail = (row: any) => {
  pushRoute({
    name: 'snapshot_detail',
    params: {
      id: row.id,
    },
  })
}

const toChain = (row: any) => {
  pushRoute({
    name: 'snapshot_chain',
    params: {
      id: row.diskId,
    },
    query: {
      chainName: row.serviceDiskId || '',
    },
  })
}

const rollBack = (row: any) => {
  snapshot.value = row
  changeShow(rollBackRef.value)
}

const singleRemove = (row: any) => {
  removeConfig.type = 'single'
  removeConfig.list = [row]
  changeShow(deleteRef.value)
}

const batchRemove = () => {
  const arr = selectList.value.filter(el => [1, 6].includes(el.state))
  if (arr.length) {
    removeConfig.type = 'batch'
    removeConfig.list = arr
    changeShow(deleteRef.value)
  }
}

const createDisk = (row: any) => {
  snapshotCreateConfig.checkSnapshot = true
  snapshotCreateConfig.snapshotId = row.id
  snapshotCreateConfig.snapshotName = row.name
  snapshotCreateConfig.diskId = row.diskId
  changeShow(createDiskRef.value)
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const handleOperatechange = (v: any, row: any) => {
  if (v.value === 'createDisk' && isCreateDisk(row.state, row.diskType)) {
    createDisk(row)
  }
  if (v.value === 'chain' && isSeeChain(row.state)) {
    toChain(row)
  }
}

const handleRowSelectChange = (selection: any) => {
  selectList.value = selection
}

const paginationChange = () => {
  getSnapshotListFn()
}

const getSnapshotListFn = (search = filterInputRef.value?.searchParams || {}) => {
  const cb = (res: any) => {
    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    }
  }
  const params = {
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    regionId: cvmStore.areaSelect.id,
    ...search,
  }

  notice(4)
  getSnapshotList(params, cb)
}

watch(
  () => cvmStore.areaSelect.id,
  () => {
    resetIptFn()
    getSnapshotListFn()
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.cvm-snapshot-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-snapshot-list-v2__area {
  display: inline-flex;
  align-items: center;
}

.cvm-snapshot-list-v2__panel {
  padding: 20px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-snapshot-list-v2__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cvm-snapshot-list-v2__actions,
.cvm-snapshot-list-v2__tools,
.cvm-snapshot-list-v2__ops {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.cvm-snapshot-list-v2__filter {
  width: 620px;
  max-width: 100%;
}

.cvm-snapshot-list-v2__icon-btn {
  flex: 0 0 auto;
}

.cvm-snapshot-list-v2__name-cell {
  min-width: 0;
}

.cvm-snapshot-list-v2__link {
  color: #06f;
  cursor: pointer;
}

.cvm-snapshot-list-v2__subtext {
  margin-top: 4px;
  color: #191c23;
}

.cvm-snapshot-list-v2__status-cell,
.cvm-snapshot-list-v2__time-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-snapshot-list-v2__loading-icon,
.cvm-snapshot-list-v2__time-icon {
  color: #8b95a7;
}

.cvm-snapshot-list-v2__more {
  min-width: 92px;
}

@media (width <= 768px) {
  .cvm-snapshot-list-v2__panel {
    padding: 16px;
  }

  .cvm-snapshot-list-v2__filter {
    width: 100%;
  }
}
</style>
