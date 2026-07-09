<template>
  <el-table
    ref="cat_table"
    v-loading="loading"
    :row-key="rowKey"
    :data="tableData"
    :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
    :style="border ? `border: 1px solid ${border}` : ''"
    v-bind="elementPlusConfig"
    @selection-change="handleSelect"
    @row-click="rowClick"
  >
    <!-- 多选框 -->
    <el-table-column v-if="selection" type="selection" :width="selection" />
    <el-table-column
      v-for="(item, index) in columns"
      :key="item.prop"
      :prop="item.prop"
      :label="item.label"
      :class="item.prop"
      :width="item.width"
      :min-width="item.minWidth"
      :fixed="item.fixed"
      :show-overflow-tooltip="item.tooltip"
    >
      <template #header="{ $index }">
        <slot :name="item.prop + '-header'" :prop="item.prop" :header-index="index">
          {{ item.label }}
          <!-- 排序的按钮 -->
          <SvgIcon
            v-if="item.prop in sort"
            :name="sort[item.prop] ? (sort[item.prop] === 'up' ? 'sort-up' : 'sort-down') : 'sort'"
            @click="handleSort(item.prop)"
          />
        </slot>
      </template>
      <template #default="{ row, $index }">
        <slot :name="item.prop" :row="row" :row-index="$index">
          {{ item.format ? item.format(row) : row[item.prop] }}
        </slot>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
export type SortType = '' | 'up' | 'down'
const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    loading?: boolean
    tableData?: any[]
    rowKey?: string
    elementPlusConfig?: { [x: string]: any } // element-plus提供的一系列参数都可以塞进来(看文档：  https://element-plus.gitee.io/zh-CN/component/table.html)
    selection?: number // 开启多选框 传入的值对应着checkbox这行所占宽度
    sort?: {
      [x: string]: SortType
    } // 开启排序 key === prop
    border?: string // 边框颜色
    // autoComputedWidth?: boolean; // 自动按比例计算宽度
    // ... 后续根据需求补充
  }>(),
  {
    loading: false,
    tableData: () => [],
    rowKey: 'id',
    elementPlusConfig: () => ({}),
    selection: 0, // 默认没有check功能: 0
    sort: () => ({}),
  },
)

const emit = defineEmits<{
  (event: 'select-change', selection: any[]): void
  (event: 'row-click', row): void
  (
    event: 'update:sort',
    data: {
      [x: string]: SortType
    },
  ): void
}>()

const cat_table = ref()

const selections = ref<any[]>([])
// 选择
const handleSelect = (v: any[]) => {
  selections.value = v
  emit('select-change', v)
}
// 清除单个选择
const cancelSelect = row => {
  cat_table.value.toggleRowSelection(row, false)
}
// 清除全部选择
const clearSelect = () => {
  cat_table.value!.clearSelection()
}

// 某一行点击
const rowClick = row => {
  emit('row-click', row)
}

// 排序(up: 向上 down: 向下 空字符串: 未排序)
const handleSort = (prop: string) => {
  const lastSort = props.sort[prop]
  let nextSort: SortType = ''
  if (!lastSort) {
    nextSort = 'up'
  } else {
    nextSort = lastSort === 'up' ? 'down' : 'up'
  }
  const obj = { ...props.sort }
  for (const key in obj) {
    obj[key] = ''
  }
  emit('update:sort', {
    ...obj,
    [prop]: nextSort,
  })
}

// 自动计算过宽度的columns
// const autoComputedWidthColumns = computed(() => {
//   if (props.autoComputedWidth) {
//     props.columns.forEach((item) => {
//       if (item.width && typeof item.width === "number") {
//         item.width = computedWidth(item.width);
//       }
//     });
//     return props.columns;
//   } else {
//     return [];
//   }
// });

// 计算表格格子宽度 1.413 = 1640(实际表格宽度) / 1160设计图表格宽度
const computedWidth = number => {
  return parseInt('' + number * 1.413)
}

defineExpose({
  getRef: () => cat_table,
  cancelSelect: cancelSelect,
  clearSelect: clearSelect,
})
</script>

<style scoped lang="scss"></style>
