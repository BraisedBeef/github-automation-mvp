import { _createProductOrder } from '@/apis/cost-center/payment'

import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'

/**
 * @desc 创建包年包月产品订单
 */
export type BusinessType =
  | 'recharge'
  | 'cdn'
  | 'order'
  | 'cvm'
  | 'domain'
  | 'cbs'
  | 'eip'
  | 'flow_packet'
  | 'renew'
  | 'oss'

export const useProductOrder = () => {
  // 通过type跳转支付页面
  const toPayment = (tradeNo: string, type: BusinessType) => {
    pushRoute({
      name: 'payment_product_order',
      params: {
        tradeNo,
      },
      query: {
        type,
      },
    })
  }
  const loading = ref<boolean>(false)

  // 通过预订单流水号跳转支付页面
  const createProductOrder = async (serialNo: string, type: BusinessType) => {
    try {
      loading.value = true
      const res = await _createProductOrder({
        serialNo,
      })
      if (res.success) {
        res?.data.tradeNo && toPayment(res?.data.tradeNo, type)
      } else {
        message.warning(res.msg)
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    createProductOrder,
    toPayment,
  }
}
