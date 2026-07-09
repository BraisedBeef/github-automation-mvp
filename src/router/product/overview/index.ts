import t from '@/utils/i18n'

// 账户信息视图路由
export const viewOverviewRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/product/overview',
    name: 'product_overview',
    meta: {
      title: t('productOverview.servicesOverview'),
      icon: 'menu-cost-center-user',
      product: false,
      dynamicRoute: true,
    },
    component: () => import('@/views/product/overview/index.vue'),
  },
]
