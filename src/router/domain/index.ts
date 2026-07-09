import t from '@/utils/i18n'

export const domainRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/domain/overview',
    name: 'domain_overview',
    component: () => import('@/views/domain/overview/index.vue'),
    meta: {
      title: t('domain.menu.203053-0'),
      icon: 'menu-overview-domain',
      permissions: ['domain:**'],
      product: true,
    },
  },
  {
    path: '/domain/list',
    name: 'domain_list',
    component: () => import('@/views/domain/list/index.vue'),
    meta: {
      title: t('domain.menu.203053-1'),
      icon: 'menu-list-domain',
      permissions: ['domain:**'],
      product: true,
    },
    redirect: '/domain/list/table',
    children: [
      {
        path: '/domain/list/table',
        name: 'domain_list_table',
        component: () => import('@/views/domain/list/table/index.vue'),
        meta: {
          title: t('domain.menu.203053-1'),
          notMenu: true,
          notMenuRedirect: 'domain_list',
          permissions: ['domain:**'],
          product: true,
        },
      },
      {
        path: '/domain/list/detail',
        name: 'domain_list_detail',
        component: () => import('@/views/domain/list/detail/index.vue'),
        meta: {
          title: '',
          notMenu: true,
          notMenuRedirect: 'domain_list',
          backHeader: {
            path: '/domain/list/table',
            title: t('backDomain'),
          },
          permissions: ['domain:**'],
          product: true,
        },
        beforeEnter: (to, from, next) => {
          // @ts-ignore
          to.meta.backHeader.detail = to.query.domain
          next()
        },
      },
    ],
  },
  {
    path: '/domain/template',
    name: 'domain_template',
    component: () => import('@/views/domain/template/index.vue'),
    meta: {
      title: t('domain.menu.203053-2'),
      icon: 'menu-template-domain',
      permissions: ['domain:**'],
      product: true,
    },
    redirect: '/domain/template/table',
    children: [
      {
        path: '/domain/template/table',
        name: 'domain_template_table',
        component: () => import('@/views/domain/template/table/index.vue'),
        meta: {
          title: t('domain.menu.203053-2'),
          notMenu: true,
          notMenuRedirect: 'domain_template',
          permissions: ['domain:**'],
          product: true,
        },
      },
      {
        path: '/domain/template/detail',
        name: 'domain_template_detail',
        component: () => import('@/views/domain/template/detail/index.vue'),
        meta: {
          title: '',
          notMenu: true,
          notMenuRedirect: 'domain_template',
          backHeader: {
            path: '/domain/template/table',
            title: t('domain.menu.203053-3'),
          },
          permissions: ['domain:**'],
          product: true,
        },
      },
    ],
  },
  {
    path: '/domain/batch-opertate',
    name: 'domain_batch-opertate',
    component: () => import('@/views/domain/batch-operate/index.vue'),
    meta: {
      title: t('domain.menu.203053-4'),
      icon: 'menu-operate-domain',
      permissions: ['domain:**'],
      product: true,
    },
  },
  {
    path: '/domain/operate-log',
    name: 'domain_operate-log',
    component: () => import('@/views/domain/operate-log/index.vue'),
    meta: {
      title: t('domain.menu.203053-5'),
      icon: 'menu-log-domain',
      permissions: ['domain:**'],
      product: true,
    },
  },
  {
    path: '/domain/pay',
    name: 'domain_pay',
    component: () => import('@/views/domain/pay/index.vue'),
    meta: {
      title: '',
      icon: 'menu-service-domain',
      notMenu: true,
      notMenuRedirect: 'domain_overview',
      permissions: ['domain:**'],
      product: true,
    },
  },
]
