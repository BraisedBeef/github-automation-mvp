export interface GetQueryOrderPageReq {
  beginDate: string // 起始时间 yyyy-MM-dd
  endDate: string // 起始时间
  status: number // 订单状态 1 待支付 2 交易成功 3 已取消 4 已过期
}

export interface GetTransMonthBillOverviewReq {
  transMonth: string // 查询月份
  queryType: number // 查询类型
}
