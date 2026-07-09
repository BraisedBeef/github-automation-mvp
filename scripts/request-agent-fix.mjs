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

if (!apiUrl) {
  throw new Error('AGENT_API_URL secret is required');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    console.warn(`Agent API attempt ${attempt} failed, retrying in ${delayMs}ms...`);
    await sleep(delayMs);
  }

  throw lastError || new Error('Agent API request failed');
}

const payload = JSON.parse(readFileSync(contextPath, 'utf8'));
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

const result = await response.json();
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

console.log(`Agent API responded with can_handle=${Boolean(result.can_handle)}.`);
