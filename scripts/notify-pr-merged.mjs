import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import process from 'node:process';

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const pullRequest = event.pull_request;
const repo = process.env.GITHUB_REPOSITORY;

if (!pullRequest || !repo) {
  throw new Error('缺少拉取请求事件上下文');
}

const match = String(pullRequest.body || '').match(/Closes\s+#(\d+)/i);
if (!match) {
  console.log('没有在 PR 正文中找到关联的 Issue。');
  process.exit(0);
}

const issueNumber = match[1];
const commentBody = [
  `Agent 拉取请求 #${pullRequest.number} 已经合并到 \`${pullRequest.base.ref}\`。`,
  '',
  `已合并的拉取请求：${pullRequest.html_url}`
].join('\n');

execFileSync(
  'gh',
  ['issue', 'comment', issueNumber, '--repo', repo, '--body', commentBody],
  {
    env: {
      ...process.env,
      GH_TOKEN: process.env.GITHUB_TOKEN
    },
    stdio: 'inherit'
  }
);
