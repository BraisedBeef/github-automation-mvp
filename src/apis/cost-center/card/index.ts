import { requestCs as request } from '@/request/http/index'
import { GetCreditcardReq, AddCreditcardReq, RemoveCreditcardReq, SetDefaultCreditcardReq } from './type'

// 信用卡列表
export const _getCreditcardList = () => {
  return request.get('/userApi/creditcard/getCreditcardList')
}

// 查询信用卡
export const _getCreditcard = (params: GetCreditcardReq) => {
  return request.get('/userApi/creditcard/getCreditcard', params)
}

// 添加信用卡
export const _addCreditcard = (data: AddCreditcardReq) => {
  return request.post('/userApi/creditcard/addCreditcard', data)
}

// 删除信用卡
export const _removeCreditcard = (data: RemoveCreditcardReq) => {
  return request.post('/userApi/creditcard/removeCreditcard', data)
}

// 设置默认支付信用卡
export const _setDefaultCreditcard = (data: SetDefaultCreditcardReq) => {
  return request.post('/userApi/creditcard/setDefaultCreditcard', data)
}
