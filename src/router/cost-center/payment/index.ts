// 支付系统视图路由
export const viewPaymentRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cost-center/payment',
    name: 'payment',
    meta: { notMenu: true, notMenuRedirect: 'payment' },
    component: () => import('@/views/cost-center/payment/index.vue'),
    children: [
      {
        path: 'product-order/:tradeNo',
        name: 'payment_product_order', // 产品订单
        component: () => import('@/views/cost-center/payment/order/entry.vue'),
        meta: {
          notMenu: true,
          notMenuRedirect: 'payment',
        },
      },
      {
        path: 'online/:tradeNo',
        name: 'payment_online', // 在线支付
        component: () => import('@/views/cost-center/payment/online/entry.vue'),
        meta: {
          notMenu: true,
          notMenuRedirect: 'payment',
        },
      },
      {
        path: 'success',
        name: 'payment_success', // 成功
        component: () => import('@/views/cost-center/payment/result/success.vue'),
        meta: { notMenu: true, notMenuRedirect: 'payment' },
      },
      {
        path: 'fail',
        name: 'payment_fail', // 失败
        component: () => import('@/views/cost-center/payment/result/fail.vue'),
        meta: { notMenu: true, notMenuRedirect: 'payment' },
      },
      {
        path: 'pre-pay-order/:serialNo',
        name: 'payment_pre_pay_order', // 预付款订单
        component: () => import('@/views/cost-center/payment/pre-pay-order/entry.vue'),
        meta: {
          notMenu: true,
          notMenuRedirect: 'payment',
        },
      },
      {
        path: 'pre-refund-order/:serialNo',
        name: 'payment_pre_refund_order', // 预退款订单
        component: () => import('@/views/cost-center/payment/pre-refund-order/index.vue'),
        meta: {
          notMenu: true,
          notMenuRedirect: 'payment',
        },
      },
    ],
  },
]
