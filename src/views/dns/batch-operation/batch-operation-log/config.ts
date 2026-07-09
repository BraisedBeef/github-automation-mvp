import t from '@/utils/i18n'
export const type1columns: TableColumn[] = [
  { label: t('columns.optMession'), prop: 'taskName', tooltip: true },
  { label: t('columns.counter'), prop: 'total' },
  { label: t('columns.optResult'), prop: 'result', tooltip: true },
  { label: t('columns.optTime'), prop: 'createTime', tooltip: true },
  { label: t('columns.operation'), prop: 'handle', width: 140 },
]

export const type2columns2: TableColumn[] = [
  { label: t('columns.hostRecord'), prop: 'hostRecord', width: 216 },
  { label: t('columns.recordType'), prop: 'recordType', width: 216 },
  { label: t('columns.lineType'), prop: 'lineType', width: 216 },
  { label: t('columns.recordValue'), prop: 'recordValue', width: 276 },
  { label: t('columns.mx'), prop: 'mx', width: 196 },
  { label: t('columns.weights'), prop: 'weight', width: 196 },
  { label: t('columns.ttl'), prop: 'ttl', width: 196 },
  { label: t('columns.optResult'), prop: 'status', width: 120, fixed: 'right' },
]

export const type2columns2Width: any[] = [
  'width: 87.5%',
  'width: 0; padding: 0',
  'width: 0; padding: 0',
  'width: 0; padding: 0',
  'width: 0; padding: 0',
  'width: 0; padding: 0',
  'width: 0; padding: 0',
  'width: 12.5%',
]

export const type2columns1: TableColumn[] = [
  { label: t('columns.domain'), prop: 'hostRecord' },
  { label: t('columns.optResult'), prop: 'status' },
]

export const type2StatusOption = [
  { label: t('common.fail'), value: 2, class: 'error' },
  { label: t('common.success'), value: 1, class: 'success' },
  { label: t('common.processing'), value: 3, class: 'warning' },
]
