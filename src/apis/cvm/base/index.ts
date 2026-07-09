import { requestCvmBaseCs as request } from '@/request/http/index'

import { ListByRegionIdReq, GetQuickCreateDefaultZoneReq, CreateVpcReq, SendSSEReq } from './type'

// 获取大区列表及其地
export const _getListWithRegion = () => {
  return request.get('/location/getListWithRegion')
}

// 获取大区列表及其地区 （白名单版本）
export const _getListWithRegionByWhitelist = () => {
  return request.get('/location/getListWithRegionByWhitelist')
}

// 根据地区id获取可用区列表
export const _listByRegionId = (params: ListByRegionIdReq) => {
  return request.get(`/zone/listByRegionId/${params.regionId}`)
}

// 查询所有可用区
export const _getAllZoneList = () => {
  return request.get('/zone/getAllZoneList')
}

// 查询快速创建默认可用区
export const _getQuickCreateDefaultZone = (params: GetQuickCreateDefaultZoneReq) => {
  return request.get(`/zone/getQuickCreateDefaultZone/${params.regionId}`)
}

// 创建默认VPC
export const _createVpc = (data: CreateVpcReq) => {
  return request.post('/network/vpc/createVpc', data)
}

// 通知SSE
export const _sendSSE = (data: SendSSEReq) => {
  return request.post('/sse/taskState/send', data)
}

// 关闭SSE
export const _closeSSE = () => {
  return request.get('/sse/close')
}
