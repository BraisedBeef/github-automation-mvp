<template>
  <div class="access-overview-v2">
    <PageToolbar :title="t('accountSystemRoutes.overview')" @doc="openHelpDoc" />

    <section class="access-overview-v2__summary">
      <article class="access-overview-v2__card access-overview-v2__card--user">
        <div class="access-overview-v2__headline">
          <h2 class="access-overview-v2__email">
            {{ user.email || user.userName || '-' }}
          </h2>
          <span class="access-overview-v2__tag">
            {{ user.accountType === 1 ? t('overview.mainUser') : t('overview.subUser') }}
          </span>
        </div>

        <div class="access-overview-v2__info-list">
          <div class="access-overview-v2__info-row">
            <div class="access-overview-v2__label access-overview-v2__label--with-icon">
              <span>{{ t('overview.lastLoginTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
            <div class="access-overview-v2__value">
              {{ user.lastLoginTime ? maoYunDayJs(user.lastLoginTime).format(FORMAT_TIME) : '-' }}
            </div>
          </div>

          <div class="access-overview-v2__info-row">
            <div class="access-overview-v2__label">
              {{ t('overview.lastLoginIp') }}
            </div>
            <div class="access-overview-v2__value">
              {{ user.lastLoginIp || '-' }}
            </div>
          </div>

          <div class="access-overview-v2__info-row access-overview-v2__info-row--security">
            <div class="access-overview-v2__label">
              {{ t('overview.identitySecurity') }}
            </div>
            <div class="access-overview-v2__security-list">
              <div class="access-overview-v2__security-item">
                <span>{{ t('overview.loginProtect') }}</span>
                <SvgIcon :name="user.loginProtect === 1 ? 'user-safe-success' : 'user-safe-error'" />
              </div>
              <div class="access-overview-v2__security-item">
                <span>{{ t('overview.operateNotice') }}</span>
                <SvgIcon :name="user.operateProtect === 1 ? 'user-safe-success' : 'user-safe-error'" />
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="access-overview-v2__card access-overview-v2__card--stats">
        <div class="access-overview-v2__stat">
          <div class="access-overview-v2__stat-title">
            {{ t('overview.user') }}
          </div>
          <div class="access-overview-v2__stat-value">
            {{ user.userNum || 0 }}
          </div>
          <el-button type="primary" class="access-overview-v2__cta" @click="toUserCreate">
            {{ t('overview.createUser') }}
          </el-button>
        </div>

        <div class="access-overview-v2__stat-divider" />

        <div class="access-overview-v2__stat">
          <div class="access-overview-v2__stat-title">
            {{ t('overview.associateRole') }}
          </div>
          <div class="access-overview-v2__stat-value">
            {{ user.roleNum || 0 }}
          </div>
          <el-button type="primary" class="access-overview-v2__cta" @click="toRoleCreate">
            {{ t('overview.createRole') }}
          </el-button>
        </div>
      </article>
    </section>

    <section class="access-overview-v2__panel">
      <div class="access-overview-v2__panel-head">
        <h3 class="access-overview-v2__panel-title">
          {{ t('overview.sensitive') }}
        </h3>
        <p class="access-overview-v2__panel-desc">
          {{ t('overview.sensitiveTooltip') }}
        </p>
      </div>

      <TableV2
        v-loading="loading"
        :data="canViewSensitiveList ? sensitiveList : []"
        :pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        :show-pagination="canViewSensitiveList"
        @change="getSensitiveList"
        @update:pagination="paginationConfig.pagination = $event"
      >
        <el-table-column prop="id" min-width="180">
          <template #header>
            <div class="access-overview-v2__table-head">
              <span>{{ t('account.accountID') }}</span>
              <SvgIcon name="info-circle" />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="userName" :label="t('overview.userName')" min-width="160">
          <template #default="{ row }">
            {{ row.userName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="sensitive" :label="t('overview.sensitive')" min-width="220">
          <template #default="{ row }">
            {{ row.sensitive || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="productName" :label="t('overview.productName')" min-width="180">
          <template #default="{ row }">
            {{ row.productName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="operateTime" :label="t('overview.operateTime')" min-width="180">
          <template #default="{ row }">
            {{ row.operateTime ? maoYunDayJs(row.operateTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>

        <template v-if="!canViewSensitiveList" #empty>
          <div class="access-overview-v2__permission-empty">
            <div class="access-overview-v2__permission-icon">
              <SvgIcon name="account-user-outlined" />
            </div>
            <div class="access-overview-v2__permission-title">
              {{ t('overview.sensitivePermissionTitle') }}
            </div>
            <div class="access-overview-v2__permission-desc">
              {{ t('overview.sensitivePermissionDesc') }}
            </div>
            <el-button type="primary" class="access-overview-v2__reload" @click="refreshSensitivePermission">
              <SvgIcon name="refresh" />
              <span>{{ t('prem.reload') }}</span>
            </el-button>
          </div>
        </template>

        <template v-else #empty>
          <div class="access-overview-v2__plain-empty">
            <div class="access-overview-v2__plain-empty-icon">
              <SvgIcon name="access-overview-empty" />
            </div>
            <div class="access-overview-v2__plain-empty-text">暂无相关数据</div>
          </div>
        </template>
      </TableV2>
    </section>

    <section class="access-overview-v2__panel">
      <div class="access-overview-v2__panel-head">
        <h3 class="access-overview-v2__panel-title">
          {{ t('overview.highPermRole') }}
        </h3>
      </div>

      <TableV2 :data="highRoleList">
        <el-table-column prop="roleName" min-width="420">
          <template #header>
            <span>{{ t('overview.highPermRoleDescTable') }}</span>
          </template>
          <template #default="{ row }">
            {{ formatHighRoleName(row) }}
          </template>
        </el-table-column>

        <el-table-column prop="associationNum" :label="t('overview.highPermRoleDesc2')" min-width="160">
          <template #default="{ row }">
            {{ row.associationNum ?? 0 }}
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { _getSensitiveList } from '@/apis/account-system/access/user'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

interface PaginationState {
  pagination: {
    page: number
    pageSize: number
  }
  total: number
}

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const sensitiveList = ref<any[]>([])
const loading = ref(false)
const paginationConfig = reactive<PaginationState>({
  pagination: {
    page: 1,
    pageSize: 10,
  },
  total: 0,
})

const hasPermission = (perm: string | string[]) => {
  const permissions = user.value.permissions || []

  if (user.value.accountType == 1) return true
  if (permissions.includes('**')) return true

  return perm instanceof Array ? perm.every(item => permissions.includes(item)) : permissions.includes(perm)
}

const canViewSensitiveList = computed(() => hasPermission('userApi:selectSensitiveList'))

const highRoleList = computed(() => user.value.highRoleDTOList || [])

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const openPermissionDialog = (i18nKey: string) => {
  userStore.setPermission({
    show: true,
    i18nKey,
  })
}

const toRoleCreate = () => {
  if (!hasPermission('roleApi:insertRole')) {
    openPermissionDialog('overview.createRolePerm')
    return
  }

  pushRoute({
    name: 'access_role_create',
    query: {
      title: 'overview.overview',
      path: '/account-system/access/overview',
    },
  })
}

const toUserCreate = () => {
  if (!hasPermission('userApi:insertVcUser')) {
    openPermissionDialog('account.createUserPerm')
    return
  }

  pushRoute({
    name: 'access_user_create',
    query: {
      title: 'overview.overview',
      path: '/account-system/access/overview',
    },
  })
}

const formatHighRoleName = (row: { roleName?: string; description?: string }) => {
  if (!row.roleName) return '-'
  return row.description ? `${row.roleName}（${row.description}）` : row.roleName
}

const getSensitiveList = async () => {
  try {
    loading.value = true
    const res = await _getSensitiveList({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    })

    if (res.success) {
      sensitiveList.value = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt || 0
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const refreshSensitivePermission = async () => {
  await userStore.getUser()
  message.success(t('prem.refreshSuccess'))
  getSensitiveList()
}

onMounted(() => {
  userStore.getUser()
  getSensitiveList()
})
</script>

<style scoped lang="scss">
.access-overview-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.access-overview-v2__summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.access-overview-v2__card,
.access-overview-v2__panel {
  background: #fff;
}

.access-overview-v2__card {
  // min-height: 200px;
  padding: 20px;
}

.access-overview-v2__card--stats {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  gap: 24px;
  align-items: stretch;
}

.access-overview-v2__headline {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}

.access-overview-v2__email {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: #191c23;
}

.access-overview-v2__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 10px;
  font-size: 12px;
  line-height: 20px;
  color: #06f;
  background: #ecf4ff;
}

.access-overview-v2__info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.access-overview-v2__info-row {
  display: flex;
  gap: 32px;
  align-items: center;
}

.access-overview-v2__info-row--security {
  align-items: flex-start;
}

.access-overview-v2__label {
  flex-shrink: 0;
  width: 120px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.access-overview-v2__label--with-icon {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.access-overview-v2__label--with-icon :deep(svg),
.access-overview-v2__table-head :deep(svg) {
  width: 16px;
  height: 16px;
  color: #828b9c;
}

.access-overview-v2__value {
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.access-overview-v2__security-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.access-overview-v2__security-item {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.access-overview-v2__security-item :deep(svg) {
  width: 16px;
  height: 16px;
}

.access-overview-v2__stat {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.access-overview-v2__stat-title {
  font-size: 16px;
  line-height: 24px;
  color: #191c23;
}

.access-overview-v2__stat-value {
  margin: 24px 0;
  font-size: 36px;
  font-weight: 700;
  line-height: 44px;
  color: #191c23;
}

.access-overview-v2__stat-divider {
  width: 1px;
  height: 100%;
  background: #e8ecf3;
}

.access-overview-v2__cta {
  align-self: flex-start;
  min-width: 102px;
  height: 36px;
  padding: 0 16px;
}

.access-overview-v2__panel {
  padding: 20px;
}

.access-overview-v2__panel-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.access-overview-v2__panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.access-overview-v2__panel-desc {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.access-overview-v2__table-head {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.access-overview-v2__permission-empty {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
}

.access-overview-v2__plain-empty {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.access-overview-v2__plain-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: #f2f4f7;
  border-radius: 50%;
}

.access-overview-v2__plain-empty-icon :deep(svg) {
  width: 48px;
  height: 48px;
}

.access-overview-v2__plain-empty-text {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  text-align: center;
}

.access-overview-v2__permission-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  color: #98a2b3;
  background: #f2f4f7;
  border-radius: 50%;
}

.access-overview-v2__permission-icon :deep(svg) {
  width: 48px;
  height: 48px;
}

.access-overview-v2__permission-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
  text-align: center;
}

.access-overview-v2__permission-desc {
  max-width: 700px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  text-align: center;
}

.access-overview-v2__reload {
  min-width: 112px;
}

.access-overview-v2__reload :deep(.el-button__inner),
.access-overview-v2__reload :deep(span) {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.access-overview-v2__reload :deep(svg) {
  width: 16px;
  height: 16px;
}

@media (width <= 960px) {
  .access-overview-v2__summary {
    grid-template-columns: 1fr;
  }

  .access-overview-v2__card--stats {
    grid-template-columns: 1fr;
  }

  .access-overview-v2__stat-divider {
    width: 100%;
    height: 1px;
  }
}

@media (width <= 768px) {
  .access-overview-v2 {
    padding: 12px;
  }

  .access-overview-v2__card,
  .access-overview-v2__panel {
    padding: 16px;
  }

  .access-overview-v2__headline,
  .access-overview-v2__info-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .access-overview-v2__headline {
    gap: 8px;
    margin-bottom: 24px;
  }

  .access-overview-v2__email {
    font-size: 20px;
    line-height: 28px;
    word-break: break-all;
  }

  .access-overview-v2__label {
    width: auto;
  }
}
</style>
