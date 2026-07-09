import { requestCs as request } from '@/request/http/index'
import {
  GetRoleListReq,
  InsertRoleReq,
  GetRoleInfoReq,
  GetRoleStrategyListReq,
  RoleStrategyDeleteReq,
  DeleteRoleReq,
  UpdateRoleReq,
} from './type'

// 获取角色列表
export const _getRoleList = (data: GetRoleListReq) => {
  return request.post('/roleApi/getRoleList', data)
}

// 新增角色
export const _insertRole = (data: InsertRoleReq) => {
  return request.post('/roleApi/insertRole', data)
}

// 获取角色详情
export const _getRoleInfo = (data: GetRoleInfoReq) => {
  return request.get(`/roleApi/getRoleInfo/${data.id}`)
}

// 角色详情-策略列表
export const _getRoleStrategyList = (data: GetRoleStrategyListReq) => {
  return request.post('/roleApi/roleStrategyList', data)
}

// 角色详情-策略解除
export const _roleStrategyDelete = (data: RoleStrategyDeleteReq) => {
  return request.post('/roleApi/roleStrategyDelete', data)
}

// 删除角色
export const _deleteRole = (data: DeleteRoleReq) => {
  return request.get(`/roleApi/deleteRole/${data.id}`)
}

// 修改角色
export const _updateRole = (data: UpdateRoleReq) => {
  return request.post(`/roleApi/updateRole`, data)
}
