import t from '@/utils/i18n'

// 子网视图路由
export const viewSubnetRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/network/subnet/list',
    name: 'network_security_subnet_list',
    component: () => import('@/views/network/subnet/list/index.vue'),
    meta: {
      title: t('netRoutes.subnet'),
      icon: 'menu-subnet',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
  {
    path: '/network/subnet/detail',
    name: 'network_security_subnet_detail',
    component: () => import('@/views/network/subnet/detail/index.vue'),
    meta: {
      title: t('netRoutes.subnetDetail'),
      notMenu: true,
      notMenuRedirect: 'network_security_subnet_list',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
]
