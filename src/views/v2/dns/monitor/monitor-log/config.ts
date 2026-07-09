import t from '@/utils/i18n'
export const columns = [
  {
    prop: 'name',
    label: t('columns.monitorProject'),
  },
  {
    prop: 'ip',
    label: t('columns.errIp'),
  },
  {
    prop: 'startTime',
    label: t('columns.startTime'),
    utcTip: true,
  },
  {
    prop: 'endTime',
    label: t('columns.recoveryTime'),
    utcTip: true,
  },
  {
    prop: 'duration',
    label: t('columns.duration'),
  },
]
