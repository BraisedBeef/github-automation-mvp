import t from '@/utils/i18n'

// 订单管理视图路由
export const viewOrderRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cost-center/order/list',
    name: 'order',
    meta: {
      title: t('costCenterRoutes.order'),
      icon: 'menu-order',
      permissions: ['feeApi:queryProductOrderPage'],
    },
    component: () => import('@/views/cost-center/order/list/entry.vue'),
  },
  {
    path: '/cost-center/order/detail/:tradeNo',
    name: 'order_detail',
    component: () => import('@/views/cost-center/order/detail/entry.vue'),
    meta: {
      title: t('costCenterRoutes.orderDetail'),
      notMenu: true,
      permissions: ['feeApi:queryProductOrder', 'feeApi:cancelProductOrder'],
      notMenuRedirect: 'order',
    },
    beforeEnter: (to, from, next) => {
      to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
      next()
    },
  },
]
