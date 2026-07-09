import { AxiosRequestConfig } from 'axios'
import { requestCd } from '@/request/http/index'
import type { BaseApiType } from './type'

// const userStore = useUserStore(store)
// 添加接口基本类型
export const request = <T extends object>(config: AxiosRequestConfig) => {
  config['headers'] = {
    ...config['headers'],
  }
  config['url'] = '/sslcert' + config['url']

  return <Promise<BaseApiType<T>>>requestCd(config)
}
