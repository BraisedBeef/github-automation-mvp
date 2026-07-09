import { requestCs as request } from '@/request/http/index'
import { GeneratePagReq, GetPathReq } from './type'

// 账单下载-导出记录
export const _generatePage = (data: GeneratePagReq) => {
  return request.post('/feeApi/bill/generate/page', data)
}

// 账单下载-获取下载地址
export const _getPath = (params: GetPathReq) => {
  return request.get('/feeApi/bill/generate/file/getPath', params)
}
