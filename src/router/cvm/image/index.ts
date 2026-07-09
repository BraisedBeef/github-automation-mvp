import t from '@/utils/i18n'

// 镜像视图路由
export const viewImageRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cvm/image/list',
    name: 'image',
    component: () => import('@/views/cvm/image/list/entry.vue'),
    meta: {
      title: t('cvmRoutes.image'),
      icon: 'menu-mirror',
      permissions: ['vcloudCvm:**'],
      product: true,
    },
  },
  {
    path: '/cvm/image/common/detail/:id',
    name: 'image_common_detail',
    component: () => import('@/views/cvm/image/detail/common-entry.vue'),
    meta: {
      title: t('cvmRoutes.imageDetail'),
      notMenu: true,
      permissions: ['vcloudCvm:**'],
      notMenuRedirect: 'image',
      product: true,
    },
  },
  {
    path: '/cvm/image/custom/detail/:id',
    name: 'image_custom_detail',
    component: () => import('@/views/cvm/image/detail/custom-entry.vue'),
    meta: {
      title: t('cvmRoutes.imageDetail'),
      notMenu: true,
      permissions: ['vcloudCvm:**'],
      notMenuRedirect: 'image',
      product: true,
    },
  },
]
