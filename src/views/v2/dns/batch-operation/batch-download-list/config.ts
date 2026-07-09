import t from '@/utils/i18n'
export const columns: TableColumn[] = [
  {
    label: t('columns.fileType'),
    prop: 'fileType',
    width: 200,
  },
  {
    label: t('columns.domain'),
    prop: 'domain',
    minWidth: 200,
  },
  {
    label: t('columns.fileName'),
    prop: 'fileName',
    minWidth: 360,
  },
  {
    label: t('columns.createTime'),
    prop: 'createTime',
    utcTip: true,
    width: 260,
  },
  {
    label: t('columns.comleteTime'),
    prop: 'completionTime',
    utcTip: true,
    width: 260,
  },
  {
    label: t('columns.status'),
    prop: 'status',
    width: 160,
  },
  {
    label: t('columns.operation'),
    prop: 'handle',
    width: 200,
    fixed: 'right',
  },
]

export const statusOption = [
  { label: t('batchOperation.processing'), value: 0, class: 'warning' },
  { label: t('batchOperation.completed'), value: 1, class: 'success' },
  { label: t('common.fail'), value: 2, class: 'error' },
  { label: t('batchOperation.expired'), value: 3, class: 'warning' },
]
