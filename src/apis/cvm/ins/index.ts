import { requestCvmCs as request } from '@/request/http/index'

import {
  CreateInstanceReq,
  BatchRebootServersReq,
  BatchStopServersReq,
  BatchStartServersReq,
  BatchSetPwdReq,
  UpdateInstanceNameReq,
  ResetInstanceImageReq,
  ChangeServerOsReq,
  ChangeServerTypeReq,
  ListInstanceReq,
  GetInstanceCountReq,
  DiskListInstanceReq,
  ListInstanceDetailReq,
  ListRecommendSpecificationsReq,
  GetInstanceFamilyReq,
  GetSpecificationsListReq,
  RefundInstanceReq,
  SetInstanceAutoRenewReq,
  InstanceRenewInquiryReq,
  InstanceRenewReq,
  VerifyChangeServerTypeReq,
  CreateInstanceVerifyReq,
  GetChangeTypeSupportSpecificationsReq,
  CreateInstanceInquiryReq,
  ChangeServerTypeInquiryReq,
  RefundInstanceInquiryReq,
  ExportInstanceReq,
  CreateInstanceDryRunReq,
  GetCacheParamReq,
  ReleaseInstanceReq,
  ModifyInstancesChargeTypeReq,
  ModifyInstancesChargeTypeInquiryReq,
} from './type'

// 创建服务器
export const _createInstance = (data: CreateInstanceReq) => {
  return request.post('/instance/createInstance', data)
}

// 创建服务器-库存验证
export const _createInstanceVerify = (data: CreateInstanceVerifyReq) => {
  return request.post('/instance/createInstanceVerify', data)
}

// 批量重启云服务器
export const _batchRebootServers = (data: BatchRebootServersReq) => {
  return request.post('/instance/batchRebootServers', data)
}

// 批量关闭云服务器
export const _batchStopServers = (data: BatchStopServersReq) => {
  return request.post('/instance/batchStopServers', data)
}

// 批量开启云服务器
export const _batchStartServers = (data: BatchStartServersReq) => {
  return request.post('/instance/batchStartServers', data)
}

// 批量设置云服务器密码
export const _batchSetPwd = (data: BatchSetPwdReq) => {
  return request.post('/instance/batchSetPwd', data)
}

// 修改服务器信息
export const _updateInstanceName = (data: UpdateInstanceNameReq) => {
  return request.post('/instance/updateInstanceName', data)
}

// 重装服务器镜像
export const _resetInstanceImage = (data: ResetInstanceImageReq) => {
  return request.post('/instance/resetInstanceImage', data)
}

// 切换服务器镜像
export const _changeServerOs = (data: ChangeServerOsReq) => {
  return request.post('/instance/changeServerOs', data)
}

// 切换服务器规格
export const _changeServerType = (data: ChangeServerTypeReq) => {
  return request.post('/instance/changeServerType', data)
}

// 切换服务器规格-获取可切换规格配置
export const _getChangeTypeSupportSpecifications = (data: GetChangeTypeSupportSpecificationsReq) => {
  return request.post('/instance/getChangeTypeSupportSpecifications', data)
}

// 切换服务器规格-前置效验
export const _verifyChangeServerType = (data: VerifyChangeServerTypeReq) => {
  return request.post('/instance/verifyChangeServerType', data)
}

// 分页查询服务器列表
export const _listInstance = (data: ListInstanceReq) => {
  return request.post('/instance/listInstance', data)
}

// 查询可用区下面 服务器数量
export const _getInstanceCount = (data: GetInstanceCountReq) => {
  return request.post('/instance/getInstanceCount', data)
}

// 购买实例-自定义配置-获取机型族
export const _getInstanceFamily = (params: GetInstanceFamilyReq) => {
  return request.get('/instance/getInstanceFamily', params)
}

// 购买实例-自定义配置-查询创建服务器规格列表
export const _getSpecificationsList = (data: GetSpecificationsListReq) => {
  return request.post('/instance/getSpecificationsList', data)
}

// 云硬盘-挂载-获取可挂载服务器列表
export const _diskListInstance = (data: DiskListInstanceReq) => {
  return request.post('/instance/disk/listInstance', data)
}

// 购买实例-快速配置-推荐机型
export const _listRecommendSpecifications = (params: ListRecommendSpecificationsReq) => {
  return request.get('/instance/listRecommendSpecifications', params)
}

// 获取服务器列表（详细信息）
export const _listInstanceDetail = (data: ListInstanceDetailReq) => {
  return request.post('/instance/listInstanceDetail', data)
}

// 退还/销毁服务器
export const _refundInstance = (data: RefundInstanceReq) => {
  return request.post('/instance/refundInstance', data)
}

// 设置云服务器自动续费状态
export const _setInstanceAutoRenew = (data: SetInstanceAutoRenewReq) => {
  return request.post('/instance/setInstanceAutoRenew', data)
}

// 服务器续费-询价
export const _instanceRenewInquiry = (data: InstanceRenewInquiryReq) => {
  return request.post('/instance/instanceRenewInquiry', data)
}

// 服务器续费
export const _instanceRenew = (data: InstanceRenewReq) => {
  return request.post('/instance/instanceRenew', data)
}

// 创建服务器-询价
export const _createInstanceInquiry = (data: CreateInstanceInquiryReq) => {
  return request.post('/instance/createInstanceInquiry', data)
}

// 切换服务器规格-询价
export const _changeServerTypeInquiry = (data: ChangeServerTypeInquiryReq) => {
  return request.post('/instance/changeServerTypeInquiry', data)
}

// 退还/销毁服务器-询价
export const _refundInstanceInquiry = (data: RefundInstanceInquiryReq) => {
  return request.post('/instance/refundInstanceInquiry', data)
}

// 云服务器导出
export const _exportInstance = (data: ExportInstanceReq) => {
  return request({
    url: '/instance/exportInstance',
    responseType: 'blob',
    method: 'post',
    data,
  })
}

// 创建服务器-预检
export const _createInstanceDryRun = (data: CreateInstanceDryRunReq) => {
  return request.post('/instance/createInstanceDryRun', data)
}

// 获取参数缓存
export const _getCacheParam = (params: GetCacheParamReq) => {
  return request.get(`/officialWebsite/getCacheParam/${params.id}`)
}

// 回收站释放云服务器
export const _releaseInstance = (data: ReleaseInstanceReq) => {
  return request.post(`/instance/releaseInstance`, data)
}

// 按量计费转包年包月-创建预订单
export const _modifyInstancesChargeType = (data: ModifyInstancesChargeTypeReq) => {
  return request.post(`/instance/modifyInstancesChargeType`, data)
}

// 按量计费转包年包月-询价
export const _modifyInstancesChargeTypeInquiry = (data: ModifyInstancesChargeTypeInquiryReq) => {
  return request.post(`/instance/modifyInstancesChargeTypeInquiry`, data)
}
