import { createServer } from 'node:http';
import process from 'node:process';

const port = Number(process.env.PORT || 8787);
const apiToken = process.env.AGENT_API_TOKEN || '';
const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const model = process.env.OPENAI_MODEL || 'gpt-4.1';
const demoMode = String(process.env.AGENT_DEMO_MODE || 'false') === 'true';

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 2_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'issue';
}

function buildDemoPatch(issueNumber, issueTitle) {
  const filePath = `docs/agent-runs/issue-${issueNumber}.md`;
  const contentLines = [
    `# Agent Demo Run for Issue #${issueNumber}`,
    '',
    `Title: ${issueTitle}`,
    '',
    'This file was created by the demo Agent API mode to prove that the issue-to-PR workflow is wired correctly.'
  ];

  return [
    `diff --git a/${filePath} b/${filePath}`,
    'new file mode 100644',
    'index 0000000..1111111',
    '--- /dev/null',
    `+++ b/${filePath}`,
    `@@ -0,0 +1,5 @@`,
    ...contentLines.map(line => `+${line}`),
    ''
  ].join('\n');
}

async function callOpenAI(payload) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      can_handle: false,
      summary: 'OPENAI_API_KEY is not configured on the Agent API service.',
      branch_name: '',
      commit_message: '',
      pr_title: '',
      pr_body: '',
      issue_comment: '',
      patch: ''
    };
  }

  const systemPrompt = [
    'You are a GitHub issue fixing agent.',
    'Return JSON only.',
    'Decide whether the issue can be handled automatically with a low-risk patch.',
    'If yes, return a unified diff patch that can be applied with git apply.',
    'Only modify files that appear in the provided repository context.',
    'Keep changes minimal and deterministic.',
    'If the task is ambiguous or high risk, set can_handle to false and explain why.'
  ].join(' ');

  const userPrompt = JSON.stringify(payload, null, 2);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Model response did not include message content');
  }

  return JSON.parse(content);
}

function normalizeAgentResponse(raw, issueNumber, issueTitle) {
  const safeTitle = slugify(issueTitle);
  const branchName = raw.branch_name || `agent/issue-${issueNumber}-${safeTitle}`;
  const commitMessage = raw.commit_message || `fix: resolve issue #${issueNumber}`;
  const prTitle = raw.pr_title || `fix: resolve issue #${issueNumber}`;
  const issueSummary = raw.summary || 'Agent prepared a low-risk change for this issue.';
  const prBodyLines = [
    raw.pr_body || issueSummary,
    '',
    `Closes #${issueNumber}`
  ];

  return {
    can_handle: Boolean(raw.can_handle),
    summary: issueSummary,
    branch_name: branchName,
    commit_message: commitMessage,
    pr_title: prTitle,
    pr_body: prBodyLines.join('\n'),
    issue_comment: raw.issue_comment || `Agent opened a draft fix for issue #${issueNumber}.`,
    patch: raw.patch || ''
  };
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { ok: true, demoMode, model });
  }

  if (req.method !== 'POST' || req.url !== '/solve-issue') {
    return sendJson(res, 404, { error: 'Not found' });
  }

  if (apiToken) {
    const authHeader = req.headers.authorization || '';
    if (authHeader !== `Bearer ${apiToken}`) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }
  }

  try {
    const payload = await readJsonBody(req);
    const issueNumber = payload.issue?.number || 0;
    const issueTitle = payload.issue?.title || 'Untitled issue';

    let rawResponse;
    if (demoMode) {
      rawResponse = {
        can_handle: true,
        summary: 'Demo mode is enabled, so the agent created a trace file instead of editing application code.',
        branch_name: `agent/issue-${issueNumber}-${slugify(issueTitle)}`,
        commit_message: `chore: demo agent run for issue #${issueNumber}`,
        pr_title: `chore: demo agent run for issue #${issueNumber}`,
        issue_comment: `Demo mode created a verification PR for issue #${issueNumber}.`,
        patch: buildDemoPatch(issueNumber, issueTitle)
      };
    } else {
      rawResponse = await callOpenAI(payload);
    }

    const normalized = normalizeAgentResponse(rawResponse, issueNumber, issueTitle);
    sendJson(res, 200, normalized);
  } catch (error) {
    sendJson(res, 500, {
      can_handle: false,
      summary: error instanceof Error ? error.message : 'Unknown server error',
      branch_name: '',
      commit_message: '',
      pr_title: '',
      pr_body: '',
      issue_comment: '',
      patch: ''
    });
  }
});

server.listen(port, () => {
  console.log(`Agent API listening on http://127.0.0.1:${port}`);
});
