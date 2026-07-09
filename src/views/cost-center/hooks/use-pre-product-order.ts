import { _queryPreProductOrder } from '@/apis/cost-center/payment'

import { BusinessType } from './use-product-order'
import { pushRoute } from '@/utils/router-jump'

/**
 * @desc 包年包月预付款/预退款订单
 */

export type PrePayOrderBusinessType = BusinessType
export type PreRefundOrderProductType = 'ins'
export type PreRefundOrderOperateType = 'setconfig'

export const usePreProductOrder = () => {
  const loading = ref<boolean>(false)

  // 跳转预付款订单页
  const toPrePayOrder = (serialNo: string, type: PrePayOrderBusinessType) => {
    pushRoute({
      name: 'payment_pre_pay_order',
      params: {
        serialNo,
      },
      query: {
        type,
      },
    })
  }

  // 跳转预退款订单页
  const toPreRefundOrder = (
    serialNo: string,
    product: PreRefundOrderProductType,
    operate: PreRefundOrderOperateType,
  ) => {
    pushRoute({
      name: 'payment_pre_refund_order',
      params: {
        serialNo,
      },
      query: {
        product,
        operate,
      },
    })
  }

  // 通过预订单流水号获取详情
  const queryPreProductOrder = async (serialNo: string, cb?: (p: any) => void) => {
    try {
      loading.value = true
      const res = await _queryPreProductOrder({
        serialNo,
      })
      cb?.(res)
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    queryPreProductOrder,
    toPrePayOrder,
    toPreRefundOrder,
  }
}
