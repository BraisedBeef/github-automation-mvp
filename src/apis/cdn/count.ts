import { requestCd as request } from '@/request/http/index'
import { requestCd as request_download } from '@/request/http/index'

interface Form {
  area?: number
  domain_ids?: number[]
  type?: number
  order_by?: number
  start_time: number
  end_time: number
}

//用户访问
export const _getStaticUser = (data: Form) => {
  return request({
    url: '/cdn/analysis/access_distribution',
    method: 'post',
    data,
  })
}
export const _getAllUser = (data: Form) => {
  return request({
    url: '/cdn/analysis/ecdn/access_distribution',
    method: 'post',
    data,
  })
}
export const _exportStaticUser = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/access_distribution/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
export const _exportAllUser = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/ecdn/access_distribution/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}

//运营商
export const _getStaticOperator = (data: Form) => {
  return request({
    url: '/cdn/analysis/operator_distribution',
    method: 'post',
    data,
  })
}
export const _getAllOperator = (data: Form) => {
  return request({
    url: '/cdn/analysis/ecdn/opeartor_distribution',
    method: 'post',
    data,
  })
}
export const _exportStaticOperator = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/operator_distribution/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
export const _exportAllOperator = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/ecdn/opeartor_distribution/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}

//流量
export const _getStaticFlow = (data: Form) => {
  return request({
    url: '/cdn/analysis/flux',
    method: 'post',
    data,
  })
}
export const _getAllFlow = (data: Form) => {
  return request({
    url: '/cdn/analysis/ecdn/flux',
    method: 'post',
    data,
  })
}
export const _exportStaticFlow = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/flux/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
export const _exportAllFlow = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/ecdn/flux/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}

//带宽
export const _getStaticBroadband = (data: Form) => {
  return request({
    url: '/cdn/analysis/bindwidth',
    method: 'post',
    data,
  })
}
export const _getAllBroadband = (data: Form) => {
  return request({
    url: '/cdn/analysis/ecdn/bindwidth',
    method: 'post',
    data,
  })
}
export const _exportStaticBroadband = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/bindwidth/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
export const _exportAllBroadband = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/ecdn/bindwidth/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}

//请求数
export const _getStaticRequest = (data: Form) => {
  return request({
    url: '/cdn/analysis/request',
    method: 'post',
    data,
  })
}
export const _getAllRequest = (data: Form) => {
  return request({
    url: '/cdn/analysis/ecdn/request',
    method: 'post',
    data,
  })
}
export const _exportStaticRequest = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/request/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
export const _exportAllRequest = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/ecdn/request/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}

//错误码
export const _getStaticError = (data: Form) => {
  return request({
    url: '/cdn/analysis/http_status',
    method: 'post',
    data,
  })
}
export const _getAllError = (data: Form) => {
  return request({
    url: '/cdn/analysis/ecdn/http_status',
    method: 'post',
    data,
  })
}
export const _exportStaticError = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/http_status/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
export const _exportAllError = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/ecdn/http_status/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}

//热点URL
export const _getStaticHotUrl = (data: Form, params: { page: number; page_size: number }) => {
  return request({
    url: '/cdn/analysis/hot_url',
    method: 'post',
    data,
    params,
  })
}
export const _getAllHotUrl = (data: Form, params: { page: number; page_size: number }) => {
  return request({
    url: '/cdn/analysis/ecdn/hot_url',
    method: 'post',
    data,
    params,
  })
}
export const _exportStaticHotUrl = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/hot_url/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
export const _exportAllHotUrl = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/ecdn/hot_url/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}

//域名排行
export const _getStaticDomain = (data: Form) => {
  return request({
    url: '/cdn/analysis/domain_rank',
    method: 'post',
    data,
  })
}
export const _getAllDomain = (data: Form) => {
  return request({
    url: '/cdn/analysis/ecdn/domain_rank',
    method: 'post',
    data,
  })
}
export const _exportStaticDomain = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/domain_rank/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
export const _exportAllDomain = (data: Form) => {
  return request_download({
    url: '/cdn/analysis/ecdn/domain_rank/data_file',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
