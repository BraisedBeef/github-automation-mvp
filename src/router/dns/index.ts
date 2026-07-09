import t from '@/utils/i18n'
// dns视图路由
export const dnsRoutes: PlusRouteRecordRaw[] = [
  // 我的域名
  {
    path: '/dns/my-domains',
    name: 'MyDomains',
    meta: { title: t('routes.myDomains'), icon: 'menu-domain-dns', permissions: ['dns:**'], product: true },
    component: () => import('@/views/dns/domains/my-domains/entry.vue'),
  },
  // 监控任务
  {
    path: '/dns/monitor-task',
    name: 'MonitorTask',
    meta: { title: t('routes.monitorTask'), icon: 'menu-monitor-dns', permissions: ['dns:**'], product: true },
    component: () => import('@/views/dns/monitor/entry.vue'),
  },
  // 批量操作
  {
    path: '/dns/batch-operation',
    name: 'BatchOperation',
    meta: {
      title: t('routes.batchOperation'),
      icon: 'menu-batch-dns',
      permissions: ['dns:**'],
      product: true,
    },
    component: () => import('@/views/dns/batch-operation/entry.vue'),
    redirect: '/dns/batch-operation/add-domain',
    children: [
      {
        path: '/dns/batch-operation/add-domain',
        name: 'BatchAddDomain', // 添加域名
        meta: {
          title: t('routes.addDomains'),
          notMenu: true,
          notMenuRedirect: 'BatchOperation',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/batch-operation/batch-add-domain/entry.vue'),
      },
      {
        path: '/dns/batch-operation/add-record',
        name: 'BatchAddRecord', // 添加记录
        meta: {
          title: t('routes.addRecords'),
          notMenu: true,
          notMenuRedirect: 'BatchOperation',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/batch-operation/batch-add-record/entry.vue'),
      },
      {
        path: '/dns/batch-operation/amendant-record',
        name: 'BatchAmendantRecord', // 修改记录
        meta: {
          title: t('routes.modifyRecords'),
          notMenu: true,
          notMenuRedirect: 'BatchOperation',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/batch-operation/batch-amendant-record/entry.vue'),
      },
      {
        path: '/dns/batch-operation/import-record',
        name: 'BatchImportRecord', // 导入记录
        meta: {
          title: t('routes.importRecords'),
          notMenu: true,
          notMenuRedirect: 'BatchOperation',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/batch-operation/batch-import-record/entry.vue'),
      },
      {
        path: '/dns/batch-operation/export-record',
        name: 'BatchExportRecord', // 导出记录
        meta: {
          title: t('routes.exportRecords'),
          notMenu: true,
          notMenuRedirect: 'BatchOperation',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/batch-operation/batch-export-record/entry.vue'),
      },
      {
        path: '/dns/batch-operation/delete-domain',
        name: 'BatchDeleteDomain', // 删除域名
        meta: {
          title: t('routes.deleteDomains'),
          notMenu: true,
          notMenuRedirect: 'BatchOperation',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/batch-operation/batch-delete-domain/entry.vue'),
      },
      {
        path: '/dns/batch-operation/operation-log',
        name: 'BatchOperationLog', // 操作日志
        meta: {
          title: t('routes.operationLog'),
          notMenu: true,
          notMenuRedirect: 'BatchOperation',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/batch-operation/batch-operation-log/entry.vue'),
      },
      {
        path: '/dns/batch-operation/download-list',
        name: 'BatchDownloadList', // 文件下载列表
        meta: {
          title: t('routes.fileList'),
          notMenu: true,
          notMenuRedirect: 'BatchOperation',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/batch-operation/batch-download-list/entry.vue'),
      },
    ],
  },
  // ],
  // },
  {
    path: '/dns/domain-layout',
    name: 'DomainLayout',
    component: () => import('@/views/dns/domains/domain-layout/entry.vue'),
    redirect: '/dns/domain-layout/record-mana',
    meta: { notMenu: true, permissions: ['dns:**'], notMenuRedirect: 'MyDomains', product: true },
    children: [
      {
        path: '/dns/domain-layout/record-mana',
        name: 'RecordMana',
        meta: {
          title: t('routes.recordMana'),
          notMenu: true,
          notMenuRedirect: 'MyDomains',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/domains/record-mana/entry.vue'),
      },
      {
        path: '/dns/domain-layout/data-statistics',
        name: 'DataStatistics',
        meta: {
          title: t('routes.dataStatistics'),
          notMenu: true,
          notMenuRedirect: 'MyDomains',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/domains/data-statistics/entry.vue'),
      },
      {
        path: '/dns/domain-layout/domains-set',
        name: 'DomainsSet',
        meta: {
          title: t('routes.domainSetting'),
          notMenu: true,
          notMenuRedirect: 'MyDomains',
          permissions: ['dns:**'],
          product: true,
        },
        component: () => import('@/views/dns/domains/domains-set/entry.vue'),
      },
    ],
  },
  {
    path: '/dns/add-monitor',
    name: 'AddMonitor', // 监控
    meta: {
      notMenu: true,
      notMenuRedirect: 'MonitorTask',
      permissions: ['dns:**'],
      product: true,
    },
    component: () => import('@/views/dns/monitor/add-monitor/entry.vue'),
  },
]
