import { requestCs as request } from '@/request/http/index'
import { OpenProductReq, ListProductSubTypeReq } from './type'

// 开通产品
export const _openProduct = (params: OpenProductReq) => {
  return request.get(`/userApi/openProduct/${params.productId}`)
}

// 查询产品列表
export const _productList = () => {
  return request.get(`/outside/productApi/list`)
}

// 查询子产品类型列表
export const _listProductSubType = (data: ListProductSubTypeReq) => {
  return request.post(`/outside/productApi/listProductSubType`, data)
}
