import t from '@/utils/i18n'

// 硬盘视图路由
export const viewDiskRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cvm/disk/list',
    name: 'disk',
    component: () => import('@/views/cvm/disk/list/entry.vue'),
    meta: {
      title: t('cvmRoutes.disk'),
      icon: 'menu-harddisk',
      permissions: ['vcloudCvm:**'],
      product: true,
    },
  },
  {
    path: '/cvm/disk/detail/:id',
    name: 'disk_detail',
    component: () => import('@/views/cvm/disk/detail/entry.vue'),
    meta: {
      title: t('cvmRoutes.diskDetail'),
      notMenu: true,
      permissions: ['vcloudCvm:**'],
      notMenuRedirect: 'disk',
      product: true,
    },
  },
]
