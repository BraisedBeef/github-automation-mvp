# GitHub Actions + Agent API MVP

## What this MVP does

When an issue has the `agent` label, GitHub Actions will:

1. Check out the repository
2. Build a compact issue context payload
3. Call your external Agent API
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

Set these repository secrets:

- `AGENT_API_URL`
- `AGENT_API_TOKEN`

### GitHub Variables

Optional repository variables:

- `AGENT_VALIDATION_COMMAND`
- `ENABLE_AUTO_MERGE`

Examples:

```text
AGENT_VALIDATION_COMMAND=echo "Add your lint/build/test command here"
ENABLE_AUTO_MERGE=false
```

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

1. Start the Agent API service
2. Expose it with a public URL such as a tunnel or deploy it
3. Add `AGENT_API_URL` and `AGENT_API_TOKEN` in GitHub repository settings
4. Create a small issue
5. Add the `agent` label
6. Watch the workflow open a PR

## Production hardening ideas

- Restrict writable paths inside the Agent API prompt
- Reject issues with labels like `security`, `infra`, or `migration`
- Require human review before merge
- Replace demo validation with real project checks
- Add audit logs and retry handling
