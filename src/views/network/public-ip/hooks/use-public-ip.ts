import { createEip, batchUpdateEip, renewEip } from '@/apis/network/public-ip'
import { message } from '@/utils/message'
import { useProductOrder } from '@/views/cost-center/hooks/use-product-order'
import { useNetworkStore } from '@/store'

import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
import { pushRoute } from '@/utils/router-jump'

/**
 * @name 弹性公网ip
 */
export const usePublicIp = () => {
  const networkStore = useNetworkStore()
  const loading = ref<boolean>(false)
  // const { createProductOrder } = useProductOrder()
  const { toPrePayOrder } = usePreProductOrder()

  // 创建弹性公网ip
  const createPublicIp = async (params: any, cb: () => void = () => {}) => {
    try {
      loading.value = true
      const res = await createEip(params)
      if (res.success) {
        // message.success(res.msg)
        // 包年包月
        if (params.chargeType === 2) {
          // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'eip')
          res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'eip')
        } else {
          // 按需计费 或 共享流量包
          cb && cb()
        }
      } else {
        message.warning(res.msg)
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  // 调整网络
  const adjustNetwork = async (params: any, cb: () => void = () => {}) => {
    try {
      loading.value = true
      const res = await batchUpdateEip(params)
      if (res.success) {
        // message.success(res.msg)
        // 包年包月
        if (params.chargeType === 2) {
          // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'eip')
          res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'eip')
        } else {
          // 按需计费
          cb && cb()
        }
      } else {
        message.warning(res.msg)
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  // 续费
  const renewNetwork = async (params: any) => {
    try {
      loading.value = true
      const res = await renewEip(params)
      if (res.success) {
        // message.success(res.msg)
        // 只有包年包月有续费
        // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'eip')
        res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'eip')
      } else {
        message.warning(res.msg)
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  // 生成弹性公网ip订单
  const setPublicIpOrder = (
    reqParams: any,
    list: any[],
    price: string | number,
    type: 'create' | 'adjust' | 'renew',
  ) => {
    networkStore.setTimeCostOrder(reqParams, list, price)
    pushRoute({
      name: 'public_ip_order',
      query: {
        operate: type,
        product: 'eip',
      },
    })
  }

  return {
    loading,
    createPublicIp,
    adjustNetwork,
    renewNetwork,
    setPublicIpOrder,
  }
}
