import { _refundInstanceInquiry } from '@/apis/cvm/ins'

import { useCvmStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

/**
 * @name
 */
export const useRefund = () => {
  const loading = ref<boolean>(false)
  const cvmStore = useCvmStore()

  // 退还/销毁询价
  const refundInstanceInquiry = async (params, cb?: (p: any) => void) => {
    try {
      loading.value = true
      const res = await _refundInstanceInquiry(params)
      console.log(`_refundInstanceInquiry===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * @desc 生成退款订单
   * @params inquiryReqParams 询价参数
   * @params refundReqParams 退款参数
   */
  const setRefundOrder = (
    inquiryReqParams: any,
    refundReqParams: any,
    routeName: string,
    product: 'ins' | 'disk',
    operate: 'setconfig' | 'destruction',
  ) => {
    cvmStore.setRefundOrder(inquiryReqParams, refundReqParams)

    pushRoute({
      name: routeName,
      query: {
        product,
        operate,
      },
    })
  }

  return {
    loading,
    refundInstanceInquiry,
    setRefundOrder,
  }
}
