<template>
  <div>
    <PageHeader :title="t('snapshot.list.snapshot')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <div style="padding: 20px" class="page-box">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <!-- 删除 -->
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

          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('snapshot.list.listPh')"
              :filter-list="iptFilterConfig"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" @click="refresh">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="list"
          class="mt20 table"
          @selection-change="handleRowSelectChange"
          @row-click="row => console.log(row)"
        >
          <el-table-column type="selection" width="40" :selectable="row => isDelete(row.state)" />
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('snapshot.list.idName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary pointer">
                  <Copy :text="row.snapshotId" style="display: inline-block" @handle-click="toDetail(row)" />
                </div>
                <div class="text-over">
                  {{ row.name || '-' }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 状态 -->
          <el-table-column min-width="200" :label="t('snapshot.list.state')">
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
              <div class="df ac">
                <StatusGroup :list="SNAPSHOT_STATE_ARR_MAP" :value="row.state" />
                <SvgIcon v-if="row.loadingState" class="ml4" name="loading" />
              </div>
            </template>
          </el-table-column>
          <!-- 硬盘属性 -->
          <el-table-column min-width="200" :label="t('snapshot.list.diskType')">
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
              <div>{{ row.diskSize || 0 }}GiB</div>
            </template>
          </el-table-column>
          <!-- 关联硬盘 -->
          <el-table-column min-width="200" :label="t('snapshot.list.bindDisk')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div v-if="handleBindDisk(row).show" class="text-primary pointer" @click="toDisk(row)">
                  {{ row.serviceDiskId }}
                </div>
                <div v-if="handleBindDisk(row).show" class="text-over">
                  {{ row.diskName }}
                </div>
                <div v-if="!handleBindDisk(row).show">-</div>
              </div>
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column min-width="220" :label="t('snapshot.list.createTime')">
            <template #header>
              <div class="df ac">
                <span>{{ t('snapshot.list.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}</div>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column min-width="220" :label="t('snapshot.list.opts')" fixed="right">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 回滚 -->
                <DisableText
                  v-if="checkPermission(permMap.snapshot.ROLLBACK_SNAPSHOT)"
                  class="mr20"
                  :disabled="!isRollBack(row.state)"
                  :text="t('snapshot.list.rollBack')"
                  :open-tooltip="!isRollBack(row.state)"
                  @click="rollBack(row)"
                >
                  <template #content>
                    <div style="width: 200px">
                      {{ t('snapshot.list.noRollBackDesc') }}
                    </div>
                  </template>
                </DisableText>

                <!-- 删除 -->
                <DisableText
                  v-if="checkPermission(permMap.snapshot.EXPUNGE_SNAPSHOT)"
                  class="mr20"
                  :disabled="!isDelete(row.state)"
                  :text="t('snapshot.list.delete')"
                  @click="singleRemove(row)"
                />

                <div style="width: 130px">
                  <el-select
                    class="select-tr"
                    :placeholder="t('snapshot.list.more')"
                    suffix-icon=""
                    @change="
                      v => {
                        handleOperatechange(v, row)
                      }
                    "
                  >
                    <el-option
                      v-for="item in snapshotMoreList"
                      :key="item.value"
                      :value="item"
                      :label="item.label"
                      :disabled="selectOptDisabled(item, row)"
                    />
                  </el-select>
                </div>
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
        <RollBack ref="rollBackRef" :snapshot-list="[snapshot]" @success="getSnapshotListFn" />
        <!-- 删除 -->
        <Delete ref="deleteRef" :snapshot-list="removeConfig.list" @success="getSnapshotListFn" />
        <!-- 创建自定义镜像 -->
        <!-- <CreateCustomImage ref="createCustomImageRef" :snapshotList="[snapshot]" @success="getSnapshotListFn" /> -->
        <!-- 创建硬盘 -->
        <CreateDisk ref="createDiskRef" :snapshot-create-config="snapshotCreateConfig" @success="getSnapshotListFn" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import RollBack from './components/roll-back.vue'
import Delete from './components/delete.vue'
// import CreateCustomImage from './components/create-custom-image.vue'
import CreateDisk from '@/views/cvm/disk/list/components/create-disk.vue'
import { AreaSelectType } from '@/store/cvm'
import { useCvmStore } from '@/store'
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
import { httpUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

/**
 * @desc 快照和镜像暂时没有绑定关系
 */
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
const { handleThSelectFn, handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)
const cvmStore = useCvmStore()

// 地区
const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})
const list = ref<any[]>([]) // 列表
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
  diskId?: number
}>({
  checkSnapshot: false, // 是否快速创建
  snapshotId: '', // 快照id
  snapshotName: '', // 快照名称
  diskId: 0, // 硬盘主键id
})
const selectList = ref<any[]>([]) // 选中的
const snapshot = ref<any>({}) // 当前快照

// 删除配置
const removeConfig = reactive<{
  type: 'single' | 'batch'
  list: any[]
}>({
  type: 'single',
  list: [],
})

const rollBackRef = ref<InstanceType<typeof RollBack>>() // 回滚
const deleteRef = ref<InstanceType<typeof Delete>>() // 删除
// const createCustomImageRef = ref<InstanceType<typeof CreateCustomImage>>() // 创建自定义镜像
const createDiskRef = ref<InstanceType<typeof CreateDisk>>() // 创建硬盘
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

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.snapshot,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const snapshotMoreList = computed(() => {
  const filterCb = el => {
    // 判断不同厂商支持的功能
    if (el.perm) {
      return checkPermission(el.perm)
    } else {
      return true
    }
  }

  return SNAPSHOT_MORE_OPTS.filter(filterCb)
})

// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  console.log(`searchFn===>`, search)
  paginationConfig.pagination.page = 1

  stateThFilterRef.value?.updateCheck(search?.states)
  diskTypesThFilterRef.value?.updateCheck(search?.diskTypes)
  getSnapshotListFn(search)
}

// 表格的筛选项同步到搜索框搜索项中
const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  console.log(`tableCheckFilterFn===>`, list, fieldKey)

  if (fieldKey === 'states') {
    handleThCheckFn(list, 'states', t('snapshot.list.state'))
  }
  if (fieldKey === 'diskTypes') {
    handleThCheckFn(list, 'diskTypes', t('snapshot.list.diskType'))
  }
}

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
}

const refresh = () => {
  start()
  resetIptFn()
  // getSnapshotListFn()
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

// 跳转硬盘详情
const toDisk = (row: any) => {
  console.log(`toDisk===>`, row)

  const id = row.diskId
  const diskState = row.diskState
  if (isHasBindDisk(diskState)) {
    pushRoute({
      name: 'disk_detail',
      params: {
        id,
      },
    })
  }
}

// 跳转详情
const toDetail = (row: any) => {
  console.log(`toDetail===>`, row)

  const id = row.id

  pushRoute({
    name: 'snapshot_detail',
    params: {
      id,
    },
  })
}

// 跳转快照链
const toChain = (row: any) => {
  console.log(`toChain===>`, row)

  const id = row.diskId

  pushRoute({
    name: 'snapshot_chain',
    params: {
      id,
    },
    query: {
      chainName: row.serviceDiskId || '',
    },
  })
}

// 回滚
const rollBack = (row: any) => {
  snapshot.value = row
  changeShow(rollBackRef.value)
}

// 删除
const singleRemove = (row: any) => {
  removeConfig.type = 'single'
  removeConfig.list = [row]
  changeShow(deleteRef.value)
}

// 批量删除
const batchRemove = () => {
  const arr = selectList.value.filter(el => [1, 6].includes(el.state))

  if (arr.length) {
    removeConfig.type = 'batch'
    removeConfig.list = arr
    changeShow(deleteRef.value)
  }
}

// 创建云硬盘
const createDisk = (row: any) => {
  snapshotCreateConfig.checkSnapshot = true
  snapshotCreateConfig.snapshotId = row.id
  snapshotCreateConfig.snapshotName = row.name
  snapshotCreateConfig.diskId = row.diskId

  changeShow(createDiskRef.value)
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// select opt disabled
const selectOptDisabled = (v: any, row: any) => {
  // 新建云硬盘
  if (v.value === 'createDisk') {
    return !isCreateDisk(row.state, row.diskType)
  }
  // 查看快照链
  if (v.value === 'chain') {
    return !isSeeChain(row.state)
  }
}

// 操作
const handleOperatechange = (v: any, row: any) => {
  console.log(`handleOperatechange===>`, v, row)
  // 新建云硬盘
  if (v.value === 'createDisk') {
    if (isCreateDisk(row.state, row.diskType)) {
      createDisk(row)
    }
  }

  // 查看快照链
  if (v.value === 'chain') {
    if (isSeeChain(row.state)) {
      toChain(row)
    }
  }
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

// 快照列表
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

onMounted(async () => {
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
@use '@/views/cvm/style/common';

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
