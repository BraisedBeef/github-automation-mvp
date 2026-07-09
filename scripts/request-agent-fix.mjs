import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, '.agent-output');
const contextPath = path.join(outputDir, 'issue-context.json');
const responsePath = path.join(outputDir, 'response.json');
const patchPath = path.join(outputDir, 'issue.patch');

const apiUrl = process.env.AGENT_API_URL;
const apiToken = process.env.AGENT_API_TOKEN || '';
const demoMode = String(process.env.AGENT_DEMO_MODE || 'false') === 'true';
const openaiBaseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const openaiApiKey = process.env.OPENAI_API_KEY || '';
const openaiModel = normalizeModelName(process.env.OPENAI_MODEL || 'gpt-4.1');
const openaiEndpointPath = process.env.OPENAI_ENDPOINT_PATH || '';
const openaiWireApi = String(process.env.OPENAI_WIRE_API || 'responses').trim().toLowerCase();
const openaiReasoningEffort = String(process.env.OPENAI_REASONING_EFFORT || '').trim().toLowerCase();
const openaiDisableResponseStorage = String(process.env.OPENAI_DISABLE_RESPONSE_STORAGE || 'true') === 'true';
const openaiUserAgent = process.env.OPENAI_USER_AGENT || '';

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'issue';
}

function normalizeModelName(model) {
  const value = String(model || '').trim();
  if (!value) {
    return 'gpt-4.1';
  }

  // Some proxy tools accept shorthand like "5.4" in the UI and rewrite it to "gpt-5.4".
  if (/^\d+(\.\d+)?(-mini)?$/.test(value)) {
    return `gpt-${value}`;
  }

  return value;
}

function buildDemoPatch(issueNumber, issueTitle) {
  const filePath = `docs/agent-runs/issue-${issueNumber}.md`;
  const contentLines = [
    `# Issue #${issueNumber} 的 Agent 演示记录`,
    '',
    `标题：${issueTitle}`,
    '',
    '这个文件由 GitHub Actions 的演示模式自动创建，用来验证从 Issue 到拉取请求的自动处理链路已经连通。'
  ];

  return [
    `diff --git a/${filePath} b/${filePath}`,
    'new file mode 100644',
    'index 0000000..1111111',
    '--- /dev/null',
    `+++ b/${filePath}`,
    '@@ -0,0 +1,5 @@',
    ...contentLines.map(line => `+${line}`),
    ''
  ].join('\n');
}

function buildDemoResponse(payload) {
  const issueNumber = payload.issue?.number || 0;
  const issueTitle = payload.issue?.title || 'Untitled issue';

  return {
    can_handle: true,
    summary: '当前启用了 GitHub Actions 演示模式，因此这次流程创建的是演示记录文件，而不是真实修改业务代码。',
    branch_name: `agent/issue-${issueNumber}-${slugify(issueTitle)}`,
    commit_message: `chore: 演示 issue #${issueNumber} 的 agent 流程`,
    pr_title: `chore: 演示 issue #${issueNumber} 的 agent 流程`,
    pr_body: `当前启用了 GitHub Actions 演示模式，因此这次流程创建的是演示记录文件，而不是真实修改业务代码。\n\nCloses #${issueNumber}`,
    issue_comment: `演示模式已经为 issue #${issueNumber} 创建了一条验证用的拉取请求。`,
    patch: buildDemoPatch(issueNumber, issueTitle)
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeAgentResponse(raw, payload) {
  const issueNumber = payload.issue?.number || 0;
  const issueTitle = payload.issue?.title || 'Untitled issue';
  const canHandle = Boolean(raw.can_handle);
  const defaultSummary = canHandle
    ? 'Agent 已经准备好一份低风险改动。'
    : 'Agent 判断这个 Issue 当前信息不足，暂时不适合自动生成修复补丁。';
  const defaultIssueComment = canHandle
    ? `Agent 已经为 issue #${issueNumber} 生成了一条修复用的拉取请求。`
    : `Agent 暂时不能直接处理 issue #${issueNumber}，建议补充更明确的复现步骤、期望结果和影响文件。`;

  return {
    can_handle: canHandle,
    summary: raw.summary || defaultSummary,
    branch_name: canHandle ? (raw.branch_name || `agent/issue-${issueNumber}-${slugify(issueTitle)}`) : '',
    commit_message: canHandle ? (raw.commit_message || `fix: 处理 issue #${issueNumber}`) : '',
    pr_title: canHandle ? (raw.pr_title || `fix: 处理 issue #${issueNumber}`) : '',
    pr_body: canHandle ? (raw.pr_body || `${raw.summary || defaultSummary}\n\nCloses #${issueNumber}`) : '',
    issue_comment: raw.issue_comment || defaultIssueComment,
    patch: canHandle ? (raw.patch || '') : ''
  };
}

async function callOpenAICompatibleModel(payload) {
  const systemPrompt = [
    '你是一个 GitHub Issue 自动修复 Agent。',
    '你必须只返回 JSON。',
    '你需要判断这个 Issue 是否适合自动处理。',
    '如果适合，请返回可以直接被 git apply 应用的 unified diff patch。',
    '只允许修改仓库上下文里已经提供的文件，改动必须尽量小、尽量确定。',
    '如果需求不明确、风险过高、或者缺少必要上下文，请把 can_handle 设为 false，并解释原因。'
  ].join(' ');

  const chatCompletionsRequestBody = {
    model: openaiModel,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(payload, null, 2) }
    ]
  };
  if (openaiReasoningEffort) {
    chatCompletionsRequestBody.reasoning_effort = openaiReasoningEffort;
  }

  const responsesRequestBody = {
    model: openaiModel,
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(payload, null, 2) }
    ],
    text: {
      format: {
        type: 'json_object'
      }
    },
    store: !openaiDisableResponseStorage
  };
  if (openaiReasoningEffort) {
    responsesRequestBody.reasoning = {
      effort: openaiReasoningEffort
    };
  }

  const endpointCandidates = buildEndpointCandidates();

  let lastError;

  for (const candidate of endpointCandidates) {
    const requestUrl = candidate.url;
    try {
      console.log(`尝试模型接口地址：${requestUrl}`);

      const headers = {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      };
      if (openaiUserAgent) {
        headers['User-Agent'] = openaiUserAgent;
      }

      const response = await requestWithRetry(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(candidate.kind === 'responses' ? responsesRequestBody : chatCompletionsRequestBody)
      });

      const data = await response.json();
      const content = candidate.kind === 'responses'
        ? extractResponsesText(data)
        : data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('模型响应中没有返回可解析内容');
      }

      return JSON.parse(content);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`接口地址 ${requestUrl} 调用失败：${lastError.message}`);
    }
  }

  throw lastError || new Error('所有模型接口地址都调用失败');
}

function buildEndpointCandidates() {
  if (openaiEndpointPath) {
    const normalizedPath = openaiEndpointPath.startsWith('/')
      ? openaiEndpointPath
      : `/${openaiEndpointPath}`;
    return [
      {
        url: `${openaiBaseUrl}${normalizedPath}`,
        kind: normalizedPath.includes('responses') ? 'responses' : 'chat.completions'
      }
    ];
  }

  const candidates = openaiWireApi === 'chat_completions' || openaiWireApi === 'chat/completions'
    ? [
        { url: `${openaiBaseUrl}/v1/chat/completions`, kind: 'chat.completions' },
        { url: `${openaiBaseUrl}/chat/completions`, kind: 'chat.completions' },
        { url: `${openaiBaseUrl}/v1/responses`, kind: 'responses' },
        { url: `${openaiBaseUrl}/responses`, kind: 'responses' }
      ]
    : [
        { url: `${openaiBaseUrl}/v1/responses`, kind: 'responses' },
        { url: `${openaiBaseUrl}/responses`, kind: 'responses' },
        { url: `${openaiBaseUrl}/v1/chat/completions`, kind: 'chat.completions' },
        { url: `${openaiBaseUrl}/chat/completions`, kind: 'chat.completions' }
      ];

  return uniqueCandidates(candidates);
}

function uniqueCandidates(candidates) {
  const seen = new Set();
  return candidates.filter(candidate => {
    if (seen.has(candidate.url)) {
      return false;
    }
    seen.add(candidate.url);
    return true;
  });
}

function extractResponsesText(data) {
  if (typeof data.output_text === 'string' && data.output_text) {
    return data.output_text;
  }

  const outputs = Array.isArray(data.output) ? data.output : [];
  for (const item of outputs) {
    const contents = Array.isArray(item.content) ? item.content : [];
    for (const part of contents) {
      if (part?.type === 'output_text' && typeof part.text === 'string') {
        return part.text;
      }
      if (part?.type === 'text' && typeof part.text === 'string') {
        return part.text;
      }
    }
  }

  return '';
}

async function requestWithRetry(url, options, retries = 4) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }

      const text = await response.text();
      const retryableStatus = response.status === 408 || response.status === 429 || response.status >= 500;
      if (!retryableStatus || attempt === retries) {
        throw new Error(`Agent API request failed: ${response.status} ${text}`);
      }

      lastError = new Error(`Attempt ${attempt}/${retries} failed: ${response.status} ${text}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === retries) {
        throw lastError;
      }
    }

    const delayMs = attempt * 3000;
    console.warn(`Agent API 第 ${attempt} 次请求失败，将在 ${delayMs}ms 后重试...`);
    await sleep(delayMs);
  }

  throw lastError || new Error('Agent API request failed');
}

const payload = JSON.parse(readFileSync(contextPath, 'utf8'));
let result;

if (demoMode) {
  result = buildDemoResponse(payload);
} else if (openaiApiKey) {
  const raw = await callOpenAICompatibleModel(payload);
  result = normalizeAgentResponse(raw, payload);
} else {
  if (!apiUrl) {
    throw new Error('当 AGENT_DEMO_MODE=false 时，必须提供 OPENAI_API_KEY 或 AGENT_API_URL');
  }

  const response = await requestWithRetry(`${apiUrl.replace(/\/$/, '')}/solve-issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Agent API request failed: ${response.status} ${text}`);
  }

  const raw = await response.json();
  result = normalizeAgentResponse(raw, payload);
}
mkdirSync(outputDir, { recursive: true });
writeFileSync(responsePath, `${JSON.stringify(result, null, 2)}\n`);
writeFileSync(patchPath, result.patch || '', 'utf8');

const outputLines = [
  `can_handle=${Boolean(result.can_handle)}`,
  `branch_name=${result.branch_name || ''}`,
  `commit_message=${result.commit_message || ''}`,
  `pr_title=${result.pr_title || ''}`,
  `pr_body<<__BODY__`,
  `${result.pr_body || ''}`,
  `__BODY__`
];

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `${outputLines.join('\n')}\n`, { flag: 'a' });
}

console.log(`Agent 结果已生成，can_handle=${Boolean(result.can_handle)}。`);
