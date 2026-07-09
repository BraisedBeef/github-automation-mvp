import { defineStore } from 'pinia'
import { CVM_STORE } from '@/config/constant-config'

export type AreaSelectType = {
  id: number
  locationId: number
  [x: string]: any
}

export type TimeCostReduceConfigOrderType = {
  [serialNo: string]: any
}

export type RefundOrderType = {
  inquiryReqParams: any
  refundReqParams: any
}

export default defineStore(CVM_STORE, {
  state: () => {
    return {
      areaSelect: {
        id: 0,
        locationId: 0, // 当前地域
      } as AreaSelectType,
      areaList: [] as any[], // 所有地域
      regionName: '' as string, // 地域名称
      timeCostReduceConfigOrder: {} as TimeCostReduceConfigOrderType, // 包年包月降配订单
      refundOrder: {
        inquiryReqParams: {}, // 询价参数
        refundReqParams: {}, // 退款参数
      } as RefundOrderType, // 退款订单
    }
  },
  getters: {},
  actions: {
    setAreaSelect(areaSelect: AreaSelectType) {
      console.log(`setAreaSelect===>`, areaSelect)
      this.areaSelect = areaSelect
    },
    setAreaList(areaList: any[]) {
      console.log(`setAreaList===>`, areaList)
      this.areaList = areaList
    },
    setRegionName(regionName: string) {
      this.regionName = regionName
    },
    setTimeCostReduceConfigOrder(reqParams: any, serialNo: string) {
      this.timeCostReduceConfigOrder[serialNo] = reqParams
    },
    setRefundOrder(inquiryReqParams: any, refundReqParams: any) {
      this.refundOrder.inquiryReqParams = inquiryReqParams
      this.refundOrder.refundReqParams = refundReqParams
    },
  },
  persist: true,
})
