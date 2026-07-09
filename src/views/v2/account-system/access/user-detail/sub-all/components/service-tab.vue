<template>
  <section class="user-detail-service-tab">
    <h3 class="user-detail-service-tab__title">
      {{ t('user.serviceTit') }}
    </h3>

    <InfoNotice :text="t('user.serviceTip')" />

    <div class="user-detail-service-tab__search">
      <el-input v-model.trim="condition" :placeholder="t('user.serviceSearchplaceholder')" :prefix-icon="Search" />
    </div>

    <TableV2
      v-loading="loading"
      :data="list"
      :pagination="paginationConfig.pagination"
      :total="paginationConfig.total"
      show-pagination
      @change="getSelectUserStrategyList"
      @update:pagination="paginationConfig.pagination = $event"
    >
      <el-table-column prop="productName" :label="t('user.serve')" min-width="280">
        <template #default="{ row }">
          {{ row.productName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="strategyName" :label="t('user.associatedStrategy')" min-width="280">
        <template #default="{ row }">
          {{ row.strategyName || '-' }}
        </template>
      </el-table-column>
    </TableV2>
  </section>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { _getSelectUserStrategyList } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'
import type { IPagination } from '@/views/account-system/type'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const props = defineProps<{
  userId: number
}>()

const condition = ref('')
const loading = ref(false)
const list = ref<any[]>([])
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const getSelectUserStrategyList = async () => {
  try {
    loading.value = true
    const res = await _getSelectUserStrategyList({
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
  getSelectUserStrategyList()
})

watch(
  () => props.userId,
  () => {
    paginationConfig.pagination.page = 1
    getSelectUserStrategyList()
  },
)

onMounted(() => {
  getSelectUserStrategyList()
})
</script>

<style scoped lang="scss">
.user-detail-service-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-detail-service-tab__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.user-detail-service-tab__search {
  width: 332px;
}

@media (width <= 768px) {
  .user-detail-service-tab__search {
    width: 100%;
  }
}
</style>
