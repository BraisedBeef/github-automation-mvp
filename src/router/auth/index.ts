// auth路由
export const authRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/auth-layout',
    name: 'AuthLayout',
    component: () => import('@/layout/auth-layout.vue'),
    redirect: '/login',
    children: [
      {
        path: '/login',
        name: 'Login', //登录
        component: () => import('@/views/auth/login/index.vue'),
        meta: {
          public: true,
        },
      },
      {
        path: '/register',
        name: 'Register', //注册
        component: () => import('@/views/auth/register/index.vue'),
        meta: {
          public: true,
        },
      },
      {
        path: '/register-success',
        name: 'RegisterSuccess', //注册成功
        component: () => import('@/views/auth/register-success/index.vue'),
        meta: {
          public: true,
        },
      },
      {
        path: '/forget-pwd',
        name: 'ForgetPwd', // 忘记密码
        component: () => import('@/views/auth/forget-pwd/index.vue'),
        meta: {
          public: true,
        },
      },
      {
        path: '/reset-pwd',
        name: 'ResetPwd', // 设置新密码
        component: () => import('@/views/auth/reset-pwd/index.vue'),
        meta: {
          public: true,
        },
      },
      {
        path: '/reset-success',
        name: 'ResetSuccess', // 设置新密码成功
        component: () => import('@/views/auth/reset-success/index.vue'),
        meta: {
          public: true,
        },
      },
      {
        path: '/login-protect',
        name: 'LoginProtect', // 登录保护
        component: () => import('@/views/auth/login-protect/index.vue'),
        meta: {
          public: true,
        },
      },
      {
        path: '/google-register',
        name: 'RegisterGoogle', // 谷歌注册
        component: () => import('@/views/auth/google-register/index.vue'),
        meta: {
          public: true,
        },
      },
    ],
  },
]
