export interface NoAuthSendMailReq {
  email: string // 邮箱
  type: number // 1注册2忘记密码3修改密码4敏感操作5安全邮箱6登录保护7异地登录
}

export interface RegisterReq {
  userName?: string // 用户名
  password: string // 密码
  code: string // 验证码
  email: string // 邮箱
}

export interface ResetPwdReq {
  email: string // 邮箱
  newPassword: string // 新密码
  code: string // 验证码
}

export interface LoginReq {
  email: string // 账号
  password: string // 密码
  masterAccountId?: string // 主账户ID
  accountType?: number // 账户类型1:主账号2:子用户
}

export interface VerifyEmailCodeReq {
  email: string // 邮箱
  type: number // 1注册2忘记密码3修改密码4敏感操作5安全邮箱6登录保护7异地登录
  code: string // 验证码
}

export interface GoogleAuthorizingUrlReq {
  redirectUrl?: string
}

export interface GoogleAuthorizingCodeReq {
  code: string
}

export interface GoogleChangePasswordLoginReq {
  email: string
  newPassword: string
  confirmPassword: string
}
