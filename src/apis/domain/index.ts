import { requestCd as request } from '@/request/http/index'

export const _getDomainOverview = () => {
  return request({
    url: '/cloudDomain/console/overView',
    method: 'get',
  })
}

interface DomainParams {
  register_start: any
  register_end: any
  expire_start: any
  expire_end: any
  status: number
  auto_renew: number
  keyword: string
  register_time_sort: number
  exprire_time_sort: number
  page: number
  limit: number
}
export const _getDomainList = (params: DomainParams) => {
  return request({
    url: '/cloudDomain/console/domainList',
    method: 'get',
    params,
  })
}
export const _exportDomainList = (params: DomainParams) => {
  return request({
    url: '/cloudDomain/console/excelOfUsersDomainList',
    method: 'get',
    params,
  })
}
export const _updateDomainRemark = (data: { id: any; remark: string }) => {
  return request({
    url: '/cloudDomain/console/remarkUpdate',
    method: 'post',
    data,
  })
}

export const _getDomainDetail = (params: { id: any }) => {
  return request({
    url: '/cloudDomain/console/domainDetail',
    method: 'get',
    params,
  })
}

// 获取字典信息
export const _getSyDict = () => {
  return request({
    url: '/cloudDomain/home/sydict',
    method: 'get',
  })
}

export const _updateAutoRenew = (data: { ids: any; auto_renew: 1 | 2 }) => {
  return request({
    url: '/cloudDomain/console/autoRenew',
    method: 'post',
    data,
  })
}
export const _updateExpireNotice = (data: { id: any; notice: 1 | 2 }) => {
  return request({
    url: '/cloudDomain/console/expireNotice',
    method: 'post',
    data,
  })
}
export const _getLockVerify = () => {
  return request({
    url: '/cloudDomain/console/lockVerify',
    method: 'post',
    data: {},
  })
}
export const _updateLock = (data: { ids: any[]; lock: 1 | 2; code: string }) => {
  return request({
    url: '/cloudDomain/console/lock',
    method: 'post',
    data,
  })
}
export const _updateLockSign = (data: { ids: any; lock: 1 | 2; code: string }) => {
  return request({
    url: '/cloudDomain/console/lockSingle',
    method: 'post',
    data,
  })
}
export const _updatePrivacy = (data: { id: any; open: 1 | 2 }) => {
  return request({
    url: '/cloudDomain/console/openPrivacy',
    method: 'post',
    data,
  })
}

export const _getDomainDetailLog = (params: { domain: string; page: number; limit: number }) => {
  return request({
    url: '/cloudDomain/console/domainLog',
    method: 'get',
    params,
  })
}
export const _getDomainContacts = (params: { id: any }) => {
  return request({
    url: '/cloudDomain/console/contactInfo',
    method: 'get',
    params,
  })
}
export const _updateDns = (data: { ids: any[]; [key: string]: string | any }) => {
  return request({
    url: '/cloudDomain/console/nsUpdate',
    method: 'post',
    data,
  })
}

export const _getContactsTemplateList = (params: { key: string; page: number; limit: number }) => {
  return request({
    url: '/cloudDomain/console/contactTemplateList',
    method: 'get',
    params,
  })
}
export const _getContactsTemplateDomain = (params: { id: any }) => {
  return request({
    url: '/cloudDomain/console/contactTemplateAssociateDomains',
    method: 'get',
    params,
  })
}
export interface ContactsForm {
  id?: any
  address: string
  city: string
  company: string
  country: string
  // email: string
  fax: string
  first_name: string
  is_default: number
  last_name: string
  name: string
  phone: string
  postal_code: string
  province: string
  remark: string
}
export const _addContactsTemplate = (data: ContactsForm) => {
  return request({
    url: '/cloudDomain/console/contactTemplateAdd',
    method: 'post',
    data,
  })
}
export const _updateContactsTemplate = (data: ContactsForm) => {
  return request({
    url: '/cloudDomain/console/contactTemplateEdit',
    method: 'post',
    data,
  })
}
export const _deleteContactsTemplate = (data: { id: any }) => {
  return request({
    url: '/cloudDomain/console/contactTemplateDelete',
    method: 'post',
    data,
  })
}

export const _domainOwnership = (data: { domains: any }) => {
  return request({
    url: '/cloudDomain/console/domainBelongCheck',
    method: 'post',
    data,
  })
}
export const _updateDomainContacts = (data: { ids: any; contact_temp_id: number; privacy: number }) => {
  return request({
    url: '/cloudDomain/console/contactInfoEdit',
    method: 'post',
    data,
  })
}

interface OperateLogParams {
  start_time: any
  end_time: any
  keyword: string
  page: number
  limit: number
  time_desc: number
}
export const _getOperateLogList = (params: OperateLogParams) => {
  return request({
    url: '/cloudDomain/console/actionRecord',
    method: 'get',
    params,
  })
}
export const _exportOperateLog = (params: OperateLogParams) => {
  return request({
    url: '/cloudDomain/console/excelOfOperationLogList',
    method: 'get',
    params,
  })
}

export const _getCountry = () => {
  return request({
    url: '/cloudDomain/console/getCountries',
    method: 'get',
  })
}
export const _getProvince = (params: { country_id: number }) => {
  return request({
    url: '/cloudDomain/console/getStates',
    method: 'get',
    params,
  })
}
export const _getCity = (params: { state_id: number }) => {
  return request({
    url: '/cloudDomain/console/getCities',
    method: 'get',
    params,
  })
}

// 续费域名
export const _renewDomain = (data: { ids: string[]; auto_renew: number; year: number }) => {
  return request({
    url: '/cloudDomain/console/renew',
    method: 'post',
    data,
  })
}
// 单个续费域名
export const _renewDomainSign = (data: { ids: string; auto_renew: number; year: number }) => {
  return request({
    url: '/cloudDomain/console/renewSign',
    method: 'post',
    data,
  })
}
// 获取订单信息
export const _getOrderInfo = (params: { order_no: string }) => {
  return request({
    url: `/cloudDomain/order/orderInfo`,
    method: 'get',
    params,
  })
}

// 查询批量操作日志
export const _getBatchOperationLogList = (params: { page?: number; limit?: number; time_desc?: 1 | 2 }) => {
  return request({
    url: '/cloudDomain/console/batchOperationLogList',
    method: 'get',
    params,
  })
}

// 查看日志详情
export const _getBatchOperationLogDetail = (params: { id: string }) => {
  return request({
    url: '/cloudDomain/console/batchOperationLogDetail',
    method: 'get',
    params,
  })
}

// 导出批量操作日志
export const _exportBatchOperationLog = (params: { id: string }) => {
  return request({
    url: '/cloudDomain/console/excelOfBatchOperationLogDetail',
    method: 'get',
    params,
  })
}
