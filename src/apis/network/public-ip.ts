import { requestCvmBaseCs as request } from '@/request/http/index'
import {
  IpGroupListType,
  CreateEipReq,
  BatchReleaseEipReq,
  BatchUpdateEipReq,
  QueryBindResourceListReq,
  GetDefaultConfigReq,
  GetEipDetailReq,
  AssociateEipReq,
  QueryInsBindEipListReq,
  RenewEipReq,
  QueryEipPriceReq,
  QueryUpdateBandwidthPriceReq,
  QueryRefundEipPricerReq,
  GetEipLineTypeReq,
  UpdateEipNameReq,
  GetEipChargeTypeReq,
  RecycleBinEipPageReq,
  GetEipIdByInstanceIdReq,
} from './type/public-ip'

// 查询IP组列表
export const getIpGroupList = (data: IpGroupListType) => {
  return request({
    url: 'network/eip/getEipPage',
    method: 'post',
    data,
  })
}

// 创建弹性公网IP
export const createEip = (data: CreateEipReq) => {
  return request({
    url: 'network/eip/createEip',
    method: 'post',
    data,
  })
}

// 批量释放公网IP
export const batchReleaseEip = (data: BatchReleaseEipReq) => {
  return request({
    url: 'network/eip/batchReleaseEip',
    method: 'post',
    data,
  })
}

// 调整网络
export const batchUpdateEip = (data: BatchUpdateEipReq) => {
  return request({
    url: 'network/eip/batchUpdateEip',
    method: 'post',
    data,
  })
}

// 查询可绑定的资源列表
export const queryBindResourceList = (data: QueryBindResourceListReq) => {
  return request({
    url: 'network/eip/queryBindResourceList',
    method: 'post',
    data,
  })
}

// 查询eip默认配置
export const getDefaultConfig = (data: GetDefaultConfigReq) => {
  return request({
    url: 'network/eip/getDefaultConfig',
    method: 'post',
    data,
  })
}

// 查询弹性公网IP详情
export const getEipDetail = (data: GetEipDetailReq) => {
  return request({
    url: 'network/eip/getEipDetail',
    method: 'post',
    data,
  })
}

// 绑定实例
export const associateEip = (data: AssociateEipReq) => {
  return request({
    url: 'network/eip/associateEip',
    method: 'post',
    data,
  })
}

// 解绑实例
export const disassociateEip = (data: GetEipDetailReq) => {
  return request({
    url: 'network/eip/disassociateEip',
    method: 'post',
    data,
  })
}

// 查询实例|网卡可绑定的弹性公网IP列表
export const queryInsBindEipList = (data: QueryInsBindEipListReq) => {
  return request({
    url: 'network/eip/queryInsBindEipList',
    method: 'post',
    data,
  })
}

// 续费包月弹性公网IP
export const renewEip = (data: RenewEipReq) => {
  return request({
    url: 'network/eip/renewEip',
    method: 'post',
    data,
  })
}

// 查询公网IP价格
export const queryEipPrice = (data: QueryEipPriceReq) => {
  return request({
    url: 'network/eip/price/queryEipPrice',
    method: 'post',
    data,
  })
}

// 修改带宽询价
export const queryUpdateBandwidthPrice = (data: QueryUpdateBandwidthPriceReq) => {
  return request({
    url: 'network/eip/price/queryUpdateBandwidthPrice',
    method: 'post',
    data,
  })
}

// 查询EIP退款金额
export const queryRefundEipPrice = (data: QueryRefundEipPricerReq) => {
  return request({
    url: '/network/eip/price/queryRefundEipPrice',
    method: 'post',
    data,
  })
}

// 查询地区下支持的EIP线路
export const getEipLineType = (data: GetEipLineTypeReq) => {
  return request({
    url: '/network/eip/getEipLineType',
    method: 'post',
    data,
  })
}

// 批量更新弹性公网IP续费标识(包月IP可用)
export const batchModifyEipRenewFlag = (data: GetEipLineTypeReq) => {
  return request({
    url: '/network/eip/batchModifyEipRenewFlag',
    method: 'post',
    data,
  })
}

// 修改弹性公网ip名称
export const updateEipName = (data: UpdateEipNameReq) => {
  return request({
    url: '/network/eip/updateEipName',
    method: 'post',
    data,
  })
}

// 提交EIP计费模式变更审核申请
export const auditSubmit = (data: { eipId: number }) => {
  return request({
    url: '/network/eip/audit/submit',
    method: 'post',
    data,
  })
}

// 查询地区下支持的EIP计费模式
export const getEipChargeType = (data: GetEipChargeTypeReq) => {
  return request({
    url: '/network/eip/getEipChargeType',
    method: 'post',
    data,
  })
}

// 回收站EIP列表
export const recycleBinEipPage = (data: RecycleBinEipPageReq) => {
  return request({
    url: '/network/eip/recycleBin/recycleBinEipPage',
    method: 'post',
    data,
  })
}

// 实例回收站查询 待回收状态隐式绑定的EIP
export const getEipIdByInstanceId = (data: GetEipIdByInstanceIdReq) => {
  return request({
    url: '/network/eip/recycleBin/getEipIdByInstanceId',
    method: 'post',
    data,
  })
}
