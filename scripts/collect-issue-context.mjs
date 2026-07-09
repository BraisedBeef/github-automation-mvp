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
const keywordAliases = new Map([
  ['域名', ['domain', 'dns']],
  ['域名注册', ['domain', 'register']],
  ['域名列表', ['domain', 'list']],
  ['列表', ['list', 'table']],
  ['注册', ['register', 'add', 'create']],
  ['详情', ['detail']],
  ['批量', ['batch', 'batch-operate']],
  ['v1', ['v1', 'legacy', 'index']],
  ['v2', ['v2', 'entry', 'page-shell']],
  ['主题', ['theme', 'entry', 'page-shell']],
  ['版本', ['theme', 'entry', 'v2', 'v1']],
  ['共存', ['entry', 'v2', 'v1', 'page-shell']],
  ['首页', ['home']],
  ['指引', ['guide', 'docs']],
  ['文档', ['guide', 'docs']],
  ['路由', ['router', 'entry']],
  ['样式', ['scss', 'css', 'style']],
  ['账号中心', ['account-system']],
  ['页面壳', ['page-shell']]
]);

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
  const baseTokens = String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/)
    .filter(token => token.length >= 2);
  const expandedTokens = [...baseTokens];

  for (const token of baseTokens) {
    const aliases = keywordAliases.get(token);
    if (aliases) {
      expandedTokens.push(...aliases);
    }
  }

  return Array.from(new Set(expandedTokens));
}

function scoreFile(filePath, tokens) {
  const lower = filePath.toLowerCase();
  let score = tokens.reduce((total, token) => total + (lower.includes(token) ? 3 : 0), 0);

  if (lower.includes('src/views/domain/')) score += 2;
  if (lower.includes('src/views/v2/')) score += 1;
  if (lower.endsWith('/entry.vue')) score += 2;
  if (lower.endsWith('/index.vue')) score += 1;
  if (lower.includes('home-theme-version-guide.md')) score += 10;
  if (lower.includes('use-theme-version')) score += 8;
  if (lower.includes('page-shell.vue')) score += 8;

  return score;
}

const allFiles = walk(repoRoot);
const tokens = tokenize(`${issue.title}\n${issue.body || ''}`);
const mentionedThemeGuide = /home-theme-version-guide\.md/i.test(`${issue.title}\n${issue.body || ''}`);
const themeRelated = tokens.some(token => ['v1', 'v2', 'theme', 'entry', 'page-shell'].includes(token));
const domainRelated = tokens.some(token => ['domain', 'dns', 'list', 'register'].includes(token));

const topFiles = allFiles
  .map(filePath => ({ filePath, score: scoreFile(filePath, tokens) }))
  .sort((a, b) => b.score - a.score || a.filePath.localeCompare(b.filePath))
  .slice(0, 20)
  .map(item => item.filePath);

const alwaysInclude = [
  'README.md',
  'package.json',
  ...(mentionedThemeGuide ? ['docs/home-theme-version-guide.md'] : []),
  ...(themeRelated ? [
    'src/hooks/use-theme-version.ts',
    'src/views/v2/account-system/components/page-shell.vue'
  ] : [])
].filter(filePath => allFiles.includes(filePath));

const domainModuleFiles = domainRelated
  ? allFiles
      .filter(filePath =>
        filePath.startsWith('src/views/domain/')
        || filePath.startsWith('src/views/v2/domain/')
      )
      .slice(0, 12)
  : [];

const selectedFiles = Array.from(new Set([...alwaysInclude, ...topFiles]));
const finalSelectedFiles = Array.from(
  new Set([
    ...alwaysInclude,
    ...domainModuleFiles,
    ...topFiles
  ])
).slice(0, 24);

const fileContexts = finalSelectedFiles.map(filePath => {
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

console.log(`Prepared context for issue #${issue.number} with ${finalSelectedFiles.length} candidate files.`);
console.log('Selected candidate files:');
for (const filePath of finalSelectedFiles) {
  console.log(`- ${filePath}`);
}
