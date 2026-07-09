// 退款视图路由
export const viewRefundRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cvm/refund',
    name: 'cvm_refund',
    meta: { notMenu: true, notMenuRedirect: 'cvm_refund', product: true },
    component: () => import('@/views/cvm/refund/index.vue'),
    redirect: '/cvm/refund/order',
    children: [
      {
        path: 'order',
        name: 'cvm_refund_order', // 退款订单
        component: () => import('@/views/cvm/refund/order/index.vue'),
        meta: {
          title: '',
          notMenu: true,
          permissions: ['vcloudCvm:**'],
          notMenuRedirect: 'cvm_refund',
          product: true,
        },
      },
      {
        path: 'success',
        name: 'cvm_refund_success', // 退款成功
        component: () => import('@/views/cvm/refund/result/success.vue'),
        meta: { title: '', notMenu: true, permissions: ['vcloudCvm:**'], notMenuRedirect: 'cvm_refund', product: true },
      },
    ],
  },
]
