import { request } from '../index'
import type { CreateOrderReq, CreateOrderResp, FactoryListResp, FactoryConfigReq, FactoryConfigResp } from './type'

/**
 * 获取工厂列表
 * GET /sp/list
 * 接口ID：253408144
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408144
 */
export const _getFactoryList = () => {
  return request<FactoryListResp>({
    url: '/sp/list',
    method: 'get',
  })
}

/**
 * 获取厂商对应的证书配置
 * GET /sp/get/cert/config
 * 接口ID：253408143
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408143
 */
export const _getCertConfig = (params: FactoryConfigReq) => {
  return request<FactoryConfigResp>({
    url: '/sp/get/cert/config',
    method: 'get',
    params,
  })
}

/**
 * 提交订单
 * POST /order/create/order
 * 接口ID：253408142
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408142
 */
export const _createOrder = (data: CreateOrderReq) => {
  return request<CreateOrderResp>({
    url: '/order/create/order',
    method: 'post',
    data,
  })
}
