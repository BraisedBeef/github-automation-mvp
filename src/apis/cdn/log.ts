import { requestCd as request } from '@/request/http/index'

// 获取离线日志记录
export const _getOfflineLog = (params: {
  start_time?: number
  end_time?: number
  channel_type?: string
  domain_id?: string
  page: number
  page_size: number
}) => {
  return request({
    url: '/cdn/offlinelogs/list',
    method: 'get',
    params,
  })
}

// 获取用户离线日志的域名
export const _getOfflineLogDomain = (params: { channel_type?: string }) => {
  return request({
    url: '/cdn/offlinelogs/domains',
    method: 'get',
    params,
  })
}

// 获取离线日志下载链接
export const _getOfflineLogDownloadUrl = (params: { ids: string; channel_type?: string; domain_id?: string }) => {
  return request({
    url: '/cdn/offlinelogs/downloadUrl',
    method: 'get',
    params,
  })
}
