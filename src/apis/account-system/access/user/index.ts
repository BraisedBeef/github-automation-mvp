import { requestCs as request } from '@/request/http/index'
import {
  GetSensitiveListReq,
  GetUserListReq,
  InsertVcUserReq,
  GetUserRoleListReq,
  AuthUserRoleReq,
  SetStatusReq,
  GetAccessUserInfoReq,
  UpdateEmailReq,
  UpdateSecuritySettingReq,
  GetSelectUserStrategyListReq,
  GetSelectUserRoleListReq,
  GenerateSecretKeyReq,
  SetSecretKeyStatusReq,
  UserRoleDeleteReq,
  UpdateTokenExpireTimeReq,
  SendUpdatePhoneSmsReq,
  VerifySmsReq,
  GetUserSubscribeListReq,
  UpdateUserSubscribeReq,
} from './type'

// 获取敏感操作列表
export const _getSensitiveList = (data: GetSensitiveListReq) => {
  return request.post('/userApi/selectSensitiveList', data)
}

// 获取用户列表
export const _getUserList = (data: GetUserListReq) => {
  return request.post('/userApi/getUserList', data)
}

// 新增用户
export const _insertVcUser = (data: InsertVcUserReq) => {
  return request.post('/userApi/insertVcUser', data)
}

// 获取角色列表
export const _getUserRoleList = (data: GetUserRoleListReq) => {
  return request.post('/roleApi/UserRoleList', data)
}

// 用户授权角色
export const _authUserRole = (data: AuthUserRoleReq) => {
  return request.post('/userApi/authUserRole', data)
}

// 设置用户状态
export const _setStatus = (data: SetStatusReq) => {
  return request.post('/userApi/setStatus', data)
}

// 获取用户详情
export const _getAccessUserInfo = (data: GetAccessUserInfoReq) => {
  return request.get(`/userApi/getUserInfo/${data.id}`)
}

// 修改安全邮箱
export const _updateEmail = (data: UpdateEmailReq) => {
  return request.post(`/userApi/updateEmail`, data)
}

// 安全设置
export const _updateSecuritySetting = (data: UpdateSecuritySettingReq) => {
  return request.post(`/userApi/updateSecuritySetting`, data)
}

// 用户详情-服务列表
export const _getSelectUserStrategyList = (data: GetSelectUserStrategyListReq) => {
  return request.post(`/userApi/selectUserStrategyList`, data)
}

// 用户详情-角色策略
export const _getSelectUserRoleList = (data: GetSelectUserRoleListReq) => {
  return request.post(`/userApi/selectUserRoleList`, data)
}

// 用户详情-角色解除
export const _userRoleDelete = (data: UserRoleDeleteReq) => {
  return request.post(`/roleApi/UserRoleDelete`, data)
}

// 生成用户密钥
export const _generateSecretKey = (data: GenerateSecretKeyReq) => {
  return request.post(`/userApi/generateSecretKey/${data.id}`, data)
}

// 设置密钥状态
export const _setSecretKeyStatus = (data: SetSecretKeyStatusReq) => {
  return request.post(`/userApi/setSecretKeyStatus`, data)
}

// 修改用户token过期时间
export const _updateTokenExpireTime = (data: UpdateTokenExpireTimeReq) => {
  return request.post(`/userApi/updateTokenExpireTime`, data)
}

// 下线所有登录状态
export const _offlineAllLoginStatus = () => {
  return request.get(`/userApi/offlineAllLoginStatus`)
}

// 发送修改手机号验证码
export const _sendUpdatePhoneSms = (data: SendUpdatePhoneSmsReq) => {
  return request.post(`/smsApi/sendUpdatePhoneSms`, data)
}

// 修改手机号
export const _verifySms = (data: VerifySmsReq) => {
  return request.post(`/smsApi/verifySms`, data)
}

// 用户详情-订阅消息
export const _getUserSubscribeList = (params: GetUserSubscribeListReq) => {
  return request.get(`/msgApi/subscribe/getUserSubscribeList`, params)
}

// 用户详情-订阅消息-更新消息订阅
export const _updateUserSubscribe = (data: UpdateUserSubscribeReq) => {
  return request.post(`/msgApi/subscribe/updateUserSubscribe`, data)
}

// 可接受消息类型列表
export const _getMessageType = () => {
  return request.get(`/msgApi/messageType/types`)
}
