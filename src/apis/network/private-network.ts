import { requestCvmBaseCs as request } from '@/request/http/index'
import {
  QueryVpcPageType,
  QueryVpcDetailType,
  UpdateVpcNameType,
  VerifyDefaultVpcType,
  DirectCreateVpcType,
  DirectDeleteVpcType,
} from './type/private-network'

// 查询VPC列表
export const getQueryVpcPage = (data: QueryVpcPageType) => {
  return request({
    url: 'network/vpc/queryVpcPage',
    method: 'post',
    data,
  })
}

// 查询VPC详情
export const getQueryVpcDetail = (data: QueryVpcDetailType) => {
  return request({
    url: 'network/vpc/queryVpcDetail',
    method: 'post',
    data,
  })
}

// 更新VPC名称
export const getUpdateVpcName = (data: UpdateVpcNameType) => {
  return request({
    url: 'network/vpc/updateVpcName',
    method: 'post',
    data,
  })
}

// 验证指定地区下默认VPC是否已创建
export const verifyDefaultVpc = (data: VerifyDefaultVpcType) => {
  return request({
    url: 'network/vpc/verifyDefaultVpc',
    method: 'post',
    data,
  })
}

// TCE创建VPC
export const directCreateVpc = (data: DirectCreateVpcType) => {
  return request({
    url: 'network/vpc/directCreateVpc',
    method: 'post',
    data,
  })
}

// TCE删除VPC
export const directDeleteVpc = (data: DirectDeleteVpcType) => {
  return request({
    url: 'network/vpc/directDeleteVpc',
    method: 'post',
    data,
  })
}
