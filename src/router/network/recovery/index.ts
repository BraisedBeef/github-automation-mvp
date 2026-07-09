import t from '@/utils/i18n'

// 回收站视图路由
export const viewRecoveryRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/network/recovery',
    name: 'network_recovery',
    meta: { title: t('netRoutes.recovery'), icon: 'menu-recovery', product: true },
    component: () => import('@/views/network/recovery/index.vue'),
    redirect: '/network/recovery/eip',
    children: [
      {
        path: '/network/recovery/eip',
        name: 'recovery_eip',
        component: () => import('@/views/network/recovery/eip/index.vue'),
        meta: {
          title: t('netRoutes.eipRecovery'),
          permissions: ['vcloudCvm:**'],
          product: true,
        },
      },
    ],
  },
]
