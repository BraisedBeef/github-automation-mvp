import { requestCs as request } from '@/request/http/index'
import {
  NoAuthSendMailReq,
  ResetPwdReq,
  RegisterReq,
  LoginReq,
  VerifyEmailCodeReq,
  GoogleAuthorizingUrlReq,
  GoogleAuthorizingCodeReq,
  GoogleChangePasswordLoginReq,
} from './type'

// 发送验证码(无token)
export const _noAuthSendMail = (data: NoAuthSendMailReq) => {
  return request.post('/msgApi/noAuth/sendMail', data)
}

// 找回->设置新密码
export const _resetPwd = (data: ResetPwdReq) => {
  return request.post('/userApi/noAuth/forgetPassword', data)
}

// 账号注册
export const _register = (data: RegisterReq) => {
  return request.post('/userApi/noAuth/register', data)
}

// 登录
export const _login = (data: LoginReq) => {
  return request.post('/userApi/noAuth/login', data)
}

// 验证邮箱验证码
export const _verifyEmailCode = (data: VerifyEmailCodeReq) => {
  return request.post('/msgApi/noAuth/verifyEmailCode', data)
}

// 退出登录
export const _logout = () => {
  return request.get('/userApi/logout')
}

// 获取谷歌登录验证url
export const _googleAuthorizingUrl = (params: GoogleAuthorizingUrlReq) => {
  return request.get('/userApi/noAuth/googleAuthorizingUrl', params)
}

// 谷歌登录验证Code
export const _googleAuthorizingCode = (params: GoogleAuthorizingCodeReq) => {
  return request.get('/userApi/noAuth/googleAuthorizingCode', params)
}

// 谷歌修改密码登录
export const _googleChangePasswordLogin = (data: GoogleChangePasswordLoginReq) => {
  return request.post('/userApi/noAuth/googleChangePasswordLogin', data)
}
