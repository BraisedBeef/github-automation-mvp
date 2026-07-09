import { requestCd as request } from '@/request/http/index'
import { domainToUnicode } from '@/utils/encrypt-decrypt'

export const _getOverviewData = (params: { duration: number }) => {
  return request({
    url: '/cdn/monitoring/overview',
    method: 'get',
    params,
  })
}

export const _getOverviewRank = (data: {
  domain_ids: number[]
  start_time: number
  end_time: number
  order_by: 0 | 1 | 3
}) => {
  return request({
    url: '/cdn/analysis/overview/domainRank',
    method: 'post',
    data,
  }).then(res => {
    // TIPS CDN_CN_DOMAIN 处理中文域名
    if (res?.data?.data) {
      res.data.data?.forEach(item => {
        item.domain = domainToUnicode(item?.domain)
      })
    }
    return res
  })
}

// 推荐流量包
export const _getPkgRecommended = () => {
  return request({
    url: '/cdn/consume/fluxPkgs/recommended',
    method: 'get',
  })
}
