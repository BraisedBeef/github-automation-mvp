export interface UpdateVcUserReq {
  id?: number | string
  [key: string]: any
}

export interface UploadHeadReq {
  file: File
}

export interface SendMailReq {
  email: string //邮箱
  type: number //邮件类型 1注册2忘记密码3修改密码4敏感操作5安全邮箱6登录保护7异地登录8修改登录邮箱
}

export interface ResetPasswordReq {
  confirmPassword: string //确认密码
  newPassword: string //新密码
  code: string //验证码
}

export interface UpdateLoginEmailReq {
  email: string // 邮箱
  code: string // 验证码
}

export interface UpdateLanguageReq {
  langCode: string // 邮箱
}

export interface GetUserProjectReq {
  projectName?: string // 项目名称
}
