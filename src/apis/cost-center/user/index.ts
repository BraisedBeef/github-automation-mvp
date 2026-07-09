import { requestCs as request } from '@/request/http/index'
import { GetQueryOrderPageReq, GetTransMonthBillOverviewReq } from './type'

// 查询登录用户账户
export const _getAccountInfo = () => {
  return request.get('/userApi/getAccountInfo')
}

// 待支付订单
export const _queryOrderPage = (data: GetQueryOrderPageReq) => {
  return request.post('/feeApi/order/product/queryOrderPage', data)
}

// 月度资源账单
export const _getTransMonthBillOverview = (data: GetTransMonthBillOverviewReq) => {
  return request.post('/feeApi/bill/getTransMonthBillOverview', data)
}
