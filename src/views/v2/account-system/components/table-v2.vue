<template>
  <div
    class="account-table-v2"
    :class="{
      'account-table-v2--grouped': grouped,
      'account-table-v2--tree': tree,
    }"
  >
    <el-table ref="tableRef" v-bind="$attrs" :data="data" class="account-table-v2__table" table-layout="auto">
      <slot />
      <template #empty>
        <slot name="empty">
          <SvgIcon name="v2-table-empty" size="64" />
          <div class="account-table-v2__empty-text">
            {{ emptyText }}
          </div>
        </slot>
      </template>
    </el-table>

    <div v-if="showPagination" class="account-table-v2__footer">
      <div class="account-table-v2__total">
        {{ t('components.total', { total: total || 0 }) }}
      </div>

      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :page-sizes="pageSizes"
        :pager-count="pagerCount"
        :total="total"
        background
        layout="sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import t from '@/utils/i18n'

const props = withDefaults(
  defineProps<{
    data?: any[]
    total?: number
    pagination?: {
      page: number
      pageSize: number
    }
    showPagination?: boolean
    pagerCount?: number
    pageSizes?: number[]
    emptyText?: string
    emptyMinHeight?: number
    grouped?: boolean
    tree?: boolean
  }>(),
  {
    data: () => [],
    total: 0,
    pagination: () => ({
      page: 1,
      pageSize: 10,
    }),
    showPagination: false,
    pagerCount: 7,
    pageSizes: () => [10, 20, 30, 40, 50],
    emptyText: '暂无相关数据',
    emptyMinHeight: 240,
    grouped: false,
    tree: false,
  },
)

// `grouped` is for "group row + child row" tables like subscription management.
// Typical pairing:
// - data: visibleRows from `useTableV2GroupedRows`
// - grouped: true
// - row-class-name / span-method: controlled by the page
// The page still owns business rendering; TableV2 only provides shared v2 table visuals.

const emit = defineEmits<{
  (
    event: 'update:pagination',
    pagination: {
      page: number
      pageSize: number
    },
  ): void
  (
    event: 'change',
    pagination: {
      page: number
      pageSize: number
    },
  ): void
}>()

const tableRef = ref()

const updatePagination = (pagination: { page: number; pageSize: number }) => {
  emit('update:pagination', pagination)
  emit('change', pagination)
}

const handleCurrentChange = (page: number) => {
  updatePagination({
    ...props.pagination,
    page,
  })
}

const handleSizeChange = (pageSize: number) => {
  const maxPage = Math.max(1, Math.ceil((props.total || 0) / pageSize))
  updatePagination({
    page: Math.min(props.pagination.page, maxPage),
    pageSize,
  })
}

defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection?.(),
  getSelectionRows: () => tableRef.value?.getSelectionRows?.(),
  toggleRowSelection: (row: any, selected?: boolean) => tableRef.value?.toggleRowSelection?.(row, selected),
  toggleRowExpansion: (row: any, expanded?: boolean) => tableRef.value?.toggleRowExpansion?.(row, expanded),
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow?.(row),
})
</script>

<style scoped lang="scss">
.account-table-v2 {
  width: 100%;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.account-table-v2__table {
  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }

  :deep(.el-table__border-left-patch) {
    display: none;
  }

  :deep(.el-table__header-wrapper th.el-table__cell) {
    height: 46px;
    padding: 0 16px;
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
    color: #191c23;
    background: #f9fafc;
  }

  :deep(.el-table__body-wrapper td.el-table__cell) {
    height: 56px;

    // padding: 0 16px;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
    background: #fff;
  }

  :deep(.el-table__cell) {
    border-right: 1px solid #e8ecf3;
  }

  :deep(.el-table__fixed),
  :deep(.el-table__fixed-right) {
    box-shadow: none;
  }

  :deep(.el-table__fixed-right::before),
  :deep(.el-table__fixed::before) {
    background-color: #e8ecf3;
  }

  :deep(.el-table__fixed-right-patch) {
    background: #f9fafc;
    border-left: 1px solid #e8ecf3;
  }

  :deep(.el-scrollbar__bar.is-horizontal) {
    height: 10px;
  }

  :deep(.el-table-column--selection .cell) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(th.el-table__cell.is-leaf),
  :deep(td.el-table__cell) {
    border-bottom: 1px solid #e8ecf3;
  }

  :deep(.el-table__row:hover > td.el-table__cell) {
    background: #f9fbff;
  }

  :deep(.el-table__empty-block) {
    min-height: v-bind('`${props.emptyMinHeight}px`');
    padding: 48px 16px;
  }
}

.account-table-v2--grouped .account-table-v2__table {
  :deep(.el-table__body-wrapper td.el-table__cell) {
    padding: 0 16px;
    vertical-align: middle;
  }

  :deep(.el-table__row) {
    height: 56px;
  }

  :deep(td.el-table__cell .cell) {
    display: flex;
    align-items: center;
    min-height: 56px;
  }

  :deep(.account-table-v2__row--group td.el-table__cell) {
    border-right-color: transparent !important;
  }

  :deep(.account-table-v2__row--group td.el-table__cell .cell) {
    display: flex;
    align-items: center;
    min-height: 56px;
  }

  :deep(.el-checkbox) {
    --el-checkbox-input-width: 16px;
    --el-checkbox-input-height: 16px;
  }

  :deep(.el-switch) {
    --el-switch-on-color: #06f;
    --el-switch-off-color: #dcdfe6;

    height: 16px;
  }

  :deep(.el-switch__core) {
    min-width: 26px !important;
    height: 16px;
    border-radius: 12px;
  }

  :deep(.el-switch__action) {
    width: 12px;
    height: 12px;
  }

  :deep(.el-switch.is-checked .el-switch__action) {
    left: calc(100% - 13px);
  }
}

.account-table-v2--tree .account-table-v2__table {
  :deep(.el-table__indent) {
    width: 20px;
  }

  :deep(.el-table__placeholder) {
    display: inline-block;
    width: 14px;
  }
}

.account-table-v2__empty-text {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.account-table-v2__footer {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #e8ecf3;
}

.account-table-v2__total {
  font-size: 14px;
  line-height: 22px;
  color: rgb(0 0 0 / 45%);
}

.account-table-v2__footer :deep(.el-pagination) {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  font-weight: 400;
}

.account-table-v2__footer :deep(.el-pagination__sizes) {
  margin-right: 8px;
}

.account-table-v2__footer :deep(.el-pagination__jump) {
  margin-left: 8px;
  font-size: 14px;
  color: #191c23;
}

.account-table-v2__footer :deep(.btn-prev),
.account-table-v2__footer :deep(.btn-next),
.account-table-v2__footer :deep(.el-pager li),
.account-table-v2__footer :deep(.el-input__wrapper) {
  min-width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 0;
  box-shadow: none;
}

.account-table-v2__footer :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background: #06f;
  border-color: #06f;
}

.account-table-v2__footer :deep(.el-input__wrapper) {
  padding: 0 10px;
}

.account-table-v2__footer :deep(.el-select .el-input) {
  width: 110px;
}

.account-table-v2__footer :deep(.el-input__inner),
.account-table-v2__footer :deep(.el-pagination__jump .el-input__inner) {
  font-size: 14px;
  color: #191c23;
}

@media (width <= 960px) {
  .account-table-v2__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .account-table-v2__footer :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-left: 0;
  }
}
</style>
<style lang="scss" scoped>
:deep(.el-table) {
  .el-form-item {
    margin-bottom: 0;
  }

  thead,
  tbody {
    .el-table__cell {
      .cell {
        padding: 0 16px !important;
        line-height: 46px !important;
      }
    }

    // tr > *:first-child .cell {
    //   padding-left: 20px;
    // }

    // tr > *:last-child .cell {
    //   padding-right: 20px;
    // }
  }

  thead {
    .el-table__cell {
      .cell {
        font-size: 12px !important;
        color: #191c23 !important;
      }
    }
  }
}
</style>
