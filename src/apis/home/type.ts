export interface GetDomainCountReq {}

export interface GetMetricValueReq {
  endTime: number // 结束时间
  metric: number // 0:流量 1:带宽 2:请求数
  startTime: number // 开始时间
}
