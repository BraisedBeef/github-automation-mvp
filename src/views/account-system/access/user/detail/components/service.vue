<template>
  <div class="wrap mt20">
    <div class="df ac mb20 pointer" @click="isShow = !isShow">
      <span class="mr4 title">{{ t('user.serviceTit') }}</span>
      <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
        <CaretRight />
      </el-icon>
    </div>

    <el-divider class="divider" />
    <el-collapse-transition>
      <div v-show="isShow">
        <!-- tip -->
        <Tip :text="tips" type="OneToOne" />

        <div class="search-wrap mb20">
          <el-input
            v-model.trim="condition"
            maxlength="30"
            :placeholder="t('user.serviceSearchplaceholder')"
            :suffix-icon="Search"
          />
        </div>

        <el-table v-loading="loading" :data="list">
          <el-table-column prop="productName" :label="t('user.serve')">
            <template #default="{ row }">
              <span class="text-primary">{{ row.productName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="strategyName" :label="t('user.associatedStrategy')">
            <template #default="{ row }">
              <span class="text-primary">{{ row.strategyName }}</span>
            </template>
          </el-table-column>
        </el-table>

        <CatPagination
          v-model:pagination="paginationConfig.pagination"
          :total="paginationConfig.total"
          @change="getSelectUserStrategyList"
        />
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { CaretBottom, Search, CaretRight } from '@element-plus/icons-vue'
import { _getSelectUserStrategyList } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'

const route = useRoute()
const condition = ref<string>('') // 查询条件
const loading = ref<boolean>(false)
const list = ref<any[]>([]) // 列表
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const isShow = ref<boolean>(true) // 是否显示详情

const tips = computed(() => [
  {
    main: t('user.serviceTip'),
  },
])

// 用户详情-服务列表
const getSelectUserStrategyList = async () => {
  try {
    loading.value = true
    const res = await _getSelectUserStrategyList({
      id: Number(route.params.id) as number,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      condition: condition.value,
    })

    console.log(`_getStrategyList===>`, res)

    if (res.success) {
      list.value = res.data?.list || []

      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 条件
watch(condition, () => {
  getSelectUserStrategyList()
})

// 路由
watch(
  () => route.params.id,
  () => {
    getSelectUserStrategyList()
  },
)

onMounted(() => {
  getSelectUserStrategyList()
})
</script>

<style lang="scss" scoped>
.wrap {
  .divider {
    margin-top: 12px;
    margin-bottom: 20px;
  }

  .search-wrap {
    width: 360px;
    height: 34px;
    border-radius: 4px;
  }
}

.is-reverse {
  transform: rotateZ(90deg);
}
</style>
