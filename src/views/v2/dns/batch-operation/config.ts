import t from '@/utils/i18n'
export const tabs = [
  {
    label: t('routes.addDomains'),
    value: 0,
    name: 'BatchAddDomain',
    path: '/dns/batch-operation/add-domain',
  },
  {
    label: t('routes.addRecords'),
    value: 1,
    name: 'BatchAddRecord',
    path: '/dns/batch-operation/add-record',
  },
  {
    label: t('routes.modifyRecords'),
    value: 2,
    name: 'BatchAmendantRecord',
    path: '/dns/batch-operation/amendant-record',
  },
  {
    label: t('routes.importRecords'),
    value: 3,
    name: 'BatchImportRecord',
    path: '/dns/batch-operation/import-record',
  },
  {
    label: t('routes.exportRecords'),
    value: 4,
    name: 'BatchExportRecord',
    path: '/dns/batch-operation/export-record',
  },
  {
    label: t('routes.deleteDomains'),
    value: 5,
    name: 'BatchDeleteDomain',
    path: '/dns/batch-operation/delete-domain',
  },
  {
    label: t('routes.operationLog'),
    value: 6,
    name: 'BatchOperationLog',
    path: '/dns/batch-operation/operation-log',
  },
  {
    label: t('routes.fileList'),
    value: 7,
    name: 'BatchDownloadList',
    path: '/dns/batch-operation/download-list',
  },
]

// 判断当前域名是否属于当前用户
export const checkDomainsAllowsUser = (_domains: string, domainList: any[]) => {
  const domains = _domains.split('\n').filter(item => item)
  const domainsByList = domainList.map(item => item.domain)
  const n: string[] = []
  domains.forEach(item => {
    if (!domainsByList.includes(item)) {
      n.push(item)
    }
  })
  return {
    n,
    domains,
    domainsByList,
  }
}
