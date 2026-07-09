# 文档中心治理清单（对比 `test` 分支）

> 对比分支：`test...chore/tech-debt`
> 更新时间：2026-03-30
> 对比命令：`git diff --name-status test -- .`、`git diff --stat test -- .`

---

## 一、对比结论

- 本次治理覆盖工程规范、提交链路、请求层重构、命名规范统一、构建稳定性治理与依赖治理等方向。
- 相对 `test` 分支，当前分支累计 **1475 个文件变更**，其中包含大量重命名与结构性迁移。
- 代码统计：**+38616 / -61515**，属于“清理 + 迁移 + 替换”的净收敛型改造。

---

## 二、构建体积结果（`build:test`）

### 2.1 当前分支构建快照

| 指标          |         数值 |
| ------------- | -----------: |
| js+css 总体积 | 11,796,358 B |
| js 总体积     | 10,894,174 B |
| css 总体积    |    902,184 B |

### 2.2 主要大体积产物（Top 10）

| 文件                         |        体积 |
| ---------------------------- | ----------: |
| index-785cdc2d.js            | 2,153,270 B |
| index-3f532b04.js            | 1,667,440 B |
| echarts-4dd432e2.js          | 1,032,882 B |
| index-8f8430e1.js            |   957,756 B |
| vue-vendor-a1d7fe17.js       |   707,952 B |
| test-e15d06db.js             |   464,974 B |
| xlsx-5f85f80d.js             |   353,464 B |
| vue-vendor-0c0a471b.css      |   327,152 B |
| index-d487612f.js            |   291,207 B |
| use-table-height-1ffb06c3.js |   207,100 B |

### 2.3 主要构建稳定性动作

- 修复构建产物 TDZ 问题（`Cannot access 'no' before initialization`）。
- 调整 `vite` 分包策略：`vue/vue-router/pinia/element-plus` 收敛到 `vue-vendor`，`echarts` 独立分包。
- 在 `build:test` 与 `preview` 链路做过运行验证。

---

## 三、工程治理（相对 `test`）

### 3.1 包管理与基础脚本

- 包管理切换到 `pnpm + pnpm-lock.yaml`（移除 `package-lock.json`）。
- 脚本能力统一：`typecheck / lint / lint:style / lint-staged / commitlint / commit`。
- 增加 `corepack` 激活脚本，约束团队环境一致性。

### 3.2 代码质量体系补齐

- ESLint/Stylelint/Prettier 配置迁移到 `internal/*`，根配置改为薄代理。
- 补齐 `.editorconfig`、`.vscode/extensions.json` 等团队协作配置。
- 引入并固化 lint-staged 规则，按文件类型执行质量检查。

### 3.3 Git 提交流程治理

- 接入 Husky：`pre-commit` + `commit-msg`。
- 接入 Commitlint 与 Commitizen（cz-git）。
- 增加路径大小写防护，降低跨平台提交风险。

---

## 四、架构与目录治理（相对 `test`）

### 4.1 命名规范统一（kebab-case）

- `src` 下组件、视图、资源路径大规模统一为小写短横线命名。
- 本次对比中重命名变更约 **998** 条（以 `git diff --name-status test -- .` 统计）。

### 4.2 请求层与接口目录治理

- 从旧 `src/axios/` 向 `src/request/` 分层结构迁移。
- 新增 `http.ts / index.ts / http-error.ts`，统一错误处理与拦截器入口。
- API 目录按模块拆分并规范化。

### 4.3 关键目录影响面

- `src/views`：632
- `src/assets`：416
- `src/components`：115
- `src/apis`：94
- `src/router`：49

---

## 五、路径大小写与跨平台一致性

### 5.1 新增 Git 路径大小写防护

- `internal/git/check-path-case.mjs`
- `internal/git/case-rename.mjs`
- pre-commit 增加路径大小写校验，提前拦截仅大小写变更导致的远端构建问题。

### 5.2 治理价值

- 避免 macOS/Windows 本地可运行但 Linux 环境构建失败。
- 保障 kebab-case 命名规范长期可执行，而非一次性整改。

---

## 六、关键文件索引

### 6.1 新增（代表）

- `.husky/commit-msg`
- `commitlint.config.mjs`
- `lint-staged.config.mjs`
- `internal/git/check-path-case.mjs`
- `internal/git/case-rename.mjs`
- `internal/eslint/index.cjs`
- `src/request/http.ts`
- `src/request/index.ts`
- `src/request/http-error.ts`

### 6.2 删除/迁移（代表）

- `package-lock.json`（删除，切换 `pnpm-lock.yaml`）
- `src/axios/index.ts`（迁移到 `src/request/`）
- `.cz-config.js`、`.prettierrc.js`（迁移为 `.mjs` 配置）

### 6.3 关键修改（代表）

- `vite.config.ts`
- `package.json`
- `src/utils/router-jump.ts`
- `src/views/network/private-network/list/index.vue`
- `src/views/oss/resource-pack/list/index.vue`
