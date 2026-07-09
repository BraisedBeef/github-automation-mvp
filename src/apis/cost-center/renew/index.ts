import { requestCs as request } from '@/request/http/index'
import type { CostCenterResponse } from './type'

// 获取续费产品筛选条件
export const _getRenewFilter = (data: { timeType: number }): Promise<any> => {
  return request({
    url: '/feeApi/renew/queryRenewResourceNum',
    method: 'POST',
    data,
  })
}

// 获取续费产品列表
export const _getRenewList = (data: {
  timeType?: number
  productId: string
  regionId: string
  renewType: number
  resourceId?: string
  resourceName?: string
  pageIndex: number
  pageSize: number
}) => {
  return request({
    url: '/feeApi/renew/queryRenewResourceList',
    method: 'POST',
    data,
  })
}

// 查询续费价格
export const _getRenewPrice = (data: {
  /**
   * 产品类别ID
   */
  productId: string
  /**
   * 地域ID
   */
  regionId: string
  /**
   * 续费时长
   */
  period: number
  /**
   * 资源IDs
   */
  ids: string[]
}) => {
  return request({
    url: '/feeApi/renew/queryRenewPrice',
    method: 'POST',
    data,
  })
}

// 更新续费标识
export const _modifyRenewFlag = data => {
  return request({
    url: '/feeApi/renew/modifyRenewFlag',
    method: 'POST',
    data,
  })
}

// 续费
export const _renewOrder = data => {
  return request({
    url: '/feeApi/renew/createRenewResourceOrder',
    method: 'POST',
    data,
  })
}
