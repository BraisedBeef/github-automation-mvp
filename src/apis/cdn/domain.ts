import { requestCd as request } from '@/request/http/index'
import { requestCd as request_download } from '@/request/http/index'
import { domainTOASCII, domainToUnicode } from '@/utils/encrypt-decrypt'

import type {
  FromTableData,
  AddDomainConfig,
  RefererConfig,
  IPconfig,
  IPfreqConfig,
  AuthConfig,
  AuthCalcConfig,
  AgentConfig,
  RemoteConfig,
  CacheRule,
  BrowserCacheRule,
  StatusCodeRule,
  HttpHead,
  URLrewriteItem,
  BackSNIConfig,
  Certificate,
  ForceRedirect,
  HSTSconfig,
  TLSconfig,
  ErrorTableItem,
  ZIPconfig,
} from '@/views/cdn/common'

interface DomainListParams {
  domain_name: string
  channel_type: string | number
  order: string
  status: number | string
  area_codes: number | string
  https_status: number | string
  page_size: number
  page: number
}

// 获取域名列表
export const _getDomainList = (params: DomainListParams) => {
  return request({
    url: '/cdn/domain',
    method: 'get',
    params,
  })
    .then(res => {
      // TIPS CDN_CN_DOMAIN 处理中文域名
      if (res?.data?.data) {
        res.data.data?.forEach(item => {
          item.domain = domainToUnicode(item?.domain)
          item.cname = domainToUnicode(item?.cname)
          item.origin_servers.forEach(server => {
            server.host = domainToUnicode(server.host)
          })
        })
      }
      return res
    })
    .then(res => {
      // TIPS CDN_CN_DOMAIN 处理中文域名
      if (res?.data?.data) {
        res.data.data?.forEach(item => {
          item.domain = domainToUnicode(item?.domain)
          item.cname = domainToUnicode(item?.cname)
          item.origin_servers.forEach(server => {
            server.host = domainToUnicode(server.host)
          })
        })
      }
      return res
    })
}

// 获取域名状态
export const _getDomainStatus = (domain_names: string) => {
  return request({
    url: `/cdn/domain/cname_status?domain_names=${domain_names}`,
    method: 'get',
  }).then(res => {
    // TIPS CDN_CN_DOMAIN 处理中文域名
    if (res?.data?.data) {
      res.data.data.forEach(item => {
        item.domain_name = domainToUnicode(item?.domain_name)
      })
    }
    return res
  })
}

//导出域名列表
export const _downloadDomainList = (params: DomainListParams) => {
  return request_download({
    url: `/cdn/domain/xlsx`,
    method: 'get',
    params,
    responseType: 'blob',
  })
}

interface AddDomainParams {
  area_code: number
  channel_type: number
  domain: string
  remark: string
  origin_conf: {
    protocol: number
    servers: FromTableData[]
  }
}

//添加域名
export const _addDomain = (data: AddDomainParams) => {
  // TIPS CDN_CN_DOMAIN 中文域名编码
  data.domain = domainTOASCII(data.domain)
  data.origin_conf.servers.forEach((item: FromTableData) => {
    item.host = domainTOASCII(item.host)
    item.address = domainTOASCII(item.address)
  })

  return request({
    url: '/cdn/domain',
    method: 'post',
    data,
  })
}

//域名校验
export const _domainValidation = (data: { domain: string; area_code?: number }) => {
  return request({
    url: '/cdn/domain/validation',
    method: 'post',
    data,
  })
}

//域名验证归属
export const _domainVerify = (data: { domain: string }) => {
  return request({
    url: '/cdn/domain/verify',
    method: 'post',
    data,
  })
}

//获取域名验证归属配置
export const _domainVerifyRecord = (params: { domain: string }) => {
  return request({
    url: '/cdn/domain/verify/record',
    method: 'get',
    params,
  })
}

//复制域名配置
export const _copyDomainConfig = (data: { domain: string; from: any }) => {
  // TIPS CDN_CN_DOMAIN 处理中文域名
  data.domain = domainTOASCII(data.domain)
  return request({
    url: '/cdn/domain/copy',
    method: 'post',
    headers: { 'Disabled-Global-Error-Msg': true },
    data,
  })
}

//删除域名
export const _delDomain = (id: any) => {
  return request({
    url: `/cdn/domain/${id}`,
    method: 'delete',
    headers: { 'Disabled-Global-Error-Msg': true },
  })
}

//启用or停用域名
export const _updateDomain = (data: { id: any; status: number }) => {
  return request({
    url: `/cdn/domain/${data.id}/status`,
    method: 'put',
    headers: { 'Disabled-Global-Error-Msg': true },
    data: { status: data.status },
  })
}

//获取默认域名配置
export const _getDomainConfig = (id: any) => {
  return request({
    url: `/cdn/domain/${id}/cache_conf`,
    method: 'get',
  })
}

//更新域名配置
export const _updateDomainConfig = (data: { id: any; form: AddDomainConfig }) => {
  return request({
    url: `/cdn/domain/${data.id}`,
    method: 'put',
    data: data.form,
  })
}

//获取证书列表
export const _getCertList = (params: { domain: string; page_size: number; page: number }) => {
  return request({
    url: `/cdn/sslcert/available`,
    method: 'get',
    params,
  })
}

//获取基本配置
export const _getBaseConfig = (id: any) => {
  return request({
    url: `/cdn/domain/${id}/base_conf`,
    method: 'get',
  }).then(res => {
    // TIPS CDN_CN_DOMAIN 处理中文域名
    if (res?.data) {
      if (res.data.base_info) {
        res.data.base_info.domain = domainToUnicode(res.data.base_info?.domain)
        res.data.base_info.cname = domainToUnicode(res.data.base_info?.cname)
      }
      if (res.data.origin_server_conf) {
        res.data.origin_server_conf?.forEach(item => {
          item.host = domainToUnicode(item.host)
        })
      }
    }
    return res
  })
}

//更新基本配置
export const _updateBaseConfig = (data: {
  id: any
  form: { support_ipv6?: number; remark?: string; area_code: number }
}) => {
  return request({
    url: `/cdn/domain/${data.id}/base_info`,
    method: 'put',
    data: data.form,
  })
}

//更新源站配置
export const _updateBaseOriginConfig = (data: { id: any; tableData: { servers: FromTableData[] } }) => {
  // TIPS CDN_CN_DOMAIN 处理中文域名
  data.tableData.servers.forEach((item: FromTableData) => {
    item.host = domainTOASCII(item.host)
  })
  // TIPS CDN_CN_DOMAIN 处理中文域名
  data.tableData.servers.forEach((item: FromTableData) => {
    item.host = domainTOASCII(item.host)
  })
  return request({
    url: `/cdn/domain/${data.id}/origin_server_conf`,
    method: 'put',
    data: data.tableData,
  })
}

//获取访问控制配置
export const _getAccessConfig = (id: any) => {
  return request({
    url: `/cdn/domain/${id}/access_control_conf`,
    method: 'get',
  })
}

//更新防盗链配置
export const _updateRefererConfig = (data: { id: any; form: RefererConfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/referer_conf`,
    method: 'put',
    data: data.form,
  })
}

//更新IP黑白名单配置
export const _updateIPconfig = (data: { id: any; form: IPconfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/ip_filter_conf`,
    method: 'put',
    data: data.form,
  })
}

//更新IP访问限频配置
export const _updateIPfreqConfig = (data: { id: any; form: IPfreqConfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/ip_freq_conf`,
    method: 'put',
    data: data.form,
  })
}

//更新鉴权配置
export const _updateAuthConfig = (data: { id: any; form: AuthConfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/auth_conf`,
    method: 'put',
    data: data.form,
  })
}

//更新鉴权计算器配置
export const _updateAuthCalcConfig = (data: AuthCalcConfig) => {
  return request({
    url: `/cdn/domain/access_control_conf/auth_conf_calc`,
    method: 'post',
    data,
  })
}

//更新User-Agent黑白名单
export const _updateAgentConfig = (data: { id: any; form: AgentConfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/user_agent_conf`,
    method: 'put',
    data: data.form,
  })
}

//更新远程鉴权
export const _updateRemoteConfig = (data: { id: any; form: RemoteConfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/remote_auth_conf`,
    method: 'put',
    data: data.form,
  })
}

//获取缓存配置
export const _getCacheConfig = (id: any) => {
  return request({
    url: `/cdn/domain/${id}/cache_conf`,
    method: 'get',
  })
}

//更新缓存规则
export const _updateCacheConfig = (data: { id: any; tableData: { rules: CacheRule[] } }) => {
  return request({
    url: `/cdn/domain/${data.id}/cache_rule_conf`,
    method: 'put',
    data: data.tableData,
  })
}

//更新浏览器缓存时间
export const _updateBrowserConfig = (data: { id: any; tableData: { rules: BrowserCacheRule[] } }) => {
  return request({
    url: `/cdn/domain/${data.id}/browser_cache_conf`,
    method: 'put',
    data: data.tableData,
  })
}

//添加状态码缓存
export const _addStatusCodeRule = (data: { id: any; form: { rule: StatusCodeRule } }) => {
  return request({
    url: `/cdn/domain/${data.id}/http_status_cache_conf`,
    method: 'post',
    data: data.form,
  })
}

//删除状态码缓存
export const _delStatusCodeRule = (data: { id: any; rule_id: any }) => {
  return request({
    url: `/cdn/domain/${data.id}/http_status_cache_conf/${data.rule_id}`,
    method: 'delete',
  })
}

//更新状态码缓存
export const _updateStatusCodeRule = (data: { id: any; form: { rule: StatusCodeRule } }) => {
  return request({
    url: `/cdn/domain/${data.id}/http_status_cache_conf`,
    method: 'put',
    data: data.form,
  })
}

//访问URL重写
export const _updateCacheURLrewrite = (data: { id: any; form: { rules: URLrewriteItem[] } }) => {
  return request({
    url: `/cdn/domain/${data.id}/cache_url_rewrite_conf`,
    method: 'put',
    data: data.form,
  })
}

//获取回源配置
export const _getBackConfig = (id: any) => {
  return request({
    url: `/cdn/domain/${id}/back_source_conf`,
    method: 'get',
  })
}

//更新回源协议
export const _updateBackSourceProtocol = (data: { id: any; protocol: number }) => {
  return request({
    url: `/cdn/domain/${data.id}/backSourceProtocol`,
    method: 'put',
    data: { protocol: data.protocol },
  })
}

//更新range回源
export const _updateBackRange = (data: { id: any; status: number }) => {
  return request({
    url: `/cdn/domain/${data.id}/back_source_range_conf`,
    method: 'put',
    data: { status: data.status },
  })
}

//添加回源HTTP请求头
export const _addHttpRule = (data: { id: any; form: HttpHead }) => {
  return request({
    url: `/cdn/domain/${data.id}/back_source_request_header_conf`,
    method: 'post',
    data: data.form,
  })
}

//更新回源HTTP请求头
export const _updateHttpHeader = (data: { id: any; form: { rule: HttpHead } }) => {
  return request({
    url: `/cdn/domain/${data.id}/back_source_request_header_conf`,
    method: 'put',
    data: data.form,
  })
}

//删除状态码缓存
export const _delHttpHeader = (data: { id: any; rule_id: any }) => {
  return request({
    url: `/cdn/domain/${data.id}/back_source_request_header_conf/${data.rule_id}`,
    method: 'delete',
  })
}

//更新回源跟随
export const _updateBackFollow = (data: { id: any; status: number }) => {
  return request({
    url: `/cdn/domain/${data.id}/back_source_follow_conf`,
    method: 'put',
    data: { status: data.status },
  })
}

//更新回源跟随
export const _updateBackTimeout = (data: { id: any; status: number }) => {
  return request({
    url: `/cdn/domain/${data.id}/back_source_timeout_conf`,
    method: 'put',
    data: { conf: { ttl: data.status } },
  })
}

//更新回源跟随
export const _updateURLrewrite = (data: { id: any; tableData: URLrewriteItem[] | null }) => {
  return request({
    url: `/cdn/domain/${data.id}/back_source_url_rewrite_conf`,
    method: 'put',
    data: { rules: data.tableData },
  })
}

//更新回源sni
export const _updateSNI = (data: { id: any; form: BackSNIConfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/back_source_sni_conf`,
    method: 'put',
    data: data.form,
  })
}

//获取https配置
export const _getHttpsConfig = (id: any) => {
  return request({
    url: `/cdn/domain/${id}/https_conf`,
    method: 'get',
  })
}

interface HttpsCertificate {
  status: number
  certificate: Certificate | { certificate_id: number }
}
//更新https设置
export const _updateHttps = (data: { id: any; form: HttpsCertificate }) => {
  return request({
    url: `/cdn/domain/${data.id}/https_conf`,
    method: 'put',
    data: data.form,
  })
}

//更新http2.0设置
export const _updateHttp20 = (data: { id: any; status: number }) => {
  return request({
    url: `/cdn/domain/${data.id}/http20_conf`,
    method: 'put',
    data: { status: data.status },
  })
}

//更新强制跳转设置
export const _updateForceDirect = (data: { id: any; form: ForceRedirect }) => {
  return request({
    url: `/cdn/domain/${data.id}/force_direct_conf`,
    method: 'put',
    data: data.form,
  })
}

//更新强制跳转设置
export const _updateHSTS = (data: { id: any; form: HSTSconfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/hsts_conf`,
    method: 'put',
    data: data.form,
  })
}

//更新TLS设置
export const _updateTLS = (data: { id: any; form: TLSconfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/tls_conf`,
    method: 'put',
    data: data.form,
  })
}

//更新强制跳转设置
export const _updateOCSP = (data: { id: any; status: number }) => {
  return request({
    url: `/cdn/domain/${data.id}/ocsp_conf`,
    method: 'put',
    data: { status: data.status },
  })
}

//获取高级配置
export const _getSeniorConfig = (id: any) => {
  return request({
    url: `/cdn/domain/${id}/advance_setting_conf`,
    method: 'get',
  })
}

//新增错误规则
export const _addErrorRule = (data: { id: any; form: ErrorTableItem }) => {
  return request({
    url: `/cdn/domain/${data.id}/error_page_conf`,
    method: 'post',
    data: { rule: data.form },
  })
}

//更新错误规则
export const _updateErrorRule = (data: { id: any; form: ErrorTableItem }) => {
  return request({
    url: `/cdn/domain/${data.id}/error_page_conf`,
    method: 'put',
    data: { rule: data.form },
  })
}

//删除错误规则
export const _delErrorRule = (data: { id: any; rule_id: any }) => {
  return request({
    url: `/cdn/domain/${data.id}/error_page_conf/${data.rule_id}`,
    method: 'delete',
  })
}

//更新HTTP响应头
export const _updateHttpHead = (data: { id: any; tableData: HttpHead[] }) => {
  return request({
    url: `/cdn/domain/${data.id}/response_header_conf`,
    method: 'put',
    data: { rules: data.tableData },
  })
}

//更新zip
export const _updateZip = (data: { id: any; form: ZIPconfig }) => {
  return request({
    url: `/cdn/domain/${data.id}/smart_compress_conf`,
    method: 'put',
    data: data.form,
  })
}
