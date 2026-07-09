import t from '@/utils/i18n'

// 资金管理视图路由
export const viewCapitalRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cost-center/capital',
    name: 'capital',
    meta: { title: t('costCenterRoutes.capital'), icon: 'menu-capital' },
    component: () => import('@/views/cost-center/capital/index.vue'),
    redirect: '/cost-center/capital/payment',
    children: [
      {
        path: '/cost-center/capital/payment',
        name: 'capital_payment',
        meta: {
          title: t('costCenterRoutes.payment'),
          permissions: [
            'userApi:getCreditcardList',
            'userApi:addCreditcard',
            'userApi:removeCreditcard',
            'userApi:setDefaultCreditcard',
          ],
        },
        component: () => import('@/views/cost-center/capital/payment/entry.vue'),
      },
    ],
  },
]
