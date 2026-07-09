import t from '@/utils/i18n'

// 安全组视图路由
export const viewSecurityGroupRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/network/security-group/list',
    name: 'network_security_security_group_list',
    component: () => import('@/views/network/security-group/list/index.vue'),
    meta: {
      title: t('netRoutes.securityGroup'),
      icon: 'menu-security-group',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
  {
    path: '/network/security-group/detail',
    name: 'network_security_security_group_detail',
    component: () => import('@/views/network/security-group/detail/index.vue'),
    meta: {
      title: t('netRoutes.securityGroupDetail'),
      notMenu: true,
      notMenuRedirect: 'network_security_security_group_list',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
]
