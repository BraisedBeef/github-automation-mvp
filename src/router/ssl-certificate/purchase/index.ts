import t from '@/utils/i18n'

export const purchaseRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/ssl/purchase',
    name: 'ssl_certificate_purchase',
    component: () => import('@/views/ssl-certificate/purchase/index.vue'),
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      title: t('ssl-certificate.router.669988-0'),
      icon: 'menu-certificate-purchase-ssl',
      permissions: ['sslcert:**'],
      product: true,
    },
  },
]
