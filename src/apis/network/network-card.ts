import { requestCvmBaseCs as request } from '@/request/http/index'
import {
  EniPageReq,
  EniDetailReq,
  CreateEniReq,
  DeleteEniReq,
  EniPrivateIpListReq,
  EniUpdateSgReq,
  UpdateEniReq,
  AddIpReq,
  DelIpReq,
  UpdateIpReq,
  EniBindVmReq,
  InsBindEniListReq,
} from './type/network-card'

// 查询网卡列表
export const getEniPage = (data: EniPageReq) => {
  return request({
    url: 'network/eni/getEniPage',
    method: 'post',
    data,
  })
}

// 查询网卡详情
export const getEniDetail = (data: EniDetailReq) => {
  return request({
    url: 'network/eni/getEniDetail',
    method: 'post',
    data,
  })
}

// 创建弹性网卡
export const createEni = (data: CreateEniReq) => {
  return request({
    url: 'network/eni/createEni',
    method: 'post',
    data,
  })
}

// 创建弹性网卡并挂载到实例
export const createEniBindIns = (data: CreateEniReq) => {
  return request({
    url: 'network/eni/createEniBindIns',
    method: 'post',
    data,
  })
}

// 删除弹性网卡
export const deleteEni = (data: DeleteEniReq) => {
  return request({
    url: 'network/eni/deleteEni',
    method: 'post',
    data,
  })
}

// 查询网卡内网IP列表
export const getEniPrivateIpList = (data: EniPrivateIpListReq) => {
  return request({
    url: 'network/eni/getEniPrivateIpList',
    method: 'post',
    data,
  })
}

// 查询网卡关联安全组
export const getEniRefSg = (data: EniDetailReq) => {
  return request({
    url: 'network/eni/getEniRefSg',
    method: 'post',
    data,
  })
}

// 更新网卡绑定安全组
export const eniUpdateSg = (data: EniUpdateSgReq) => {
  return request({
    url: 'network/eni/eniUpdateSg',
    method: 'post',
    data,
  })
}

// 修改网卡名称
export const updateEni = (data: UpdateEniReq) => {
  return request({
    url: 'network/eni/updateEni',
    method: 'post',
    data,
  })
}

// 分配IP
export const addIp = (data: AddIpReq) => {
  return request({
    url: 'network/eni/addIp',
    method: 'post',
    data,
  })
}

// 释放IP
export const delIp = (data: DelIpReq) => {
  return request({
    url: 'network/eni/delIp',
    method: 'post',
    data,
  })
}

// 更新IP
export const updateIp = (data: UpdateIpReq) => {
  return request({
    url: 'network/eni/updateIp',
    method: 'post',
    data,
  })
}

// 查询网卡允许绑定的实例列表
export const getEniBindInsList = (data: EniDetailReq) => {
  return request({
    url: 'network/eni/getEniBindInsList',
    method: 'post',
    data,
  })
}

// 网卡绑定实例
export const eniBindVm = (data: EniBindVmReq) => {
  return request({
    url: 'network/eni/eniBindVm',
    method: 'post',
    data,
  })
}

// 网卡解绑实例
export const eniUnbindVm = (data: EniBindVmReq) => {
  return request({
    url: 'network/eni/eniUnbindVm',
    method: 'post',
    data,
  })
}

// 查询实例允许绑定的网卡列表
export const getInsBindEniList = (data: InsBindEniListReq) => {
  return request({
    url: 'network/eni/getInsBindEniList',
    method: 'post',
    data,
  })
}
