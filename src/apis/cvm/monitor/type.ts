export interface GetMonitorReq {
  monitorType: number // 监控类型 1 实例 2 硬盘
  id: number // 资源id
  metricName: string // 指标名
  startTime: string // 开始时间
  endTime: string // 结束时间
  period: number // 粒度 60:1分钟粒度300:5分钟粒度3600:1小时粒度86400:1天粒度
}

export interface GetMonitorMetricReq {
  monitorType: number
  // 监控类型 1 实例 2 硬盘

  regionId: number
  // 地区id
}
