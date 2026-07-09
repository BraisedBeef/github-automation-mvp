import { requestCs as request, requestCd } from '@/request/http/index'
import {
  QueryProductOrderReq,
  BalancePayOrderReq,
  CreateSubOrderReq,
  CreateRechargeOrderReq,
  QueryRechargeOrderReq,
  CreateProductOrderReq,
  QueryPreProductOrderReq,
} from './type'

// 查询产品订单详情
export const _queryProductOrder = (data: QueryProductOrderReq) => {
  return request.post('/feeApi/order/product/queryOrder', data)
}

// 余额支付订单
export const _balancePayOrder = (data: BalancePayOrderReq) => {
  return request.post('/feeApi/order/product/balancePayOrder', data)
}

// 创建充值订单
export const _createRechargeOrder = (data: CreateRechargeOrderReq) => {
  return request.post('/feeApi/order/recharge/createOrder', data)
}

// 创建充值子订单
export const _createSubOrder = (data: CreateSubOrderReq) => {
  return request.post('/feeApi/order/recharge/createSubOrder', data)
}

// 查询充值订单
export const _queryRechargeOrder = (data: QueryRechargeOrderReq) => {
  return request.post('/feeApi/order/recharge/queryOrder', data)
}

// 创建产品订单
export const _createProductOrder = (data: CreateProductOrderReq) => {
  return request.post('/feeApi/order/product/createOrder', data)
}

// 创建产品订单
export const _createProductOrder2 = (data: any) => {
  return requestCd.post('/cdn/internal/consume/user/createPreProductOrder', data)
}

// 查询产品预定单
export const _queryPreProductOrder = (params: QueryPreProductOrderReq) => {
  return request.get(`/feeApi/order/product/queryProductOrder/${params.serialNo}`)
}
