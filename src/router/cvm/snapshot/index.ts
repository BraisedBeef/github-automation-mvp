import t from '@/utils/i18n'

// 快照视图路由
export const viewSnapshotRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cvm/snapshot/list',
    name: 'snapshot',
    component: () => import('@/views/cvm/snapshot/list/entry.vue'),
    meta: {
      title: t('cvmRoutes.snapshot'),
      icon: 'menu-snapshot',
      permissions: ['vcloudCvm:**'],
      product: true,
    },
  },
  {
    path: '/cvm/snapshot/detail/:id',
    name: 'snapshot_detail',
    component: () => import('@/views/cvm/snapshot/detail/entry.vue'),
    meta: {
      title: t('cvmRoutes.snapshotDetail'),
      notMenu: true,
      permissions: ['vcloudCvm:**'],
      notMenuRedirect: 'snapshot',
      product: true,
    },
  },
  {
    path: '/cvm/snapshot/chain/:id',
    name: 'snapshot_chain',
    component: () => import('@/views/cvm/snapshot/chain/entry.vue'),
    meta: {
      title: t('cvmRoutes.snapshotChain'),
      notMenu: true,
      permissions: ['vcloudCvm:**'],
      notMenuRedirect: 'snapshot',
      product: true,
    },
  },
  {
    path: '/cvm/snapshot/policy',
    name: 'snapshot_policy',
    component: () => import('@/views/cvm/snapshot/policy/index.vue'),
    meta: {
      title: t('cvmRoutes.snapshotChain'),
      notMenu: true,
      permissions: ['vcloudCvm:**'],
      notMenuRedirect: 'snapshot',
      product: true,
    },
  },
]
