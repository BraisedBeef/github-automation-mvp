import { Pagination } from '@/apis/account-system/access/strategy/type'

export interface IncomeRecordListReq extends Pagination {
  transType?: number // 交易类型 1 充值 2 扣费 3 垫付 4 垫付回款 5 充账
  beginDate: string // 开始时间 yyyy-MM-dd
  endDate: string // 结束时间 yyyy-MM-dd
  showZero?: number // 是否显示0元费用 1 显示 2 隐藏
}

export interface IncomeRecordExportReq extends Pagination {
  transType?: number //交易类型 1 充值 2 扣费 3 垫付 4 垫付回款 5 充账
  beginDate: string //开始时间 yyyy-MM-dd
  endDate: string //结束时间 yyyy-MM-dd
  showZero?: number //是否显示0元费用1 显示 2 隐藏
}
