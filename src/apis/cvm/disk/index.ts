import { requestCvmCs as request } from '@/request/http/index'

import {
  ComputeDiskPriceReq,
  CreateDiskReq,
  AttachDiskReq,
  DetachDiskReq,
  ModifyRenewFlagReq,
  AssignToProjectReq,
  ResizeDiskReq,
  RenewDiskReq,
  TerminateDisksReq,
  ListDiskReq,
  GetDetailReq,
  ListDiskPriceReq,
  UpdateDiskReq,
  OperateLogListReq,
  DiskConvertOnDemandToSubscriptionReq,
} from './type'

// 计算磁盘价格
export const _computeDiskPrice = (data: ComputeDiskPriceReq) => {
  return request.post('/serverDiskApi/computeDiskPrice', data)
}

// 创建磁盘
export const _createDisk = (data: CreateDiskReq) => {
  return request.post('/serverDiskApi/createDisk', data)
}

// 挂载硬盘
export const _attachDisk = (data: AttachDiskReq) => {
  return request.post('/serverDiskApi/attachDisk', data)
}

// 卸载硬盘
export const _detachDisk = (data: DetachDiskReq) => {
  return request.post('/serverDiskApi/detachDisk', data)
}

// 修改云硬盘续费标识
export const _modifyRenewFlag = (data: ModifyRenewFlagReq) => {
  return request.post('/serverDiskApi/modifyRenewFlag', data)
}

// 分配至项目
export const _assignToProject = (data: AssignToProjectReq) => {
  return request.post('/serverDiskApi/assignToProject', data)
}

// 扩容硬盘
export const _resizeDisk = (data: ResizeDiskReq) => {
  return request.post('/serverDiskApi/resizeDisk', data)
}

// 续费硬盘
export const _renewDisk = (data: RenewDiskReq) => {
  return request.post('/serverDiskApi/renewDisk', data)
}

// 销毁退还硬盘
export const _terminateDisks = (data: TerminateDisksReq) => {
  return request.post('/serverDiskApi/terminateDisks', data)
}

// 硬盘列表
export const _listDisk = (data: ListDiskReq) => {
  return request.post('/serverDiskApi/listDisk', data)
}

// 硬盘详情
export const _getDetail = (data: GetDetailReq) => {
  return request.get(`/serverDiskApi/getDetail/${data.id}`)
}

// 硬盘类型列表
export const _listDiskPrice = (data: ListDiskPriceReq) => {
  return request.post(`/serverDiskApi/listDiskPrice`, data)
}

// 硬盘修改
export const _updateDisk = (data: UpdateDiskReq) => {
  return request.post(`/serverDiskApi/updateDisk`, data)
}

// 操作日志列表
export const _operateLogList = (data: OperateLogListReq) => {
  return request.post(`/operateLog/list`, data)
}

// 云硬盘回收站列表
export const _getAdminDiskRecyclePage = (data: ListDiskReq) => {
  return request.post(`/ServerDiskRecycle/getAdminDiskRecyclePage`, data)
}

// 释放云硬盘
export const _releaseCBS = (data: GetDetailReq) => {
  return request.get(`/ServerDiskRecycle/releaseCBS/${data.id}`)
}

// 恢复回收站硬盘
export const _recoveryCBS = (data: GetDetailReq) => {
  return request.get(`/ServerDiskRecycle/recoveryCBS/${data.id}`)
}

// 硬盘按需转包年包月
export const _diskConvertOnDemandToSubscription = (data: DiskConvertOnDemandToSubscriptionReq) => {
  return request.post(`/serverDiskApi/diskConvertOnDemandToSubscription`, data)
}
