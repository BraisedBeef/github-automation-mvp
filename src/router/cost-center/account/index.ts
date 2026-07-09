import t from '@/utils/i18n'

// 账户信息视图路由
export const viewAccountRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cost-center/account/info',
    name: 'cost_center_account',
    meta: { title: t('costCenterRoutes.account'), icon: 'menu-cost-center-user' },
    component: () => import('@/views/cost-center/account/info/entry.vue'),
  },
  {
    path: '/cost-center/account/recharge',
    name: 'cost_center_account_recharge',
    component: () => import('@/views/cost-center/account/recharge/entry.vue'),
    meta: {
      title: t('costCenterRoutes.recharge'),
      notMenu: true,
      permissions: ['userApi:getAccountInfo', 'feeApi:createRechargeOrder'],
      notMenuRedirect: 'cost_center_account',
    },
    beforeEnter: (to, from, next) => {
      to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
      next()
    },
  },
]
