<template>
  <div class="cvm-snapshot-chain-v2">
    <PageBreadcrumbToolbar :items="[t('snapshot.list.snapshot'), title]" @doc="openHelpDoc" />

    <section class="cvm-snapshot-chain-v2__summary">
      <div class="cvm-snapshot-chain-v2__summary-item">
        <div class="cvm-snapshot-chain-v2__summary-label">
          {{ t('snapshot.chain.snapshotNum') }}
        </div>
        <div class="cvm-snapshot-chain-v2__summary-value">
          {{ snapshotCount || 0 }}
        </div>
      </div>

      <div class="cvm-snapshot-chain-v2__summary-item">
        <div class="cvm-snapshot-chain-v2__summary-label">
          {{ t('snapshot.chain.snapshotSize') }}
        </div>
        <div class="cvm-snapshot-chain-v2__summary-value">
          {{ snapshotSize || 0 }}
          <span class="cvm-snapshot-chain-v2__summary-unit">GiB</span>
        </div>
      </div>
    </section>

    <section class="cvm-snapshot-chain-v2__panel">
      <div class="cvm-snapshot-chain-v2__toolbar">
        <div class="cvm-snapshot-chain-v2__actions">
          <el-button
            v-if="checkPermission(permMap.snapshot.EXPUNGE_SNAPSHOT)"
            :type="selectList.length ? 'primary' : ''"
            :disabled="!isDeleteBatch(selectList.map(el => el.state))"
            @click="batchRemove"
          >
            {{ t('snapshot.chain.delete') }}
          </el-button>
        </div>

        <div class="cvm-snapshot-chain-v2__tools">
          <FilterInput
            ref="filterInputRef"
            class="cvm-snapshot-chain-v2__filter"
            :placeholder="t('snapshot.list.listPh')"
            :filter-list="iptFilterConfig"
            @search="searchFn"
          />
          <CdnIconButton class="cvm-snapshot-chain-v2__icon-btn" @click="refresh">
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

        <el-table-column min-width="210" :label="t('snapshot.chain.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-snapshot-chain-v2__name-cell">
              <div class="cvm-snapshot-chain-v2__link">
                <Copy :text="row.snapshotId" style="display: inline-block" />
              </div>
              <div class="cvm-snapshot-chain-v2__subtext">
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
              :label="t('snapshot.chain.state')"
              tip=""
              :field-key="tableFilterConfig.states.fieldKey"
              :field-type="tableFilterConfig.states.fieldType"
              :list="tableFilterConfig.states.opts"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            <StatusGroup :list="SNAPSHOT_STATE_ARR_MAP" :value="row.state" />
          </template>
        </el-table-column>

        <el-table-column min-width="200">
          <template #header>
            <TableHeadFilter
              ref="diskTypesThFilterRef"
              v-model="tableFilterConfig.diskTypes.value"
              :label="t('snapshot.chain.diskType')"
              tip=""
              :field-key="tableFilterConfig.diskTypes.fieldKey"
              :field-type="tableFilterConfig.diskTypes.fieldType"
              :list="tableFilterConfig.diskTypes.opts"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            <div>{{ DISK_TYPE_MAP[row.diskType] }}</div>
            <div class="cvm-snapshot-chain-v2__subtext">{{ row.diskSize || 0 }}GiB</div>
          </template>
        </el-table-column>

        <el-table-column min-width="220" :label="t('snapshot.chain.bindDisk')" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="handleBindDisk(row).show" class="cvm-snapshot-chain-v2__name-cell">
              <div class="cvm-snapshot-chain-v2__link" @click="toDisk(row)">
                {{ row.serviceDiskId }}
              </div>
              <div class="cvm-snapshot-chain-v2__subtext">
                {{ row.diskName }}
              </div>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>

        <el-table-column min-width="220" :label="t('snapshot.chain.diskMountIns')" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="handleDiskMountIns(row).show" class="cvm-snapshot-chain-v2__name-cell">
              <div class="cvm-snapshot-chain-v2__link">
                {{ row.insUuid }}
              </div>
              <div class="cvm-snapshot-chain-v2__subtext">
                {{ row.instanceName }}
              </div>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>

        <el-table-column min-width="220">
          <template #header>
            <div class="cvm-snapshot-chain-v2__time-head">
              <span>{{ t('snapshot.chain.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="cvm-snapshot-chain-v2__time-icon" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>

        <el-table-column min-width="220" fixed="right" :label="t('snapshot.chain.opts')">
          <template #default="{ row }">
            <div class="cvm-snapshot-chain-v2__ops">
              <DisableText
                v-if="checkPermission(permMap.snapshot.ROLLBACK_SNAPSHOT)"
                :disabled="!isRollBack(row.state)"
                :text="t('snapshot.chain.rollBack')"
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
                :text="t('snapshot.chain.delete')"
                disabled-type="hidden"
                @click="singleRemove(row)"
              />

              <Select
                v-if="snapshotChainMoreList.length"
                class="cvm-snapshot-chain-v2__more"
                :one-menu-width="140"
                :select-width="92"
                :list="snapshotChainMoreList"
                :ph="t('snapshot.chain.more')"
                :no-border="true"
                @opt-click="handleOperatechange($event, row)"
              />
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <RollBack ref="rollBackRef" :snapshot-list="[snapshot]" @success="getSnapshotListFn" />
    <Delete ref="deleteRef" :snapshot-list="removeConfig.list" @success="getSnapshotListFn" />
    <CreateDisk ref="createDiskRef" :snapshot-create-config="snapshotCreateConfig" @success="getSnapshotListFn" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { useTempStore, useCvmStore } from '@/store'
import RollBack from '@/views/cvm/snapshot/list/components/roll-back.vue'
import Delete from '@/views/cvm/snapshot/list/components/delete.vue'
import { IPagination } from '@/views/account-system/type'
import {
  SNAPSHOT_STATE_ARR_MAP,
  SNAPSHOT_CHAIN_MORE_OPTS,
  SNAPSHOT_STATE_FILTER_ARR_MAP,
  isDelete,
  isRollBack,
  isCreateDisk,
  isDeleteBatch,
  isHasBindDisk,
} from '@/views/cvm/snapshot/config'
import { DISK_TYPE_MAP, DISK_TYPE_FILTER_MAP } from '@/views/cvm/disk/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import CreateDisk from '@/views/cvm/disk/list/components/create-disk.vue'
import { useSnapshot } from '@/views/cvm/hooks/use-snapshot'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
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
  { fieldName: t('snapshot.chain.state'), fieldKey: 'states', fieldType: 'check', list: SNAPSHOT_STATE_FILTER_ARR_MAP },
  {
    fieldName: t('snapshot.list.diskType'),
    fieldKey: 'diskTypes',
    fieldType: 'check',
    list: DISK_TYPE_FILTER_MAP,
  },
]

const route = useRoute()
const { getSnapshotList, loading } = useSnapshot()
const { handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)

const diskId = ref<string>(route.params.id as string)
const snapshot = ref<any>({})
const selectList = ref<any[]>([])
const list = ref<any[]>([])
const snapshotCount = ref<number>(0)
const snapshotSize = ref<number>(0)
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
}>({
  checkSnapshot: false,
  snapshotId: '',
  snapshotName: '',
})

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

const cvmStore = useCvmStore()
const permConfig = reactive({
  moduleId: moduleMap.snapshot,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const snapshotChainMoreList = computed(() => {
  return SNAPSHOT_CHAIN_MORE_OPTS.filter(el => (el.perm ? checkPermission(el.perm) : true))
})

const title = computed(() => t('snapshot.chain.title', [route.query.chainName || '-']))

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const searchFn = (search: any) => {
  paginationConfig.pagination.page = 1
  stateThFilterRef.value?.updateCheck(search?.states)
  diskTypesThFilterRef.value?.updateCheck(search?.diskTypes)
  getSnapshotListFn(search)
}

const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  if (fieldKey === 'states') {
    handleThCheckFn(list, 'states', t('snapshot.chain.state'))
  }
  if (fieldKey === 'diskTypes') {
    handleThCheckFn(list, 'diskTypes', t('snapshot.list.diskType'))
  }
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

const handleBindDisk = (row: any) => {
  return {
    show: !!(row.serviceDiskId || row.diskName),
    serviceDiskId: row.serviceDiskId,
    diskName: row.diskName,
  }
}

const handleDiskMountIns = (row: any) => {
  return {
    show: !!(row.insUuid || row.instanceName),
    insUuid: row.insUuid,
    instanceName: row.instanceName,
  }
}

const refresh = () => {
  start()
  resetIptFn()
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
  removeConfig.type = 'batch'
  removeConfig.list = selectList.value
  changeShow(deleteRef.value)
}

const createDisk = (row: any) => {
  snapshotCreateConfig.checkSnapshot = true
  snapshotCreateConfig.snapshotId = row.id
  snapshotCreateConfig.snapshotName = row.name
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
      snapshotSize.value = res.data?.snapshotSize
      snapshotCount.value = res.data?.snapshotCount
      paginationConfig.total = res.data.recordCnt
    }
  }

  notice(4)
  getSnapshotList(
    {
      diskId: diskId.value,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      ...search,
    },
    cb,
  )
}

onMounted(() => {
  useTempStore().setPageHeader(false)
  getSnapshotListFn()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.cvm-snapshot-chain-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-snapshot-chain-v2__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  padding: 24px 40px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-snapshot-chain-v2__summary-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cvm-snapshot-chain-v2__summary-label {
  font-size: 12px;
  line-height: 24px;
  color: #667085;
}

.cvm-snapshot-chain-v2__summary-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
  color: #191c23;
}

.cvm-snapshot-chain-v2__summary-unit {
  margin-left: 8px;
  font-size: 18px;
  font-weight: 400;
  line-height: 28px;
  color: #667085;
}

.cvm-snapshot-chain-v2__panel {
  padding: 20px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-snapshot-chain-v2__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cvm-snapshot-chain-v2__actions,
.cvm-snapshot-chain-v2__tools,
.cvm-snapshot-chain-v2__ops {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.cvm-snapshot-chain-v2__filter {
  width: 620px;
  max-width: 100%;
}

.cvm-snapshot-chain-v2__icon-btn {
  flex: 0 0 auto;
}

.cvm-snapshot-chain-v2__name-cell {
  min-width: 0;
}

.cvm-snapshot-chain-v2__link {
  color: #06f;
  cursor: pointer;
}

.cvm-snapshot-chain-v2__subtext {
  margin-top: 4px;
  color: #191c23;
}

.cvm-snapshot-chain-v2__time-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-snapshot-chain-v2__time-icon {
  color: #8b95a7;
}

.cvm-snapshot-chain-v2__more {
  min-width: 92px;
}

@media (width <= 768px) {
  .cvm-snapshot-chain-v2__summary {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    padding: 24px 20px;
  }

  .cvm-snapshot-chain-v2__summary-value {
    font-size: 40px;
  }

  .cvm-snapshot-chain-v2__panel {
    padding: 16px;
  }

  .cvm-snapshot-chain-v2__filter {
    width: 100%;
  }
}
</style>
