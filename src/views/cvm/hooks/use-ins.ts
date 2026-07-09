import {
  _createInstance,
  _listInstance,
  _createInstanceInquiry,
  _instanceRenew,
  _refundInstance,
  _changeServerType,
  _createInstanceVerify,
  _createInstanceDryRun,
  _getSpecificationsList,
  _listInstanceDetail,
  _modifyInstancesChargeType,
} from '@/apis/cvm/ins'
import { message } from '@/utils/message'
// import { useProductOrder } from '@/views/cost-center/hooks/use-product-order'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
import { useCvmInsCreateStore, useCvmInsFastCreateStore, useCvmStore } from '@/store'

import { getEipLineType as _getEipLineType } from '@/apis/network/public-ip'
import { shareTrafficPackageList } from '@/apis/network/flow-packet'
import { pushRoute, replaceRoute, backRoute } from '@/utils/router-jump'
interface PriceItem {
  discount: number
  discountPrice: number
  originalPrice: number
  oneMonthDiscountPrice: number
}

/**
 * @name 服务器
 */
export const useIns = () => {
  const route = useRoute()
  const cvmInsCreateStore = useCvmInsCreateStore()
  const cvmInsFastCreateStore = useCvmInsFastCreateStore()
  const cvmStore = useCvmStore()
  // const { createProductOrder } = useProductOrder()
  const { toPrePayOrder, toPreRefundOrder } = usePreProductOrder()

  // 是否默认方式创建，如购买相同配置实例，镜像创建实例，官网购买场景 则不是
  const isDefaultCreateStr = route.query.isDefaultCreate as string
  const isDefaultCreate = isDefaultCreateStr === 'true'
  const loading = ref<boolean>(false)
  // 创建服务器-询价
  const createInsPrice = reactive<{
    dataDiskPrice: PriceItem
    imagePrice: PriceItem
    instancePrice: PriceItem
    networkPrice: PriceItem
    systemDiskPrice: PriceItem
    dataDiskDetailedPrice: any[]
    queryEipPriceRespDTO: any
  }>({
    dataDiskPrice: {
      discount: 0,
      discountPrice: 0,
      originalPrice: 0,
      oneMonthDiscountPrice: 0,
    },
    imagePrice: {
      discount: 0,
      discountPrice: 0,
      originalPrice: 0,
      oneMonthDiscountPrice: 0,
    },
    instancePrice: {
      discount: 0,
      discountPrice: 0,
      originalPrice: 0,
      oneMonthDiscountPrice: 0,
    },
    networkPrice: {
      discount: 0,
      discountPrice: 0,
      originalPrice: 0,
      oneMonthDiscountPrice: 0,
    },
    systemDiskPrice: {
      discount: 0,
      discountPrice: 0,
      originalPrice: 0,
      oneMonthDiscountPrice: 0,
    },
    dataDiskDetailedPrice: [],
    queryEipPriceRespDTO: {},
  })

  /**
   * @desc 创建实例预付款订单
   * @parmas timeCost：计费模式是否为包年包月
   */
  const createInstance = async (timeCost: boolean, params: any, cb?: () => void) => {
    try {
      loading.value = true
      const res = await _createInstance(params)
      console.log(`_createInstance===>`, res)

      if (res.success) {
        cb?.()

        // 包年包月
        if (timeCost) {
          // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'cvm')
          res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'cvm')
        } else {
          // 按需计费
          // backRoute()
          replaceRoute({ name: 'ins' })
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

  // 续费实例
  const instanceRenew = async (params: any) => {
    try {
      loading.value = true
      const res = await _instanceRenew(params)
      console.log(`_instanceRenew===>`, res)

      if (res.success) {
        // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'cvm')
        res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'cvm')
      } else {
        message.warning(res.msg)
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  // 按量转包年包月
  const modifyInstancesChargeType = async (params: any) => {
    try {
      loading.value = true
      const res = await _modifyInstancesChargeType(params)
      console.log(`_modifyInstancesChargeType===>`, res)

      if (res.success) {
        // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'cvm')
        res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'cvm')
      } else {
        message.warning(res.msg)
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  // 创建服务器-询价
  const createInstanceInquiry = async (params: any) => {
    try {
      console.log(`_createInstanceInquiry params===>`, params)

      const res = await _createInstanceInquiry(params)

      console.log(`_createInstanceInquiry===>`, res)

      if (res.success) {
        createInsPrice.dataDiskPrice = res.data?.dataDiskPrice
        createInsPrice.imagePrice = res.data?.imagePrice
        createInsPrice.instancePrice = res.data?.instancePrice
        createInsPrice.networkPrice = res.data?.networkPrice
        createInsPrice.systemDiskPrice = res.data?.systemDiskPrice
        createInsPrice.dataDiskDetailedPrice = res.data?.dataDiskDetailedPrice
        createInsPrice.queryEipPriceRespDTO = res.data?.queryEipPriceRespDTO
      } else {
        for (const key in createInsPrice) {
          if (key === 'dataDiskDetailedPrice') {
            createInsPrice[key] = []
          } else if (key === 'queryEipPriceRespDTO') {
            createInsPrice[key] = {}
          } else {
            createInsPrice[key] = {
              discount: 0,
              discountPrice: 0,
              originalPrice: 0,
              oneMonthDiscountPrice: 0,
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  // 分页查询服务器列表
  const listInstance = async (params: any, cb?: (p: any) => void) => {
    try {
      loading.value = true
      const res = await _listInstance(params)
      console.log(`_listInstance===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * @desc 退还/销毁服务器
   * @parmas timeCost：计费模式是否为包年包月
   */
  const refundInstance = async (timeCost: boolean, params: any, cb?: () => void) => {
    try {
      loading.value = true
      const res = await _refundInstance(params)
      console.log(`_refundInstance===>`, res)
      if (res.success) {
        // 包年包月 按需计费
        if (timeCost) {
          cb?.()
        } else {
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

  /**
   * @desc 切换服务器规格=>升配/降配
   * @parmas timeCost：计费模式是否为包年包月
   * @parmas upgrade：是否升配
   */
  const changeServerType = async (timeCost: boolean, params: any, upgrade: boolean, cb?: () => void) => {
    try {
      loading.value = true
      const res = await _changeServerType(params)
      console.log(`_changeServerType===>`, res)
      if (res.success) {
        // 包年包月
        if (timeCost) {
          // 升配
          if (upgrade) {
            // res.data?.serialNo && createProductOrder(res.data?.serialNo, 'cvm')
            res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'cvm')
          } else {
            // 降配
            if (params.createPreRefundOrder) {
              // 创建预退款单号
              if (res.data?.serialNo) {
                cvmStore.setTimeCostReduceConfigOrder({ ...params, createPreRefundOrder: false }, res.data?.serialNo)
                toPreRefundOrder(res.data?.serialNo, 'ins', 'setconfig')
              }
            } else {
              // 退钱
              pushRoute({ name: 'ins' })
              message.success(res.msg)
            }
          }
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

  // 查询地区下支持的EIP线路
  const getEipLineType = async (params: any, cb?: (p: any) => void) => {
    try {
      const res = await _getEipLineType(params)
      console.log(`_getEipLineType===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  // 创建服务器-库存验证
  const createInstanceVerify = async (params: any, cb?: (p: any) => void) => {
    loading.value = true
    return _createInstanceVerify(params)
      .then(res => {
        console.log(`_createInstanceVerify===>`, res)
        loading.value = false
        cb?.(res)
        return res.success
      })
      .catch(() => {
        loading.value = false
        return false
      })
  }

  // 查询共享流量包列表
  const getShareTrafficPackageList = async (params: any, cb?: (p: any) => void) => {
    try {
      const res = await shareTrafficPackageList(params)
      console.log(`shareTrafficPackageList===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  // 创建服务器-预检
  const createInstanceDryRun = async (params: any, cb?: (p: any) => void) => {
    loading.value = true
    return _createInstanceDryRun(params)
      .then(res => {
        console.log(`_createInstanceDryRun===>`, res)
        loading.value = false
        cb?.(res)
        return res.success
      })
      .catch(() => {
        loading.value = false
        return false
      })
  }

  // 购买实例-自定义配置-查询创建服务器规格列表
  const getSpecificationsList = async (params: any, cb?: (p: any) => void) => {
    try {
      const res = await _getSpecificationsList(params)
      console.log(`_getSpecificationsList===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  // 获取服务器详细信息
  const listInstanceDetail = async (params: any, cb?: (p: any) => void) => {
    try {
      loading.value = true
      const res = await _listInstanceDetail(params)
      console.log(`_listInstanceDetail===>`, res)

      cb?.(res)
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    createInstance,
    createInstanceInquiry,
    createInsPrice,
    isDefaultCreate,
    listInstance,
    instanceRenew,
    modifyInstancesChargeType,
    refundInstance,
    changeServerType,
    cvmInsCreateStore,
    cvmInsFastCreateStore,
    getEipLineType,
    createInstanceVerify,
    getShareTrafficPackageList,
    createInstanceDryRun,
    getSpecificationsList,
    listInstanceDetail,
  }
}
