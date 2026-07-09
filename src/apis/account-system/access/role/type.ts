import { Pagination } from '../strategy/type'

export interface GetRoleListReq extends Pagination {
  condition: string //查询条件
}

export interface InsertRoleReq {
  roleName: string //角色名称
  roleSource: number //权限来源1:后台管理 2: 系统分配 3 用户自建strategyIds: string[] //角色策略id
  description: string //描述
  strategyIds?: any
}

export interface GetRoleInfoReq {
  id: string
}

export interface GetRoleStrategyListReq extends Pagination {
  id: string //角色id
}

export interface RoleStrategyDeleteReq {
  id: string //角色id
  strategyIds: string[] //策略ids
}

export interface DeleteRoleReq {
  id: string
}

export interface UpdateRoleReq {
  strategyIds: string[] //角色策略id
  id: string
}
