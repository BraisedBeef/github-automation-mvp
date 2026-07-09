// 退款视图路由
export const viewRefundRoutes = [
  {
    path: '/network/refund',
    name: 'network_refund',
    meta: { title: '', notMenu: true, permissions: ['vcloudBase:**'] },
    component: () => import('@/views/network/refund/index.vue'),
    redirect: '/network/refund/order',
    children: [
      {
        path: 'order',
        name: 'network_refund_order', // 退款订单
        component: () => import('@/views/network/refund/order/index.vue'),
        meta: {
          title: '',
          notMenu: true,
          permissions: ['vcloudBase:**'],
          product: true,
        },
      },
      {
        path: 'success',
        name: 'network_refund_success', // 退款成功
        component: () => import('@/views/network/refund/result/success.vue'),
        meta: { title: '', notMenu: true, permissions: ['vcloudBase:**'], product: true },
      },
    ],
  },
]
