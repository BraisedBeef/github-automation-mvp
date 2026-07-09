# GitHub Actions + Agent API MVP

## What this MVP does

When an issue has the `agent` label, GitHub Actions will:

1. Check out the repository
2. Build a compact issue context payload
3. Call your external Agent API, or generate a built-in demo result
4. Apply the returned patch
5. Optionally run a validation command
6. Open a pull request
7. Comment back on the issue

If the PR body contains `Closes #<issue-number>`, GitHub will close the issue automatically after merge. A second workflow comments on the issue once the agent PR is merged.

## Files added by this MVP

- `.github/workflows/issue-agent.yml`
- `.github/workflows/agent-pr-merged.yml`
- `agent-service/`
- `scripts/collect-issue-context.mjs`
- `scripts/request-agent-fix.mjs`
- `scripts/render-workflow-summary.mjs`
- `scripts/notify-pr-merged.mjs`

## Repository configuration

### GitHub Secrets

Set these repository secrets when you are using a real external Agent API:

- `AGENT_API_URL`
- `AGENT_API_TOKEN`

### GitHub Variables

Optional repository variables:

- `AGENT_DEMO_MODE`
- `AGENT_VALIDATION_COMMAND`
- `ENABLE_AUTO_MERGE`

Examples:

```text
AGENT_VALIDATION_COMMAND=echo "Add your lint/build/test command here"
ENABLE_AUTO_MERGE=false
```

Example demo-first setup:

```text
AGENT_DEMO_MODE=true
AGENT_VALIDATION_COMMAND=echo "validation skipped"
ENABLE_AUTO_MERGE=false
```

When `AGENT_DEMO_MODE=true`, the workflow does not require `AGENT_API_URL` or `AGENT_API_TOKEN`. It generates a demo patch directly inside GitHub Actions so you can verify labels, branching, PR creation, and issue comments without exposing a local service.

## Starting the example Agent API locally

```bash
cd agent-service
cp .env.example .env
node src/server.mjs
```

The default service listens on `http://127.0.0.1:8787`.

### Demo mode

If you set `AGENT_DEMO_MODE=true`, the service will not call a model. It will create a new markdown file under `docs/agent-runs/` so you can verify the full issue-to-PR path safely.

## Recommended first test

1. For the simplest test, set `AGENT_DEMO_MODE=true`
2. Create a small issue
3. Add the `agent` label
4. Watch the workflow open a PR
5. Only after that, switch to a real hosted Agent API if you want model-driven fixes

## Production hardening ideas

- Restrict writable paths inside the Agent API prompt
- Reject issues with labels like `security`, `infra`, or `migration`
- Require human review before merge
- Replace demo validation with real project checks
- Add audit logs and retry handling
