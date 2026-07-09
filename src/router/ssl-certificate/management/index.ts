import t from '@/utils/i18n'

// 证书管理路由
export const managementRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/ssl/management',
    name: 'ssl_certificate_management',
    component: () => import('@/views/ssl-certificate/management/entry.vue'),
    meta: {
      title: t('ssl-certificate.router.931344-0'),
      icon: 'productions-ssl',
      permissions: ['sslcert:**'],
      product: true,
    },
  },
  {
    path: '/ssl/management/details/:id',
    name: 'ssl_certificate_details',
    component: () => import('@/views/ssl-certificate/management/details/entry.vue'),
    props: true,
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      backHeader: {
        path: '/ssl/management',
        title: t('ssl-certificate.router.931344-1'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
    beforeEnter: (to, from, next) => {
      // @ts-ignore
      to.meta.backHeader.detail = to.query.cert_id
      next()
    },
  },
  {
    path: '/ssl/management/verifyInfo/:id',
    name: 'ssl_certificate_verify_info',
    component: () => import('@/views/ssl-certificate/management/details/verify-info.vue'),
    props: true,
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      backHeader: {
        path: '/ssl/management',
        title: t('ssl-certificate.router.931344-2'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
    beforeEnter: (to, from, next) => {
      // @ts-ignore
      to.meta.backHeader.detail = to.query.cert_id
      next()
    },
  },
  {
    path: '/ssl/management/update/:id',
    name: 'ssl_certificate_update',
    component: () => import('@/views/ssl-certificate/management/update/entry.vue'),
    props: true,
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      backHeader: {
        path: '/ssl/management',
        title: t('ssl-certificate.router.931344-3'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
    beforeEnter: (to, from, next) => {
      // @ts-ignore
      to.meta.backHeader.detail = to.query.cert_id
      next()
    },
  },
  {
    path: '/ssl/management/apply',
    name: 'ssl_certificate_apply',
    component: () => import('@/views/ssl-certificate/management/apply/index.vue'),
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      backHeader: {
        path: '/ssl/management',
        title: t('ssl-certificate.router.931344-4'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
  },
  {
    path: '/ssl/management/upload',
    name: 'ssl_certificate_upload',
    component: () => import('@/views/ssl-certificate/management/upload/entry.vue'),
    props: true,
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      backHeader: {
        path: '/ssl/management',
        title: t('ssl-certificate.router.931344-5'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
  },
  {
    path: '/ssl/management/deploy/:id',
    name: 'ssl_certificate_deploy',
    props: true,
    component: () => import('@/views/ssl-certificate/management/deploy/entry.vue'),
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      backHeader: {
        path: '/ssl/management',
        title: t('ssl-certificate.router.931344-6'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
    beforeEnter: (to, from, next) => {
      // @ts-ignore
      to.meta.backHeader.detail = to.query.cert_id
      next()
    },
  },
  {
    path: '/ssl/management/deploy-status/:id',
    name: 'ssl_certificate_deploy_status',
    props: true,
    component: () => import('@/views/ssl-certificate/management/details/status-entry.vue'),
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      backHeader: {
        path: '/ssl/management',
        title: t('ssl-certificate.router.931344-1'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
  },
  {
    path: '/ssl/management/revoke/:id',
    name: 'ssl_certificate_revoke',
    component: () => import('@/views/ssl-certificate/management/revoke/index.vue'),
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      backHeader: {
        path: '/ssl/management',
        title: t('ssl-certificate.router.931344-7'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
  },
  {
    path: '/ssl/management/create-csr',
    name: 'ssl_certificate_create_csr',
    component: () => import('@/views/ssl-certificate/management/create-crs/entry.vue'),
    meta: {
      notMenu: true,
      notMenuRedirect: 'ssl_certificate_management',
      backHeader: {
        path: '/ssl/management',
        title: t('ssl-certificate.router.931344-8'),
      },
      permissions: ['sslcert:**'],
      product: true,
    },
  },
]
