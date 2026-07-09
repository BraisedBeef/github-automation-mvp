import { requestCs as request } from '@/request/http/index'
import { GetStrategyListReq, InsertVsStrategyReq, GetStrategytDetailReq, GetStrategySummaryReq } from './type'

// 策略列表
export const _getStrategyList = (data: GetStrategyListReq) => {
  return request.post('/strategyApi/getStrategyList', data)
}

// 新增策略
export const _insertVsStrategy = (data: InsertVsStrategyReq) => {
  return request.post('/strategyApi/insertVsStrategy', data)
}

// 策略详情
export const _geStrategytDetail = (data: GetStrategytDetailReq) => {
  return request.get(`/strategyApi/getDetail/${data.id}`)
}

// 策略摘要
export const _getStrategySummary = (data: GetStrategySummaryReq) => {
  return request.post('/strategyApi/getStrategySummary', data)
}
