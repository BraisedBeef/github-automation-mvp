import { requestCvmBaseCs as request } from '@/request/http/index'
import { requestCvmBaseCs as request_download } from '@/request/http/index'
import {
  ListSecurityGroupType,
  CloneSecurityGroupType,
  DelSecurityGroupType,
  ListSecurityGroupRuleType,
  GetCreateSecurityGroutType,
  AddSecurityGroupRuleType,
  DeleteSecurityGroupRuleType,
  EditSecurityGroupRuleType,
  SecurityGroupInstancesListReq,
  SecurityGroupBindInstanceReq,
  SecurityGroupUnbindInstanceReq,
  EditSecurityGroupRulePriorityReq,
  SecurityGroupByInstanceListReq,
} from './type/security-group'

// 获取安全组列表
export const getListSecurityGroup = (data: ListSecurityGroupType) => {
  return request({
    url: 'securityGroup/listSecurityGroup',
    method: 'post',
    data,
  })
}
// 克隆安全组
export const getCloneSecurityGroup = (data: CloneSecurityGroupType) => {
  return request({
    url: 'securityGroup/cloneSecurityGroup',
    method: 'post',
    data,
  })
}
// 删除安全组
export const getDelSecurityGroup = (data: DelSecurityGroupType) => {
  return request({
    url: 'securityGroup/delSecurityGroup',
    method: 'post',
    data,
  })
}
// 获取模板列表
export const getTemplateList = () => {
  return request({
    url: 'securityGroup/template/getTemplateList',
    method: 'post',
    data: {},
  })
}

// 创建安全组
export const getCreateSecurityGrout = (data: GetCreateSecurityGroutType) => {
  return request({
    url: 'securityGroup/create',
    method: 'post',
    data,
  })
}
// 查询安全组规则列表
export const getListSecurityGroupRule = (data: ListSecurityGroupRuleType) => {
  return request({
    url: 'securityGroupRule/listSecurityGroupRule',
    method: 'post',
    data,
  })
}

// 导出安全组规则模板
export const getExportTemplate = () => {
  return request_download({
    url: 'securityGroupRule/exportTemplate',
    method: 'get',
    responseType: 'blob',
  })
}

// 安全组列表导出
export const downloadSecurityGroup = (data: ListSecurityGroupType) => {
  return request_download({
    url: '/securityGroup/download',
    method: 'post',
    data,
    responseType: 'blob',
  })
}

// 添加安全组规则
export const addSecurityGroupRule = (data: AddSecurityGroupRuleType) => {
  return request({
    url: 'securityGroupRule/addSecurityGroupRule',
    method: 'post',
    data,
  })
}

// 删除安全组规则
export const deleteSecurityGroupRule = (data: DeleteSecurityGroupRuleType) => {
  return request({
    url: 'securityGroupRule/deleteSecurityGroupRule',
    method: 'post',
    data,
  })
}

// 更新安全组规则
export const editSecurityGroupRule = (data: EditSecurityGroupRuleType) => {
  return request({
    url: 'securityGroupRule/editSecurityGroupRule',
    method: 'post',
    data,
  })
}

// 获取默认模板
export const getDefaultTemplate = () => {
  return request({
    url: 'securityGroup/template/getDefaultTemplate',
    method: 'post',
    data: {},
  })
}

// 安全组关联实例列表
export const getSecurityGroupInstancesList = (data: SecurityGroupInstancesListReq) => {
  return request({
    url: 'securityGroup/listSecurityGroupInstances',
    method: 'post',
    data,
  })
}

// 安全组批量绑定实例
export const securityGroupBindInstance = (data: SecurityGroupBindInstanceReq) => {
  return request({
    url: 'securityGroup/securityGroupBindInstance',
    method: 'post',
    data,
  })
}

// 安全组批量解绑实例
export const securityGroupUnbindInstance = (data: SecurityGroupUnbindInstanceReq) => {
  return request({
    url: 'securityGroup/securityGroupUnbindInstance',
    method: 'post',
    data,
  })
}

// 修改规则优先级
export const editSecurityGroupRulePriority = (data: EditSecurityGroupRulePriorityReq) => {
  return request({
    url: 'securityGroupRule/editSecurityGroupRulePriority',
    method: 'post',
    data,
  })
}

// 实例关联安全组列表
export const securityGroupByInstanceList = (data: SecurityGroupByInstanceListReq) => {
  return request({
    url: 'securityGroup/securityGroupByInstanceList',
    method: 'post',
    data,
  })
}
