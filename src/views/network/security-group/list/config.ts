import t from '@/utils/i18n'
export const actionMap = new Map([
  ['allow', t('securityGroup.allow')],
  ['deny', t('securityGroup.refuse')],
])

export const typeOptions = [
  { label: t('securityGroup.default'), value: 1 },
  { label: t('securityGroup.custom'), value: 2 },
]
