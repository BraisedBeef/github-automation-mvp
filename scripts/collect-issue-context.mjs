import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const eventPath = process.env.GITHUB_EVENT_PATH;

if (!eventPath) {
  throw new Error('GITHUB_EVENT_PATH is required');
}

const event = JSON.parse(readFileSync(eventPath, 'utf8'));
const issue = event.issue;

if (!issue) {
  throw new Error('Issue payload not found in GitHub event');
}

const textExtensions = new Set([
  '.md', '.txt', '.json', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
  '.vue', '.css', '.scss', '.less', '.html', '.yml', '.yaml'
]);
const skipNames = new Set(['node_modules', 'dist', '.git', '.agent-output', '.pnpm-store']);

function walk(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (skipNames.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, results);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(ext)) continue;
    const stats = statSync(fullPath);
    if (stats.size > 50_000) continue;
    results.push(path.relative(repoRoot, fullPath));
  }
  return results;
}

function tokenize(text) {
  return Array.from(
    new Set(
      String(text || '')
        .toLowerCase()
        .split(/[^a-z0-9\u4e00-\u9fa5]+/)
        .filter(token => token.length >= 2)
    )
  );
}

function scoreFile(filePath, tokens) {
  const lower = filePath.toLowerCase();
  return tokens.reduce((score, token) => score + (lower.includes(token) ? 3 : 0), 0);
}

const allFiles = walk(repoRoot);
const tokens = tokenize(`${issue.title}\n${issue.body || ''}`);
const topFiles = allFiles
  .map(filePath => ({ filePath, score: scoreFile(filePath, tokens) }))
  .sort((a, b) => b.score - a.score || a.filePath.localeCompare(b.filePath))
  .slice(0, 12)
  .map(item => item.filePath);

const alwaysInclude = ['README.md', 'package.json'].filter(filePath => allFiles.includes(filePath));
const selectedFiles = Array.from(new Set([...alwaysInclude, ...topFiles]));

const fileContexts = selectedFiles.map(filePath => {
  const content = readFileSync(path.join(repoRoot, filePath), 'utf8');
  return {
    path: filePath,
    content: content.split('\n').slice(0, 200).join('\n')
  };
});

const payload = {
  repository: process.env.GITHUB_REPOSITORY || '',
  issue: {
    number: issue.number,
    title: issue.title,
    body: issue.body || '',
    labels: (issue.labels || []).map(label => label.name)
  },
  default_branch: event.repository?.default_branch || 'main',
  repository_context: {
    file_inventory: allFiles.slice(0, 400),
    candidate_files: fileContexts
  }
};

mkdirSync(path.join(repoRoot, '.agent-output'), { recursive: true });
writeFileSync(
  path.join(repoRoot, '.agent-output', 'issue-context.json'),
  `${JSON.stringify(payload, null, 2)}\n`
);

console.log(`Prepared context for issue #${issue.number} with ${selectedFiles.length} candidate files.`);
