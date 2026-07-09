import { requestCs as request } from '@/request/http/index'
import {
  SendMailReq,
  ResetPasswordReq,
  UpdateVcUserReq,
  UploadHeadReq,
  UpdateLoginEmailReq,
  UpdateLanguageReq,
  GetUserProjectReq,
} from './type'

// 修改用户信息 (包括修改登录用户昵称)
export const _updateVcUser = (data: UpdateVcUserReq) => {
  return request.post('/userApi/updateVcUser', data)
}

// 上传头像
export const _uploadHead = (data: UploadHeadReq) => {
  return request.post('/userApi/uploadHead', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 发送验证码(带token)
export const _sendMail = (data: SendMailReq) => {
  return request.post('/msgApi/sendMail', data)
}

// 修改登录用户密码
export const _resetPassword = (data: ResetPasswordReq) => {
  return request.post('/userApi/resetPassword', data)
}

// 获取登录用户信息
export const _getDetail = () => {
  return request.get('/userApi/getDetail')
}

// 修改登录邮箱
export const _updateLoginEmail = (data: UpdateLoginEmailReq) => {
  return request.post('/userApi/updateLoginEmail', data)
}

// 修改语言
export const _updateLanguage = (data: UpdateLanguageReq) => {
  return request.post('/userApi/updateLanguage', data)
}

// 用户项目列表
export const _getUserProject = (params?: GetUserProjectReq) => {
  return request.get('/userProjectApi/getUserProject', params)
}
