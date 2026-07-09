export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert', 'build', 'ci'],
    ],
    'subject-min-length': [2, 'always', 5],
    'header-max-length': [2, 'always', 100],
    'subject-case': [0],
  },
}
