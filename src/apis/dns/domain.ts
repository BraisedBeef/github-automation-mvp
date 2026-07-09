// import { domain as axios } from "../";
import { requestCd as request } from '@/request/http/index'

// 获取我的域名
interface DomainList {
  page: number
  pageSize: number
  keyword?: string
  state?: string // 1:正常 2: 暂停 3:异常
  receiveState?: string // 1正常 2dns未修改，3dns未设置
  groupId?: string
}
// 域名列表
export const _getDomainList = (params: DomainList) => {
  return request.get('/dns/domain/list', params)
}
// 域名信息
export const _getDomainInfo = (params: { domainId: string }) => {
  return request.get('/dns/domain/info', params)
}
interface ChangeDomainInfo {
  ttl?: number
  domainId: number
  remark?: string
  status: number
}
// 修改域名信息
export const _changeDomainInfo = (data: ChangeDomainInfo) => {
  return request.post('/dns/domain/do_edit', data)
}

// 删除域名
export const _deleteDomains = (data: { domainId: string }) => {
  return request.post('/dns/domain/do_delete', data)
}
interface DomainLock {
  type: 'lock' | 'unlock' // 锁定/解锁
  domainId: string // 多个用,隔开
  password?: string // 域名操作, 解锁必传
}
// 域名解锁/锁定
export const _domainLock = (data: DomainLock) => {
  return request.post('/dns/domain/lock_operate', data)
}
interface ChangeDomainPwd {
  domainId: number
  originalPassword: string
  newlPassword: string
}
// 修改域名锁密码
export const _changeDomainPassword = (data: ChangeDomainPwd) => {
  return request.post('/dns/domain/modify_lockpassowrd', data)
}

//找回域名锁密码-发送验证码  sms:国内 email:国外
export const _sendDomainPasswordCode = (data: { type: 'sms' | 'email' }) => {
  return request.post('/dns/domain/retrieve/sendcode', data)
}
interface ResetDomainPassword {
  domainId: number
  password: string
  type: 'sms' | 'email'
  code: string // 验证码
}
// 重置域名锁密码
export const _resetDomainPassword = (data: ResetDomainPassword) => {
  return request.post('/dns/domain/retrieve/lockpassword', data)
}

// 获取域名状态信息
export const _refreshDomainStatus = (params: { domainId: string }) => {
  return request.get('/dns/domain/get_status', params)
}

// 添加域名
export const _addDomain = (data: { domain: string }) => {
  return request.post('/dns/domain/do_add', data)
}

// 添加域名（校验）
export const _addDomainValidate = (data: { domain: string }) => {
  return request.post('/dns/domain/do_add_validate', data)
}

interface DomainTxtInfo {
  domain: string
  type: 1 | 2 // 1-取回 2-TXT校验
}
// 获取域名校验TXT记录
export const _getDomainTxtInfo = (params: DomainTxtInfo) => {
  return request.get('/dns/domain/acquire_domain_by_txt', params)
}

// 校验域名TXT并取回域名
export const _getBackDomain = (data: { domain: string }) => {
  return request.post('/dns/domain/do_quhui', data)
}
// 校验域名TXT并添加子域名
export const _addChildDomain = (data: { domain: string }) => {
  return request.post('/dns/domain/check_domain_by_txt', data)
}

export interface ChartQuery {
  domainName: string
  hostRecord?: string
  dateTime?: string
  country?: string // 国家 目前写死中国: '中国'
}
// 图表

// 总体趋势
export const _getTrendChart = (params: ChartQuery) => {
  return request.get('/dns/domain/statistics/request', params)
}

// 全球分布
export const _getWorldChart = (params: ChartQuery) => {
  return request.get('/dns/domain/statistics/global_spread', params)
}

// 中国分布
export const _getChinaChart = (params: ChartQuery) => {
  return request.get('/dns/domain/statistics/country_spread', params)
}

// 修改域名M优化属性
export const _changeDomainX = (data: {
  domainId: number
  xOptimizeState: number
  sensitivity: number
  maxReturn: number
}) => {
  return request.post('/dns/domain/edit_x_optimization', data)
}
