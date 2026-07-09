import { useUserStore } from '@/store'

import { productOverviews } from '../config'
import { useOpenOss } from './use-open-oss'
import { _openProduct } from '@/apis/product'
import { message } from '@/utils/message'
import { OSS, OSS_KEY } from '@/config/constant-config'
import { owUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

export const useOpen = () => {
  const route = useRoute()
  const userStore = useUserStore()
  const { openOss, toOss } = useOpenOss()

  const loading = ref<boolean>(false)
  const productKey = ref<string>('') // 产品标识
  const productId = ref<string>('') // 产品ID
  const productConfig = ref<any>({}) // 产品

  const isOss = computed(() => {
    return OSS === Number(productId.value) && OSS_KEY === productKey.value
  })

  // 首次开通服务按钮是否禁止
  const disabled = computed(() => {
    // 未上线需要禁止
    if (!productConfig.value?.online) {
      return true
    } else {
      // 上线无需禁止
      return false
    }
  })

  // 首次开通服务是否生效
  const flag = computed(() => {
    return productConfig.value?.flag ? true : false
  })

  // 跳转官网
  const goOfficial = (official: string) => {
    const url = official.includes('https:') ? official : owUrl + official

    official && window.open(url, '_blank')
  }

  // 获取产品
  const getProductConfig = () => {
    if (route.query.product) {
      productKey.value = route.query.product as any
    }

    if (route.query.productId) {
      productId.value = route.query.productId as any
    }

    const productDTOS = userStore.user.productDTOS || []
    const config = productOverviews[productKey.value]
    // console.log(`getProductConfig config===>`, config, productDTOS, productId.value)

    const p = productDTOS.find(product => product.productId == productId.value)
    // console.log(`getProductConfig p===>`, p)

    productConfig.value = {
      ...config,
      ...p,
      online: p ? true : false, // 产品是否上线
    }

    if (flag.value) {
      const { routeName } = productConfig.value.console

      if (routeName) {
        pushRoute({ name: routeName })
      }
    }
  }

  // 开通产品
  const openProductServe = async () => {
    try {
      loading.value = true
      const res = await _openProduct({
        productId: productId.value,
      })

      console.log(`_openProduct===>`, res)

      if (isOss.value) {
        // oss模块开通服务
        openOss({
          msg: res.msg,
          code: res.code,
          success: res.success,
        })
      } else {
        // 其他模块开通服务(cvm/cdn/ssl等)
        if (res.success) {
          message.success(res.msg)
          const { routeName } = productConfig.value.console
          if (routeName) {
            pushRoute({ name: routeName })
          }
        } else {
          message.warning(res.msg)
        }
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  watch(route, () => {
    getProductConfig()
  })

  onMounted(() => {
    getProductConfig()
  })

  return {
    loading,
    disabled,
    openProductServe,
    goOfficial,
    productConfig,
  }
}
