import { requestCs as request } from '@/request/http/index'
import { SensitiveVerifyEmailCodeReq } from './type'

// 验证敏感操作验证码
export const _sensitiveVerifyEmailCode = (data: SensitiveVerifyEmailCodeReq) => {
  return request.post('/msgApi/sensitive/verifyEmailCode', data)
}
