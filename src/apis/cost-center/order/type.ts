import { Pagination } from '@/apis/account-system/access/strategy/type'

export interface QueryOrderPageReq extends Pagination {
  beginDate: string //起始时间 yyyy-MM-dd
  endDate: string // 起始时间 yyyy-MM-dd
  productId?: number // 产品ID可选 398759540226658308 CDN
  subProductId?: number //子产品ID
  tradeNo?: string //订单号
  type?: number // 订单类型  1 新购 2 升配 3 降配 4 续费
  createTimeSortType?: string //创建时间排序方式  ASC 升序 DESC 降序
  status?: number //订单状态  1 待支付 2 交易成功 3 已取消 4 已过期
}

export interface CancelOrderReq {
  tradeNo?: string //订单号
}

export interface ExportOrderReq {
  beginDate: string //起始时间 yyyy-MM-dd
  endDate: string //起始时间 yyyy-MM-dd
  productId: number // 产品ID  398759540226658308 CDN
  subProductId?: number // 子产品ID
  tradeNo?: string //订单号
  type?: number //订单类型  1 新购 2 升配 3 降配 4 续费
  createTimeSortType?: string //创建时间排序方式  ASC 升序 DESC 降序
  status?: number //订单状态  1 待支付 2 交易成功 3 已取消 4 已过期
}
