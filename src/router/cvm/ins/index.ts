import t from '@/utils/i18n'

// 实例视图路由
export const viewInsRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cvm/ins/list',
    name: 'ins',
    meta: {
      title: t('cvmRoutes.ins'),
      icon: 'menu-example',
      permissions: ['vcloudCvm:**'],
      product: true,
    },
    component: () => import('@/views/cvm/ins/list/entry.vue'),
  },
  {
    path: '/cvm/ins/detail/:id/:uuid/:name',
    name: 'ins_detail',
    meta: {
      title: t('cvmRoutes.insDetail'),
      notMenu: true,
      permissions: ['vcloudCvm:**'],
      notMenuRedirect: 'ins',
      product: true,
    },
    component: () => import('@/views/cvm/ins/detail/entry.vue'),
  },
  {
    path: '/cvm/ins/create',
    name: 'ins_create',
    meta: { title: '', notMenu: true, permissions: ['vcloudCvm:**'], notMenuRedirect: 'ins', product: true },
    component: () => import('@/views/cvm/ins/create/entry.vue'),
  },
]
