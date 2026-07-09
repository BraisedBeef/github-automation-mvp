import t from '@/utils/i18n'
// 弹性网卡视图路由
export const viewNetworkCardRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/network/network-card/list',
    name: 'network_security_network_card_list',
    component: () => import('@/views/network/network-card/list/index.vue'),
    meta: {
      title: t('netRoutes.networkCard'),
      icon: 'menu-network-card',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
  {
    path: '/network/network-card/detail',
    name: 'network_security_network_card_detail',
    component: () => import('@/views/network/network-card/detail/index.vue'),
    meta: {
      title: t('netRoutes.networkCardDetail'),
      notMenu: true,
      notMenuRedirect: 'network_security_network_card_list',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
]
