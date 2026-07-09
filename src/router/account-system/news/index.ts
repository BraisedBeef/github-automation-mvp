import t from '@/utils/i18n'

// 消息订阅视图路由
export const viewNewsRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/account-system/news',
    name: 'news',
    meta: { title: t('accountSystemRoutes.news'), icon: 'menu-news' },
    component: () => import('@/views/account-system/news/index.vue'),
    redirect: '/account-system/news/subscribe',
    children: [
      {
        path: '/account-system/news/subscribe',
        name: 'news_subscribe',
        meta: {
          title: t('accountSystemRoutes.subscribe'),
          permissions: [
            'msgApi:updateBatchProductSubscribe',
            'msgApi:updateProductSubscribe',
            'msgApi:subscribeGetList',
            'msgApi:subscribeUpdateDisturb',
          ],
        },
        component: () => import('@/views/account-system/news/subscribe/entry.vue'),
      },
      {
        path: 'recipient/list',
        name: 'news_recipient_list',
        component: () => import('@/views/account-system/news/recipient/list/entry.vue'),
        meta: {
          title: t('accountSystemRoutes.recipient'),
          permissions: ['userApi:getUserList'],
        },
      },
      {
        path: 'recipient/mana/:uid',
        name: 'news_recipient_mana',
        component: () => import('@/views/account-system/news/recipient/mana/entry.vue'),
        meta: {
          title: t('accountSystemRoutes.recipientMana'),
          notMenu: true,
          permissions: [
            'msgApi:subscribeGetSubscribeList',
            'msgApi:updateUserProductSubscribe',
            'msgApi:subscribeOverview',
          ],
          notMenuRedirect: 'news_recipient_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
          next()
        },
      },
      {
        path: 'tg-bind/success',
        name: 'tg_bind_success', // Tg绑定结果
        component: () => import('@/views/account-system/news/tg-bind/tg-bind-success.vue'),
        meta: {
          notMenu: true,
          permissions: [],
          notMenuRedirect: 'tg_bind_success',
          public: true,
        },
      },
    ],
  },
]
