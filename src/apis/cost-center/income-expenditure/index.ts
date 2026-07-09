import { requestCs as request } from '@/request/http/index'
import { IncomeRecordListReq, IncomeRecordExportReq } from './type'

// 查询收支明细列表
export const _incomeRecordList = (data: IncomeRecordListReq) => {
  return request.post('/feeApi/incomeRecord/queryList', data)
}

// 查询收支明细详情
export const _queryDetailList = (data: { id: string }) => {
  return request.post('/feeApi/incomeRecord/queryDetailList', data)
}

// 提交收支明细下载任务
export const _incomeRecordExport = (data: IncomeRecordExportReq) => {
  return request.post('/feeApi/incomeRecord/export', data)
}
