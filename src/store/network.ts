import { defineStore } from 'pinia'
import { NETWORK_STORE } from '@/config/constant-config'

export type TimeCostOrderType = {
  reqParams: any
  list: any[]
  price: string | number
}

export type RefundOrderType = {
  inquiryReqParams: any
  refundReqParams: any
}

export default defineStore(NETWORK_STORE, {
  state: () => {
    return {
      timeCostOrder: {
        reqParams: {},
        price: '',
        list: [],
      } as TimeCostOrderType, // 包年包月订单
      refundOrder: {
        inquiryReqParams: {}, // 询价参数
        refundReqParams: {}, // 退款参数
      } as RefundOrderType, // 退款订单
    }
  },
  getters: {},
  actions: {
    setTimeCostOrder(reqParams: any, list: any[], price: string | number) {
      this.timeCostOrder.reqParams = reqParams
      this.timeCostOrder.list = list
      this.timeCostOrder.price = price
    },
    setRefundOrder(inquiryReqParams: any, refundReqParams: any) {
      this.refundOrder.inquiryReqParams = inquiryReqParams
      this.refundOrder.refundReqParams = refundReqParams
    },
  },
  persist: {
    storage: sessionStorage,
  },
})
