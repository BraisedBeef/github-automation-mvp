export interface PropType {
  list: any[]
}

export interface ChartType {
  params: {
    monitorType: number
    id: number
    metricName: string
    startTime: string
    endTime: string
    period: 0 | 60 | 300 | 3600 | 86400 // 60:1分钟粒度300:5分钟粒度3600:1小时粒度86400:1天粒度
  }
  config: {
    title: string
    id: string
    legend: boolean
    refreshNum: number
    legendName: string
    unit: string
  }
}
