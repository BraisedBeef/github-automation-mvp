export default {
  '*.{js,jsx,ts,tsx,cjs,mjs}': ['eslint --fix', 'prettier --write'],
  '*.vue': ['eslint --fix', 'stylelint --fix', 'prettier --write'],
  '*.{scss,less,css}': ['stylelint --fix', 'prettier --write'],
  '*.json': ['prettier --write'],
  '*.md': ['prettier --write'],
}
