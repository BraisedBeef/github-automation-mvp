import t from '@/utils/i18n'

// 续费管理视图路由
export const viewRenewRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cost-center/renew',
    name: 'renew',
    meta: {
      title: t('renewalManagement.renewalManagement'),
      icon: 'menu-renew',
      permissions: [
        'renew:createRenewResourceOrder',
        'renew:queryRenewPrice',
        'renew:modifyRenewFlag',
        'renew:queryRenewResourceList',
        'renew:queryRenewResourceNum',
      ],
    },
    component: () => import('@/views/cost-center/renew/entry.vue'),
  },
]
