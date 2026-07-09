export interface CostCenterResponse {
  /**
   * 状态码
   */
  code: number
  data: RenewCostCenterFilterData
  msg: string
  success: boolean
  /**
   * 响应时间
   */
  time: number
  traceId: string
  [property: string]: any
}

export interface RenewCostCenterFilterData {
  list: RenewCostCenterFilterList[]
  [property: string]: any
}

export interface RenewCostCenterFilterList {
  /**
   * 数量
   */
  num: number
  /**
   * 产品列表
   */
  productList: RenewCostCenterFilterProductList[]
  /**
   * 时间类型，0全部 1 7天内到期  2 15天到期  3 30天到期 4 3个月到期
   */
  timeType: number
  [property: string]: any
}

export interface RenewCostCenterFilterProductList {
  /**
   * 数量
   */
  num: number
  /**
   * 产品ID
   */
  productId: string
  /**
   * 产品名称
   */
  productName: string
  /**
   * 地区数量列表
   */
  regionNums: RenewCostCenterFilterRegionNum[]
  [property: string]: any
}

export interface RenewCostCenterFilterRegionNum {
  /**
   * 数量
   */
  num: number
  /**
   * 地区ID
   */
  regionId: string
  /**
   * 地区名称
   */
  regionName: string
  [property: string]: any
}
