import t from '@/utils/i18n'

// 弹性公网IP视图路由（快捷）
export const dnsQuickRoutes = [
  {
    path: '/dns/my-domains',
    name: 'MyDomains',
    meta: {
      title: t('model.dns'),
      icon: 'menu-domain-dns',
      rightIcon: 'storage-link',
      permissions: ['dns:**'],
      product: true,
    },
    component: () => import('@/views/dns/domains/my-domains/entry.vue'),
  },
]
