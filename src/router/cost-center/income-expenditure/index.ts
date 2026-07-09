import t from '@/utils/i18n'

// 收支明细视图路由
export const viewIncomeExpenditureRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cost-center/income-expenditure/list',
    name: 'income_expenditure',
    meta: {
      title: t('costCenterRoutes.incomeExpenditure'),
      icon: 'menu-income-expenditure',
      permissions: ['feeApi:queryIncomeRecordList'],
    },
    component: () => import('@/views/cost-center/income-expenditure/list/entry.vue'),
  },
  {
    path: '/cost-center/income-expenditure/detail/:incomeType/:id',
    name: 'income_expenditure_detail',
    component: () => import('@/views/cost-center/income-expenditure/detail/index.vue'),
    meta: {
      title: t('costCenterRoutes.incomeExpenditureDetail'),
      notMenu: true,
      permissions: ['feeApi:queryIncomeRecordDetailList'],
      notMenuRedirect: 'income_expenditure',
    },
    beforeEnter: (to, from, next) => {
      to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
      next()
    },
  },
]
