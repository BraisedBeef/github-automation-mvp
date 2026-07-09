import { requestCvmBaseCs as request } from '@/request/http/index'
import { requestCvmBaseCs as request_download } from '@/request/http/index'
import {
  IpGroupListType,
  AddIpGroupType,
  DeleteIpGroupType,
  UpdateIpGroupType,
  IpListSecurityGroupType,
} from './type/ip-group'

// 查询IP组列表
export const getIpGroupList = (data: IpGroupListType) => {
  return request({
    url: 'IpGroup/list',
    method: 'post',
    data,
  })
}

// 查询IP组详情
export const getIpGroupDetail = (data: { groupId: string | number }) => {
  return request({
    url: 'IpGroup/getIpGroupDetail',
    method: 'post',
    data,
  })
}

// 新增IP组
export const addIpGroup = (data: AddIpGroupType) => {
  return request({
    url: 'IpGroup/addIpGroup',
    method: 'post',
    data,
  })
}

// 删除IP组
export const deleteIpGroup = (data: DeleteIpGroupType) => {
  return request({
    url: 'IpGroup/delete',
    method: 'post',
    data,
  })
}

// 修改IP组信息
export const updateIpGroup = (data: UpdateIpGroupType) => {
  return request({
    url: 'IpGroup/update',
    method: 'post',
    data,
  })
}

// 查询ip组绑定的安全组列表
export const ipListSecurityGroup = (data: IpListSecurityGroupType) => {
  return request({
    url: 'IpGroup/listSecurityGroup',
    method: 'post',
    data,
  })
}

// ip地址组模板导出
export const exportIpGroupTemplate = () => {
  return request_download({
    url: 'IpGroup/exportTemplate',
    method: 'get',
    responseType: 'blob',
  })
}

// ip地址组列表导出
export const downloadIpGroup = (data: IpGroupListType) => {
  return request_download({
    url: '/IpGroup/download',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
