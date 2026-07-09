import { requestCs as request } from '@/request/http/index'
import { QueryOrderPageReq, CancelOrderReq, ExportOrderReq } from './type'

// 查询产品订单列表
export const _queryOrderPage = (data: QueryOrderPageReq) => {
  return request.post('/feeApi/order/product/queryOrderPage', data)
}

// 取消订单
export const _cancelOrder = (data: CancelOrderReq) => {
  return request.post('/feeApi/order/product/cancelOrder', data)
}

// 提交下载产品订单列表任务
export const _exportOrder = (data: ExportOrderReq) => {
  return request.post('/feeApi/order/product/exportOrder', data)
}
