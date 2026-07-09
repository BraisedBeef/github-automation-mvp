<template>
  <div class="access-user-list-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <InfoNotice class="access-user-list-v2__notice">
      <div class="access-user-list-v2__notice-content">
        <div class="access-user-list-v2__notice-title">
          {{ t('user.tipMain') }}
        </div>
        <div class="access-user-list-v2__notice-desc">
          {{ t('user.tipSub') }}
        </div>
      </div>
    </InfoNotice>

    <section class="access-user-list-v2__panel">
      <div class="access-user-list-v2__actions">
        <div class="access-user-list-v2__primary-actions">
          <el-button type="primary" @click="toUserCreate">
            {{ t('user.create') }}
          </el-button>
          <el-button :type="selectedRows.length ? 'primary' : 'default'" @click="handleBatchDelete">
            {{ t('common.delete') }}
          </el-button>
        </div>

        <div class="access-user-list-v2__search-wrap">
          <el-input v-model="condition" :placeholder="t('user.searchPlaceholder')" :prefix-icon="Search" />
          <el-button class="access-user-list-v2__refresh" @click="refreshList">
            <SvgIcon name="cat-cdn-refresh" />
          </el-button>
        </div>
      </div>

      <TableV2
        v-loading="loading"
        :data="visibleRows"
        :pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        show-pagination
        :row-class-name="getRowClassName"
        :span-method="tableSpanMethod"
        @sort-change="handleSortChange"
        @change="getUserList"
        @update:pagination="paginationConfig.pagination = $event"
      >
        <el-table-column :label="t('user.userName')" min-width="260">
          <template #header>
            <div class="access-user-list-v2__head-name">
              <el-checkbox
                :model-value="isAllSelectableRowsSelected"
                :indeterminate="isSelectionIndeterminate"
                @change="toggleSelectAll"
              />
              <span>{{ t('user.userName') }}</span>
            </div>
          </template>
          <template #default="{ row }">
            <ExpandDetail v-if="isDetailRow(row)" :row="row.parentRow" />

            <div v-else class="access-user-list-v2__name-cell">
              <button type="button" class="access-user-list-v2__expand-button" @click.stop="toggleRowExpanded(row)">
                <SvgIcon
                  name="table-tree-arrow"
                  class="access-user-list-v2__expand-icon"
                  :class="{ 'is-expanded': isExpanded(row.id) }"
                />
              </button>

              <el-checkbox
                :model-value="isRowSelected(row)"
                :disabled="row.accountType == 1"
                @change="value => toggleRowSelected(row, value)"
                @click.stop
              />

              <button type="button" class="access-user-list-v2__name-link" @click="toDetail(row)">
                {{ row.userName || '-' }}
              </button>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="180">
          <template #header>
            <div class="access-user-list-v2__head-filter">
              <span>{{ t('user.accountType') }}</span>
              <el-popover
                placement="bottom"
                trigger="click"
                width="144"
                popper-class="access-user-list-v2__filter-popover"
              >
                <template #reference>
                  <button type="button" class="access-user-list-v2__filter-trigger">
                    <SvgIcon name="header-filter" />
                  </button>
                </template>

                <div class="access-user-list-v2__filter-list">
                  <button
                    type="button"
                    class="access-user-list-v2__filter-item"
                    :class="{ 'is-active': !accountType }"
                    @click="accountType = ''"
                  >
                    {{ t('common.all') }}
                  </button>
                  <button
                    v-for="item in accountTypeOptions"
                    :key="item.value"
                    type="button"
                    class="access-user-list-v2__filter-item"
                    :class="{ 'is-active': accountType === item.value }"
                    @click="accountType = item.value"
                  >
                    {{ item.label }}
                  </button>
                </div>
              </el-popover>
            </div>
          </template>
          <template #default="{ row }">
            <span v-if="!isDetailRow(row)">
              {{ formatUserType(row) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="id" :label="t('account.accountID')" min-width="220">
          <template #default="{ row }">
            <span v-if="!isDetailRow(row)">
              {{ row.id || '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="createDate" min-width="220" sortable="custom">
          <template #header>
            <div class="access-user-list-v2__table-head">
              <span>{{ t('role.createDate') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <span v-if="!isDetailRow(row)">
              {{ row.createDate ? maoYunDayJs(row.createDate).format(FORMAT_TIME) : '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column :label="t('user.relateInfo')" min-width="180">
          <template #default="{ row }">
            <div v-if="!isDetailRow(row)" class="access-user-list-v2__relate">
              <SvgIcon v-if="row.mobile" name="contact-phone" />
              <SvgIcon v-if="row.contactEmail" name="contact-email" />
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('common.operation')" min-width="180">
          <template #default="{ row }">
            <div v-if="!isDetailRow(row) && row.accountType !== 1" class="access-user-list-v2__operations">
              <button
                type="button"
                class="access-user-list-v2__link"
                :class="{ 'is-disabled': row.userType == 2 }"
                @click.stop="openEmpower(associaeRoleDialogRef, row)"
              >
                {{ t('user.authorize') }}
              </button>
              <button
                type="button"
                class="access-user-list-v2__link"
                @click.stop="handleOperatechange({ value: 'disable' }, row)"
              >
                {{ t('user.disable') }}
              </button>
              <button
                type="button"
                class="access-user-list-v2__link"
                @click.stop="handleOperatechange({ value: 'delete' }, row)"
              >
                {{ t('common.delete') }}
              </button>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <AssociaeRoleDialog :id="empowerId" ref="associaeRoleDialogRef" @success="getUserList" />
    <DeleteUserDialog
      ref="deleteUserDialogRef"
      :list="deleteConfig.list"
      :ids="deleteConfig.ids"
      @success="getUserList"
    />
    <DisableUserDialog
      :id="disableStatus.id"
      ref="disableUserDialogRef"
      :access-method="disableStatus.accessMethod"
      @success="getUserList"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { _getUserList } from '@/apis/account-system/access/user'
import { documentUrl } from '@/config/base-config'
import { usePermission } from '@/hooks/permission/use-permission'
import t from '@/utils/i18n'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'
import type { IPagination } from '@/views/account-system/type'
import AssociaeRoleDialog from '@/views/account-system/access/user/list/components/associae-role-dialog.vue'
import DeleteUserDialog from '@/views/account-system/access/user/detail/components/delete-user-dialog.vue'
import DisableUserDialog from '@/views/account-system/access/user/detail/components/disable-user-dialog.vue'
import ExpandDetail from './components/expand-detail.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { useTableV2DetailRows } from '@/views/v2/account-system/components/use-table-v2-detail-rows'

const insertVcUserPermission = usePermission('userApi:insertVcUser')
const authUserRolePermission = usePermission(['roleApi:UserRoleList', 'userApi:authUserRole'])
const setStatusPermission = usePermission('userApi:setStatus')
const updateSecuritySettingPermission = usePermission('userApi:updateSecuritySetting')

const associaeRoleDialogRef = ref<InstanceType<typeof AssociaeRoleDialog> | null>(null)
const deleteUserDialogRef = ref<InstanceType<typeof DeleteUserDialog> | null>(null)
const disableUserDialogRef = ref<InstanceType<typeof DisableUserDialog> | null>(null)

const loading = ref(false)
const condition = ref('')
const accountType = ref('')
const list = ref<any[]>([])
const selectedRowIds = ref<Array<string | number>>([])
const empowerId = ref(0)
const sortState = ref<{
  prop: string
  order: '' | 'ascending' | 'descending'
}>({
  prop: '',
  order: '',
})
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const deleteConfig = reactive<{
  ids: number[]
  list: any[]
}>({
  ids: [],
  list: [],
})

const disableStatus = reactive<{
  id: number
  accessMethod: number
}>({
  id: 0,
  accessMethod: 1,
})

const accountTypeOptions = [
  {
    value: 'main',
    label: t('overview.mainUser'),
  },
  {
    value: 'sub-all',
    label: t('account.subuser'),
  },
  {
    value: 'sub-news',
    label: t('user.messageRecipient'),
  },
]

const breadcrumbItems = computed(() => [t('accountSystemRoutes.userList')])

const filteredList = computed(() => {
  let rows = [...list.value]

  if (accountType.value === 'main') {
    rows = rows.filter(el => el.accountType == 1)
  }

  if (accountType.value === 'sub-all') {
    rows = rows.filter(el => el.userType == 1)
  }

  if (accountType.value === 'sub-news') {
    rows = rows.filter(el => el.userType == 2)
  }

  if (!sortState.value.prop || !sortState.value.order) {
    return rows
  }

  const direction = sortState.value.order === 'ascending' ? 1 : -1

  return [...rows].sort((a, b) => {
    const prop = sortState.value.prop
    const valueA = a?.[prop]
    const valueB = b?.[prop]

    if (prop === 'createDate') {
      const timeA = valueA ? new Date(valueA).getTime() : 0
      const timeB = valueB ? new Date(valueB).getTime() : 0
      return (timeA - timeB) * direction
    }

    return String(valueA || '').localeCompare(String(valueB || '')) * direction
  })
})

const { visibleRows, isExpanded, isDetailRow, toggleRowExpanded } = useTableV2DetailRows(filteredList)

const selectedRows = computed(() => {
  return filteredList.value.filter(row => selectedRowIds.value.includes(row.id))
})

const selectableRows = computed(() => {
  return filteredList.value.filter(row => row.accountType !== 1)
})

const isAllSelectableRowsSelected = computed(() => {
  return selectableRows.value.length > 0 && selectedRowIds.value.length === selectableRows.value.length
})

const isSelectionIndeterminate = computed(() => {
  return selectedRowIds.value.length > 0 && selectedRowIds.value.length < selectableRows.value.length
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const handleSortChange = ({ prop, order }) => {
  sortState.value = {
    prop: prop || '',
    order: order || '',
  }
}

const refreshList = () => {
  condition.value = ''
  getUserList()
}

const formatUserType = (row: any) => {
  if (row.accountType == 1) return t('overview.mainUser')
  if (row.userType == 1) return t('overview.subUser')
  if (row.userType == 2) return t('user.messageRecipient')
  return '-'
}

const isRowSelected = (row: any) => {
  return selectedRowIds.value.includes(row.id)
}

const toggleRowSelected = (row: any, selected: boolean | string | number) => {
  if (row.accountType == 1) return

  const nextIds = new Set(selectedRowIds.value)
  if (selected) {
    nextIds.add(row.id)
  } else {
    nextIds.delete(row.id)
  }
  selectedRowIds.value = Array.from(nextIds)
}

const toggleSelectAll = (selected: boolean | string | number) => {
  if (!selected) {
    selectedRowIds.value = []
    return
  }

  selectedRowIds.value = selectableRows.value.map(row => row.id)
}

const toUserCreate = () => {
  if (!insertVcUserPermission.checkPermissionRes) {
    insertVcUserPermission.dialog({
      show: true,
      i18nKey: 'account.createUserPerm',
    })
    return
  }

  pushRoute({
    name: 'access_user_create',
    query: {
      title: 'user.userList',
      path: '/account-system/access/user/list',
    },
  })
}

const toDetail = (row: any) => {
  const query = {
    title: 'user.userList',
    path: '/account-system/access/user/list',
  }

  const id = row.id
  if (row.accountType == 1) {
    pushRoute({
      name: 'access_user_detail_main',
      params: { id },
      query,
    })
    return
  }

  if (row.userType == 1) {
    pushRoute({
      name: 'access_user_detail_sub_all',
      params: { id },
      query,
    })
    return
  }

  if (row.userType == 2) {
    pushRoute({
      name: 'access_user_detail_sub_news',
      params: { id },
      query,
    })
  }
}

const openEmpower = (ins: InstanceType<typeof AssociaeRoleDialog> | null, row: any) => {
  if (!authUserRolePermission.checkPermissionRes) {
    authUserRolePermission.dialog({
      show: true,
      i18nKey: 'user.authorizePerm',
    })
    return
  }

  if (row.userType == 2 || !ins) return
  empowerId.value = row.id
  ins.show = true
}

const handleOperatechange = (v: any, row: any) => {
  if (v.value === 'delete') {
    if (!setStatusPermission.checkPermissionRes) {
      setStatusPermission.dialog({
        show: true,
        i18nKey: 'user.deleteUserPerm',
      })
      return
    }

    deleteConfig.ids = [row.id]
    deleteConfig.list = [row]
    if (deleteUserDialogRef.value) {
      deleteUserDialogRef.value.show = true
    }
    return
  }

  if (!updateSecuritySettingPermission.checkPermissionRes) {
    updateSecuritySettingPermission.dialog({
      show: true,
      i18nKey: 'user.disableUserPerm',
    })
    return
  }

  disableStatus.id = row.id
  disableStatus.accessMethod = row.accessMethod
  if (disableUserDialogRef.value) {
    disableUserDialogRef.value.show = true
  }
}

const getUserList = async () => {
  try {
    loading.value = true
    const res = await _getUserList({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      condition: condition.value,
    })

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt || 0
      selectedRowIds.value = selectedRowIds.value.filter(id => list.value.some(row => row.id === id))
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const handleBatchDelete = () => {
  if (!setStatusPermission.checkPermissionRes) {
    setStatusPermission.dialog({
      show: true,
      i18nKey: 'user.deleteUserPerm',
    })
    return
  }

  if (!selectedRows.value.length) {
    return message.warning(t('user.deleteUserWarn'))
  }

  deleteConfig.list = selectedRows.value.filter(el => el.accountType !== 1)
  deleteConfig.ids = deleteConfig.list.map(el => el.id)

  if (!deleteConfig.ids.length) {
    return message.warning(t('user.deleteSubUserWarn'))
  }

  if (deleteUserDialogRef.value) {
    deleteUserDialogRef.value.show = true
  }
}

const tableSpanMethod = ({ row, columnIndex }) => {
  if (!isDetailRow(row)) {
    return [1, 1]
  }

  if (columnIndex === 0) {
    return [1, 6]
  }

  return [0, 0]
}

const getRowClassName = ({ row }) => {
  return isDetailRow(row) ? 'access-user-list-v2__row--detail' : 'access-user-list-v2__row--main'
}

watch(condition, () => {
  getUserList()
})

watch(accountType, () => {
  selectedRowIds.value = selectedRowIds.value.filter(id => filteredList.value.some(row => row.id === id))
})

onMounted(() => {
  getUserList()
})
</script>

<style scoped lang="scss">
.access-user-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.access-user-list-v2__notice-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.access-user-list-v2__notice-title,
.access-user-list-v2__notice-desc {
  font-size: 14px;
  line-height: 22px;
}

.access-user-list-v2__panel {
  padding: 20px;
  background: #fff;
}

.access-user-list-v2__actions {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.access-user-list-v2__primary-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.access-user-list-v2__search-wrap {
  display: flex;
  gap: 16px;
  align-items: center;
}

.access-user-list-v2__search-wrap :deep(.el-input) {
  width: 300px;
}

.access-user-list-v2__refresh {
  width: 34px;
  height: 34px;
  padding: 0;
}

.access-user-list-v2__head-name,
.access-user-list-v2__head-filter,
.access-user-list-v2__table-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.access-user-list-v2__head-name :deep(.el-checkbox) {
  margin-right: 8px;
}

.access-user-list-v2__filter-trigger,
.access-user-list-v2__name-link,
.access-user-list-v2__expand-button,
.access-user-list-v2__link {
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.access-user-list-v2__filter-trigger :deep(svg),
.access-user-list-v2__table-head :deep(svg) {
  width: 16px;
  height: 16px;
  color: #b7c0cd;
}

.access-user-list-v2__name-cell {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 56px;
}

.access-user-list-v2__expand-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.access-user-list-v2__expand-icon {
  width: 6px;
  height: 10px;
  color: #191c23;
  transition: transform 0.2s ease;
}

.access-user-list-v2__expand-icon.is-expanded {
  transform: rotate(90deg);
}

.access-user-list-v2__name-link,
.access-user-list-v2__link {
  font-size: 14px;
  line-height: 22px;
  color: #06f;
}

.access-user-list-v2__link.is-disabled {
  color: #b7c0cd;
}

.access-user-list-v2__relate {
  display: inline-flex;
  gap: 16px;
  align-items: center;
}

.access-user-list-v2__relate :deep(svg) {
  width: 23px;
  height: 23px;
}

.access-user-list-v2__operations {
  display: flex;
  gap: 24px;
  align-items: center;
}

.access-user-list-v2 :deep(.access-user-list-v2__row--detail td.el-table__cell) {
  padding: 0 !important;
  background: #fff;
}

.access-user-list-v2 :deep(.access-user-list-v2__row--detail td.el-table__cell .cell) {
  display: block;
  padding: 0 !important;
}

.access-user-list-v2 :deep(.access-user-list-v2__row--main:hover > td.el-table__cell) {
  background: #f9fbff;
}

.access-user-list-v2__filter-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.access-user-list-v2__filter-item {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.access-user-list-v2__filter-item.is-active {
  color: #06f;
  background: #f5f8ff;
}

@media (width <= 960px) {
  .access-user-list-v2 {
    padding: 12px;
  }

  .access-user-list-v2__panel {
    padding: 16px;
  }

  .access-user-list-v2__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .access-user-list-v2__search-wrap {
    justify-content: space-between;
  }

  .access-user-list-v2__search-wrap :deep(.el-input) {
    width: 100%;
  }
}
</style>
