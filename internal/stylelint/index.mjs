export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order', 'stylelint-config-recommended-vue'],
  ignoreFiles: ['dist/**', 'node_modules/**', '**/*.min.css'],
  rules: {
    'at-rule-no-unknown': null,
    'scss/dollar-variable-pattern': null,
    'selector-class-pattern': null,
    'no-empty-source': null,
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
    'scss/no-global-function-names': null,
    // Vue 深度选择器支持
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'global', 'slotted'] }],
    // 以下规则因工具限制或项目实际情况禁用
    'declaration-property-value-no-unknown': null,
    'scss/at-extend-no-missing-placeholder': null,
    'scss/at-mixin-pattern': null,
    'selector-id-pattern': null,
    'declaration-property-value-keyword-no-deprecated': null,
    // 临时禁用，后续逐步修复
    'no-duplicate-selectors': null,
    'font-family-no-duplicate-names': null,
  },
}
