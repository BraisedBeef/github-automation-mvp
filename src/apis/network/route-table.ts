import { requestCvmBaseCs as request } from '@/request/http/index'
import { QueryRouteTablePageType, QueryRouteTableDetailType, UpdateRouteTableNameType } from './type/route-table'

// 查询路由表列表
export const getQueryRouteTablePage = (data: QueryRouteTablePageType) => {
  return request({
    url: 'network/rb/queryRouteTablePage',
    method: 'post',
    data,
  })
}

// 查询路由表详情
export const getQueryRouteTableDetail = (data: QueryRouteTableDetailType) => {
  return request({
    url: 'network/rb/queryRouteTableDetail',
    method: 'post',
    data,
  })
}

// 更新路由表名称
export const getUpdateRouteTableName = (data: UpdateRouteTableNameType) => {
  return request({
    url: 'network/rb/updateRouteTableName',
    method: 'post',
    data,
  })
}
