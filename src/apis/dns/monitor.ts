// import { domain as axios } from "..";
import { requestCd as request } from '@/request/http/index'

interface MonitorList {
  keyword: string
  page: number
  pageSize: number
}
// 监控列表
export const _getMonitorList = (params: MonitorList) => {
  return request.get('/dns/monitor/list', params)
}

interface AddMonitor {
  interval: 30 | 60 //监控频率,30、60，单位分钟，固定着两个
  monitorType: 1 | 2 //监控类型,1=域名监控,2=url监控
  //url监控参数，非url监控可以忽略
  monitorUrl?: {
    url: string
    headers: {
      [x: string]: string
    } //自定义header
    successCode: string[] //成功状态码
  }
  //域名监控，非域名监控忽略该值
  monitorDomain?: {
    domainId: number //域名ID,需要从域名列表获取
    headers: {
      [x: string]: string
    } //自定义header
    successCode: string[] //成功状态码
    host: string //域名解析的主机名
    path: string //自定义请求路径
    port: number //端口，80=http协议,443=https协议,其余均为tcp
    protocol: 1 | 2 | 3 // http https tcp
  }
  reportTtl: false //触发监控报警修改解析后是否修改ttl
  reportTrigger: 0 | 1 | 3 //报警触发0:不对该域名做如何修改（不切换),1:解析智能切换;3:停止该域
  notify_email: string[]
  notify_mobile: string[]
}
// 添加监控
export const _addMonitor = (data: AddMonitor) => {
  return request.post('/dns/monitor/add', data)
}

// 获取域名选下拉项
export const _getDomainOptions = (params: { domainId: number }) => {
  return request.get('/dns/monitor/domain_list', params)
}

// 监控开关
export const _toggleMonitor = (data: { ids: number[]; status: boolean }) => {
  return request.post('/dns/monitor/toggle', data)
}

// 删除监控
export const _deleteMonitor = (data: { ids: number[] }) => {
  return request.post('/dns/monitor/delete', data)
}

interface MonitorLog {
  keyword: string
  page: number
  pageSize: number
  status: number // 0 全部 | 1 未恢复的 | 2已经恢复的
}
// 监控报警记录(监控日志)
export const _getMonitorLog = (params: MonitorLog) => {
  return request.get('/dns/monitor/logList', params)
}

// 获取监控详情
export const _getMonitorDetail = (params: { id: string }) => {
  return request.get('/dns/monitor/info', params)
}
// 更新监控
export const _updateMonitor = (data: any) => {
  return request.post('/dns/monitor/update', data)
}

// 清空
export const _clearMonitor = (data: { id: string }) => {
  return request.post('/dns/monitor/deleteReport', data)
}
