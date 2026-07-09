import t from '@/utils/i18n'

export const hostingRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/ssl/hosting',
    name: 'ssl_certificate_hosting',
    component: () => import('@/views/ssl-certificate/hosting/entry.vue'),
    meta: {
      title: t('ssl-certificate.router.065749-0'),
      icon: 'menu-certificate-hosting-ssl',
      permissions: ['sslcert:**'],
      product: true,
    },
  },
  {
    path: '/ssl/hosting/add',
    name: 'ssl_certificate_hosting_add',
    component: () => import('@/views/ssl-certificate/hosting/add-entry.vue'),
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_hosting',
      // title: '证书托管',
      backHeader: {
        path: '/ssl/hosting',
        title: t('ssl-certificate.router.065749-1'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
  },
]
