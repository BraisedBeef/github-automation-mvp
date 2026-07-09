import { requestCvmCs as request } from '@/request/http/index'

import {
  CreateKeyPairReq,
  DeleteKeypairReq,
  BindKeypairReq,
  UnBindKeypairReq,
  ListSShReq,
  UpdateInfoReq,
  GetSSHInfoReq,
  DownloadKeyPairReq,
} from './type'

// 创建导入秘钥
export const _createKeyPair = (data: CreateKeyPairReq) => {
  return request.post('/instance/ssh/createKeyPair', data)
}

// 删除秘钥
export const _deleteKeypair = (data: DeleteKeypairReq) => {
  return request.post('/instance/ssh/deleteKeypair', data)
}

// 绑定秘钥
export const _bindKeypair = (data: BindKeypairReq) => {
  return request.post('/instance/ssh/bindKeypair', data)
}

// 解绑秘钥
export const _unBindKeypair = (data: UnBindKeypairReq) => {
  return request.post('/instance/ssh/unBindKeypair', data)
}

// 分页查询秘钥列表
export const _listSSh = (data: ListSShReq) => {
  return request.post('/instance/ssh/listSSh', data)
}

// 更新SSH秘钥名称与描述信息
export const _updateInfo = (data: UpdateInfoReq) => {
  return request.post('/instance/ssh/updateInfo', data)
}

// 获取SSH秘钥详情
export const _getSSHInfo = (params: GetSSHInfoReq) => {
  return request.get('/instance/ssh/getSSHInfo', params)
}

// 下载秘钥
export const _downloadKeyPair = (params: DownloadKeyPairReq) => {
  return request({
    url: '/instance/ssh/downloadKeyPair',
    responseType: 'blob',
    method: 'get',
    params,
  })
}
