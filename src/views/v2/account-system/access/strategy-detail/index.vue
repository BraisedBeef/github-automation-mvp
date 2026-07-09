<template>
  <div class="strategy-detail-v2">
    <PageBreadcrumbToolbar :items="[t('strategy.strategy'), t('strategy.detail')]" @doc="openHelpDoc" />

    <section class="strategy-detail-v2__info-card">
      <h2 class="strategy-detail-v2__section-title">
        {{ t('strategy.info') }}
      </h2>

      <div class="strategy-detail-v2__info-row">
        <span class="strategy-detail-v2__label">{{ t('strategy.strategyNames') }}</span>
        <span class="strategy-detail-v2__value">{{ detail.strategyName || '-' }}</span>
      </div>

      <div class="strategy-detail-v2__info-row">
        <span class="strategy-detail-v2__label">{{ t('strategy.description') }}</span>
        <span class="strategy-detail-v2__value">{{ detail.description || '-' }}</span>
      </div>

      <div class="strategy-detail-v2__info-row">
        <span class="strategy-detail-v2__label strategy-detail-v2__label--with-icon">
          <span>{{ t('strategy.createDate') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" />
          </el-tooltip>
        </span>
        <span class="strategy-detail-v2__value">
          {{ detail.createDate ? maoYunDayJs(detail.createDate).format(FORMAT_TIME) : '-' }}
        </span>
      </div>
    </section>

    <div class="strategy-detail-v2__tabs">
      <SegmentedTabs :model-value="active" :items="tabs" @update:model-value="handleTabChange" />
    </div>

    <section class="strategy-detail-v2__panel">
      <div v-show="active === 1" class="strategy-detail-v2__tab-pane">
        <div class="strategy-detail-v2__search">
          <el-input
            v-model.trim="summary.condition"
            maxlength="30"
            :placeholder="t('strategy.abstractSearchPlaceholder')"
            :suffix-icon="Search"
          />
        </div>

        <TableV2
          v-loading="summary.loading"
          :data="summary.list"
          :pagination="summary.paginationConfig.pagination"
          :total="summary.paginationConfig.total"
          show-pagination
          @change="getStrategySummary"
          @update:pagination="summary.paginationConfig.pagination = $event"
        >
          <el-table-column prop="productName" :label="t('strategy.productName', [summary.list.length])" min-width="220">
            <template #default="{ row }">
              {{ row.productName || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="resourceType" :label="t('strategy.resourceType')" min-width="220">
            <template #default="{ row }">
              {{ row.resourceType === 1 ? t('strategy.all') : t('strategy.specific') }}
            </template>
          </el-table-column>

          <el-table-column prop="condition" :label="t('strategy.condition')" min-width="220">
            <template #default="{ row }">
              {{ row.condition || '-' }}
            </template>
          </el-table-column>
        </TableV2>
      </div>

      <div v-show="active === 2" class="strategy-detail-v2__tab-pane">
        <h2 class="strategy-detail-v2__section-title strategy-detail-v2__usage-title">
          {{ t('strategy.usageDesc') }}
        </h2>

        <TableV2 v-loading="usageDTOS.loading" :data="usageDTOS.list">
          <el-table-column prop="roleName" :label="t('strategy.associateRole')" min-width="260">
            <template #default="{ row }">
              <button class="strategy-detail-v2__link" type="button" @click="toRoleDetail(row)">
                {{ row.roleName || '-' }}
              </button>
            </template>
          </el-table-column>

          <el-table-column prop="createDate" min-width="220">
            <template #header>
              <div class="strategy-detail-v2__table-head">
                <span>{{ t('strategy.usageCreateDate') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              {{ row.createDate ? maoYunDayJs(row.createDate).format(FORMAT_TIME) : '-' }}
            </template>
          </el-table-column>
        </TableV2>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { documentUrl } from '@/config/base-config'
import { _geStrategytDetail, _getStrategySummary } from '@/apis/account-system/access/strategy'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import SegmentedTabs from '@/views/v2/account-system/components/segmented-tabs.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const route = useRoute()
const detail = ref<any>({})
const active = ref(1)
const id = ref<string>(route.params.id as string)

// 策略摘要
const summary = reactive<{
  loading: boolean
  condition: string
  paginationConfig: IPagination
  list: any[]
}>({
  loading: false,
  condition: '',
  paginationConfig: {
    pagination: {
      pageSize: 10,
      page: 1,
    },
    total: 0,
  },
  list: [],
})

// 策略用法
const usageDTOS = reactive<{
  loading: boolean
  list: any[]
}>({
  loading: false,
  list: [],
})

const tabs = [
  { label: t('strategy.abstract'), value: 1 },
  { label: t('strategy.usage'), value: 2 },
]

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const handleTabChange = (value: string | number) => {
  active.value = Number(value)

  if (Number(value) === 1) {
    getStrategySummary()
  }
}

// 获取策略详情
const geStrategytDetail = async () => {
  try {
    usageDTOS.loading = true
    const res = await _geStrategytDetail({ id: id.value })

    if (res.success) {
      detail.value = res.data || {}
      usageDTOS.list = res.data?.strategyUsageDTOS || []
    }
  } catch (error) {
    console.log(error)
  } finally {
    usageDTOS.loading = false
  }
}

// 获取策略摘要
const getStrategySummary = async () => {
  try {
    summary.loading = true
    const res = await _getStrategySummary({
      id: id.value,
      condition: summary.condition,
      pageIndex: summary.paginationConfig.pagination.page,
      pageSize: summary.paginationConfig.pagination.pageSize,
    })

    if (res.success) {
      summary.list = res.data?.list || []
      summary.paginationConfig.total = res.data?.recordCnt || 0
    }
  } catch (error) {
    console.log(error)
  } finally {
    summary.loading = false
  }
}

const toRoleDetail = row => {
  pushRoute({
    name: 'access_role_detail',
    params: { id: row.id },
    query: {
      title: 'strategy.detail',
      path: route.fullPath,
    },
  })
}

// 路由
watch(
  () => route.params.id,
  () => {
    id.value = route.params.id as string
    geStrategytDetail()
  },
)

// 条件
watch(
  () => summary.condition,
  () => {
    getStrategySummary()
  },
)

onMounted(() => {
  id.value = route.params.id as string
  geStrategytDetail()
  getStrategySummary()
})
</script>

<style lang="scss" scoped>
.strategy-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.strategy-detail-v2__info-card,
.strategy-detail-v2__panel {
  background: #fff;
}

.strategy-detail-v2__info-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 218px;
  padding: 24px;
}

.strategy-detail-v2__section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.strategy-detail-v2__info-row {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 24px;
  align-items: center;
}

.strategy-detail-v2__label {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.strategy-detail-v2__label--with-icon :deep(svg),
.strategy-detail-v2__table-head :deep(svg) {
  width: 16px;
  height: 16px;
  color: #191c23;
}

.strategy-detail-v2__value {
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.strategy-detail-v2__tabs {
  display: flex;
  align-items: center;
  padding: 0;
  background: transparent;
}

.strategy-detail-v2__panel {
  padding: 24px;
}

// .strategy-detail-v2__tab-pane {
//   min-height: 320px;
// }

.strategy-detail-v2__search {
  width: 360px;
  margin-bottom: 20px;
}

.strategy-detail-v2__search :deep(.el-input__wrapper) {
  height: 36px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.strategy-detail-v2__search :deep(.el-input__wrapper:hover),
.strategy-detail-v2__search :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #06f inset;
}

.strategy-detail-v2__search :deep(.el-input__inner) {
  font-size: 14px;
  color: #191c23;
}

.strategy-detail-v2__usage-title {
  margin-bottom: 20px;
}

.strategy-detail-v2__link {
  display: inline;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.strategy-detail-v2__link:hover {
  color: #0052cc;
}

.strategy-detail-v2__table-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

@media (width <= 768px) {
  .strategy-detail-v2 {
    padding: 12px;
  }

  .strategy-detail-v2__info-card,
  .strategy-detail-v2__panel {
    padding: 16px;
  }

  .strategy-detail-v2__info-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .strategy-detail-v2__tabs {
    overflow-x: auto;
  }

  .strategy-detail-v2__search {
    width: 100%;
  }
}
</style>
