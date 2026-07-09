import { viewPaymentRoutes } from './payment'
import { viewOrderRoutes } from './order'
import { viewExpenseBillRoutes } from './expense-bill'
// import { viewVoucherRoutes } from './voucher'
import { viewExportRoutes } from './export'
import { viewIncomeExpenditureRoutes } from './income-expenditure'
import { viewRenewRoutes } from './renew'
import { viewAccountRoutes as viewCostCenterAccountRoutes } from './account'
import { viewCapitalRoutes } from './capital'

export const costRoutes = [
  ...viewCostCenterAccountRoutes, // 账户信息
  ...viewOrderRoutes, // 订单管理
  ...viewRenewRoutes, // 续费管理
  ...viewIncomeExpenditureRoutes, // 收支明细
  ...viewExpenseBillRoutes, // 费用账单
  ...viewCapitalRoutes, // 资金管理
  ...viewPaymentRoutes, // 支付系统
  ...viewExportRoutes, // 导出记录

  // ...viewVoucherRoutes,
]
