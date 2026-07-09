import t from '@/utils/i18n'

// 费用账单视图路由
export const viewExpenseBillRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/cost-center/expense-bill',
    name: 'expense_bill',
    meta: { title: t('costCenterRoutes.expenseBill'), icon: 'menu-expense-bill' },
    component: () => import('@/views/cost-center/expense-bill/index.vue'),
    redirect: '/cost-center/expense-bill/bill/list',
    children: [
      {
        path: '/cost-center/expense-bill/bill/list',
        name: 'expense_bill_bill_list',
        component: () => import('@/views/cost-center/expense-bill/bill/list/entry.vue'),
        meta: {
          title: t('costCenterRoutes.bill'),
          permissions: [
            'feeApi:getTransBillOverview',
            'feeApi:getTransMonthBillOverview',
            'feeApi:detailsBill',
            'feeApi:getBillTotalMoney',
            'feeApi:getTransMonthBillOverview',
            'feeApi:getDimensionOverview',
            'feeApi:resourceBill',
            'feeApi:getBillTotalMoney',
          ],
        },
      },
      {
        path: 'bill/natural-resources/detail/:billId',
        name: 'expense_bill_bill_natural_resources_detail',
        component: () => import('@/views/cost-center/expense-bill/bill/detail/entry.vue'),
        meta: { title: t('costCenterRoutes.billDetail'), notMenu: true, notMenuRedirect: 'expense_bill_bill_list' },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = {
            title: t(to.query.title as string),
            path: `${to.query.path}?active=${to.query.active}`,
          }
          next()
        },
      },
      {
        path: 'download',
        name: 'expense_bill_download',
        component: () => import('@/views/cost-center/expense-bill/download/entry.vue'),
        meta: { title: t('costCenterRoutes.download') },
      },
      {
        path: '/cost-center/expense-bill/invoice/list',
        name: 'expense_bill_invoice_list',
        component: () => import('@/views/cost-center/expense-bill/invoice/list/entry.vue'),
        meta: {
          title: t('costCenterRoutes.invoice'),
          permissions: [
            'feeApi:preInvoice',
            'feeApi:getInvoicableSummary',
            'feeApi:getInvoicableResourceBill',
            'feeApi:getInvoicableMonthBill',
          ],
        },
      },
      {
        path: 'invoice/record',
        name: 'expense_bill_invoice_record',
        component: () => import('@/views/cost-center/expense-bill/invoice/record/entry.vue'),
        meta: {
          title: t('costCenterRoutes.invoiceRecord'),
          notMenu: true,
          permissions: ['feeApi:getInvoiceRecord', 'feeApi:getInvoiceSummary'],
          notMenuRedirect: 'expense_bill_invoice_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
          next()
        },
      },
      {
        path: 'invoice/manage',
        name: 'expense_bill_invoice_manage',
        component: () => import('@/views/cost-center/expense-bill/invoice/manage/entry.vue'),
        meta: {
          title: t('costCenterRoutes.invoiceMana'),
          notMenu: true,
          permissions: [
            'feeApi:getInvoice',
            'feeApi:addVcInvoice',
            'feeApi:updateVcInvoice',
            'feeApi:addVcInvoice',
            'feeApi:updateVcInvoice',
          ],
          notMenuRedirect: 'expense_bill_invoice_list',
        },
        beforeEnter: (to, from, next) => {
          to.meta.backHeader = { title: t(to.query.title as string), path: to.query.path }
          next()
        },
      },
      {
        path: 'invoice/info/:price',
        name: 'expense_bill_invoice_info',
        component: () => import('@/views/cost-center/expense-bill/invoice/info/entry.vue'),
        meta: {
          title: t('costCenterRoutes.invoiceInfo'),
          notMenu: true,
          permissions: ['feeApi:getInvoice'],
          notMenuRedirect: 'expense_bill_invoice_list',
        },
      },
      {
        path: 'invoice/preview/:price',
        name: 'expense_bill_invoice_preview',
        component: () => import('@/views/cost-center/expense-bill/invoice/preview/entry.vue'),
        meta: {
          title: t('costCenterRoutes.invoicePreview'),
          notMenu: true,
          permissions: ['feeApi:invoicing'],
          notMenuRedirect: 'expense_bill_invoice_list',
        },
      },
    ],
  },
]
