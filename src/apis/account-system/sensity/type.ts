export interface SensitiveVerifyEmailCodeReq {
  email: string //邮箱
  type: number //邮件类型
  code: string //验证码
  perms: string // 敏感操作码
}
