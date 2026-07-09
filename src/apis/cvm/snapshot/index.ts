import { requestCvmCs as request } from '@/request/http/index'

import {
  CreateSnapshotReq,
  RollbackSnapshotReq,
  DeleteSnapshotReq,
  GetSnapshotListReq,
  GetDetailReq,
  ListSnapshotPolicyReq,
  SaveSnapshotPolicyReq,
  BindSnapshotPolicyReq,
  DeleteSnapshotPolicyReq,
} from './type'

// 创建快照
export const _createSnapshot = (data: CreateSnapshotReq) => {
  return request.post('/snapshotApi/createSnapshot', data)
}

// 回滚快照
export const _rollbackSnapshot = (data: RollbackSnapshotReq) => {
  return request.post('/snapshotApi/rollbackSnapshot', data)
}

// 删除快照
export const _deleteSnapshot = (data: DeleteSnapshotReq) => {
  return request.post('/snapshotApi/deleteSnapshot', data)
}

// 获取快照列表
export const _getSnapshotList = (data: GetSnapshotListReq) => {
  return request.post('/snapshotApi/getSnapshotList', data)
}

// 快照详情
export const _getDetail = (data: GetDetailReq) => {
  return request.get(`/snapshotApi/getDetail/${data.id}`)
}

// 定期快照策略列表
export const _listSnapshotPolicy = (data: ListSnapshotPolicyReq) => {
  return request.post('/snapshotPolicyApi/listSnapshotPolicy', data)
}

// 保存定期快照策略
export const _saveSnapshotPolicy = (data: SaveSnapshotPolicyReq) => {
  return request.post('/snapshotPolicyApi/saveSnapshotPolicy', data)
}

// 绑定定期快照策略
export const _bindSnapshotPolicy = (data: BindSnapshotPolicyReq) => {
  return request.post('/snapshotPolicyApi/bindSnapshotPolicy', data)
}

// 删除定期策略
export const _deleteSnapshotPolicy = (data: DeleteSnapshotPolicyReq) => {
  return request.post(`/snapshotPolicyApi/deleteSnapshotPolicy`, data)
}
