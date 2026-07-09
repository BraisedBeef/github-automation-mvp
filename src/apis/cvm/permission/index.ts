import { requestCvmCs as request } from '@/request/http/index'
import { ServerDynamicConfigListReq } from './type'

// 用户端根据模块id以及地域id查询动态配置信息
export const _serverDynamicConfigList = (data: ServerDynamicConfigListReq) => {
  return request.post('/serverDynamicConfig/list', data)
}
