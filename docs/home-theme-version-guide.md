# 主题版本共存接入指南

本文档不再只服务“首页”，而是沉淀为项目内所有 `v1 / v2` 共存页面的通用规范。后续无论是首页、账号中心、CDN，还是其他控制台模块，只要涉及“旧版稳定逻辑保留 + 新版视觉体验重构”，都建议优先按本文档的模式接入。

## 项目背景

当前控制台前端同时维护两套页面体系：

- `v1`：线上已稳定运行的旧版页面，承接现网功能、权限逻辑、已有接口约束和用户习惯。
- `v2`：按新的 Figma 视觉体系逐步重构的新版页面，重点优化信息架构、交互体验和页面一致性。

这不是一次“全量替换式重构”，而是一条需要长期并行演进的路线。原因很现实：

- 控制台模块多，业务链路长，无法一次性重写全部页面。
- 部分页面逻辑复杂，历史包袱较重，直接在原组件上硬改风险很高。
- 新版体验需要逐页落地、逐步灰度、可随时回退，不能影响线上稳定性。
- 不同模块的改版节奏不同，必须允许 `v1` 和 `v2` 长期共存。

所以项目明确采用“主题版本切换 + 新旧版本隔离”的方案，而不是在同一个旧页面里不断叠加条件分支。

## 为什么要这样做

采用 `v1 / v2` 共存而不是直接覆盖 `v1`，核心目的有四个：

### 1. 可灰度

新页面可以先在 `v2` 主题下内部验证、逐步开放，而不影响默认线上页面。

### 2. 可回退

如果 `v2` 页面出现样式、交互、接口联动或权限边界问题，可以快速切回 `v1`。

### 3. 可并行开发

不同同学可以分别维护 `v1` 稳定线和 `v2` 重构线，减少互相干扰。

### 4. 控制改动风险

旧页面的复杂逻辑通常已经跑在线上。与其在原文件里混写大量 `if (isV2Theme)`，不如通过入口层切换版本，把视觉重构和旧逻辑保护隔开。

一句话概括：`v1` 负责稳，`v2` 负责新，入口层负责切换。

## 适用范围

本文档适用于以下场景：

- 某个模块已经有稳定的 `v1` 页面，但要按新版设计稿新增 `v2` 页面。
- 希望保留旧版逻辑与旧版样式，不直接侵入原组件。
- 需要通过 `THEME_VERSION` 在运行时切换版本。
- 需要在 `v2` 页面中接入统一的新版布局壳、表格、提示条、工具条等公共组件。

不建议用于以下场景：

- 只是小范围修 bug 或改一两个文案。
- 页面还没有正式的 `v1 / v2` 双版本诉求。
- 只是局部组件换皮，不涉及整页结构和布局体系切换。

## 总体原则

后续所有接入都尽量遵守下面几条：

### 原则 1：绝不直接改动 v1 逻辑

`v1` 是稳定线。除非是明确的线上 bug 修复，否则不要为了配合 `v2` 改造去改 `v1` 页面逻辑、模板结构或样式结构。

### 原则 2：路由层只切入口，不直接切实现细节

路由应尽量指向 `entry.vue`，由 `entry.vue` 负责根据主题版本选择 `v1` 或 `v2` 页面。

### 原则 3：v2 页面独立实现，不包 v1 页面“换皮”

如果目标是做真正的 `v2` 页面，应该在 `src/views/v2/...` 下独立实现结构、样式和组件组合。  
不要把 `v1` 页面套一层容器后当成 `v2`。

### 原则 4：主题判断集中在入口层

业务页面内部应尽量避免充斥大量 `if (isV2Theme)` 分支。  
主题版本判断尽量收敛到入口层、布局层和少量共享组件层。

### 原则 5：公共能力优先沉淀，避免每个页面各写一套

只要某个 `v2` 结构已经在多个页面重复出现，就应该优先沉淀成公共组件或通用文档，而不是在每个模块重复复制。

## 主题切换机制

主题版本由 Cookie `THEME_VERSION` 控制。

- `v1`：旧版页面
- `v2`：新版页面

核心 Hook：

- [src/hooks/use-theme-version.ts](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/hooks/use-theme-version.ts)

这个 Hook 负责：

- 读取 `THEME_VERSION`
- 标准化主题值，只允许 `v1 / v2`
- 提供 `isV2Theme`
- 提供 `syncThemeVersion`
- 提供 `setThemeVersion`
- 给 `body` 同步挂载 `theme-v2` class

当前实现要点：

- `normalizeThemeVersion`：所有非 `v2` 值都回退成 `v1`
- `syncThemeVersion`：从 Cookie 重新同步
- `setThemeVersion`：写入 Cookie 并同步 body class

## 两类典型接入模式

### 模式 A：首页这类“单入口页面切组件”

典型文件：

- [src/views/home/index.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/home/index.vue)

特点：

- 页面本身就是入口
- 根据 `isV2Theme` 直接切换 `v1 / v2` 组件
- 同时根据业务条件选择主账号/子账号页面

适合场景：

- 这个页面天然就是一个总入口页
- `v1` 和 `v2` 组件都比较聚合
- 不需要额外再包一层 `entry.vue`

### 模式 B：业务模块“路由 -> entry.vue -> v1/v2”

这是更推荐的通用模式。

典型文件：

- [src/views/cdn/content/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/cdn/content/entry.vue)
- [src/views/cdn/log/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/cdn/log/entry.vue)
- [src/views/account-system/access/overview/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/account-system/access/overview/entry.vue)

特点：

- 路由指向 `entry.vue`
- `entry.vue` 内部根据 `isV2Theme` 选择 `LegacyPage` 或 `V2Page`
- `v2` 页面通常再包一层 `V2AccountPageShell`
- `entry.vue` 额外负责联动 `tempStore.pageHeader`

适合场景：

- 大多数控制台业务页面
- 一个模块下会陆续接入多张 `v2` 页面
- 希望路由结构稳定，后续继续扩展更方便

## 推荐目录约定

以 CDN 内容管理为例：

```text
src/views/cdn/content/
├── entry.vue        # 版本切换入口
├── index.vue        # v1 页面
└── refresh-dialog.vue

src/views/v2/cdn/content/
└── index.vue        # v2 页面
```

通用建议：

- `src/views/业务模块/页面/entry.vue`：入口层
- `src/views/业务模块/页面/index.vue`：`v1`
- `src/views/v2/业务模块/页面/index.vue`：`v2`

这样做的好处是：

- `v1 / v2` 物理隔离清晰
- 查问题时一眼能看出哪份代码属于哪个版本
- 路由层不需要频繁改来改去

## 推荐 entry 模板

推荐后续绝大多数列表页、详情页都按这个模板接入：

```vue
<template>
  <V2AccountPageShell v-if="isV2Theme">
    <V2Page />
  </V2AccountPageShell>
  <LegacyPage v-else />
</template>

<script setup lang="ts">
import LegacyPage from './index.vue'
import V2Page from '@/views/v2/xxx/index.vue'
import V2AccountPageShell from '@/views/v2/account-system/components/page-shell.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import { useTempStore } from '@/store'

const tempStore = useTempStore()
const { isV2Theme, syncThemeVersion } = useThemeVersion()

onBeforeMount(() => {
  syncThemeVersion()
  tempStore.setPageHeader(!isV2Theme.value)
})

watch(
  () => isV2Theme.value,
  value => {
    tempStore.setPageHeader(!value)
  },
)

onBeforeUnmount(() => {
  tempStore.setPageHeader(true)
})

onBeforeRouteLeave(() => {
  tempStore.setPageHeader(true)
})
</script>
```

这套模板的职责非常明确：

- 进入页面时同步主题版本
- `v2` 时关闭旧版 `pageHeader`
- 离开页面时恢复默认状态
- 不把 `v1 / v2` 的实现细节揉在一个文件里

## 路由接入约定

推荐路由永远指向 `entry.vue`，不要直接指向 `v1` 或 `v2` 页面。

例如：

```ts
{
  path: '/cdn/content',
  name: 'cdn_content',
  component: () => import('@/views/cdn/content/entry.vue'),
}
```

这样做的好处：

- 后续新增 `v2` 时无需再次调整整套路由语义
- 保持对外路由稳定
- 回退时不需要动业务页面路径

## v2 页面应该怎么写

真正的 `v2` 页面应该是“独立实现”，而不是“复用 v1 DOM 再强行换样式”。

### 推荐做法

- 结构独立写在 `src/views/v2/...`
- 视觉体系优先复用已有 `v2` 公共组件
- 数据接口、字段结构、业务流程尽量沿用 `v1` 已验证过的逻辑

### 不推荐做法

- 在 `v2` 页面里直接 `import LegacyPage` 然后包一层
- 在 `v1` 页面里加很多 `:class="{ 'is-v2': isV2Theme }"`
- 在同一份模板里堆很多 `v-if="isV2Theme"` 分叉 DOM

可以复用的是：

- 接口调用
- 数据转换函数
- 枚举/常量
- 字段格式化函数

不建议直接复用的是：

- `v1` 页面整体 DOM 结构
- `v1` 页面整块样式
- `v1` 页面耦合过深的布局实现

## v2 公共组件资产

当前项目里已经沉淀出一批可复用的 `v2` 页面组件，后续新页面优先使用这些能力。

### 页面壳与工具条

- 页壳：
  [src/views/v2/account-system/components/page-shell.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/page-shell.vue)
- 页内工具条：
  [src/views/v2/account-system/components/page-toolbar.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/page-toolbar.vue)
- 面包屑工具条：
  [src/views/v2/account-system/components/page-breadcrumb-toolbar.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/page-breadcrumb-toolbar.vue)

### 信息提示

- 提示条：
  [src/views/v2/account-system/components/info-notice.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/info-notice.vue)

说明：

- 支持 `info / danger`
- 适合蓝色说明条、红色风险提示条
- `v2` 页面里的普通说明、顶部蓝色提示、风险提醒，优先使用 `InfoNotice`
- 除非设计稿明确要求特殊样式，否则不要在页面里重复手写一套蓝底 notice

### 表格体系

- 表格封装：
  [src/views/v2/account-system/components/table-v2.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/table-v2.vue)
- grouped rows 中间层：
  [src/views/v2/account-system/components/use-table-v2-grouped-rows.ts](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/use-table-v2-grouped-rows.ts)
- detail rows 中间层：
  [src/views/v2/account-system/components/use-table-v2-detail-rows.ts](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/use-table-v2-detail-rows.ts)

说明：

- `table-v2` 已统一表头、行高、空态、分页和边框视觉
- 已支持选择列和实例透传
- 适合平铺表格、分组表格、详情展开表格

补充文档：

- [docs/account-system-table-v2-grouped-guide.md](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/docs/account-system-table-v2-grouped-guide.md)

### 其他常用组件

- 分段 tabs：
  [src/views/v2/account-system/components/segmented-tabs.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/segmented-tabs.vue)
- 流程步骤：
  [src/views/v2/account-system/components/process-steps.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/account-system/components/process-steps.vue)

## 当前已经采用该模式的模块

### 首页

- 入口：
  [src/views/home/index.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/home/index.vue)
- `v1` 主账号：
  [src/views/home/components/main.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/home/components/main.vue)
- `v1` 子账号：
  [src/views/home/components/sub.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/home/components/sub.vue)
- `v2` 主账号：
  [src/views/v2/home/main.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/home/main.vue)
- `v2` 子账号：
  [src/views/v2/home/sub.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/v2/home/sub.vue)

### 账号中心

- 账号信息：
  [src/views/account-system/account/index.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/account-system/account/index.vue)
- 安全设置：
  [src/views/account-system/security-setting/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/account-system/security-setting/entry.vue)
- 订阅管理：
  [src/views/account-system/news/subscribe/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/account-system/news/subscribe/entry.vue)
- 访问管理概览：
  [src/views/account-system/access/overview/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/account-system/access/overview/entry.vue)
- 用户列表：
  [src/views/account-system/access/user/list/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/account-system/access/user/list/entry.vue)
- 新建用户：
  [src/views/account-system/access/user/create/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/account-system/access/user/create/entry.vue)
- 角色列表：
  [src/views/account-system/access/role/list/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/account-system/access/role/list/entry.vue)
- 新建角色：
  [src/views/account-system/access/role/create/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/account-system/access/role/create/entry.vue)

### CDN

- 服务概览：
  [src/views/cdn/service/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/cdn/service/entry.vue)
- 域名管理：
  [src/views/cdn/domain/list/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/cdn/domain/list/entry.vue)
- 内容管理：
  [src/views/cdn/content/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/cdn/content/entry.vue)
- 数据分析监控：
  [src/views/cdn/analysis/monitor/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/cdn/analysis/monitor/entry.vue)
- 数据分析统计：
  [src/views/cdn/analysis/count/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/cdn/analysis/count/entry.vue)
- 离线日志：
  [src/views/cdn/log/entry.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/views/cdn/log/entry.vue)

## 布局与状态联动

版本切换不只是页面组件切换，还涉及布局状态和头部行为。

### `tempStore.pageHeader`

定义位置：

- [src/store/temp.ts](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/store/temp.ts)

用途：

- `true`：显示旧版 `pageHeader`
- `false`：关闭旧版 `pageHeader`，由 `v2` 页面自己接管页头区域

这是为什么大多数 `entry.vue` 都要做：

- 进入时 `tempStore.setPageHeader(!isV2Theme.value)`
- 离开时恢复 `true`

### `tempStore.showSlider`

用途：

- `true`：显示左侧业务菜单
- `false`：隐藏左侧业务菜单

首页是特殊场景。  
进入首页时会主动隐藏侧边栏，离开时恢复。

### `tempStore.prodSlider`

用途：

- 控制产品抽屉 / 产品面板的打开状态

注意：

- 旧版和新版都在使用这个状态
- 如果后续抽屉交互变复杂，建议拆分 `v1 / v2` 各自的产品抽屉状态，避免互相影响

## 顶部与抽屉相关实现

新版首页和部分 `v2` 页面会受到整体布局和头部切换影响，相关位置如下：

- 布局入口：
  [src/layout/default-layout.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/layout/default-layout.vue)
- 头部切换入口：
  [src/layout/components/header/cat-header/cat-header.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/layout/components/header/cat-header/cat-header.vue)
- 旧版头部：
  [src/layout/components/header/cat-header/cat-header-v1.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/layout/components/header/cat-header/cat-header-v1.vue)
- 新版头部：
  [src/layout/components/header/cat-header/cat-header-v2.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/layout/components/header/cat-header/cat-header-v2.vue)
- 新版产品抽屉：
  [src/layout/components/header/cat-header/product-drawer-v2.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/layout/components/header/cat-header/product-drawer-v2.vue)

补充说明：

- `V2AccountPageShell` 只负责页面内容区的 `v2` 容器，不负责左侧菜单切换
- 左侧是不是 `cdn / account-system` 那套深色 `v2` 侧边栏，取决于
  [src/layout/components/menu/cat-menu.vue](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/src/layout/components/menu/cat-menu.vue)
  里的 `v2MenuConfig`
- 当前是按一级路由前缀判断模块，例如 `/account-system/`、`/cdn/`、`/ssl/`
- 所以如果某个页面已经接了 `entry.vue + V2AccountPageShell`，但左侧还是旧版白色菜单，优先检查 `cat-menu.vue` 是否把这个模块纳入了 `v2MenuConfig`
- 这套侧边栏逻辑可以直接参考 `cdn` 和 `account-system` 的接法

## 接入新模块时的推荐步骤

后续如果某个模块也要做 `v2`，建议按下面顺序推进：

1. 保留原有 `v1` 页面，不直接改原文件结构。
2. 新增 `src/views/v2/模块/页面/index.vue`，独立实现 `v2` 页面。
3. 新增 `src/views/模块/页面/entry.vue`，统一做版本切换。
4. 路由改指向 `entry.vue`。
5. 如果 `v2` 页面需要自定义页头，接入 `tempStore.pageHeader` 联动。
6. 优先复用 `page-shell`、`page-breadcrumb-toolbar`、`info-notice`、`table-v2` 等公共组件。
7. 验证 `v1 / v2` 两套页面都能正常进入、切换、回退。

## 接入检查清单

以后每次新增 `v2` 页面，都建议自查下面这些点：

- 路由是否已经切到 `entry.vue`
- `entry.vue` 是否调用了 `syncThemeVersion`
- `v2` 场景是否正确关闭了旧版 `pageHeader`
- 离开页面时是否恢复了 `pageHeader`
- `v2` 页面是否独立实现，而不是包裹 `v1`
- 是否优先复用了现有 `v2` 公共组件
- 是否避免在 `v1` 页面中混入 `v2` 样式分支
- 是否验证了 `v1` 和 `v2` 两套页面都可正常访问

## 后续维护建议

### 1. 优先保持“入口层切换，页面层隔离”

这是目前项目里最稳妥的模式。  
后续不要轻易退回到“单文件里塞满 `isV2Theme` 分支”的写法。

### 2. 公共组件继续向 `v2` 资产沉淀

如果某个 `v2` 模块里出现第二次相同布局，就应该考虑抽成公共组件，而不是继续复制。

### 3. 文档命名虽然叫首页，但用途已经升级为通用规范

当前文件名仍是 `home-theme-version-guide.md`，是因为这份机制最早从首页开始落地。  
但从内容上，它已经是项目级的“主题版本共存接入指南”。后续如果需要，也可以再单独重命名为更通用的文档名。

### 4. 最重要的一条

不要为了赶进度去改坏 `v1`。  
`v1` 是稳定线，`v2` 是演进线，入口层是隔离带。这个边界一旦守住，后续页面越改越多，项目也不会失控。
