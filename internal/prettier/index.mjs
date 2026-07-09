export default {
  printWidth: 120,
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'avoid',
  useTabs: false,
  requirePragma: false,
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.html',
      options: { parser: 'html' },
    },
    {
      files: '*.md',
      options: { parser: 'markdown' },
    },
    {
      files: '*.json',
      options: { parser: 'json' },
    },
  ],
}
