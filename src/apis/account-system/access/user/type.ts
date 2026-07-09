import { Pagination } from '../strategy/type'

export interface GetSensitiveListReq extends Pagination {}

export interface GetUserListReq extends Pagination {
  condition: string //查询条件
  queryProductId?: string
}

export interface InsertVcUserReq {
  parentId: number //主账号id
  password?: string //密码
  userType: number //账户类型 1:可访问资源并接收消息2:仅用于接收消息
  userName: string //用户名
  areaCode?: string //手机区号
  mobile?: string //手机
  email?: string //邮箱
  contactEmail?: string //联系邮箱
  accessMethod?: number //猫云控制台访问 1:开启0:关闭
  loginProtect?: number // 登录保护1:开启0:关闭
  operateProtect?: number // 操作保护1:开启0:关闭
  roleIds?: number[] //角色id列表
  isSecret?: boolean // 是否生成API密钥
  messageTypes?: string[] //消息类型
}

export interface GetUserRoleListReq extends Pagination {
  id: number | string
  condition?: string //查询条件
}

export interface AuthUserRoleReq {
  id: number | string
  roleIds: number[]
}

export interface SetStatusReq {
  state: number // 用户状态( 1正常 2删除 3禁用)
  ids: number[]
}

export interface GetAccessUserInfoReq {
  id: number | string
}

export interface UpdateEmailReq {
  uid: number | string //用户id
  email: string //邮箱
  code: string //验证码
}

export interface UpdateSecuritySettingReq {
  uid: number | string //用户id
  loginProtect?: number //登录保护1:开启0:关闭
  operateProtect?: number //操作保护1:开启0:关闭
  resetPassword?: number //下次登录重置密码
  accessMethod?: number //控制台访问
  remoteProtect?: number //异地登录保护
  receiveMessage?: number //接收消息
}

export interface GetSelectUserStrategyListReq extends Pagination {
  id: number | string
  condition?: string //查询条件
}

export interface GetSelectUserRoleListReq extends Pagination {
  id: number | string
  condition?: string //查询条件
}

export interface GenerateSecretKeyReq {
  id: number | string
}

export interface SetSecretKeyStatusReq {
  id: number | string
  state: number //用户状态( 1正常 2删除 3禁用)
}

export interface UserRoleDeleteReq {
  id: number | string
  roleIds: number[]
}

export interface UpdateTokenExpireTimeReq {
  keepTime?: number // 无操作登录保持时间
  maxKeepTime?: number // 最大登录保持时间
}

export interface SendUpdatePhoneSmsReq {
  phone: string // 原手机号
  uid: number //用户id
}

export interface VerifySmsReq {
  uid: number //用户id
  phone: string // 新手机号
  code: string // 短信验证码
}

export interface GetUserSubscribeListReq {
  targetUserId: number //目标用户id
}

export interface UpdateUserSubscribeReq {
  subscribes: string[]
  targetUserId: string //更新的目标用户id
}
