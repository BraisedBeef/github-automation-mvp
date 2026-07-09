import { message } from '@/utils/message'
import {
  _createDisk,
  _computeDiskPrice,
  _renewDisk,
  _recoveryCBS,
  _listDiskPrice,
  _listDisk,
  _resizeDisk,
  _terminateDisks,
  _diskConvertOnDemandToSubscription,
} from '@/apis/cvm/disk'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'

/**
 * @name 硬盘
 */
export const useDisk = () => {
  // const { createProductOrder } = useProductOrder()
  const { toPrePayOrder } = usePreProductOrder()

  const loading = ref<boolean>(false)
  const price = reactive<{
    discountMoney: number
    discountPrice: number
    originalMoney: number
    originalPrice: number
    effectiveMonth: number
    monthDiscountPrice: number
    monthOriginalPrice: number
    refundPrice: number
    resourceDiscountMoney: number
    resourceOriginalMoney: number
  }>({
    discountMoney: 0, // 总价折扣
    discountPrice: 0, // 单价折扣
    originalMoney: 0, // 总价
    originalPrice: 0, // 单价
    effectiveMonth: 0, // 扩容时长
    monthDiscountPrice: 0,
    monthOriginalPrice: 0,
    refundPrice: 0,
    resourceDiscountMoney: 0,
    resourceOriginalMoney: 0,
  })

  // 创建硬盘
  const createDisk = async (params: any, cb = () => {}) => {
    try {
      loading.value = true
      const res = await _createDisk(params)
      console.log(`_createDisk===>`, res)

      if (res.success) {
        // 包年包月
        if (params.costType === 2) {
          // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'cbs')
          res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'cbs')
        } else {
          // 按需计费
          cb?.()
          message.success(res.msg)
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

  // 计算磁盘价格
  const computeDiskPrice = async (params: any) => {
    try {
      // const boolRes = Object.values(params).every(el => Boolean(el))

      const res = await _computeDiskPrice(params)
      console.log(`_computeDiskPrice===>`, res)

      if (res.success) {
        price.discountMoney = res.data?.discountMoney
        price.discountPrice = res.data?.discountPrice
        price.originalMoney = res.data?.originalMoney
        price.originalPrice = res.data?.originalPrice
        price.effectiveMonth = res.data?.effectiveMonth
        price.monthDiscountPrice = res.data?.monthDiscountPrice
        price.monthOriginalPrice = res.data?.monthOriginalPrice
        price.refundPrice = res.data?.refundPrice
        price.resourceDiscountMoney = res.data?.resourceDiscountMoney
        price.resourceOriginalMoney = res.data?.resourceOriginalMoney
      } else {
        for (const key in price) {
          price[key] = 0
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  // 续费硬盘
  const renewDisk = async (params: any) => {
    try {
      loading.value = true
      const res = await _renewDisk(params)
      console.log(`_renewDisk===>`, res)

      if (res.success) {
        // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'cbs')
        res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'cbs')
      } else {
        message.warning(res.msg)
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  // 硬盘按需转包年包月
  const diskConvertOnDemandToSubscription = async (params: any) => {
    try {
      loading.value = true
      const res = await _diskConvertOnDemandToSubscription(params)
      console.log(`_diskConvertOnDemandToSubscription===>`, res)

      if (res.success) {
        // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'cbs')
        res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'cbs')
      } else {
        message.warning(res.msg)
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  // 恢复回收站硬盘
  const recoveryCBS = async (params: any) => {
    try {
      loading.value = true
      const res = await _recoveryCBS(params)
      console.log(`_recoveryCBS===>`, res)

      if (res.success) {
        // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'cbs')
        res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'cbs')
      } else {
        message.warning(res.msg)
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * @desc 扩容硬盘
   * @parmas timeCost：计费模式是否为包年包月
   */
  const resizeDisk = async (timeCost: boolean, params: any, cb?: () => void) => {
    try {
      loading.value = true
      const res = await _resizeDisk(params)
      console.log(`_resizeDisk===>`, res)

      if (res.success) {
        // 包年包月
        if (timeCost) {
          // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'cbs')
          res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'cbs')
        } else {
          // 按需计费
          cb?.()
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

  // 硬盘类型列表
  const listDiskPrice = async (params: any, cb?: (p: any) => void) => {
    try {
      const res = await _listDiskPrice(params)
      console.log(`_listDiskPrice===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  // 硬盘列表
  const listDisk = async (params: any, cb?: (p: any) => void) => {
    try {
      loading.value = true

      const res = await _listDisk(params)
      console.log(`_listDisk===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  // 销毁退还硬盘
  const terminateDisks = async (params: any, cb?: (p: any) => void) => {
    try {
      loading.value = true

      const res = await _terminateDisks(params)
      console.log(`_terminateDisks===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    createDisk,
    computeDiskPrice,
    price,
    renewDisk,
    diskConvertOnDemandToSubscription,
    recoveryCBS,
    resizeDisk,
    listDiskPrice,
    listDisk,
    terminateDisks,
  }
}
