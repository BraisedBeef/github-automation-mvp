import { requestCvmBaseCs as request } from '@/request/http/index'

import {
  GetShareTrafficPackageConfigListType,
  CreateShareTrafficPackageType,
  ShareTrafficPackageListType,
  GetShareTrafficPackageDetailType,
  SetShareTrafficPackageNameType,
  PageEipAllowedShareTrafficPackageType,
  ShareTrafficPackageConfigDetailType,
  ShareTrafficPackageEipListType,
  ShareTrafficPackageRemoveEipType,
} from './type/flow-packet'

// 查询共享流量包配置列表
export const getShareTrafficPackageConfigList = (data: GetShareTrafficPackageConfigListType) => {
  return request({
    url: 'network/shareTrafficPackageConfig/list',
    method: 'post',
    data,
  })
}

// 创建共享流量包
export const createShareTrafficPackage = (data: CreateShareTrafficPackageType) => {
  return request({
    url: 'network/shareTrafficPackage/createShareTrafficPackage',
    method: 'post',
    data,
  })
}

// 查询共享流量包列表
export const shareTrafficPackageList = (data: ShareTrafficPackageListType) => {
  return request({
    url: 'network/shareTrafficPackage/shareTrafficPackageList',
    method: 'post',
    data,
  })
}

// 查询流量包详情
export const getShareTrafficPackageDetail = (data: GetShareTrafficPackageDetailType) => {
  return request({
    url: 'network/shareTrafficPackage/detail',
    method: 'post',
    data,
  })
}

// 设置流量包名称
export const setShareTrafficPackageName = (data: SetShareTrafficPackageNameType) => {
  return request({
    url: 'network/shareTrafficPackage/setName',
    method: 'post',
    data,
  })
}

// 查询允许添加的EIP列表
export const pageEipAllowedShareTrafficPackage = (data: PageEipAllowedShareTrafficPackageType) => {
  return request({
    url: 'network/shareTrafficPackage/pageEipAllowedShareTrafficPackage',
    method: 'post',
    data,
  })
}

// 查询共享流量包配置详情
export const shareTrafficPackageConfigDetail = (data: ShareTrafficPackageConfigDetailType) => {
  return request({
    url: 'network/shareTrafficPackageConfig/configDetail',
    method: 'post',
    data,
  })
}

// 查询流量包中的EIP列表
export const shareTrafficPackageEipList = (data: ShareTrafficPackageEipListType) => {
  return request({
    url: 'network/shareTrafficPackage/packageEipList',
    method: 'post',
    data,
  })
}

// EIP移出流量包
export const shareTrafficPackageRemoveEip = (data: ShareTrafficPackageRemoveEipType) => {
  return request({
    url: 'network/shareTrafficPackage/removeEip',
    method: 'post',
    data,
  })
}

// EIP加入流量包
export const shareTrafficPackageAddEip = (data: ShareTrafficPackageRemoveEipType) => {
  return request({
    url: 'network/shareTrafficPackage/addEip',
    method: 'post',
    data,
  })
}

// 查询配置了共享流量包的地域
export const getShareTrafficPackageRegionList = () => {
  return request({
    url: 'location/getShareTrafficPackageRegionList',
    method: 'get',
  })
}
