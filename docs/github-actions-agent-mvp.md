# GitHub Actions + Agent API MVP

## 这套 MVP 能做什么

当一个 Issue 带上 `agent` 标签后，GitHub Actions 会自动执行下面这条链路：

1. 检出仓库代码
2. 生成精简的 Issue 上下文
3. 调用外部 Agent API，或者直接生成内置演示结果
4. 应用返回的补丁
5. 按需执行校验命令
6. 自动创建拉取请求
7. 在 Issue 下自动回帖

如果 PR 正文里包含 `Closes #<issue-number>`，那么合并之后 GitHub 会自动关闭对应的 Issue。另一个 workflow 还会在 PR 合并后，再回帖通知 Issue。

## 这套 MVP 新增了哪些文件

- `.github/workflows/issue-agent.yml`
- `.github/workflows/agent-pr-merged.yml`
- `agent-service/`
- `scripts/collect-issue-context.mjs`
- `scripts/request-agent-fix.mjs`
- `scripts/render-workflow-summary.mjs`
- `scripts/notify-pr-merged.mjs`

## 仓库配置

### GitHub Secrets

只有在你要接入真实外部 Agent API 时，才需要配置下面两个 Secret：

- `AGENT_API_URL`
- `AGENT_API_TOKEN`

### GitHub Variables

可选变量如下：

- `AGENT_DEMO_MODE`
- `AGENT_VALIDATION_COMMAND`
- `ENABLE_AUTO_MERGE`

示例：

```text
AGENT_VALIDATION_COMMAND=echo "这里填你的 lint/build/test 命令"
ENABLE_AUTO_MERGE=false
```

推荐的演示模式配置：

```text
AGENT_DEMO_MODE=true
AGENT_VALIDATION_COMMAND=echo "validation skipped"
ENABLE_AUTO_MERGE=false
```

当 `AGENT_DEMO_MODE=true` 时，workflow 不依赖 `AGENT_API_URL` 或 `AGENT_API_TOKEN`，而是直接在 GitHub Actions 内部生成一份演示补丁。这样你不用暴露本地服务，也能验证标签触发、自动建分支、自动建 PR 和自动回帖这条链路。

## 如何在本地启动示例 Agent API

```bash
cd agent-service
cp .env.example .env
node src/server.mjs
```

默认服务地址是 `http://127.0.0.1:8787`。

### 演示模式说明

如果你把 `AGENT_DEMO_MODE=true` 配到本地服务里，那么服务不会调用模型，而是会在 `docs/agent-runs/` 下创建一份 markdown 记录文件，用来证明整个 Issue -> PR 流程已经打通。

## 推荐的第一次测试方式

1. 先把 `AGENT_DEMO_MODE=true` 打开
2. 创建一个测试 Issue
3. 给这个 Issue 打上 `agent` 标签
4. 观察 workflow 是否自动创建 PR
5. 确认流程跑通后，再切换到真实托管的 Agent API

## 生产环境建议

- 在 Agent API 的提示词里限制允许修改的路径
- 对 `security`、`infra`、`migration` 等高风险标签直接拒绝自动处理
- 合并前保留人工审核
- 用真实的 lint / build / test 命令替换演示校验
- 为每次自动处理增加审计日志和重试机制
