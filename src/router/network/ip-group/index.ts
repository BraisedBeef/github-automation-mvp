import t from '@/utils/i18n'
// ip组视图路由
export const viewIpGroupRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/network/ip-group/list',
    name: 'network_security_ip-group_list',
    component: () => import('@/views/network/ip-group/list/index.vue'),
    meta: {
      title: t('netRoutes.ipGroup'),
      icon: 'menu-ip-group',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
  {
    path: '/network/ip-group/detail',
    name: 'network_security_ip_group_detail',
    component: () => import('@/views/network/ip-group/detail/index.vue'),
    meta: {
      title: t('netRoutes.ipGroupDetail'),
      notMenu: true,
      notMenuRedirect: 'network_security_ip-group_list',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
]
