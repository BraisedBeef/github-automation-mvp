import t from '@/utils/i18n'

// 订单视图路由
export const viewOrderRoutes = [
  {
    path: '/network/order/:serialNo',
    name: 'public_ip_order',
    meta: { title: t('netRoutes.order'), notMenu: true, permissions: ['vcloudBase:**'], product: true },
    component: () => import('@/views/network/order/index.vue'),
  },
]
