# TableV2 特殊表格复用说明

本文档用于说明账号中心 `v2` 里两种“非普通平铺列表”表格如何复用，避免后续页面再次手写一套展开、选择和样式逻辑。

当前这套能力由两部分组成：

- `TableV2` 的 `grouped` 视觉模式
- `TableV2` 的 `tree` 视觉模式
- `useTableV2GroupedRows` 的分组行展开/选择逻辑
- `useTableV2DetailRows` 的“主行 + 展开详情面板”逻辑

## 文件位置

- 分组表格样式能力：
  [src/views/v2/account-system/components/table-v2.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/table-v2.vue)
- 分组表格逻辑能力：
  [src/views/v2/account-system/components/use-table-v2-grouped-rows.ts](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/use-table-v2-grouped-rows.ts)
- 展开详情行逻辑能力：
  [src/views/v2/account-system/components/use-table-v2-detail-rows.ts](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/use-table-v2-detail-rows.ts)
- 当前参考页面：
  [src/views/v2/account-system/news/subscribe/index.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/news/subscribe/index.vue)
- 当前“展开详情面板”参考页面：
  [src/views/v2/account-system/access/user-list/index.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/access/user-list/index.vue)

## 形态一：grouped rows

### 适用场景

适合下面这种表格：

- 一级行是“分类/分组”
- 二级行是“分类下的具体数据项”
- 一级行需要自己控制展开/收起
- 一级行和二级行视觉不一样
- 一级行通常不直接展示完整列内容，而是跨列占位

不适合下面这种表格：

- 普通平铺列表
- 完全使用 `el-table` 默认树表样式的页面
- 业务字段、交互完全不一样，且首列不是“箭头 + 复选框 + 标题”的页面

### 设计边界

这套复用的边界是：

- `TableV2 grouped` 只负责提供统一的 `v2` 分组表格视觉基础能力
- `useTableV2GroupedRows` 只负责展开、可见行、全选、半选、子项选择联动
- 页面本身仍然负责：
  - 首列内容怎么画
  - 具体列有哪些
  - `span-method`
  - `row-class-name`
  - 业务按钮、开关、跳转、编辑逻辑

不要把“订阅管理”的业务字段直接抽进公共组件。

### 数据结构要求

在传给 composable 之前，先把接口数据整理成这种形式：

```ts
type GroupRow = {
  id: string
  rowType: 'group'
  messageTypeDesc: string
  subRows?: ChildRow[]
}

type ChildRow = {
  id: string
  parentId: string
  rowType: 'child'
  messageTypeDesc: string
  channels?: string[]
  userNames?: string[]
  notDisturb?: number
}
```

注意：

- 不要把接口原始的 `children` 直接保留在最终行对象上
- 建议统一转成 `subRows`
- 否则 `el-table` 可能把它继续当树数据渲染，造成重复行

### 最小接入步骤

### 1. 先把接口树数据规范化

参考：
[src/views/v2/account-system/news/subscribe/index.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/news/subscribe/index.vue)

核心思路：

- 一级分组行生成 `id`
- 二级子行生成 `id` 和 `parentId`
- 一级行标记 `rowType: 'group'`
- 二级行标记 `rowType: 'child'`
- 子行挂在 `subRows`

### 2. 页面中接入 composable

```ts
const list = ref<GroupRow[]>([])

const {
  visibleRows,
  selectedLeafRows,
  isAllLeafSelected,
  isLeafSelectionIndeterminate,
  isGroupRow,
  isChildRow,
  isExpanded,
  isRowSelected,
  isGroupIndeterminate,
  toggleGroup,
  toggleRowSelected,
  toggleSelectAll,
  setExpandedGroupIds,
  resetSelection,
} = useTableV2GroupedRows(list, {
  getChildren: row => row.subRows,
})
```

### 3. 表格启用 grouped 模式

```vue
<TableV2 :data="visibleRows" grouped :span-method="tableSpanMethod" :row-class-name="getRowClassName">
  ...
</TableV2>
```

### 4. 自己绘制首列

首列通常需要页面自己控制：

- 展开箭头
- 一级行复选框
- 二级行复选框
- 一级/二级缩进
- 标题文本

因为这部分最容易受业务设计稿影响，不适合封死在公共组件里。

### grouped 模式提供了什么

`TableV2 grouped` 当前统一了这些基础样式：

- 分组表格行高 `56px`
- 单元格垂直居中
- 一级分组行去掉竖线
- 二级明细行保留分列
- `checkbox` 统一尺寸
- `switch` 统一尺寸与颜色

如果后续同类页面样式还要统一，优先改这里：

- [src/views/v2/account-system/components/table-v2.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/table-v2.vue)

### composable 提供了什么

`useTableV2GroupedRows` 当前统一了这些行为：

- `visibleRows`
  负责把分组数据平铺成当前可见表格数据
- `toggleGroup`
  控制一级分组展开/收起
- `toggleSelectAll`
  控制全部二级数据的全选/取消全选
- `toggleRowSelected`
  控制一级联动子项、二级单行选择
- `isRowSelected`
  判断当前行是否选中
- `isGroupIndeterminate`
  判断一级分组是否处于半选态
- `selectedLeafRows`
  直接拿到最终选中的二级数据

### 订阅管理页的参考实现

当前最完整的参考页是：

- [src/views/v2/account-system/news/subscribe/index.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/news/subscribe/index.vue)

这页演示了：

- 如何把接口树数据转成 `subRows`
- 如何用 composable 控制展开和选择
- 如何在 `TableV2 grouped` 上做一级跨列
- 如何绘制首列箭头、复选框和标题
- 如何在二级行中接业务列，例如 `switch`、`编辑`

## 形态二：tree rows

这一类表格直接使用 Element Plus 的树形表格能力，展开后的内容仍然是同一张表里的子行，不是额外插入一块展开面板，也不是在展开区里再套一张子表。

### 适用场景

适合下面这种表格：

- 父行和子行使用同一套列结构
- 展开后仍然希望保持“同一张表”的视觉连续性
- 只需要 `el-table` 默认树表的展开交互
- 页面不需要 grouped 那种首列全自绘和半选联动

不适合下面这种表格：

- 需要自己控制一级跨列占位的 grouped rows
- 展开后是一整块详情面板的 detail rows
- 展开区域里要画完全不同结构的自定义内容

### 设计边界

这套复用的边界是：

- `TableV2 tree` 只负责补齐 `v2` 树表的通用视觉细节
- 具体树数据结构、列渲染、业务跳转、按钮逻辑仍由页面自己负责
- `children`、`row-key`、`tree-props` 这些树表能力继续使用 `el-table` 原生属性传入

### tree 模式提供了什么

`TableV2 tree` 当前统一了这些基础样式：

- 树表缩进宽度 `20px`
- 无子节点占位宽度 `14px`
- 继续复用 `TableV2` 默认表头、行高、边框、hover` 样式

如果后续树表样式还要继续统一，优先改这里：

- [src/views/v2/account-system/components/table-v2.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/table-v2.vue)

### 最小接入步骤

#### 1. 把接口数据转成树结构

最常见的是把接口里的 `items` 映射成 `children`：

```ts
const buildTreeRows = (rows: any[] = []) =>
  rows.map((row, parentIndex) => ({
    ...row,
    __rowKey: `${row.type || 'row'}-parent-${parentIndex}`,
    children: Array.isArray(row.items)
      ? row.items.map((child: any, childIndex: number) => ({
          ...child,
          __isChild: true,
          __parentType: row.type,
          __rowKey: `${row.type || 'row'}-child-${childIndex}`,
        }))
      : [],
  }))
```

注意：

- 每一行都要有稳定的 `row-key`
- 传给表格的数据里要使用 `children`
- 如果父子行文案不同，建议额外加 `__isChild` 这种标记位给列模板判断

#### 2. 页面中启用 `TableV2 tree`

```vue
<TableV2 :data="treeData" tree row-key="__rowKey" :tree-props="{ children: 'children' }">
  <el-table-column prop="type" label="项目名称">
    <template #default="{ row }">
      <span>{{ row.__isChild ? row.type : formatParentLabel(row) }}</span>
    </template>
  </el-table-column>
</TableV2>
```

### 当前参考页面

- [src/views/v2/cost-center/expense-bill/bill/list/components/dimension.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/cost-center/expense-bill/bill/list/components/dimension.vue)

这页演示了：

- 如何把接口返回的 `items` 转成 `children`
- 如何在 `TableV2 tree` 上直接使用 Element 树表
- 如何根据父行/子行区分首列文案和趋势按钮参数

## 形态三：expand detail rows

这一类表格和 grouped rows 的区别很关键：

- 主表行本身就是完整数据行
- 展开后不是“子表行”
- 展开后插入的是一整块无表头的详情面板
- 父行和展开内容通常需要跨列合并

账号中心里，当前的“访问管理-用户列表”就是这种形态。

### 适用场景

适合下面这种表格：

- 列表主行已经有完整列数据
- 行首需要展开箭头
- 展开后展示补充信息卡片、描述列表或详情面板
- 展开块不是独立子项，不需要参与普通列排序和选择

不适合下面这种表格：

- 真正的父子树表
- 二级项本身就是独立可编辑数据行
- 需要对子项做批量选择、半选联动的表格

### 设计边界

这套复用的边界是：

- `TableV2` 继续只负责统一的 `v2` 表格视觉壳
- `useTableV2DetailRows` 只负责“当前哪些主行被展开”以及“如何把详情行插入可见数组”
- 页面本身仍然负责：
  - 展开按钮如何渲染
  - 详情面板具体长什么样
  - `span-method`
  - `row-class-name`
  - 排序、筛选、操作按钮和业务逻辑

### 数据结构要求

这类表格不需要 `subRows`，只要求主行有稳定 `id`：

```ts
type MainRow = {
  id: string | number
  userName: string
  accountType: number
  userType: number
  createDate?: string
}
```

`useTableV2DetailRows` 会在运行时自动插入这种内部详情行：

```ts
type DetailRow = {
  id: `${mainRow.id}__detail`
  parentId: mainRow.id
  rowType: 'detail'
  parentRow: mainRow
}
```

### 最小接入步骤

#### 1. 主数据先按业务需要排序/筛选

因为详情行是运行时插进去的，所以排序、筛选一定要先作用在主行数据上，再交给 composable。

不要直接让 `el-table` 对已经混入详情行的 `visibleRows` 做本地排序，否则主行和详情块会被打散。

#### 2. 页面中接入 composable

```ts
const list = ref<MainRow[]>([])

const { visibleRows, isExpanded, isDetailRow, toggleRowExpanded } = useTableV2DetailRows(filteredList)
```

#### 3. 页面自己用 `span-method` 合并详情行

```ts
const tableSpanMethod = ({ row, columnIndex }) => {
  if (!isDetailRow(row)) {
    return [1, 1]
  }

  if (columnIndex === 0) {
    return [1, 6]
  }

  return [0, 0]
}
```

#### 4. 首列自己区分主行 / 详情行

```vue
<template #default="{ row }">
  <ExpandDetail v-if="isDetailRow(row)" :row="row.parentRow" />
  <MainRowCell v-else :row="row" />
</template>
```

### composable 提供了什么

`useTableV2DetailRows` 当前统一了这些行为：

- `visibleRows`
  负责把主行数据平铺成“主行 + 详情行”的当前可见数据
- `toggleRowExpanded`
  控制主行展开/收起
- `isExpanded`
  判断主行当前是否展开
- `isDetailRow`
  判断当前渲染行是不是详情行

### 用户列表页的参考实现

当前参考页：

- [src/views/v2/account-system/access/user-list/index.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/access/user-list/index.vue)
- [src/views/v2/account-system/access/user-list/components/expand-detail.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/access/user-list/components/expand-detail.vue)

这页演示了：

- 如何让主行保留完整列表列数据
- 如何在展开后插入一整块详情面板
- 如何通过 `span-method` 横跨整行
- 如何避免排序把详情行打散

## 常见问题

### 1. 为什么会出现重复子行

通常是因为：

- 页面已经手动把子行平铺到了 `visibleRows`
- 同时又把接口原始 `children` 保留在行对象上

`el-table` 会把 `children` 再当树节点渲染一遍。

解决方式：

- 在规范化数据时把原始 `children/items` 剥掉
- 统一只保留 `subRows`

### 2. 为什么不要直接把业务按钮封进 TableV2

因为：

- 每个页面的列和交互不一样
- 首列结构也可能不同
- 一旦把业务字段和按钮做进公共组件，后面复用范围会越来越窄

公共层应该只做“分组表格基础能力”，不要做“订阅管理专用表格”。

### 3. expand detail rows 为什么不要直接复用 grouped rows

因为两者模型不一样：

- `grouped rows` 的二级行是独立数据项
- `expand detail rows` 的详情块只是主行的补充展示

如果强行复用 grouped rows：

- 排序和筛选会更容易出错
- 详情块会被误当成真实数据行
- `span-method` 和选择联动会变复杂

### 4. 后续页面接入建议

建议按下面顺序做：

1. 先判断是 `grouped rows` 还是 `expand detail rows`
2. 如果是分组树数据，用 `useTableV2GroupedRows`
3. 如果是主行展开详情，用 `useTableV2DetailRows`
4. `TableV2` 只复用视觉壳，不要把业务结构抽进公共层
5. 页面自己处理首列、详情块和业务列

这样最稳，也最容易维护。
