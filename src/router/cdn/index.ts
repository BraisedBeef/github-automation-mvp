import t from '@/utils/i18n'

export const cdnRoutes: PlusRouteRecordRaw[] = [
  /**
   * 同时设置 meta.notNav = false && meta.notMenu = true 仅显示在导航栏，但不会显示在菜单栏
   * // TIPS 注意：与 单独设置notMenu 不兼容，待优化
   */
  {
    path: '/cdn/domain/list?tab_Type=0,1,2',
    name: 'cdn_domain_list',
    component: () => import('@/views/cdn/analysis/monitor/index.vue'),
    meta: {
      title: t('staticAcceleration'),
      permissions: ['cdn:**'],
      notNav: false,
      notMenu: true,
      notMenuRedirect: 'cdn_domain_list',
      product: true,
    },
  },
  {
    path: '/cdn/domain/list?tab_Type=3',
    name: 'cdn_domain_list',
    component: () => import('@/views/cdn/analysis/monitor/index.vue'),
    meta: {
      title: t('wholeAcceleration'),
      permissions: ['cdn:**'],
      notNav: false,
      notMenu: true,
      notMenuRedirect: 'cdn_domain_list',
      product: true,
    },
  },
  // menu
  {
    path: '/cdn/service',
    name: 'cdn_service',
    component: () => import('@/views/cdn/service/entry.vue'),
    meta: {
      title: t('serviceOverview'),
      icon: 'menu-service-cdn',
      notNav: true,
      permissions: ['cdn:**'],
      product: true,
    },
  },
  {
    path: '/cdn/domain',
    name: 'cdn_domain',
    component: () => import('@/views/cdn/domain/index.vue'),
    meta: {
      title: t('domainManage'),
      icon: 'menu-domain-cdn',
      permissions: ['cdn:**'],
      notNav: true,
      product: true,
    },
    redirect: '/cdn/domain/list',
    children: [
      {
        path: '/cdn/domain/list',
        name: 'cdn_domain_list',
        component: () => import('@/views/cdn/domain/list/entry.vue'),
        meta: {
          title: t('domainManage'),
          notMenu: true,
          notMenuRedirect: 'cdn_domain',
          permissions: ['cdn:**'],
          product: true,
        },
      },
      {
        path: '/cdn/domain/add',
        name: 'cdn_domain_add',
        component: () => import('@/views/cdn/domain/add/entry.vue'),
        meta: {
          title: t('createAccele'),
          notMenu: true,
          notMenuRedirect: 'cdn_domain',
          backHeader: {
            path: '/cdn/domain',
            title: t('backDomain'),
          },
          permissions: ['cdn:**'],
          product: true,
        },
      },
      {
        path: '/cdn/domain/detail',
        name: 'cdn_domain_detail',
        component: () => import('@/views/cdn/domain/detail/entry.vue'),
        meta: {
          title: t('domainSet'),
          notMenu: true,
          notMenuRedirect: 'cdn_domain',
          backHeader: {
            path: '/cdn/domain',
            title: t('backDomain'),
          },
          permissions: ['cdn:**'],
          product: true,
        },
        beforeEnter: (to, from, next) => {
          // @ts-ignore
          to.meta.backHeader.detail = to.query.domain
          next()
        },
      },
      {
        path: '/cdn/domain/copy',
        name: 'cdn_domain_copy',
        component: () => import('@/views/cdn/domain/copy/index.vue'),
        meta: {
          title: t('copyConfig'),
          notMenu: true,
          notMenuRedirect: 'cdn_domain',
          backHeader: {
            path: '/cdn/domain',
            title: t('backDomain'),
          },
          permissions: ['cdn:**'],
          product: true,
        },
      },
    ],
  },
  {
    path: '/cdn/analysis',
    name: 'cdn_analysis',
    component: () => import('@/views/cdn/analysis/index.vue'),
    redirect: '/cdn/analysis/monitor',
    meta: {
      title: t('analysis'),
      icon: 'menu-chart-cdn',
      permissions: ['cdn:**'],
      notNav: true,
      product: true,
    },
    children: [
      {
        path: '/cdn/analysis/monitor',
        name: 'cdn_analysis_monitor',
        component: () => import('@/views/cdn/analysis/monitor/entry.vue'),
        meta: {
          title: t('monitor'),
          permissions: ['cdn:**'],
          product: true,
        },
      },
      {
        path: '/cdn/analysis/count',
        name: 'cdn_analysis_count',
        component: () => import('@/views/cdn/analysis/count/entry.vue'),
        meta: {
          title: t('analysis'),
          permissions: ['cdn:**'],
          product: true,
        },
      },
    ],
  },
  {
    path: '/cdn/content',
    name: 'cdn_content',
    component: () => import('@/views/cdn/content/entry.vue'),
    meta: { title: t('content'), icon: 'menu-content-cdn', permissions: ['cdn:**'], notNav: true, product: true },
  },
  {
    path: '/cdn/certificate',
    name: 'cdn_certificate',
    component: () => import('@/views/cdn/certificate/entry.vue'),
    meta: {
      title: t('certificate'),
      icon: 'menu-certificate-cdn',
      permissions: ['cdn:**'],
      notNav: true,
      product: true,
    },
  },
  // {
  //   path: '/cdn/monitor/openService',
  //   name: 'cdn_monitor_openService',
  //   component: () => import('@/views/cdn/monitor/open-service/index.vue'),
  //   meta: { title: t('cdnOpen'), notMenu: true, icon: 'menu-open-cdn', permissions: ['cdn:**'] },
  // },
  {
    path: '/cdn/buyFlow',
    name: 'cdn_buyFlow',
    component: () => import('@/views/cdn/buy-flow/entry.vue'),
    meta: {
      title: t('purchaseTraffic'),
      notMenu: true,
      notMenuRedirect: 'cdn_buyFlow',
      permissions: ['cdn:**'],
      notNav: true,
      product: true,
    },
  },
  {
    path: '/cdn/order',
    name: 'cdn_order',
    component: () => import('@/views/cdn/flow-order/entry.vue'),
    meta: {
      title: t('confirmOrder'),
      notMenu: true,
      notMenuRedirect: 'cdn_order',
      permissions: ['cdn:**'],
      notNav: true,
      product: true,
    },
  },
  {
    path: '/cdn/fluxPkg',
    name: 'cdn_fluxPkg',
    component: () => import('@/views/cdn/flux-pkg/entry.vue'),
    meta: {
      title: t('resourcePkgManage'),
      icon: 'menu-open-cdn',
      permissions: ['cdn:**'],
      notNav: true,
      product: true,
    },
  },
  {
    path: '/cdn/log',
    name: 'cdn_offline_log',
    component: () => import('@/views/cdn/log/entry.vue'),
    meta: { title: t('offlineLog'), icon: 'menu-cdn-log', permissions: ['cdn:**'], notNav: true, product: true },
  },
]
