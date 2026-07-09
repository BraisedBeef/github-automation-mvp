import t from '@/utils/i18n'

// 安全设置视图路由
export const viewSecuritySettingRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/account-system/setup',
    name: 'account_system_security_setting',
    meta: { title: t('accountSystemRoutes.securitySet'), icon: 'menu-safe-set' },
    component: () => import('@/views/account-system/security-setting/entry.vue'),
  },
  {
    path: 'logout',
    name: 'account_system_security_setting_logout',
    component: () => import('@/views/account-system/security-setting/logout.vue'),
    meta: { title: t('accountSystemRoutes.logout'), notMenu: true, notMenuRedirect: 'account_system_security_setting' },
  },
]
