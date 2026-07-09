<template>
  <div class="recipient-list-v2">
    <PageToolbar :title="t('recipient.recipient')" @doc="openHelpDoc" />

    <InfoNotice :text="t('subscribe.subscribeTip')" />

    <section class="recipient-list-v2__panel">
      <div class="recipient-list-v2__actions">
        <el-button type="primary" class="recipient-list-v2__create" @click="toUserCerate">
          {{ t('recipient.create') }}
        </el-button>

        <div class="recipient-list-v2__search">
          <el-input v-model="condition" :placeholder="t('recipient.searchPlaceholder')" :suffix-icon="Search" />
        </div>
      </div>

      <TableV2
        v-loading="loading"
        :data="list"
        :pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        show-pagination
        @change="paginationChange"
        @update:pagination="paginationConfig.pagination = $event"
        @selection-change="handleRowSelectChange"
      >
        <el-table-column prop="userName" :label="t('user.userName')" min-width="140">
          <template #default="{ row }">
            {{ row.userName || '-' }}
          </template>
        </el-table-column>

        <el-table-column :label="t('user.accountType')" min-width="140">
          <template #default="{ row }">
            {{ formatUserType(row) }}
          </template>
        </el-table-column>

        <el-table-column prop="id" :label="t('account.accountID')" min-width="180" />

        <el-table-column :label="t('user.phone')" min-width="160">
          <template #default="{ row }">
            {{ row.mobile || t('subscribe.noSet') }}
          </template>
        </el-table-column>

        <el-table-column :label="t('user.email')" min-width="220">
          <template #default="{ row }">
            {{ row.contactEmail || t('subscribe.noSet') }}
          </template>
        </el-table-column>

        <el-table-column :label="t('common.operation')" min-width="220">
          <template #default="{ row }">
            <div class="recipient-list-v2__operations">
              <button class="recipient-list-v2__link" type="button" @click="toUserDetail(row)">
                {{ t('recipient.modify') }}
              </button>
              <button class="recipient-list-v2__link" type="button" @click="handleMana(row)">
                {{ t('recipient.mana') }}
              </button>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { documentUrl } from '@/config/base-config'
import { _getUserList } from '@/apis/account-system/access/user'
import { usePermission } from '@/hooks/permission/use-permission'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { pushRoute } from '@/utils/router-jump'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const insertVcUserPermission = usePermission('userApi:insertVcUser')
const updateVcUserPermission = usePermission('userApi:updateVcUser')

const condition = ref('')
const list = ref<any[]>([])
const loading = ref(false)
const selectList = ref<any[]>([])

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

const formatUserType = (row: any) => {
  if (row.accountType == 1) return t('overview.mainUser')
  if (row.userType == 1) return t('overview.subUser')
  if (row.userType == 2) return t('user.messageRecipient')
  return '-'
}

// 新建接收人
const toUserCerate = () => {
  if (!insertVcUserPermission.checkPermissionRes) {
    insertVcUserPermission.dialog({
      show: true,
      i18nKey: 'recipient.createPerm',
    })
    return
  }

  pushRoute({ name: 'access_user_list' })
}

// 跳转订阅管理
const handleMana = (row: any) => {
  const query = {
    title: 'recipient.recipient',
    path: '/account-system/news/recipient/list',
  }

  pushRoute({
    name: 'news_recipient_mana',
    params: {
      uid: row.id,
    },
    query,
  })
}

// 跳转用户详情
const toUserDetail = (row: any) => {
  if (!updateVcUserPermission.checkPermissionRes) {
    updateVcUserPermission.dialog({
      show: true,
      i18nKey: 'recipient.changeUserPerm',
    })
    return
  }

  const query = {
    title: 'recipient.recipient',
    path: '/account-system/news/recipient/list',
  }

  const id = row.id

  if (row.accountType == 1) {
    pushRoute({
      name: 'access_user_detail_main',
      params: {
        id,
      },
      query,
    })
    return
  }

  if (row.userType == 1) {
    pushRoute({
      name: 'access_user_detail_sub_all',
      params: {
        id,
      },
      query,
    })
  }

  if (row.userType == 2) {
    pushRoute({
      name: 'access_user_detail_sub_news',
      params: {
        id,
      },
      query,
    })
  }
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any[]) => {
  selectList.value = selection
}

// 获取用户列表
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
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 分页
const paginationChange = () => {
  getUserList()
}

watch(condition, () => {
  getUserList()
})

onMounted(() => {
  getUserList()
})
</script>

<style lang="scss" scoped>
.recipient-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.recipient-list-v2__panel {
  padding: 20px;
  background: #fff;
}

.recipient-list-v2__actions {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.recipient-list-v2__create {
  min-width: 102px;
  height: 36px;
}

.recipient-list-v2__search {
  width: 360px;
}

.recipient-list-v2__search :deep(.el-input__wrapper) {
  height: 36px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.recipient-list-v2__search :deep(.el-input__wrapper:hover),
.recipient-list-v2__search :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #06f inset;
}

.recipient-list-v2__operations {
  display: flex;
  gap: 20px;
  align-items: center;
}

.recipient-list-v2__link {
  display: inline;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.recipient-list-v2__link:hover {
  color: #0052cc;
}

@media (width <= 768px) {
  .recipient-list-v2 {
    padding: 12px;
  }

  .recipient-list-v2__panel {
    padding: 16px;
  }

  .recipient-list-v2__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .recipient-list-v2__search {
    width: 100%;
  }
}
</style>
