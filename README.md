# 朱雀云平台前端（cat-cloud-consol）

## 环境要求

- Node.js：`^18.18.0 || ^20.9.0 || >=22.0.0`
- pnpm：`>=9`（项目当前锁定 `pnpm@10.29.2`）

## 安装

```bash
pnpm install
```

## 本地运行

```bash
pnpm cdev
pnpm dev
pnpm test
pnpm prod
```

## 构建与预览

```bash
pnpm build:dev
pnpm build:test
pnpm build:prod
pnpm preview
```

## 质量检查

```bash
pnpm lint
pnpm lint:check
pnpm lint:style
pnpm lint:style:fix
pnpm typecheck
pnpm vitest
```

## 提交流程

```bash
pnpm commit
pnpm commitlint
pnpm lint-staged
pnpm check:case
pnpm git:case-rename
```

## 目录结构

```text
cat-cloud-web
├─ docs/                    项目文档
├─ env/                     环境变量文件
├─ internal/                工程化配置（eslint/stylelint/prettier/commitlint/git）
├─ public/                  静态资源
├─ src/
│  ├─ apis/                 接口定义
│  ├─ assets/               图片、样式、svg 等资源
│  ├─ components/           复用组件
│  ├─ config/               全局配置
│  ├─ constants/            常量
│  ├─ directives/           指令
│  ├─ hooks/                组合式 hooks
│  ├─ layout/               布局
│  ├─ locales/              国际化
│  ├─ request/              请求层（http、错误处理）
│  ├─ router/               路由
│  ├─ store/                pinia 状态管理
│  ├─ utils/                工具函数
│  ├─ views/                业务页面
│  ├─ app.vue
│  └─ main.ts
├─ types/                   全局类型声明
├─ vite.config.ts
└─ CHANGELOG-治理清单.md    治理报告（对比 test 分支）
```

## 补充文档

- 首页新旧版本说明：
  [docs/home-theme-version-guide.md](/Users/tian/Office.localized/cat-cloud/cat-cloud-web/docs/home-theme-version-guide.md)
- GitHub Actions + Agent API MVP：
  [docs/github-actions-agent-mvp.md](/Users/tian/Office.localized/ai/github-automation-mvp/docs/github-actions-agent-mvp.md)

## GitHub 自动处理 Issue MVP

这个仓库已经加入一套最小可用的 `GitHub Actions + Agent API` 骨架，用来验证下面这条链路：

```text
Issue 打上 agent 标签
-> GitHub Actions 收到事件
-> Actions 生成 issue 上下文并调用 Agent API
-> Agent API 返回 patch
-> Actions 应用 patch、创建 PR、回帖
-> PR 合并后自动回帖，Issue 自动关闭
```

快速入口：

```bash
cd agent-service
cp .env.example .env
node src/server.mjs
```

详细配置说明见：

- [docs/github-actions-agent-mvp.md](/Users/tian/Office.localized/ai/github-automation-mvp/docs/github-actions-agent-mvp.md)
