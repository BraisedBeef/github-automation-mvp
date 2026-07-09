# GitHub Actions Git Flow MVP

## 这套 MVP 能做什么

这是一套按 `main <- dev <- agent/*` 组织的 GitHub Actions MVP。

当一个 Issue 带上 `agent` 标签后，GitHub Actions 会自动执行下面这条链路：

1. 从 `dev` 分支检出代码
2. 生成精简的 Issue 上下文
3. 直接调用兼容 OpenAI 的模型接口，或者调用外部 Agent API，或者直接生成内置演示结果
4. 创建 `agent/issue-<编号>-<标题>` 分支
5. 应用返回的补丁
6. 按需执行校验命令
7. 自动创建 `agent/* -> dev` 拉取请求
8. 在 Issue 下自动回帖

如果 PR 正文里包含 `Closes #<issue-number>`，那么 PR 合并到 `dev` 后 GitHub 会自动关闭对应的 Issue。另一个 workflow 还会在 PR 合并后，再回帖通知 Issue。

## 分支约定

```text
main          ← 生产分支，只接收 dev -> main 的发布 PR
  └── dev     ← 集成测试分支，只接收 agent/* -> dev 的开发 PR
        └── agent/*  ← Agent 或开发者实际工作的功能分支
```

建议的仓库保护策略：

- 禁止直接 push 到 `main`
- 禁止直接 push 到 `dev`
- Agent 只允许创建 `agent/* -> dev` PR
- `dev -> main` 保留人工审核

## 这套 MVP 新增了哪些文件

- `.github/workflows/issue-agent.yml`
- `.github/workflows/agent-pr-merged.yml`
- `agent-service/`
- `scripts/collect-issue-context.mjs`
- `scripts/request-agent-fix.mjs`
- `scripts/render-workflow-summary.mjs`
- `scripts/notify-pr-merged.mjs`

## 仓库初始化

第一次使用前，先确保仓库里已经存在 `dev` 分支：

```bash
git checkout main
git pull origin main
git checkout -b dev
git push -u origin dev
```

然后在 GitHub 的分支保护里把 `main` 和 `dev` 都保护起来。

## 仓库配置

### GitHub Secrets

如果你要接入真实模型，推荐直接配置下面这组：

- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`

如果你已经有自己独立部署的 Agent API，也可以改用：

- `AGENT_API_URL`
- `AGENT_API_TOKEN`

### GitHub Variables

可选变量如下：

- `AGENT_BASE_BRANCH`
- `AGENT_DEMO_MODE`
- `OPENAI_MODEL`
- `AGENT_VALIDATION_COMMAND`
- `ENABLE_AUTO_MERGE`

示例：

```text
AGENT_BASE_BRANCH=dev
OPENAI_MODEL=gpt-4.1
AGENT_VALIDATION_COMMAND=echo "这里填你的 lint/build/test 命令"
ENABLE_AUTO_MERGE=false
```

推荐的演示模式配置：

```text
AGENT_BASE_BRANCH=dev
AGENT_DEMO_MODE=true
AGENT_VALIDATION_COMMAND=echo "validation skipped"
ENABLE_AUTO_MERGE=false
```

当 `AGENT_DEMO_MODE=true` 时，workflow 不依赖 `AGENT_API_URL` 或 `AGENT_API_TOKEN`，而是直接在 GitHub Actions 内部生成一份演示补丁。这样即使你暂时没有外部接口，也能先验证 Issue -> agent 分支 -> dev PR -> 回帖 这条链路。

## 如果你暂时没有接口，怎么做

你现在没有外部 Agent API 完全没关系，先这样用：

1. 保持 `AGENT_DEMO_MODE=true`
2. 不配置 `AGENT_API_URL`
3. 不配置 `AGENT_API_TOKEN`
4. 让 GitHub Actions 直接生成演示补丁

这样你可以先把流程和权限跑通，等以后有了真实接口，再切换到：

- `AGENT_DEMO_MODE=false`
- 优先配置 `OPENAI_BASE_URL`
- 优先配置 `OPENAI_API_KEY`
- 配置 `OPENAI_MODEL`

## 如果你有兼容 OpenAI 的中转站，怎么做

如果你手上有一个兼容 OpenAI API 的中转站，那么最简单的真实模式配置就是：

```text
AGENT_BASE_BRANCH=dev
AGENT_DEMO_MODE=false
OPENAI_MODEL=你的模型名
AGENT_VALIDATION_COMMAND=echo "validation skipped"
```

然后把下面两个值配成 GitHub Secrets：

- `OPENAI_BASE_URL`：例如 `https://你的中转站地址/v1`
- `OPENAI_API_KEY`：你的中转站密钥

这样 GitHub Actions 会直接调用这个兼容接口，不再要求你先部署一个单独的 Agent 服务。

## 如何在本地启动示例 Agent API

```bash
cd agent-service
cp .env.example .env
node src/server.mjs
```

默认服务地址是 `http://127.0.0.1:8787`。如果以后你仍然想走“独立 Agent API 服务”这条路，建议优先部署到一台固定的云服务，而不是依赖临时隧道。

### 演示模式说明

如果你把 `AGENT_DEMO_MODE=true` 配到本地服务里，那么服务不会调用模型，而是会在 `docs/agent-runs/` 下创建一份 markdown 记录文件，用来证明整个 Issue -> agent 分支 -> dev PR 流程已经打通。

## 推荐的第一次测试方式

1. 先把 `AGENT_DEMO_MODE=true` 打开
2. 创建一个测试 Issue
3. 给这个 Issue 打上 `agent` 标签
4. 观察 workflow 是否自动创建 `agent/* -> dev` PR
5. 确认流程跑通后，再切换到真实模型接口或真实托管的 Agent API
6. 后续发布时，再由人工创建 `dev -> main` 发布 PR

## 生产环境建议

- 在 Agent API 的提示词里限制允许修改的路径
- 对 `security`、`infra`、`migration` 等高风险标签直接拒绝自动处理
- `agent/* -> dev` 可以按需自动合并，但 `dev -> main` 建议保留人工审核
- 用真实的 lint / build / test 命令替换演示校验
- 为每次自动处理增加审计日志和重试机制
