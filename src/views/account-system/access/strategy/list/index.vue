<template>
  <el-card shadow="never" class="page-box operate" :body-style="bodyStyle">
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />
    <!-- search -->
    <div class="search-wrap mb20">
      <el-input v-model="condition" :placeholder="t('strategy.searchPlaceholder')" :suffix-icon="Search" />
    </div>

    <el-table v-loading="loading" :data="strategyList" class="mt20" show-overflow-tooltip>
      <el-table-column prop="strategyName" :label="t('strategy.strategyName')">
        <template #default="{ row }">
          <span class="text-primary cursor-pointer" @click="handleRowClick(row)">{{ row.strategyName || '-' }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="updateDate" label="服务类型"> </el-table-column> -->
      <el-table-column prop="description" :label="t('strategy.description')" />
      <el-table-column prop="roleNum" :label="t('strategy.roleNum')" />
    </el-table>

    <CatPagination
      v-model:pagination="paginationConfig.pagination"
      :total="paginationConfig.total"
      @change="getStrategyList"
    />
  </el-card>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { _getStrategyList } from '@/apis/account-system/access/strategy'
import t from '@/utils/i18n'

import { IPagination } from '@/views/account-system/type'
import { pushRoute } from '@/utils/router-jump'

const bodyStyle = { height: '100%' }
const strategyList = ref<any[]>([]) // 策略列表
const loading = ref<boolean>(false)
const condition = ref<string>('') // 查询条件
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const tips = computed(() => [
  {
    main: t('strategy.strategyTip'),
  },
])

// 获取策略列表
const getStrategyList = async () => {
  try {
    loading.value = true
    const res = await _getStrategyList({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      condition: condition.value,
    })

    console.log(`_getStrategyList===>`, res)

    if (res.success) {
      strategyList.value = res.data?.list || []

      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 跳转详情页
const handleRowClick = row => {
  console.log(`handleRowClick===>`, row, row.id)
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
.search-wrap {
  width: 360px;
  height: 34px;
  border-radius: 4px;
}
</style>
