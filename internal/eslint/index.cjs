module.exports = {
  parser: 'vue-eslint-parser',
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    '.eslintrc-auto-import.json',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['**/*.{ts,tsx,vue}'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'vue'],
  ignorePatterns: ['dist/', 'node_modules/', 'types/auto-import.d.ts', 'types/components.d.ts', '*.min.js'],
  rules: {
    // 临时禁用，提交后恢复
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-dupe-keys': 'off',
    'vue/no-mutating-props': 'off',
    'vue/no-unused-vars': 'off',
    'vue/valid-v-for': 'off',
    'vue/require-v-for-key': 'off',
    'vue/return-in-computed-property': 'off',
    'vue/component-name-in-template-casing': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-useless-escape': 'off',
    'no-extra-semi': 'off',
    'no-var': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'no-prototype-builtins': 'off',
    'no-empty': 'off',
    'vue/no-side-effects-in-computed-properties': 'off',
    'vue/no-useless-template-attributes': 'off',
    'vue/no-use-v-if-with-v-for': 'off',
    'vue/no-ref-as-operand': 'off',
    'vue/prop-name-casing': 'off',
    'vue/no-template-shadow': 'off',
    'vue/no-v-html': 'off',
    'vue/no-lone-template': 'off',
    // 保留的规则
    'vue/require-component-is': 'error',
  },
}
