<template>
  <div class="access-role-detail-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <section class="access-role-detail-v2__panel">
      <h3 class="access-role-detail-v2__panel-title">
        {{ t('role.roleInfo') }}
      </h3>

      <div class="access-role-detail-v2__info-list">
        <div class="access-role-detail-v2__info-row">
          <div class="access-role-detail-v2__label">
            {{ t('role.roleNames') }}
          </div>
          <div class="access-role-detail-v2__value">
            {{ detail.roleName || '-' }}
          </div>
        </div>

        <div class="access-role-detail-v2__info-row">
          <div class="access-role-detail-v2__label">
            {{ t('role.roleID') }}
          </div>
          <div class="access-role-detail-v2__value">
            {{ detail.id || '-' }}
          </div>
        </div>

        <div class="access-role-detail-v2__info-row">
          <div class="access-role-detail-v2__label">
            {{ t('role.description') }}
          </div>
          <div class="access-role-detail-v2__value">
            {{ detail.description || '-' }}
          </div>
        </div>

        <div class="access-role-detail-v2__info-row">
          <div class="access-role-detail-v2__label access-role-detail-v2__label--with-icon">
            <span>{{ t('role.createDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
          <div class="access-role-detail-v2__value">
            {{ detail.createDate ? maoYunDayJs(detail.createDate).format(FORMAT_TIME) : '-' }}
          </div>
        </div>
      </div>
    </section>

    <section class="access-role-detail-v2__panel">
      <h3 class="access-role-detail-v2__panel-title">
        {{ t('role.permStrategy') }}
      </h3>

      <InfoNotice :text="t('role.strategyDesc')" />

      <div class="access-role-detail-v2__actions">
        <el-button type="primary" @click="showStrategy(strategyDialogRef)">
          {{ t('role.associate') }}
        </el-button>
        <el-button
          :type="selectStrategyList.length ? 'primary' : 'default'"
          @click="openDelete('batch', selectStrategyList)"
        >
          {{ t('role.lift') }}
        </el-button>
      </div>

      <TableV2
        v-loading="loading"
        :data="roleStrategyList"
        :pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        show-pagination
        @change="getRoleStrategyList"
        @update:pagination="paginationConfig.pagination = $event"
        @selection-change="handleRowSelectChange"
      >
        <el-table-column type="selection" width="46" />
        <el-table-column prop="strategyName" :label="t('strategy.strategyName')" min-width="220" />
        <el-table-column prop="description" :label="t('strategy.description')" min-width="220">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="associationDate" min-width="220">
          <template #header>
            <div class="access-role-detail-v2__table-head">
              <span>{{ t('strategy.usageCreateDate') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.associationDate ? maoYunDayJs(row.associationDate).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('common.operation')" min-width="120">
          <template #default="{ row }">
            <button class="access-role-detail-v2__link" type="button" @click="openDelete('single', row)">
              {{ t('role.lift') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <CatDialog
      v-model:dialog="show"
      class="access-role-detail-v2__dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :loading="removeLoading"
      @confirm="roleStrategyDelete"
    >
      <el-row class="access-role-detail-v2__dialog-main">
        {{ t('role.deleteStrategyDesc1') }}
      </el-row>
      <el-row class="access-role-detail-v2__dialog-sub">
        {{ t('role.deleteStrategyDesc2') }}
      </el-row>
    </CatDialog>

    <BindStrategyDialog
      ref="strategyDialogRef"
      :role-id="id"
      :strategy-ids="strategyIds"
      @success="getRoleStrategyList"
    />
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { _getRoleInfo, _getRoleStrategyList, _roleStrategyDelete } from '@/apis/account-system/access/role'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import BindStrategyDialog from '@/views/account-system/access/role/detail/components/bind-strategy-dialog.vue'

const route = useRoute()
const strategyDialogRef = ref<InstanceType<typeof BindStrategyDialog> | null>(null)

const show = ref(false)
const loading = ref(false)
const removeLoading = ref(false)
const roleStrategyList = ref<any[]>([])
const selectStrategyList = ref<any[]>([])
const id = ref(route.params.id as string)
const detail = ref<any>({})
const removeStrategyIds = ref<string[]>([])
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const breadcrumbItems = computed(() => [t('accountSystemRoutes.role'), t('accountSystemRoutes.roleDetail')])

const strategyIds = computed(() => roleStrategyList.value.map(el => el.id))

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const showStrategy = (ins: any) => {
  if (ins) {
    ins.show = true
  }
}

const getRoleInfo = async () => {
  const res = await _getRoleInfo({ id: id.value })
  if (res.success) {
    detail.value = res.data || {}
  }
}

const getRoleStrategyList = async () => {
  try {
    loading.value = true
    const res = await _getRoleStrategyList({
      id: id.value,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    })

    if (res.success) {
      roleStrategyList.value = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt || 0
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const openDelete = (type: string, data: any) => {
  if (type === 'batch') {
    if (data.length) {
      show.value = true
      removeStrategyIds.value = data.map(el => el.id)
    } else {
      message.warning(t('role.deleteStrategyWarn'))
    }
  } else {
    show.value = true
    removeStrategyIds.value = [data.id]
  }
}

const roleStrategyDelete = async () => {
  try {
    removeLoading.value = true
    const res = await _roleStrategyDelete({ id: id.value, strategyIds: removeStrategyIds.value })

    if (res.success) {
      message.success(t('common.deleteSuccess'))
      getRoleStrategyList()
      show.value = false
    } else {
      message.warning(t('role.deleteFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    removeLoading.value = false
  }
}

const handleRowSelectChange = (selection: any[]) => {
  selectStrategyList.value = selection
}

watch(
  () => route.params.id,
  () => {
    id.value = route.params.id as string
    getRoleInfo()
    getRoleStrategyList()
  },
)

onMounted(() => {
  getRoleInfo()
  getRoleStrategyList()
})
</script>

<style lang="scss" scoped>
.access-role-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.access-role-detail-v2__panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;
}

.access-role-detail-v2__panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.access-role-detail-v2__info-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.access-role-detail-v2__info-row {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.access-role-detail-v2__label {
  flex-shrink: 0;
  width: 84px;
  font-size: 14px;
  line-height: 22px;
  color: #98a2b3;
}

.access-role-detail-v2__label--with-icon {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.access-role-detail-v2__label--with-icon :deep(svg),
.access-role-detail-v2__table-head :deep(svg) {
  width: 16px;
  height: 16px;
  color: #828b9c;
}

.access-role-detail-v2__value {
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-word;
}

.access-role-detail-v2__actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.access-role-detail-v2__table-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.access-role-detail-v2__link {
  display: inline;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.access-role-detail-v2__link:hover {
  color: #0052cc;
}

.access-role-detail-v2__dialog-main,
.access-role-detail-v2__dialog-sub {
  font-size: 14px;
  line-height: 20px;
  color: #191c23;
}

.access-role-detail-v2__dialog-sub {
  margin-top: 8px;
  color: #828b9c;
}

@media (width <= 768px) {
  .access-role-detail-v2 {
    padding: 12px;
  }

  .access-role-detail-v2__panel {
    padding: 16px;
  }

  .access-role-detail-v2__info-row {
    flex-direction: column;
    gap: 8px;
  }

  .access-role-detail-v2__label {
    width: auto;
  }
}
</style>
