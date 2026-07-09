<template>
  <el-card shadow="never" class="page-box mb20" :body-style="bodyStyle">
    <el-table
      v-loading="loading"
      :data="list"
      class="mt20 table"
      @selection-change="handleRowSelectChange"
      @row-click="row => console.log(row)"
    >
      <el-table-column type="selection" width="40" />
      <!-- ID/名称 -->
      <el-table-column min-width="200" :label="t('disk.snapshot.idName')">
        <template #default="{ row }">
          <div class="text-primary">
            {{ row.snapshotId }}
          </div>
          <div>{{ row.name || '-' }}</div>
        </template>
      </el-table-column>
      <!-- 状态 -->
      <el-table-column min-width="200" :label="t('disk.snapshot.state')">
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
          <div class="df ac">
            <StatusGroup :list="SNAPSHOT_STATE_ARR_MAP" :value="row.state" />
            <SvgIcon v-if="row.loadingState" class="ml4" name="loading" />
          </div>
        </template>
      </el-table-column>
      <!-- 硬盘属性 -->
      <el-table-column min-width="200" :label="t('disk.snapshot.diskType')">
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
          <div>{{ row.size || 0 }}GiB</div>
        </template>
      </el-table-column>
      <!-- 关联硬盘 -->
      <el-table-column min-width="200" :label="t('disk.snapshot.bindDisk')">
        <template #default="{ row }">
          <div v-if="handleBindDisk(row).show" class="text-primary">
            {{ row.serviceDiskId }}
          </div>
          <div v-if="handleBindDisk(row).show">
            {{ row.diskName || '-' }}
          </div>
          <div v-if="!handleBindDisk(row).show">-</div>
        </template>
      </el-table-column>
      <!-- 硬盘挂载实例 -->
      <el-table-column min-width="200" :label="t('disk.snapshot.diskMountIns')">
        <template #default="{ row }">
          <div v-if="handleDiskMountIns(row).show">
            {{ row.insUuid }}
          </div>
          <div v-if="handleDiskMountIns(row).show">
            {{ row.instanceName }}
          </div>
          <div v-if="!handleDiskMountIns(row).show">-</div>
        </template>
      </el-table-column>
      <!-- 关联镜像 -->
      <!-- <el-table-column min-width="200" :label="t('关联镜像')">
        <template #default="{ row }">
          <div>关联镜像</div>
        </template>
      </el-table-column> -->
      <!-- 创建时间 -->
      <el-table-column min-width="220" :label="t('disk.snapshot.createTime')">
        <template #header>
          <div class="df ac">
            <span>{{ t('disk.snapshot.createTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <div>{{ row?.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '' }}</div>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column min-width="340" :label="t('disk.snapshot.opts')" fixed="right">
        <template #default="{ row }">
          <div class="df ac">
            <!-- 回滚 -->
            <DisableText
              v-if="checkPermission(permMap.snapshot.ROLLBACK_SNAPSHOT)"
              class="mr20"
              :disabled="!isRollBack(row.state)"
              :text="t('disk.snapshot.rollBack')"
              @click="rollBack(row)"
            />
            <!-- 删除 -->
            <DisableText
              v-if="checkPermission(permMap.snapshot.EXPUNGE_SNAPSHOT)"
              class="mr20"
              :disabled="!isDelete(row.state)"
              :text="t('disk.snapshot.delete')"
              @click="remove(row)"
            />
            <!-- 新建云硬盘 -->
            <DisableText
              v-if="checkPermission(permMap.snapshot.CREATE_HD_FROM_SNAPSHOT)"
              class="mr20"
              :disabled="!isCreateDisk(row.state, row.diskType)"
              :text="t('disk.snapshot.createDisk')"
              @click="createDisk(row)"
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

    <!-- 回滚 -->
    <RollBack ref="rollBackRef" :snapshot-list="[snapshot]" @success="rollBackSuccess" />
    <!-- 删除 -->
    <Delete ref="deleteRef" :snapshot-list="[snapshot]" @success="getSnapshotListFn" />
    <!-- 创建硬盘 -->
    <CreateDisk ref="createDiskRef" :snapshot-create-config="snapshotCreateConfig" @success="getSnapshotListFn" />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
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

const bodyStyle = { height: '100%' }
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

const id = ref<string>(route.params.id as string) // id
const list = ref<any[]>([]) // 列表
const selectList = ref<any[]>([]) // 选中的
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
// 快照创建云硬盘
const snapshotCreateConfig = reactive<{
  checkSnapshot: boolean
  snapshotId?: string
  snapshotName?: string
}>({
  checkSnapshot: false, // 是否快速创建
  snapshotId: '', // 快照id
  snapshotName: '', // 快照名称
})
const snapshot = ref<any>({}) // 当前快照

const rollBackRef = ref<InstanceType<typeof RollBack>>() // 回滚
const deleteRef = ref<InstanceType<typeof Delete>>() // 删除
const createDiskRef = ref<InstanceType<typeof CreateDisk>>() // 创建硬盘

// 厂商权限配置
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

// 表格的筛选项
const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  console.log(`tableCheckFilterFn===>`, list, fieldKey)
  const search = {
    [fieldKey]: list,
  }
  getSnapshotListFn(search)
}

// 关联硬盘
const handleBindDisk = (row: any) => {
  const config: any = {
    show: false,
  }
  config.show = row.serviceDiskId || row.diskName ? true : false
  config.serviceDiskId = row.serviceDiskId
  config.diskName = row.diskName

  return config
}

// 硬盘挂载实例
const handleDiskMountIns = (row: any) => {
  const config: any = {
    show: false,
  }
  config.show = row.insUuid || row.instanceName ? true : false
  config.insUuid = row.insUuid
  config.instanceName = row.instanceName

  return config
}

const rollBackSuccess = () => {
  getSnapshotListFn()
  // 刷新详情
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

// 创建云硬盘
const createDisk = (row: any) => {
  snapshotCreateConfig.checkSnapshot = true
  snapshotCreateConfig.snapshotId = row.id
  snapshotCreateConfig.snapshotName = row.name

  changeShow(createDiskRef.value)
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
}

// 分页
const paginationChange = () => {
  getSnapshotListFn()
}

// 根据硬盘id查询快照列表
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

<style lang="scss" scoped>
@use '@/views/cvm/style/common';
</style>
