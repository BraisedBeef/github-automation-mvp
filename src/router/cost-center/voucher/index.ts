// 代金券视图路由
export const viewVoucherRoutes = [
  {
    path: '/cost-center/voucher',
    name: 'voucher',
    meta: { title: '代金券', icon: 'menu-voucher' },
    component: () => import('@/views/cost-center/voucher/index.vue'),
  },
]
