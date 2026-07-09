import { requestCd as request } from '@/request/http/index'
import { domainToUnicode } from '@/utils/encrypt-decrypt'
import type { Certificate } from '@/views/cdn/common'

//获取所有证书列表
export const _getAllSSLcert = (params: { domain?: string; page_size: number; page: number }) => {
  return request({
    url: '/cdn/sslcert/bound',
    method: 'get',
    params,
  }).then(res => {
    // TIPS CDN_CN_DOMAIN 处理中文域名
    if (res?.data?.data) {
      res.data.data.forEach((item: any) => {
        item.domain = domainToUnicode(item.domain)
      })
    }
    return res
  })
}

//获取托管证书列表
export const _getUseSSLcert = (params: { domain?: string; page_size: number; page: number }) => {
  return request({
    url: '/cdn/sslcert/available',
    method: 'get',
    params,
  }).then(res => {
    // TIPS CDN_CN_DOMAIN 处理中文域名
    if (res?.data?.data) {
      res.data.data.forEach((item: any) => {
        item.domain = domainToUnicode(item.domain)
        item.dns_names = item.dns_names.map((dns_name: any) => domainToUnicode(dns_name))
      })
    }
    return res
  })
}

//创建SSL证书
export const _addSSLcert = (data: { domain_id: any; certificate_id?: number; new_certificate?: Certificate }) => {
  return request({
    url: '/cdn/sslcert',
    method: 'post',
    data,
  })
}

//更新SSL证书
export const _updateSSLcert = (data: { domain_id: any; certificate_id?: number; new_certificate?: Certificate }) => {
  return request({
    url: '/cdn/sslcert',
    method: 'put',
    data,
  })
}

//删除SSL证书
export const _delSSLcert = (id: any) => {
  return request({
    url: '/cdn/sslcert',
    method: 'delete',
    data: { domain_id: id },
  })
}
