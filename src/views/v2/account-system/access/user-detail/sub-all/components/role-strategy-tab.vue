<template>
  <section class="user-detail-role-tab">
    <h3 class="user-detail-role-tab__title">
      {{ t('overview.associateRole') }}
    </h3>

    <InfoNotice :text="t('user.roleStrategyTip')" />

    <div class="user-detail-role-tab__toolbar">
      <div class="user-detail-role-tab__actions">
        <el-button type="primary" @click="openEmpowerDialog">
          {{ t('user.authRole') }}
        </el-button>
        <el-button :type="selectedRows.length ? 'primary' : 'default'" @click="openRemoveDialog('batch')">
          {{ t('user.deleteRole') }}
        </el-button>
      </div>

      <div class="user-detail-role-tab__search">
        <el-input v-model.trim="condition" :placeholder="t('user.serviceSearchplaceholder')" :prefix-icon="Search" />
      </div>
    </div>

    <TableV2
      v-loading="loading"
      :data="list"
      :pagination="paginationConfig.pagination"
      :total="paginationConfig.total"
      show-pagination
      @change="getSelectUserRoleList"
      @update:pagination="paginationConfig.pagination = $event"
      @selection-change="handleRowSelectChange"
    >
      <el-table-column type="selection" width="46" />
      <el-table-column prop="roleName" :label="t('role.roleName')" min-width="220">
        <template #default="{ row }">
          <span class="user-detail-role-tab__link">{{ row.roleName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" :label="t('strategy.description')" min-width="220">
        <template #default="{ row }">
          {{ row.description || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="strategyNum" :label="t('role.strategyNum')" min-width="140">
        <template #default="{ row }">
          {{ row.strategyNum ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="createDate" min-width="220">
        <template #header>
          <div class="user-detail-role-tab__table-head">
            <span>{{ t('user.roleStrategyCreateDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ row.createDate ? maoYunDayJs(row.createDate).format(FORMAT_TIME) : '-' }}
        </template>
      </el-table-column>
      <el-table-column :label="t('common.operation')" min-width="120">
        <template #default="{ row }">
          <button type="button" class="user-detail-role-tab__link" @click="openRemoveDialog('single', row)">
            {{ t('user.deleteRole') }}
          </button>
        </template>
      </el-table-column>
    </TableV2>

    <CatDialog
      v-model:dialog="remove.show"
      class="user-detail-role-tab__dialog"
      :title="t('user.deleteRole')"
      width="600px"
      destroy-on-close
      :loading="removeLoading"
      @confirm="userRoleDelete"
    >
      <el-row class="user-detail-role-tab__dialog-text">
        {{ t('user.deleteRoleStrategyDesc') }}
      </el-row>
    </CatDialog>

    <AssociaeRoleDialog :id="userId" ref="associaeRoleDialogRef" @success="getSelectUserRoleList" />
  </section>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { _getSelectUserRoleList, _userRoleDelete } from '@/apis/account-system/access/user'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import type { IPagination } from '@/views/account-system/type'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import AssociaeRoleDialog from '@/views/account-system/access/user/list/components/associae-role-dialog.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const props = defineProps<{
  userId: number
}>()

const associaeRoleDialogRef = ref<InstanceType<typeof AssociaeRoleDialog> | null>(null)
const loading = ref(false)
const removeLoading = ref(false)
const condition = ref('')
const list = ref<any[]>([])
const selectedRows = ref<any[]>([])
const remove = reactive<{
  show: boolean
  roleIds: number[]
}>({
  show: false,
  roleIds: [],
})
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const handleRowSelectChange = selection => {
  selectedRows.value = selection
}

const openEmpowerDialog = () => {
  if (associaeRoleDialogRef.value) {
    associaeRoleDialogRef.value.show = true
  }
}

const openRemoveDialog = (type: 'batch' | 'single', row?: any) => {
  if (type === 'batch') {
    if (!selectedRows.value.length) {
      return message.warning(t('user.associateRoleWarn'))
    }
    remove.roleIds = selectedRows.value.map(el => el.id)
  } else {
    remove.roleIds = [row.id]
  }
  remove.show = true
}

const userRoleDelete = async () => {
  try {
    removeLoading.value = true
    const res = await _userRoleDelete({
      id: props.userId,
      roleIds: remove.roleIds,
    })

    if (res.success) {
      message.success(t('user.deleteRoleStrategySuccess'))
      remove.show = false
      remove.roleIds = []
      selectedRows.value = []
      getSelectUserRoleList()
    } else {
      message.warning(t('user.deleteRoleStrategyFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    removeLoading.value = false
  }
}

const getSelectUserRoleList = async () => {
  try {
    loading.value = true
    const res = await _getSelectUserRoleList({
      id: props.userId,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      condition: condition.value,
    })

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt || 0
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

watch(condition, () => {
  paginationConfig.pagination.page = 1
  getSelectUserRoleList()
})

watch(
  () => props.userId,
  () => {
    selectedRows.value = []
    paginationConfig.pagination.page = 1
    getSelectUserRoleList()
  },
)

onMounted(() => {
  getSelectUserRoleList()
})
</script>

<style scoped lang="scss">
.user-detail-role-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-detail-role-tab__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.user-detail-role-tab__toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.user-detail-role-tab__actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-detail-role-tab__search {
  width: 332px;
}

.user-detail-role-tab__table-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.user-detail-role-tab__link {
  padding: 0;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.user-detail-role-tab__dialog-text {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

@media (width <= 768px) {
  .user-detail-role-tab__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .user-detail-role-tab__actions {
    flex-wrap: wrap;
  }

  .user-detail-role-tab__search {
    width: 100%;
  }
}
</style>
