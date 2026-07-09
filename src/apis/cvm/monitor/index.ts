import { requestCvmCs as request } from '@/request/http/index'

import { GetMonitorReq, GetMonitorMetricReq } from './type'

// 查询指标监控数据
export const _getMonitor = (data: GetMonitorReq) => {
  return request.post('/monitorApi/getMonitor', data)
}

// 查询支持的指标
export const _getMonitorMetric = (data: GetMonitorMetricReq) => {
  return request.post('/monitorApi/getMonitorMetric', data)
}
