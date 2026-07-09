// import { domain as axios } from "../";
import { requestCd as request } from '@/request/http/index'

interface AnalysisId {
  domainId: number
  analysisId: string
}
// 解析列表
export const _getAnalysisList = (params: { domainId: number; keyword?: string; page: number; pageSize: number }) => {
  return request.get('/dns/analysis/getlist', params)
}

// 解析列表筛选
export const _getAnalysisListFilter = (params: AnalysisListFilter) => {
  return request.get('/dns/analysis/getlist_v2', params)
}
// 批量修改解析记录
export const _batchChangeAnalysis = (data: BatchChangeAnalysis) => {
  return request.post('/dns/batch/edit_analysis', data)
}
// 批量添加解析记录
export const _batchAddAnalysis = (data: AddAnalysis) => {
  return request.post('/dns/analysis/do_add', data)
}
// 修改解析记录属性
export const _editAnalysisDetail = (data: EditAnalysisDetail) => {
  return request.post('/dns/analysis/do_edit', data)
}

// 修改解析记录备注
export const _editAnalysisRemark = (data: { domainId: number; analysisId: number; remark: string }) => {
  return request.post('/dns/analysis/do_edit_remark', data)
}

// 删除解析
export const _deleteAnalysis = (data: AnalysisId) => {
  return request.post('/dns/analysis/do_delete', data)
}

// 修改解析记录状态
export const _changeAnalysisStatus = (data: {
  domainId: number
  analysisId: string
  status: 1 | 2 //1:开启 2:暂停
}) => {
  return request.post('/dns/analysis/status', data)
}

// 变更解析记录M优化状态
export const _changeAnalysisX = (
  data: AnalysisId & { xOptimizeState: number; hostRecord: string; sensitivity: number; maxReturn: number },
) => {
  return request.post('/dns/analysis/xoptimize', data)
}

// 上传解析记录文件
export const _uploadAnalysisFile = (data: FormData) => {
  return request.post('/dns/upload/domainRecordsFile', data, {
    headers: {
      type: 'multipart/form-data',
    },
  })
}

// 解析导入的文件(生成列表)
export const _explainAnalysisFile = (data: { objectId: string }) => {
  return request.post('/dns/upload/recordsFileParse', data)
}

interface AnalysisId {
  domainId: number
  analysisId: string
}
interface AnalysisListFilter {
  domainId: string
  hostRecord?: string
  recordType?: number | string
  lineType?: string
  recordValue?: string
}
interface BatchChangeAnalysis {
  analysisIdList: number[]
  lineType: string
  recordType: number
  hostRecord: string
  // mx: number;
  // weight: number;
  recordValue: string
  ttl: any
}
interface AddAnalysis {
  domainId: number
  hostRecord: string
  recordType: number
  lineTypeId: string
  lineType: string
  recordValue: string
  ttl: number
  mx: number
  weight: number
}

interface EditAnalysisDetail {
  domainId: number
  analysisId: number
  hostRecord: string
  recordType: number
  lineType: string
  ttl: number
  value: string
  mx: number
  weight: number
  remark?: string
}
