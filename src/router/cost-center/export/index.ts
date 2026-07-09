import t from '@/utils/i18n'

// 导出记录视图路由
export const viewExportRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cost-center/export',
    name: 'export',
    meta: {
      title: t('costCenterRoutes.export'),
      icon: 'menu-export',
      permissions: ['feeApi:generatePage'],
    },
    component: () => import('@/views/cost-center/export/entry.vue'),
  },
]
