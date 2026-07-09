import { requestCd as request } from '@/request/http/index'
import { requestCd as request_download } from '@/request/http/index'
import { domainToUnicode } from '@/utils/encrypt-decrypt'

// 获取运营商
export const _getOperator = () => {
  return request.get('/cdn/statics/operators')
}

// 获取流量包详情
export interface Fluxform {
  accelerationType?: 1 | 2
  accelerationRegion: '' | 1 | 2
  purchaseType: '' | 1 | 2
  class: -1 | 0 | 1
  orderBy: 'purchaseTime' | 'expireTime' | ''
  order: '' | 'asc' | 'desc'
  status: '1' | '2' | '1,2' | '3' | '4' | '5' | '3,4,5'
}
export const _getFluxDetail = (params: Fluxform & { page: number; page_size: number }) => {
  return request({
    url: '/cdn/consume/userFluxPkgs',
    method: 'get',
    params,
  })
}

// 带宽（静态）
export const _bandwidth = (data: Bindwidth) => {
  return request.post('/cdn/monitoring/bindwidth', data)
}
// 带宽（全站）
export const _bindwidthAll = (data: Bindwidth) => {
  return request.post('/cdn/monitoring/ecdn/bindwidth', data)
}
// 导出带宽（静态）
export const _bindWidthExport = (data: any) => {
  return request_download.post('/cdn/monitoring/bindwidth/data_file', data, {
    responseType: 'blob',
    // headers: {
    //   'Content-Disposition': 'attachment; filename="filename.extension"',
    // },
  })
}
// 导出带宽（全站）
export const _bindWidthAllExport = (data: any) => {
  return request_download.post('/cdn/monitoring/ecdn/bindwidth/data_file', data, {
    responseType: 'blob',
  })
}

// 流量（静态）
export const _flux = (data: Bindwidth) => {
  return request.post('/cdn/monitoring/flux', data)
}
// 流量(全站)
export const _fluxAll = (data: Bindwidth) => {
  return request.post('/cdn/monitoring/ecdn/flux', data)
}
// 导出流量（静态）
export const _fluxExport = (data: any) => {
  return request_download.post('/cdn/monitoring/flux/data_file', data, {
    responseType: 'blob',
  })
}
// 导出流量（全站）
export const _fluxAllExport = (data: any) => {
  return request_download.post('/cdn/monitoring/ecdn/flux/data_file', data, {
    responseType: 'blob',
  })
}

// 请求数（静态）
export const _request = (data: Bindwidth) => {
  return request.post('/cdn/monitoring/request', data)
}
// 请求数（全站）
export const _requestAll = (data: Bindwidth) => {
  return request.post('/cdn/monitoring/ecdn/request', data)
}
// 导出请求数（静态）
export const _requestExport = (data: any) => {
  return request_download.post('/cdn/monitoring/request/data_file', data, {
    responseType: 'blob',
  })
}
// 导出请求数（全站）
export const _requestAllExport = (data: any) => {
  return request_download.post('/cdn/monitoring/ecdn/request/data_file', data, {
    responseType: 'blob',
  })
}

// 命中率（静态）
export const _hitrate = (data: Bindwidth) => request.post('/cdn/monitoring/hitrate', data)
// 命中率（全站）
export const _hitrateAll = (data: Bindwidth) => request.post('/cdn/monitoring/ecdn/hitrate', data)
// 导出命中率（静态）
export const _hitrateExport = (data: any) => {
  return request_download.post('/cdn/monitoring/hitrate/data_file', data, {
    responseType: 'blob',
  })
}
// 导出命中率（全站）
export const _hitrateAllExport = (data: any) => {
  return request_download.post('/cdn/monitoring/ecdn/hitrate/data_file', data, {
    responseType: 'blob',
  })
}

// 状态码（静态）
export const _httpstatus = (data: Bindwidth) => request.post('/cdn/monitoring/httpstatus', data)
// 状态码（全站）
export const _httpstatusAll = (data: Bindwidth) => request.post('/cdn/monitoring/ecdn/httpstatus', data)
// 导出状态码（静态）
export const _httpstatusExport = (data: any) => {
  return request_download.post('/cdn/monitoring/httpstatus/data_file', data, {
    responseType: 'blob',
  })
}
// 导出状态码（全站）
export const _httpstatusAllExport = (data: any) => {
  return request_download.post('/cdn/monitoring/ecdn/httpstatus/data_file', data, {
    responseType: 'blob',
  })
}

// 回源带宽（静态）
export const _backsource_bindwidth = (data: Bindwidth) => request.post('/cdn/monitoring/backsource/bindwidth', data)
// 回源带宽（全站）
export const _backsource_bindwidthAll = (data: Bindwidth) =>
  request.post('/cdn/monitoring/ecdn/backsource/bindwidth', data)
// 导出回源带宽（静态）
export const _backBindwidthExport = (data: any) => {
  return request_download.post('/cdn/monitoring/backsource/bindwidth/data_file', data, {
    responseType: 'blob',
  })
}
// 导出回源带宽（全站）
export const _backBindwidthAllExport = (data: any) => {
  return request_download.post('/cdn/monitoring/ecdn/backsource/bindwidth/data_file', data, {
    responseType: 'blob',
  })
}

// 回源流量（静态）
export const _backsource_flux = (data: Bindwidth) => request.post('/cdn/monitoring/backsource/flux', data)
// 回源流量（全站）
export const _backsource_fluxAll = (data: Bindwidth) => request.post('/cdn/monitoring/ecdn/backsource/flux', data)
// 导出回源流量（静态）
export const _backFluxExport = (data: any) => {
  return request_download.post('/cdn/monitoring/backsource/flux/data_file', data, {
    responseType: 'blob',
  })
}
// 导出回源流量（全站）
export const _backFluxAllExport = (data: any) => {
  return request_download.post('/cdn/monitoring/ecdn/backsource/flux/data_file', data, {
    responseType: 'blob',
  })
}

// 回源请求数（静态）
export const _backsource_request = (data: Bindwidth) => request.post('/cdn/monitoring/backsource/request', data)
// 回源请求数（全站）
export const _backsource_requestAll = (data: Bindwidth) => request.post('/cdn/monitoring/ecdn/backsource/request', data)
// 导出回源请求数（静态）
export const _backRequestExport = (data: any) => {
  return request_download.post('/cdn/monitoring/backsource/request/data_file', data, {
    responseType: 'blob',
  })
}
// 导出回源请求数（全站）
export const _backRequestAllExport = (data: any) => {
  return request_download.post('/cdn/monitoring/ecdn/backsource/request/data_file', data, {
    responseType: 'blob',
  })
}

// 回源状态码（静态）
export const _backsource_httpstatus = (data: Bindwidth) => request.post('/cdn/monitoring/backsource/httpstatus', data)
// 回源状态码（全站）
export const _backsource_httpstatusAll = (data: Bindwidth) =>
  request.post('/cdn/monitoring/ecdn/backsource/httpstatus', data)
// 导出回源状态码（静态）
export const _backHttpstatusExport = (data: any) => {
  return request_download.post('/cdn/monitoring/backsource/httpstatus/data_file', data, {
    responseType: 'blob',
  })
}
// 导出回源状态码（全站）
export const _backHttpstatusAllExport = (data: any) => {
  return request_download.post('/cdn/monitoring/ecdn/backsource/httpstatus/data_file', data, {
    responseType: 'blob',
  })
}

// 剩余流量
// export const _remainflux = () => {
//   return request.post('/cdn/fluxpkg/user_flux')
// }

// // 剩余流量(全站)
// export const _remainfluAll = () => {
//   return request.post('/cdn/fluxpkg/user_ecdn_flux')
// }

//实时监控获取流量包剩余
export const _remainFlux = (params: { cdnType: 'cdn' | 'ecdn' }) => {
  return request({
    url: '/cdn/consume/user_flux',
    method: 'get',
    params,
  })
}

// 获取域名列表
type Scene = 'monitoring' | 'monitoring-ecdn' | 'analysis' | 'analysis-ecdn' | 'overview'
export const _domainList = (params: { scene: Scene | string; areaCode?: any }) => {
  return request.get('/cdn/domain/specified', params).then(res => {
    // TIPS CDN_CN_DOMAIN 处理中文域名
    if (res?.data?.data) {
      res.data.data.forEach((item: any) => {
        item.domain = domainToUnicode(item.domain)
        item.cname = domainToUnicode(item.cname)
        item.origin_servers.forEach((server: any) => {
          server.host = domainToUnicode(server.host)
        })
      })
    }
    return res
  })
}

export interface Bindwidth {
  time_range?: any
  area: number // 0: 境内 1: 境外
  domain_names?: string[] // 域名
  domain_ids: number[] // 域名
  interval: number // 粒度=> 0: 5分钟 1:1小时 2:1天
  start_time: any // 开始时间
  end_time: any // 结束时间
  operator?: number // 运营商=> 0: 全部 其它的根据接口code
  http_protocol?: number // http协议=> 0:全部 1:http 2:https
  ip_protocol?: number // ip => 0: 全部 1: IPV4   2: IPV6
  start_time_next?: number // 对比开始时间
  end_time_next?: number // 对比结束时间
  is_split?: boolean // 是否按域名分组
  pageType?: any
  all_domain?: boolean
}

export interface DomainList {
  page: number
  page_size: number
  domain_name?: string
  channel_type: string // 静态加速传 1,2,3 全站传 3
  query_deleted?: 0 | 1 // 是否查询已删除的域名 0:否
}
