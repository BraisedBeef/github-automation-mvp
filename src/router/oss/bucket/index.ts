import t from '@/utils/i18n'

// 存储桶视图路由
export const viewBucketRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/oss/service-overview',
    name: 'oss_service-overview',
    meta: {
      title: t('oss.serviceOverview'),
      icon: 'menu-storage-overview',
      permissions: ['oss:**'],
      product: true,
    },
    component: () => import('@/views/oss/service-overview/entry.vue'),
  },
  {
    path: '/oss/bucket/list',
    name: 'bucket',
    meta: {
      title: t('oss.bucketList'),
      icon: 'menu-storage-bucket-list',
      permissions: ['oss:**'],
      product: true,
    },
    component: () => import('@/views/oss/bucket/list/entry.vue'),
  },
  {
    path: '/oss/bucket/detail/:id/:region/:name',
    name: 'bucket_detail',
    meta: {
      title: t('oss.bucketList'),
      notMenu: true,
      permissions: ['oss:**'],
      notMenuRedirect: 'bucket',
      product: true,
    },
    component: () => import('@/views/oss/bucket/detail/entry.vue'),
  },
  {
    path: '/oss/usage-statistics',
    name: 'oss_usage_statistics',
    meta: {
      title: t('oss.usageStatistics'),
      icon: 'menu-storage-statistics1',
      permissions: ['oss:**'],
      product: true,
    },
    component: () => import('@/views/oss/usage-statistics/entry.vue'),
  },
  {
    path: '/oss/resource-pack/list',
    name: 'oss_resourcePack',
    meta: {
      title: t('oss.resourcePackM'),
      icon: 'menu-storage-resource-pack1',
      permissions: ['oss:**'],
      product: true,
    },
    component: () => import('@/views/oss/resource-pack/list/entry.vue'),
  },
  {
    path: '/oss/create/list',
    name: 'oss_res_create',
    meta: {
      title: '',
      permissions: ['oss:**'],
      notMenu: true,
      notMenuRedirect: 'oss',
      product: true,
    },
    component: () => import('@/views/oss/resource-pack/create/entry.vue'),
  },
]
