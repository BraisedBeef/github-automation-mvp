import t from '@/utils/i18n'
// 私有网络视图路由
export const viewPrivateNetworkRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/network/private-network/list',
    name: 'network_security_private_network_list',
    component: () => import('@/views/network/private-network/list/index.vue'),
    meta: {
      title: t('netRoutes.privateNetwork'),
      icon: 'menu-private-network',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
  {
    path: '/network/private-network/detail',
    name: 'network_security_private_network_detail',
    component: () => import('@/views/network/private-network/detail/index.vue'),
    meta: {
      title: t('netRoutes.privateNetworkDetail'),
      notMenu: true,
      notMenuRedirect: 'network_security_private_network_list',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
]
