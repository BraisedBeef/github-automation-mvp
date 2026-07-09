<template>
  <div class="cat-pagination">
    <div v-if="showTotal" class="total">
      <slot name="total">
        {{ t('components.total', { total: customTotal ? customTotal : total || 0 }) }}
      </slot>
    </div>
    <div class="pager cat-flex">
      <div v-if="showPageSize" class="page-size">
        {{
          t('components.eachSize', {
            pageSize: pagination[computedPagination.pageSize],
          })
        }}
      </div>
      <el-pagination
        :current-page="pagination[computedPagination.page]"
        :page-sizes="pageSize"
        :page-size="pagination[computedPagination.pageSize]"
        layout="prev, pager, next,sizes"
        popper-class="pager-select"
        :background="true"
        :total="total"
        :pager-count="props.pagerCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
const props = withDefaults(
  defineProps<{
    pagination: any //{ [x: string]: any }
    total?: number // 总数
    customKeys?: string[] // 自定义键名
    showTotal?: boolean
    showPageSize?: boolean
    pageSize?: number[]
    pagerCount?: number
    customTotal?: string | number
  }>(),
  {
    total: 0,
    customKeys: () => ['page', 'pageSize'],
    showTotal: true,
    showPageSize: true,
    pageSize: () => [10, 20, 30, 40, 50],
    pagerCount: 7,
  },
)

const computedPagination = computed(() => {
  return {
    page: props.customKeys[0],
    pageSize: props.customKeys[1],
  }
})

const handleSizeChange = (pageSize: number) => {
  console.log('pageSize', pageSize)
  const newPage =
    Math.ceil(props.total / pageSize) > props.pagination[computedPagination.value.page]
      ? props.pagination[computedPagination.value.page]
      : Math.ceil(props.total / pageSize)
  handleCurrentChange(newPage, pageSize)
  // const newPagination = {
  //   ...props.pagination,
  //   [computedPagination.value.page]: props.pagination[computedPagination.value.page],
  //   [computedPagination.value.pageSize]: pageSize,
  // }
  // emit('update:pagination', newPagination)
  // emit('change', newPagination)
}
const handleCurrentChange = (page: number, pageSize?: number) => {
  console.log('page', page)
  const newPagination = {
    ...props.pagination,
    [computedPagination.value.page]: page,
    [computedPagination.value.pageSize]: pageSize ? pageSize : props.pagination[computedPagination.value.pageSize],
  }
  emit('update:pagination', newPagination)
  emit('change', newPagination)
}

const emit = defineEmits<{
  (event: 'change', pagination: any): void
  (event: 'update:pagination', pagination: any): void
}>()
</script>

<style lang="scss">
.cat-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 30px 0;

  .total {
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 12px;
    font-weight: 400;
    color: #222;
  }

  .pager {
    .page-size {
      margin-right: 12px;
      font-family: 'PingFang SC-Regular', 'PingFang SC';
      font-size: 12px;
      font-weight: 400;
      color: #000;
    }
  }
}
</style>
