import { requestCd as axios } from '@/request/http/index'

/**
 * 资源包列表
 */
export function getResourcePackListApi(params: any) {
  return axios.get('/oss/billing/packages', params)
}

/**
 * 获取可购买的资源包
 */
export function getAvailableResourcePacksApi(params: any) {
  return axios.get('/oss/billing/specs', params)
}

/**
 * 资源包询价
 */
export function resourcePackInquiryApi(data: any) {
  return axios.post('/oss/billing/price', data)
}

/**
 * @name 创建预订单
 * @description 购买资源包创建预订单
 * @param data
 */
export function createResourcePackOrderApi(data: any) {
  return axios.post('/oss/billing/preorder', data)
}
