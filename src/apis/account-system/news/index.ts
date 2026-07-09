import { requestCs as request } from '@/request/http/index'
import {
  GetUserSubscribeListReq,
  UpdateUserSubscribeReq,
  GetSubscribeManaListReq,
  UpdateDisturbReq,
  UpdateProductSubscribeReq,
  GetSubscribeListReq,
  UpdateUserProductSubscribeReq,
  UpdateBatchProductSubscribeReq,
  SubscribeOverviewReq,
  TelegramBindReq,
  TelegramUnbindReq,
} from './type'

// 用户详情-订阅消息
export const _getUserSubscribeList = (params: GetUserSubscribeListReq) => {
  return request.get('/msgApi/subscribe/getUserSubscribeList', params)
}

// 用户详情-订阅消息-更新消息订阅
export const _updateUserSubscribe = (data: UpdateUserSubscribeReq) => {
  return request.post('/msgApi/subscribe/updateUserSubscribe', data)
}

// 消息订阅-列表
export const _getSubscribeManaList = (data: GetSubscribeManaListReq) => {
  return request.post('/msgApi/subscribe/getList', data)
}

// 消息订阅-消息免打扰设置
export const _updateDisturb = (data: UpdateDisturbReq) => {
  return request.post('/msgApi/subscribe/updateDisturb', data)
}

// 消息订阅-编辑订阅设置
export const _updateProductSubscribe = (data: UpdateProductSubscribeReq) => {
  return request.post('/msgApi/subscribe/updateProductSubscribe', data)
}

// 消息订阅-批量编辑订阅设置
export const _updateBatchProductSubscribe = (data: UpdateBatchProductSubscribeReq) => {
  return request.post('/msgApi/subscribe/updateBatchProductSubscribe', data)
}

// 接收人管理-订阅管理列表
export const _getSubscribeList = (data: GetSubscribeListReq) => {
  return request.post('/msgApi/subscribe/getSubscribeList', data)
}

// 接收人管理-更新账户订阅消息
export const _updateUserProductSubscribe = (data: UpdateUserProductSubscribeReq) => {
  return request.post('/msgApi/subscribe/updateUserProductSubscribe', data)
}

// 接收人管理-产品订阅管理
export const _subscribeOverview = (params: SubscribeOverviewReq) => {
  return request.get('/msgApi/subscribe/subscribeOverview', params)
}

// TG群聊ID，账户绑定发送邮件接口
export const _telegramBind = (data: TelegramBindReq) => {
  return request.post('/telegram/bind', data)
}

// TG解绑
export const _telegramUnbind = (data: TelegramUnbindReq) => {
  return request.post('/telegram/unbind', data)
}
