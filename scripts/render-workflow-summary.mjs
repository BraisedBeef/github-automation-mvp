import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const responsePath = path.join(process.cwd(), '.agent-output', 'response.json');

if (!existsSync(responsePath)) {
  console.log('未找到 Agent 响应文件，跳过摘要渲染。');
  process.exit(0);
}

const response = JSON.parse(readFileSync(responsePath, 'utf8'));
const lines = [
  '## Agent 结果摘要',
  '',
  `- can_handle: ${Boolean(response.can_handle)}`,
  `- branch_name: ${response.branch_name || '（空）'}`,
  `- commit_message: ${response.commit_message || '（空）'}`,
  '',
  '### 处理说明',
  '',
  response.summary || '没有返回处理说明。',
  ''
];

if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`, { flag: 'a' });
}

console.log(lines.join('\n'));
