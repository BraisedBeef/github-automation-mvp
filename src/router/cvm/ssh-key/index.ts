import t from '@/utils/i18n'

// ssh密钥视图路由
export const viewSSHKeykRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cvm/ssh-key/list',
    name: 'ssh_key',
    component: () => import('@/views/cvm/ssh-key/list/entry.vue'),
    meta: {
      title: t('cvmRoutes.sshkey'),
      icon: 'menu-ssh-key',
      permissions: ['vcloudCvm:**'],
      product: true,
    },
  },
  {
    path: '/cvm/ssh-key/detail/:id',
    name: 'ssh_key_detail',
    component: () => import('@/views/cvm/ssh-key/detail/entry.vue'),
    meta: {
      title: t('cvmRoutes.sshkeyDetail'),
      notMenu: true,
      permissions: ['vcloudCvm:**'],
      notMenuRedirect: 'ssh_key',
      product: true,
    },
  },
]
