<template>
  <div>
    <PageHeader :title="t('snapshot.policy.title')" :back-title="t('snapshot.chain.backTitle')" back-name="snapshot" />

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <!-- 删除 -->
            <el-button
              v-if="checkPermission(permMap.snapshot.DELETE_SNAPSHOT_TACTICS)"
              :type="selectList.length ? 'primary' : ''"
              :disabled="!selectList.length"
              @click="batchRemove"
            >
              {{ t('snapshot.chain.delete') }}
            </el-button>
          </div>

          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('snapshot.policy.listPh')"
              :filter-list="iptFilterConfig"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" @click="refresh">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table v-loading="loading" :data="list" class="mt20 table" @selection-change="handleRowSelectChange">
          <el-table-column type="selection" width="40" />
          <!-- 名称 -->
          <el-table-column min-width="200" :label="t('snapshot.policy.name')">
            <template #default="{ row }">
              <div>{{ row.name }}</div>
            </template>
          </el-table-column>
          <!-- 关联云硬盘 -->
          <el-table-column min-width="200" :label="t('snapshot.policy.bindDisk')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ row.diskIdList ? row.diskIdList?.join(',') : '-' }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 备份日期 -->
          <el-table-column min-width="200" :label="t('snapshot.policy.backupDay')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ dayOfWeekText(row) }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 备份时间点 -->
          <el-table-column min-width="200" :label="t('snapshot.policy.backupTime')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ dayOfHourText(row) }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 保留时间 -->
          <el-table-column min-width="200" :label="t('snapshot.policy.retenteTime')">
            <template #default="{ row }">
              <div class="df ac">
                <span>{{ t('snapshot.policy.saveTime', [row.reserveDay]) }}</span>
              </div>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column min-width="200" :label="t('snapshot.policy.opts')" fixed="right">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 修改 -->
                <span
                  v-if="checkPermission(permMap.snapshot.UPDATE_SNAPSHOT_TACTICS)"
                  class="text-primary pointer mr20"
                  @click="modifyPolicyFn(row)"
                  >{{ t('snapshot.policy.edit') }}</span
                >
                <!-- 删除 -->
                <span
                  v-if="checkPermission(permMap.snapshot.DELETE_SNAPSHOT_TACTICS)"
                  class="text-primary pointer"
                  @click="singleRemove(row)"
                  >{{ t('snapshot.policy.delete') }}</span
                >
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
      </el-card>
    </div>

    <!-- 编辑 -->
    <ModifySnapshotPolicy
      ref="modifySnapshotPolicyRef"
      :snapshot-policy="snapshotPolicy"
      @success="listSnapshotPolicy"
    />
    <!-- 删除 -->
    <DeleteSnapshotPolicy
      ref="deleteSnapshotPolicyRef"
      :snapshot-list="removeConfig.list"
      @success="listSnapshotPolicy"
    />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore, useCvmStore } from '@/store'
import ModifySnapshotPolicy from './components/modify-snapshot-policy.vue'
import DeleteSnapshotPolicy from './components/delete-snapshot-policy.vue'
import { IPagination } from '@/views/account-system/type'
import { useFilter } from '@/components/cvm/query-filter/use-filter'
import { SNAPSHOT_STRAGETY_WEEK_MAP, SNAPSHOT_STRAGETY_HOUR_MAP } from '@/views/cvm/snapshot/config'
import { _listSnapshotPolicy } from '@/apis/cvm/snapshot'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'

const defaultIptFilterConfig = [{ fieldName: t('snapshot.policy.name'), fieldKey: 'condition' }]
const bodyStyle = { height: '100%' }

const { filterInputRef, iptFilterConfig, resetIptFn } = useFilter({}, defaultIptFilterConfig)

const loading = ref<boolean>(false)
const snapshotPolicy = ref<any>({}) // 当前快照策略
const selectList = ref<any[]>([]) // 选中的
const list = ref<any[]>([]) // 快照策略列表
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

// 删除配置
const removeConfig = reactive<{
  type: 'single' | 'batch'
  list: any[]
}>({
  type: 'single',
  list: [],
})

const modifySnapshotPolicyRef = ref<InstanceType<typeof ModifySnapshotPolicy>>() // 编辑
const deleteSnapshotPolicyRef = ref<InstanceType<typeof DeleteSnapshotPolicy>>() // 删除

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.snapshot,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  console.log(`searchFn===>`, search)
  paginationConfig.pagination.page = 1

  listSnapshotPolicy(search)
}

const refresh = () => {
  resetIptFn()
  listSnapshotPolicy()
}

// 编辑
const modifyPolicyFn = (row: any) => {
  snapshotPolicy.value = row
  changeShow(modifySnapshotPolicyRef.value)
}

// 删除
const singleRemove = (row: any) => {
  removeConfig.type = 'single'
  removeConfig.list = [row]
  changeShow(deleteSnapshotPolicyRef.value)
}

// 批量删除
const batchRemove = () => {
  if (selectList.value.length) {
    removeConfig.type = 'batch'
    removeConfig.list = selectList.value
    changeShow(deleteSnapshotPolicyRef.value)
  }
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
  listSnapshotPolicy()
}

// 日期格式
const dayOfWeekText = (raw: any, symbol: string = ' | ') => {
  const dayOfWeek = raw.dayOfWeek || []

  const arr = SNAPSHOT_STRAGETY_WEEK_MAP.filter(el => dayOfWeek.includes(el.value)).map(el => el.label)

  return arr.join(symbol)
}

// 时间格式
const dayOfHourText = (raw: any, symbol: string = ' | ') => {
  const hour = raw.hour || []

  const arr = SNAPSHOT_STRAGETY_HOUR_MAP.filter(el => hour.includes(el.value)).map(el => el.label)

  return arr.join(symbol)
}

// 定期快照策略列表
const listSnapshotPolicy = async (search = filterInputRef.value?.searchParams || {}) => {
  try {
    loading.value = true
    const res = await _listSnapshotPolicy({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      ...search,
    })

    console.log(`_listSnapshotPolicy===>`, res)

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

onMounted(async () => {
  useTempStore().setPageHeader(false)
  listSnapshotPolicy()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
@use '@/views/cvm/style/common';
</style>
