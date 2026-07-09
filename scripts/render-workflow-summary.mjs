import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const responsePath = path.join(process.cwd(), '.agent-output', 'response.json');

if (!existsSync(responsePath)) {
  console.log('No agent response found, skipping summary render.');
  process.exit(0);
}

const response = JSON.parse(readFileSync(responsePath, 'utf8'));
const lines = [
  '## Agent Result',
  '',
  `- can_handle: ${Boolean(response.can_handle)}`,
  `- branch_name: ${response.branch_name || '(empty)'}`,
  `- commit_message: ${response.commit_message || '(empty)'}`,
  '',
  '### Summary',
  '',
  response.summary || 'No summary returned.',
  ''
];

if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`, { flag: 'a' });
}

console.log(lines.join('\n'));
