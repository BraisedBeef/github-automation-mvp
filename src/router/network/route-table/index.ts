import t from '@/utils/i18n'

// 路由表视图路由
export const viewRouteTableRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/network/route-table/list',
    name: 'network_security_route_table_list',
    component: () => import('@/views/network/route-table/list/index.vue'),
    meta: {
      title: t('netRoutes.routeTable'),
      icon: 'menu-route-table',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
  {
    path: '/network/route-table/detail',
    name: 'network_security_route_table_detail',
    component: () => import('@/views/network/route-table/detail/index.vue'),
    meta: {
      title: t('netRoutes.routeTableDetail'),
      notMenu: true,
      notMenuRedirect: 'network_security_route_table_list',
      permissions: ['vcloudBase:**'],
      product: true,
    },
  },
]
