<template>
  <div class="strategy-list-v2">
    <PageToolbar :title="t('accountSystemRoutes.strategy')" @doc="openHelpDoc" />

    <InfoNotice :text="t('strategy.strategyTip')" />

    <section class="strategy-list-v2__panel">
      <div class="strategy-list-v2__search">
        <el-input v-model="condition" :placeholder="t('strategy.searchPlaceholder')" :prefix-icon="Search" />
      </div>

      <TableV2
        v-loading="loading"
        :data="strategyList"
        :pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        show-pagination
        @change="getStrategyList"
        @update:pagination="paginationConfig.pagination = $event"
      >
        <el-table-column prop="strategyName" :label="t('strategy.strategyName')" min-width="240">
          <template #default="{ row }">
            <button class="strategy-list-v2__link" type="button" @click="handleRowClick(row)">
              {{ row.strategyName || '-' }}
            </button>
          </template>
        </el-table-column>

        <el-table-column prop="description" :label="t('strategy.description')" min-width="240">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="roleNum" :label="t('strategy.roleNum')" min-width="180">
          <template #default="{ row }">
            {{ row.roleNum ?? '-' }}
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { documentUrl } from '@/config/base-config'
import { _getStrategyList } from '@/apis/account-system/access/strategy'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

interface PaginationState {
  pagination: {
    page: number
    pageSize: number
  }
  total: number
}

const strategyList = ref<any[]>([])
const loading = ref(false)
const condition = ref('')
const paginationConfig = reactive<PaginationState>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

// 获取策略列表
const getStrategyList = async () => {
  try {
    loading.value = true
    const res = await _getStrategyList({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      condition: condition.value,
    })

    if (res.success) {
      strategyList.value = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt || 0
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 跳转详情页
const handleRowClick = row => {
  pushRoute({
    name: 'access_strategy_detail',
    params: { id: row.id },
    query: {
      title: 'strategy.strategy',
      path: '/account-system/access/strategy/list',
    },
  })
}

// 条件
watch(condition, () => {
  getStrategyList()
})

onMounted(() => {
  getStrategyList()
})
</script>

<style lang="scss" scoped>
.strategy-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.strategy-list-v2__panel {
  padding: 20px;
  background: #fff;
}

.strategy-list-v2__search {
  width: 332px;
  margin-bottom: 20px;
}

.strategy-list-v2__search :deep(.el-input__wrapper) {
  height: 36px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.strategy-list-v2__search :deep(.el-input__wrapper:hover),
.strategy-list-v2__search :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #06f inset;
}

.strategy-list-v2__search :deep(.el-input__inner) {
  font-size: 14px;
  color: #191c23;
}

.strategy-list-v2__search :deep(.el-input__prefix) {
  color: #828b9c;
}

.strategy-list-v2__link {
  display: inline;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.strategy-list-v2__link:hover {
  color: #0052cc;
}

@media (width <= 768px) {
  .strategy-list-v2 {
    padding: 12px;
  }

  .strategy-list-v2__panel {
    padding: 16px;
  }

  .strategy-list-v2__search {
    width: 100%;
  }
}
</style>
