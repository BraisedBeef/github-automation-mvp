import t from '@/utils/i18n'

export const etherTypeOptions = [
  { label: 'IPv4', value: 'IPv4' },
  { label: 'IPv6', value: 'IPv6' },
]

export const importTable = new Map([
  [t('ipGroup.remark'), 'remarks'],
  [t('ipGroup.ipAddress'), 'ip'],
])
