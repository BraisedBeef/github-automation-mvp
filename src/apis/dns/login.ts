// import axios from '@/request/http/index'
import { requestCd as request } from '@/request/http/index'

// 账号注册
export const _register = (data: Register) => {
  return request.post('/common/register', data)
}
// 登录
export const _login = (data: Login) => {
  return request.post('/common/login', data)
}

// 找回->设置新密码
export const _resetPwd = (data: any) => {
  return request.post('/common/resetPassword', data)
}

/****** 短信验证码 */
// 注册短信验证码
export const _smsForRegister = (data: SmsCode) => {
  return request.post('/sms/register', data)
}
//登录短信验证码
export const _smsForLogin = (data: SmsCode) => {
  return request.post('/sms/login', data)
}
// 发送找回密码短信验证码
export const _smsForResetPwd = (data: SmsCode) => {
  return request.post('/sms/resetPassword', data)
}
// 验证找回密码短信验证码
export const _smtVerifyForResetPwd = (data: SmsCode) => {
  return request.post('/sms/verifyResetPassword', data)
}
/****** 邮箱验证码 */
// 注册邮箱验证码
export const _emailForRegister = (data: EmailCode) => {
  return request.post('/email/register', data)
}
// 找回密码邮箱验证码
export const _emailForResetPwd = (data: EmailCode) => {
  return request.post('/email/resetPassword', data)
}
// 验证找回密码邮箱验证码
export const _emailVerifyForResetPwd = (data: EmailCode) => {
  return request.post('/email/verifyResetPassword', data)
}
// 获取google验证器绑验证码
export const _emailForGoogle = (data?: EmailCode) => {
  return request.post('/email/bindGoogleAuth')
}

// 授权回调地址获取(google登录)
export const _loginWithGoogleAuth = (params: any) => {
  return request.get('/oauth/login', params)
}
// 授权登录验证(google登录)
export const _loginWithGoogle = (data: { platform: 1; code: string; state: string }) => {
  return request.post('/oauth/verify', data)
}

// 首次设置密码
export const _firstSetPassword = (data: { password: string }) => {
  return request.post('/setPassword', data)
}

export interface Login {
  method: number //登录方式,,0=用户名登录,1=短信(国内),2=邮箱(海外)
  account?: string //账号，根据method来填写
  password?: string //密码，密码后续需要进行md5加密或aes双向加密解密传输,不走明文
  code?: string //短信验证码【短信登录可选参数】
  globalCode?: string //手机区号【短信登录可选参数】
  type?: number
  token?: string // 这个是给从admin过来的时候携带token用的
}

export interface EmailCode {
  email: string
  code?: string
}

export interface Register {
  username?: string //账号
  password?: string //密码
  account: string //手机号or验证码，后端自动判断当前环境，默认国内
  code?: string //邮箱/短信验证码
  globalCode?: string //手机区号，手机可选参数
  type: number
}

export interface SmsCode {
  mobile: string
  globalCode: string
  code?: string
}
