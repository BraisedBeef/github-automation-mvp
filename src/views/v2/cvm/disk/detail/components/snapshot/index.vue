<template>
  <section class="cvm-disk-snapshot-v2">
    <TableV2
      v-model:pagination="paginationConfig.pagination"
      v-loading="loading"
      :data="list"
      :total="paginationConfig.total"
      :empty-min-height="360"
      show-pagination
      @selection-change="handleRowSelectChange"
      @change="paginationChange"
    >
      <el-table-column type="selection" width="54" />

      <el-table-column min-width="220" :label="t('disk.snapshot.idName')">
        <template #default="{ row }">
          <div class="cvm-disk-snapshot-v2__name-cell">
            <div class="cvm-disk-snapshot-v2__link">
              {{ row.snapshotId }}
            </div>
            <div class="cvm-disk-snapshot-v2__subtext">
              {{ row.name || '-' }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="180">
        <template #header>
          <TableHeadFilter
            v-model="tableFilterConfig.states.value"
            :label="t('disk.snapshot.state')"
            tip=""
            :field-key="tableFilterConfig.states.fieldKey"
            :field-type="tableFilterConfig.states.fieldType"
            :list="tableFilterConfig.states.opts"
            @change="tableCheckFilterFn"
          />
        </template>
        <template #default="{ row }">
          <div class="cvm-disk-snapshot-v2__status-cell">
            <StatusGroup :list="SNAPSHOT_STATE_ARR_MAP" :value="row.state" />
            <SvgIcon v-if="row.loadingState" class="cvm-disk-snapshot-v2__loading-icon" name="loading" />
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="200">
        <template #header>
          <TableHeadFilter
            v-model="tableFilterConfig.diskTypes.value"
            :label="t('disk.snapshot.diskType')"
            tip=""
            :field-key="tableFilterConfig.diskTypes.fieldKey"
            :field-type="tableFilterConfig.diskTypes.fieldType"
            :list="tableFilterConfig.diskTypes.opts"
            @change="tableCheckFilterFn"
          />
        </template>
        <template #default="{ row }">
          <div>{{ DISK_TYPE_MAP[row.diskType] }}</div>
          <div class="cvm-disk-snapshot-v2__subtext">{{ row.size || 0 }}GiB</div>
        </template>
      </el-table-column>

      <el-table-column min-width="220" :label="t('disk.snapshot.bindDisk')">
        <template #default="{ row }">
          <div v-if="handleBindDisk(row).show" class="cvm-disk-snapshot-v2__name-cell">
            <div class="cvm-disk-snapshot-v2__link">
              {{ row.serviceDiskId }}
            </div>
            <div class="cvm-disk-snapshot-v2__subtext">
              {{ row.diskName || '-' }}
            </div>
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>

      <el-table-column min-width="220" :label="t('disk.snapshot.diskMountIns')">
        <template #default="{ row }">
          <div v-if="handleDiskMountIns(row).show" class="cvm-disk-snapshot-v2__name-cell">
            <div>{{ row.insUuid }}</div>
            <div class="cvm-disk-snapshot-v2__subtext">
              {{ row.instanceName }}
            </div>
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>

      <el-table-column min-width="220">
        <template #header>
          <div class="cvm-disk-snapshot-v2__time-head">
            <span>{{ t('disk.snapshot.createTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="cvm-disk-snapshot-v2__time-icon" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ row?.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}
        </template>
      </el-table-column>

      <el-table-column min-width="280" fixed="right" :label="t('disk.snapshot.opts')">
        <template #default="{ row }">
          <div class="cvm-disk-snapshot-v2__ops">
            <DisableText
              v-if="checkPermission(permMap.snapshot.ROLLBACK_SNAPSHOT)"
              :disabled="!isRollBack(row.state)"
              :text="t('disk.snapshot.rollBack')"
              disabled-type="hidden"
              @click="rollBack(row)"
            />
            <DisableText
              v-if="checkPermission(permMap.snapshot.EXPUNGE_SNAPSHOT)"
              :disabled="!isDelete(row.state)"
              :text="t('disk.snapshot.delete')"
              disabled-type="hidden"
              @click="remove(row)"
            />
            <DisableText
              v-if="checkPermission(permMap.snapshot.CREATE_HD_FROM_SNAPSHOT)"
              :disabled="!isCreateDisk(row.state, row.diskType)"
              :text="t('disk.snapshot.createDisk')"
              disabled-type="hidden"
              @click="createDisk(row)"
            />
          </div>
        </template>
      </el-table-column>
    </TableV2>

    <RollBack ref="rollBackRef" :snapshot-list="[snapshot]" @success="rollBackSuccess" />
    <Delete ref="deleteRef" :snapshot-list="[snapshot]" @success="getSnapshotListFn" />
    <CreateDisk ref="createDiskRef" :snapshot-create-config="snapshotCreateConfig" @success="getSnapshotListFn" />
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { IPagination } from '@/views/account-system/type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { DISK_TYPE_MAP, DISK_TYPE_FILTER_MAP } from '@/views/cvm/disk/config'
import {
  SNAPSHOT_STATE_ARR_MAP,
  SNAPSHOT_STATE_FILTER_ARR_MAP,
  isDelete,
  isRollBack,
  isCreateDisk,
} from '@/views/cvm/snapshot/config'
import RollBack from '@/views/cvm/snapshot/list/components/roll-back.vue'
import Delete from '@/views/cvm/snapshot/list/components/delete.vue'
import CreateDisk from '@/views/cvm/disk/list/components/create-disk.vue'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { useSnapshot } from '@/views/cvm/hooks/use-snapshot'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { httpUrl } from '@/config/base-config'

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {
  detail: () => ({}),
})

const emits = defineEmits<{
  (event: 'success'): void
}>()

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

const { getSnapshotList, loading } = useSnapshot()
const { tableFilterConfig } = useFilter(defaultTableFilterConfig)
const route = useRoute()
const cvmStore = useCvmStore()

const id = ref<string>(route.params.id as string)
const list = ref<any[]>([])
const selectList = ref<any[]>([])
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
const snapshot = ref<any>({})

const rollBackRef = ref<InstanceType<typeof RollBack>>()
const deleteRef = ref<InstanceType<typeof Delete>>()
const createDiskRef = ref<InstanceType<typeof CreateDisk>>()

const permConfig = reactive({
  moduleId: moduleMap.disk,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const { notice } = useUpdateResources(
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

const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  const search = {
    [fieldKey]: list,
  }
  getSnapshotListFn(search)
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

const rollBackSuccess = () => {
  getSnapshotListFn()
  emits('success')
}

const rollBack = (row: any) => {
  snapshot.value = row
  changeShow(rollBackRef.value)
}

const remove = (row: any) => {
  snapshot.value = row
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

const handleRowSelectChange = (selection: any) => {
  selectList.value = selection
}

const paginationChange = () => {
  getSnapshotListFn()
}

const getSnapshotListFn = async (search = {}) => {
  const cb = (res: any) => {
    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    }
  }
  const params = {
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    diskId: Number(id.value),
    ...search,
  }
  notice(4)
  getSnapshotList(params, cb)
}

onMounted(() => {
  getSnapshotListFn()
})
</script>

<style scoped lang="scss">
.cvm-disk-snapshot-v2 {
  padding: 32px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-disk-snapshot-v2__name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cvm-disk-snapshot-v2__link {
  color: #06f;
}

.cvm-disk-snapshot-v2__subtext {
  color: #2f3440;
  word-break: break-all;
}

.cvm-disk-snapshot-v2__status-cell,
.cvm-disk-snapshot-v2__ops {
  display: flex;
  align-items: center;
}

.cvm-disk-snapshot-v2__ops {
  flex-wrap: wrap;
  gap: 20px;
}

.cvm-disk-snapshot-v2__loading-icon {
  margin-left: 6px;
}

.cvm-disk-snapshot-v2__time-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-disk-snapshot-v2__time-icon {
  color: #8b95a7;
}

@media (width <= 768px) {
  .cvm-disk-snapshot-v2 {
    padding: 16px;
  }
}
</style>
