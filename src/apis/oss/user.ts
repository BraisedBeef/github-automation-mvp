import { requestCd as axios } from '@/request/http/index'

// 获取oss白名单信息
export const _checkOssWhite = () => {
  return axios.get('/oss/system/whitelist/check')
}
