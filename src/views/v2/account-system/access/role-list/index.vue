<template>
  <div class="access-role-list-v2">
    <PageToolbar :title="t('accountSystemRoutes.role')" @doc="openHelpDoc" />

    <InfoNotice class="access-role-list-v2__notice">
      <div class="access-role-list-v2__notice-content">
        <div class="access-role-list-v2__notice-title">
          {{ t('role.tipMain') }}
        </div>
        <div class="access-role-list-v2__notice-desc">
          {{ t('role.tipSub') }}
        </div>
      </div>
    </InfoNotice>

    <section class="access-role-list-v2__panel">
      <div class="access-role-list-v2__actions">
        <el-button type="primary" class="access-role-list-v2__create" @click="toRoleCreate">
          {{ t('role.createRole') }}
        </el-button>

        <div class="access-role-list-v2__search">
          <el-input v-model="condition" :placeholder="t('role.searchPlaceholder')" :prefix-icon="Search" />
        </div>
      </div>

      <TableV2
        v-loading="loading"
        :data="list"
        :pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        show-pagination
        @change="getRoleList"
        @update:pagination="paginationConfig.pagination = $event"
      >
        <el-table-column prop="roleName" :label="t('role.roleName')" min-width="220">
          <template #default="{ row }">
            <button class="access-role-list-v2__link" type="button" @click="handleRowClick(row)">
              {{ row.roleName || '-' }}
            </button>
          </template>
        </el-table-column>

        <el-table-column prop="id" :label="t('role.roleID')" min-width="180">
          <template #default="{ row }">
            {{ row.id || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="strategyNum" :label="t('role.strategyNum')" min-width="140">
          <template #default="{ row }">
            {{ row.strategyNum ?? '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="updateDate" min-width="220">
          <template #header>
            <div class="access-role-list-v2__table-head">
              <span>{{ t('role.updateDate') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.updateDate ? maoYunDayJs(row.updateDate).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>

        <el-table-column :label="t('common.operation')" min-width="120">
          <template #default="{ row }">
            <button class="access-role-list-v2__link" type="button" @click.stop="openDelete(row)">
              {{ t('common.delete') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <CatDialog
      v-model:dialog="showDeleteDialog"
      class="access-role-list-v2__dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :loading="removeLoading"
      @confirm="deleteRole"
    >
      <el-row class="access-role-list-v2__dialog-text">
        {{ t('role.deleteRole') }}
      </el-row>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { documentUrl } from '@/config/base-config'
import { _deleteRole, _getRoleList } from '@/apis/account-system/access/role'
import { usePermission } from '@/hooks/permission/use-permission'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const insertRolePermission = usePermission('roleApi:insertRole')
const deleteRolePermission = usePermission('roleApi:deleteRole')

const showDeleteDialog = ref(false)
const list = ref<any[]>([])
const loading = ref(false)
const removeLoading = ref(false)
const condition = ref('')
const deleteId = ref('')
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const toRoleCreate = () => {
  if (!insertRolePermission.checkPermissionRes) {
    insertRolePermission.dialog({
      show: true,
      i18nKey: 'overview.createRolePerm',
    })
    return
  }

  pushRoute({
    name: 'access_role_create',
    query: {
      title: 'role.role',
      path: '/account-system/access/role/list',
    },
  })
}

const getRoleList = async () => {
  try {
    loading.value = true
    const res = await _getRoleList({
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

const handleRowClick = (row: any) => {
  pushRoute({
    name: 'access_role_detail',
    params: { id: row.id },
    query: {
      title: 'role.role',
      path: '/account-system/access/role/list',
    },
  })
}

const openDelete = (row: any) => {
  if (!deleteRolePermission.checkPermissionRes) {
    deleteRolePermission.dialog({
      show: true,
      i18nKey: 'role.deleteRolePerm',
    })
    return
  }

  showDeleteDialog.value = true
  deleteId.value = row.id
}

const deleteRole = async () => {
  try {
    removeLoading.value = true
    const res = await _deleteRole({ id: deleteId.value })

    if (res.success) {
      message.success(t('common.deleteSuccess'))
      showDeleteDialog.value = false
      getRoleList()
    } else {
      message.warning(t('role.deleteFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    removeLoading.value = false
  }
}

watch(condition, () => {
  paginationConfig.pagination.page = 1
  getRoleList()
})

onMounted(() => {
  getRoleList()
})
</script>

<style scoped lang="scss">
.access-role-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.access-role-list-v2__notice :deep(.v2-info-notice__text) {
  width: 100%;
}

.access-role-list-v2__notice-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.access-role-list-v2__notice-title,
.access-role-list-v2__notice-desc {
  font-size: 14px;
  line-height: 22px;
  color: #06f;
}

.access-role-list-v2__panel {
  padding: 20px;
  background: #fff;
}

.access-role-list-v2__actions {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.access-role-list-v2__create {
  min-width: 112px;
  height: 36px;
  padding: 0 16px;
}

.access-role-list-v2__search {
  width: 332px;
}

.access-role-list-v2__search :deep(.el-input__wrapper) {
  height: 36px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.access-role-list-v2__search :deep(.el-input__wrapper:hover),
.access-role-list-v2__search :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #06f inset;
}

.access-role-list-v2__search :deep(.el-input__inner) {
  font-size: 14px;
  color: #191c23;
}

.access-role-list-v2__search :deep(.el-input__prefix) {
  color: #828b9c;
}

.access-role-list-v2__table-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.access-role-list-v2__table-head :deep(svg) {
  width: 16px;
  height: 16px;
  color: #828b9c;
}

.access-role-list-v2__link {
  display: inline;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.access-role-list-v2__link:hover {
  color: #0052cc;
}

.access-role-list-v2__dialog-text {
  font-size: 14px;
  line-height: 20px;

  // color: #191c23;
  color: #828b9c;
}

@media (width <= 768px) {
  .access-role-list-v2 {
    padding: 12px;
  }

  .access-role-list-v2__panel {
    padding: 20px 16px 0;
  }

  .access-role-list-v2__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .access-role-list-v2__search {
    width: 100%;
  }
}
</style>
