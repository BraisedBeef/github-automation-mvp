import t from '@/utils/i18n'

// 弹性公网IP视图路由
export const viewPublicIpRoutes = [
  {
    path: '/network/public-ip/list',
    name: 'network_security_public_ip_list',
    component: () => import('@/views/network/public-ip/list/index.vue'),
    meta: {
      title: t('netRoutes.publicIp'),
      icon: 'menu-public-ip',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
]
