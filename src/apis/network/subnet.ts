import { requestCvmBaseCs as request } from '@/request/http/index'
import {
  QuerySubnetPageQuery,
  QuerySubnetDetailQuery,
  UpdateSubnetNameType,
  CreateSubnetType,
  SubnetIpConfigType,
} from './type/subnet'

// 查询子网列表
export const getQuerySubnetPage = (data: QuerySubnetPageQuery) => {
  return request({
    url: 'network/subnet/querySubnetPage',
    method: 'post',
    data,
  })
}

// 查询子网详情
export const getQuerySubnetDetail = (data: QuerySubnetDetailQuery) => {
  return request({
    url: 'network/subnet/querySubnetDetail',
    method: 'post',
    data,
  })
}

// 删除子网
export const getDelSubnet = (data: QuerySubnetDetailQuery) => {
  return request({
    url: 'network/subnet/delSubnet',
    method: 'post',
    data,
  })
}

// 更新子网名称
export const getUpdateSubnetName = (data: UpdateSubnetNameType) => {
  return request({
    url: 'network/subnet/updateSubnetName',
    method: 'post',
    data,
  })
}

// 创建子网
export const getCreateSubnet = (data: CreateSubnetType) => {
  return request({
    url: 'network/subnet/createSubnet',
    method: 'post',
    data,
  })
}

// 获取子网默认配置
export const getSubnetIpConfig = (data: SubnetIpConfigType) => {
  return request({
    url: 'network/subnet/getSubnetIpConfig',
    method: 'post',
    data,
  })
}
