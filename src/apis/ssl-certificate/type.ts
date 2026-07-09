// 基本的接口返回类型
export interface BaseApiType<T extends object> {
  timestamp: number
  code: number
  msg: string
  data?: T
  requestId: string
}
