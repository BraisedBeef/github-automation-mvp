import t from '@/utils/i18n'

// 共享流量包视图路由
export const viewFlowPacketRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/network/flow-packet/list',
    name: 'network_security_flow-packet_list',
    component: () => import('@/views/network/flow-packet/list/index.vue'),
    meta: {
      title: t('netRoutes.flowPacket'),
      icon: 'menu-flow-packet',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
  {
    path: '/network/flow-packet/detail',
    name: 'network_security_flow-packet_detail',
    component: () => import('@/views/network/flow-packet/detail/index.vue'),
    meta: {
      title: t('netRoutes.flowPacketDetail'),
      notMenu: true,
      notMenuRedirect: 'network_security_flow-packet_list',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
]
