import t from '@/utils/i18n'
export const columns: TableColumn[] = [
  { label: t('columns.hostRecord'), prop: 'hostRecord', width: 216 },
  { label: t('columns.recordType'), prop: 'recordTypeString', width: 216 },
  { label: t('columns.lineType'), prop: 'lineType', width: 216 },
  { label: t('columns.recordValue'), prop: 'recordValue', width: 276 },
  { label: t('columns.mx'), prop: 'mx', width: 240 },
  { label: t('columns.weights'), prop: 'weight', width: 240 },
  { label: t('columns.ttl'), prop: 'ttl', width: 240 },
]
