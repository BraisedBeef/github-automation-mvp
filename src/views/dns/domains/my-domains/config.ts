import t from '@/utils/i18n'
// 域名状态
export const statusOption = [
  {
    label: t('myDomains.normal'),
    value: 1,
    notice: '*' + t('domainSet2.parseStatus1'),
    class: 'success',
  },
  {
    label: t('myDomains.pause'),
    value: 2,
    notice: '*' + t('domainSet2.parseStatus2'),
    class: 'error',
  },
  {
    label: t('myDomains.abnormal'),
    value: 3,
    notice: '*' + t('domainSet2.parseStatus3'),
    class: 'error',
  },
]

export const columns: TableColumn[] = [
  {
    prop: 'domain',
    label: t('columns.domain'),
    // minWidth: 200,
    minWidth: 240,
    tooltip: true,
  },
  {
    prop: 'status',
    label: t('columns.status'),
    // minWidth: 150,
    minWidth: 180,
  },
  {
    prop: 'parseCount',
    label: t('columns.records'),
    // minWidth: 150,
    minWidth: 180,
    tip: '1',
  },
  // {
  //   prop: 'groupId',
  //   label: t('columns.domainGroup'),
  //   minWidth: 140,
  //   tooltip: true
  // },
  {
    prop: 'updateTime',
    label: t('columns.lastUpdated'),
    // minWidth: 200,
    minWidth: 220,
    tip: '1',
    utcTip: true,
    tooltip: true,
  },
  {
    prop: 'remark',
    label: t('columns.remark'),
    // minWidth: 200,
    minWidth: 220,
    tooltip: true,
  },
  {
    prop: 'handle',
    label: t('columns.operation'),
    fixed: 'right',
    minWidth: 300,
  },
]

export const lockOptions = [
  { label: t('common.locked'), value: 1 },
  { label: t('common.unlocked'), value: 0 },
]

export const batchOption = [
  { label: t('myDomains.addDomains'), name: 'BatchAddDomain' },
  { label: t('myDomains.addRecords'), name: 'BatchAddRecord' },
  { label: t('myDomains.changeRecords'), name: 'BatchAmendantRecord' },
  { label: t('myDomains.importRecords'), name: 'BatchImportRecord' },
  { label: t('myDomains.exportRecords'), name: 'BatchExportRecord' },
  { label: t('myDomains.deleteDomain2'), name: 'BatchDeleteDomain' },
]
