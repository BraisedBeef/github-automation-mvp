const testRoutes = [
  {
    path: '/dns/test',
    name: 'Test', // 调试
    meta: { title: '调试', permissions: '**', notMenu: true },
    component: () => import('@/views/special/test.vue'),
  },
]

export const viewTestRoutes = import.meta.env.MODE === 'prod' ? [] : testRoutes
