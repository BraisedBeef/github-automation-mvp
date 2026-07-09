import t from '@/utils/i18n'

// 访问管理视图路由
export const viewAccessRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/account-system/access',
    name: 'access',
    meta: { title: t('accountSystemRoutes.access'), icon: 'menu-access' },
    component: () => import('@/views/account-system/access/index.vue'),
    redirect: '/account-system/access/overview',
    children: [
      {
        path: '/account-system/access/overview',
        name: 'access_overview',
        component: () => import('@/views/account-system/access/overview/entry.vue'),
        meta: { title: t('accountSystemRoutes.overview') },
      },
      {
        path: '/account-system/access/user/list',
        name: 'access_user_list',
        component: () => import('@/views/account-system/access/user/list/entry.vue'),
        meta: {
          title: t('accountSystemRoutes.userList'),
          permissions: ['userApi:getUserList'],
        },
      },
      {
        path: 'strategy/list',
        name: 'access_strategy_list',
        component: () => import('@/views/account-system/access/strategy/list/entry.vue'),
        meta: {
          title: t('accountSystemRoutes.strategy'),
          permissions: ['strategyApi:getStrategyList'],
        },
      },
      {
        path: 'strategy/detail/:id',
        name: 'access_strategy_detail',
        component: () => import('@/views/account-system/access/strategy/detail/entry.vue'),
        meta: {
          title: t('accountSystemRoutes.strategyDetail'),
          notMenu: true,
          permissions: ['strategyApi:getDetail', 'strategyApi:getStrategySummary'],
          notMenuRedirect: 'access_strategy_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = {
            title: t(to.query.title as string),
            path: to.query.path,
          }
          next()
        },
      },
      {
        path: 'role/list',
        name: 'access_role_list',
        component: () => import('@/views/account-system/access/role/list/entry.vue'),
        meta: {
          title: t('accountSystemRoutes.role'),
          permissions: ['roleApi:getRoleList'],
          permissionPageTitleKey: 'prem.pageRoleListDesc',
        },
      },
      {
        path: 'role/create',
        name: 'access_role_create',
        component: () => import('@/views/account-system/access/role/create/entry.vue'),
        meta: {
          title: t('accountSystemRoutes.createRole'),
          notMenu: true,
          permissions: ['roleApi:insertRole', 'strategyApi:getStrategyList'],
          notMenuRedirect: 'access_role_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
          next()
        },
      },
      {
        path: 'role/detail/:id',
        name: 'access_role_detail',
        component: () => import('@/views/account-system/access/role/detail/entry.vue'),
        meta: {
          title: t('accountSystemRoutes.roleDetail'),
          notMenu: true,
          permissions: ['roleApi:getRoleInfo', '/roleApi/roleStrategyList', 'roleApi:roleStrategyDelete'],
          notMenuRedirect: 'access_role_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
          next()
        },
      },
      {
        path: 'user/create',
        name: 'access_user_create',
        component: () => import('@/views/account-system/access/user/create/entry.vue'),
        meta: {
          title: t('accountSystemRoutes.createUser'),
          notMenu: true,
          permissions: ['userApi:insertVcUser', 'roleApi:UserRoleList'],
          notMenuRedirect: 'access_user_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
          next()
        },
      },
      // 主账户类型
      {
        path: 'user/detail/main/:id/',
        name: 'access_user_detail_main',
        component: () => import('@/views/account-system/access/user/detail/main-detail.vue'),
        meta: {
          title: t('accountSystemRoutes.userDetail'),
          notMenu: true,
          permissions: ['userApi:getUserInfo', 'userApi:updateVcUser', 'msgApi:updateUserSubscribe'],
          notMenuRedirect: 'access_user_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
          next()
        },
      },
      // 子用户类型-可访问资源并接收消息
      {
        path: 'user/detail/sub-all/:id/',
        name: 'access_user_detail_sub_all',
        component: () => import('@/views/account-system/access/user/detail/sub-all-entry.vue'),
        meta: {
          title: t('accountSystemRoutes.userDetail'),
          notMenu: true,
          permissions: [
            'userApi:getUserInfo',
            'userApi:updateVcUser',
            'userAp:updateEmail',
            'smsApi:verifySms',
            'msgApi:updateUserSubscribe',
            'userApi:setStatus',
            'userApi:updateSecuritySetting',
            'userApi:generateSecretKey',
            'userApi:generateSecretKey',
            'userApi:setSecretKeyStatus',
            'roleApi:UserRoleList',
            'userApi:authUserRole',
            'roleApi:UserRoleDelete',
            'userApi:selectSensitiveList',
            'userApi:updateVcUser',
            'userApi:updateSecuritySetting',
            'userApi:selectUserStrategyList',
          ],
          notMenuRedirect: 'access_user_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
          next()
        },
      },
      // 子用户类型-仅用于接收消息
      {
        path: 'user/detail/sub-news/:id/',
        name: 'access_user_detail_sub_news',
        component: () => import('@/views/account-system/access/user/detail/sub-news-detail.vue'),
        meta: {
          title: t('accountSystemRoutes.userDetail'),
          notMenu: true,
          permissions: [
            'userApi:getUserInfo',
            'userApi:updateVcUser',
            'userAp:updateEmail',
            'smsApi:verifySms',
            'msgApi:updateUserSubscribe',
            'userApi:setStatus',
          ],
          notMenuRedirect: 'access_user_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
          next()
        },
      },
    ],
  },
]
