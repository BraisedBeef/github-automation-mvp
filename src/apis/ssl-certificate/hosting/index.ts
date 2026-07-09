import { domainTOASCII } from '@/utils/encrypt-decrypt'
import { request } from '../index'
import {
  CreateHostingReq,
  CreateHostingResp,
  CancelHostingReq,
  AssociateCertReq,
  HostingDetailsReq,
  GetHostingDetailsResp,
  GetAssociateCertReq,
  GetAssociateCertResp,
  HostingSettingReq,
  ListHostingReq,
  ListHostingResp,
  GetAvailableCertsResp,
  GetAvailableCertsReq,
  DelHostingReq,
} from './type'

/**
 * 创建托管
 * POST /hosting/create/hosting
 * 接口ID：261873047
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-261873047
 */
export const _createHosting = (data: CreateHostingReq) => {
  return request<CreateHostingResp>({
    url: '/hosting/create/hosting',
    method: 'post',
    data,
  })
}

/**
 * 取消托管
 * POST /hosting/cancel/hosting
 * 接口ID：261873046
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-261873046
 */
export const _cancelHosting = (data: CancelHostingReq) => {
  return request({
    url: '/hosting/cancel/hosting',
    method: 'post',
    data,
  })
}
/**
 * 关联证书
 * POST /hosting/associate/cert
 * 接口ID：261873045
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-261873045
 */
export const _associateCert = (data: AssociateCertReq) => {
  return request({
    url: '/hosting/associate/cert',
    method: 'post',
    data,
  })
}

/**
 * 获取托管详情
 * GET /hosting/get
 * 接口ID：261328575
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-261328575
 */
export const _getHostingDetails = (params: HostingDetailsReq) => {
  return request<GetHostingDetailsResp>({
    url: '/hosting/get',
    method: 'get',
    params,
  })
}

/**
 * 获取托管证书关联的新证书
 * GET /hosting/get/associate/certs
 * 接口ID：261873048
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-261873048
 */
export const _getAssociateCerts = (params: GetAssociateCertReq) => {
  return request<GetAssociateCertResp>({
    url: '/hosting/get/associate/certs',
    method: 'get',
    params,
  })
}

/**
 * 获取可托管证书列表
 * GET /sslcert/hosting/get/available/certs
 * 接口ID：269768728
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-269768728
 */
export const _getAvailableCerts = (params: GetAvailableCertsReq) => {
  return request<GetAvailableCertsResp>({
    url: '/hosting/get/available/certs',
    method: 'get',
    params,
  })
}

/**
 * 托管设置
 * POST /hosting/hosting/setting
 * 接口ID：261873049
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-261873049
 */
export const _hostingSetting = (data: HostingSettingReq) => {
  return request({
    url: '/hosting/hosting/setting',
    method: 'post',
    data,
  })
}

/**
 * 展示托管列表
 * GET /hosting/list
 * 接口ID：261328576
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-261328576
 */
export const _getHostingList = (params: ListHostingReq) => {
  // TIPS CDN_CN_DOMAIN 中文域名编码
  if (params.domain) params.domain = domainTOASCII(params.domain)

  return request<ListHostingResp>({
    url: '/hosting/list',
    method: 'get',
    params,
  })
}

/**
 * 删除托管记录
 * POST /hosting/del/hosting
 * 接口ID：278718600
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-278718600
 */
export const _delHosting = (data: DelHostingReq) => {
  return request({
    url: '/hosting/del/hosting',
    method: 'post',
    data,
  })
}
