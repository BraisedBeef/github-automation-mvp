import t from '@/utils/i18n'

// 回收站视图路由
export const viewRecoveryRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cvm/recovery',
    name: 'cvm_recovery',
    meta: { title: t('cvmRoutes.recovery'), icon: 'menu-recovery', product: true },
    component: () => import('@/views/cvm/recovery/index.vue'),
    redirect: '/cvm/recovery/ins',
    children: [
      {
        path: '/cvm/recovery/ins',
        name: 'recovery_ins',
        component: () => import('@/views/cvm/recovery/ins/entry.vue'),
        meta: {
          title: t('cvmRoutes.insRecovery'),
          permissions: ['vcloudCvm:**'],
          product: true,
        },
      },
      {
        path: '/cvm/recovery/disk',
        name: 'recovery_disk',
        component: () => import('@/views/cvm/recovery/disk/entry.vue'),
        meta: {
          title: t('cvmRoutes.diskRecovery'),
          permissions: ['vcloudCvm:**'],
          product: true,
        },
      },
    ],
  },
]
