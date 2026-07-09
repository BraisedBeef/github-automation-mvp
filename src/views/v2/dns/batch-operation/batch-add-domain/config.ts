import t from '@/utils/i18n'
export const columns: TableColumn[] = [
  {
    prop: 'host',
    label: t('columns.hostRecord'),
    width: 216,
  },
  {
    prop: 'record_type',
    label: t('columns.recordType'),
    width: 216,
  },
  {
    prop: 'route_type',
    label: t('columns.lineType'),
    width: 216,
  },
  {
    prop: 'record_value',
    label: t('columns.recordValue'),
    width: 264,
  },
  {
    prop: 'mx',
    label: t('columns.mx'),
    width: 240,
  },
  {
    prop: 'weight',
    label: t('columns.weights'),
    width: 240,
  },
  {
    prop: 'TTL',
    label: t('columns.ttl'),
    width: 240,
  },
]
