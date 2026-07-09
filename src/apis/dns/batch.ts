import { requestCd as request } from '@/request/http/index'

// 添加域名
export const _batchAddDomain = (data: { domainList: string[]; recordValue: string }) => {
  return request.post('/dns/batch/add_domain', data)
}

// 导出解析记录
export const _batchExport = (data: { domainIdList: number[]; format: 'xlsx' | 'txt' | 'zone' }) => {
  return request.post('/dns/batch/export_analysis', data)
}
// 操作日志
export const _getHandleLog = (params: { page: number; pageSize: number }) => {
  return request.get('/dns/batch/get_operate_list', params)
}

// 操作日志详情
export const _getHandleLogDetail = (params: { taskId: string }) => {
  return request.get('/dns/batch/get_operate_detail', params)
}

// 文件下载列表
export const _getDownloadList = (params: Pager) => {
  return request.get('/dns/batch/download_list', params)
}
// 文件下载列表删除
export const _deleteDownload = (data: { taskId: number }) => {
  return request.post('/dns/batch/download_delete', data)
}

// 添加解析记录
export const _batchAddAnalysis = (data: BatchAddAnalysis) => {
  return request.post('/dns/batch/add_analysis', data)
}

// 批量删除
export const _batchDelete = (data: { domainIdList: number[] }) => {
  return request.post('/dns/batch/del_domain', data)
}

interface BatchAddAnalysis {
  domainList: string[]
  recordList: {
    hostRecord: string // 主机记录
    recordType: number // 记录类型
    lineType: string // 线路
    mx: number // mx优先级
    ttl: number // TTL
    weight: number // 权重
    value: string // 记录值
  }[]
}
