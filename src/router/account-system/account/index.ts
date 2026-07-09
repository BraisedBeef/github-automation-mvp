import t from '@/utils/i18n'

// 账户信息视图路由
export const viewAccountRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/account-system/account/info',
    name: 'account_system_account',
    meta: {
      title: t('accountSystemRoutes.account'),
      icon: 'menu-user',
    },
    component: () => import('@/views/account-system/account/index.vue'),
  },
]
