import { requestCd, requestCs } from '@/request/http/index'
import { GetMetricValueReq } from './type'

// 获取用户域名数量
export const _getDomainCount = () => {
  return requestCd.get('/cdn/overview/get_domain_count')
}

// 获取用户域名数量
export const _getMetricValue = (data: GetMetricValueReq) => {
  return requestCd.post('/cdn/overview/get_metric_value', data)
}

// 统计-DNS概览数据
export const _getDnsDomain = () => {
  return requestCd.get('/dns/domain/statistics/overview')
}

// 统计-域名注册
export const _domainRegisterCnt = () => {
  return requestCd.get('/cloudDomain/console/domainRegisterCnt')
}

// 获取JSON数据
export const _getJsonValue = (data: { id: number }) => {
  return requestCd.post('/api/vcloudActivity/order/getJsonValue', data)
}

// 创建CDN产品订单
export const _createCDNProductOrder = (data: { id: number; activityPlanId: number; num: number }) => {
  return requestCd.post('/api/vcloudActivity/order/createCdnOrder', data)
}

// 获取产品列表（用于产品文档列表的显示）
export const _productApilist = () => {
  return requestCs.get('/outside/productApi/list')
}
