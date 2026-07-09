import { requestCd as request } from '@/request/http/index'
import { domainToUnicode } from '@/utils/encrypt-decrypt'

export interface ContentPagination {
  page_size: number
  page: number
}

export interface ContentRefrehs {
  urls?: string[]
  paths?: string[]
  url_encode: boolean
  refresh_type?: number
}

// 获取配额
export const _getQuota = () => {
  return request.get('/cdn/contentmgmt/quota')
}

// 目录刷新列表(缺少请求参数: 搜索框, 时间; 缺少返回参数: type)
export const _pathRefresh = (
  params: ContentPagination & {
    key: string
    start_time: number
    end_time: number
    status: number
  },
) => {
  return request.get('/cdn/contentmgmt/tasks/path_refresh', params)
}

// 创建目录刷新
export const _createPathRefresh = (data: ContentRefrehs) => {
  try {
    // TIPS CDN_CN_DOMAIN 处理中文域名
    data.paths = data.paths?.map(r => {
      const url = new URL(r)
      return r.replace(domainToUnicode(url.hostname), url.hostname)
    })
  } catch (error) {
    console.log(error)
  }
  return request.post('/cdn/contentmgmt/tasks/path_refresh', data)
}

//  URL预热任务
export const _URLprefetch = (params: ContentPagination) => {
  return request.get('/cdn/contentmgmt/tasks/url_prefetch', params)
}
//  创建URL预热任务
export const _createURLprefresh = (data: ContentRefrehs) => {
  try {
    // TIPS CDN_CN_DOMAIN 处理中文域名
    data.urls = data.urls?.map(r => {
      const url = new URL(r)
      return r.replace(domainToUnicode(url.hostname), url.hostname)
    })
  } catch (error) {
    console.log(error)
  }
  return request.post('/cdn/contentmgmt/tasks/url_prefetch', data)
}

// URL刷新任务
export const _URLrefresh = (params: ContentPagination) => {
  return request.get('/cdn/contentmgmt/tasks/url_refresh', params)
}

//  创建URL刷新任务
export const _createURLrefresh = (data: ContentRefrehs) => {
  try {
    // TIPS CDN_CN_DOMAIN 处理中文域名
    data.urls = data.urls?.map(r => {
      const url = new URL(r)
      return r.replace(domainToUnicode(url.hostname), url.hostname)
    })
  } catch (error) {
    console.log(error)
  }
  return request.post('/cdn/contentmgmt/tasks/url_refresh', data)
}
