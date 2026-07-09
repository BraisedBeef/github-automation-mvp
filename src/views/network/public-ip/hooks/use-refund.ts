import { _refundInstanceInquiry } from '@/apis/cvm/ins'
import { batchReleaseEip } from '@/apis/network/public-ip'

import { useNetworkStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

/**
 * @name 退款
 */
export const useRefund = () => {
  const loading = ref<boolean>(false)
  const networkStore = useNetworkStore()

  // 退还/销毁服务器-询价
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
   * @desc 批量释放公网IP
   * @params params 接口如参
   * @params cb 成功回调
   */
  const setBatchReleaseEip = async (params: any, cb?: (p: any) => void) => {
    try {
      loading.value = true
      const res = await batchReleaseEip(params)
      console.log(`batchReleaseEip===>`, res)
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
    product: 'eip',
    operate: 'destruction',
  ) => {
    networkStore.setRefundOrder(inquiryReqParams, refundReqParams)
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
    setBatchReleaseEip,
    setRefundOrder,
  }
}
