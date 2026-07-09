import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import process from 'node:process';

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const pullRequest = event.pull_request;
const repo = process.env.GITHUB_REPOSITORY;

if (!pullRequest || !repo) {
  throw new Error('Missing pull request event context');
}

const match = String(pullRequest.body || '').match(/Closes\s+#(\d+)/i);
if (!match) {
  console.log('No linked issue found in PR body.');
  process.exit(0);
}

const issueNumber = match[1];
const commentBody = [
  `Agent pull request #${pullRequest.number} has been merged into \`${pullRequest.base.ref}\`.`,
  '',
  `Merged PR: ${pullRequest.html_url}`
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
