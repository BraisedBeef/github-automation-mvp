import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { _getItem, _setItem } from '@/utils/storage'
import { TOKEN, USER_STORE, LANGUAGE_MAP } from '@/config/constant-config'
import { useUserStore, useBaseStore, usePermissionStore } from '@/store'
import { addUserInfoCookie } from '@/views/auth/config'
import { setCookies } from '@/utils/cookie'
import { productMap } from '@/config/constant-config'

export const routerLoading = ref(false)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from) => {
  const permissionStore = usePermissionStore()
  const userStore = useUserStore()

  // 开启路由加载动画
  routerLoading.value = true
  if (to.path === '/layout') {
    return { path: '/home' }
  }

  /**
   * @desc 处理admin端登录跳转
   */
  const admin_token = to.query?.admin_token as string

  if (admin_token) {
    _setItem(TOKEN, admin_token)
    userStore.setToken(admin_token)
    const res = await userStore.getUser()
    setCookies(TOKEN, admin_token)
    setCookies(USER_STORE, JSON.stringify(addUserInfoCookie(res)))

    console.log(`getUser==>`, res)

    if (res.langCode) {
      const key = res.langCode.split('-')[0]
      console.log(`cb===>`, res.langCode, res.langCode.split('-'), key)

      const lang = LANGUAGE_MAP[key].i18nParam
      useBaseStore().switchLanguage(lang)
    }

    // 统一跳转到home页
    return { path: '/home' }
  }

  /**
   * @desc 处理页面访问权限 公共页面/私有页面
   */

  const token = _getItem(TOKEN, true)

  if (to.meta?.public) {
    if (token && to.path === '/login') {
      const redirect_url = to.query?.redirect_url as string
      // console.log(`to===>`, to)

      // 统一跳转到home页
      return redirect_url
        ? {
            path: '/home',
            query: {
              redirect_url,
            },
          }
        : { path: '/home' }
    } else {
      return true
    }
  } else {
    // 登录
    if (token) {
      await userStore.getUser()
      // 产品模块页面
      if (to.meta?.product) {
        await permissionStore.getUserCdnMenus()
        // 所有上线产品
        const onlineProducts = useUserStore().user?.productDTOS || []

        // 产品是否上线
        const isOnline = (p: string) => {
          const products = onlineProducts.map(v => v.symbol.toLocaleLowerCase()) || []
          return products.includes(p)
        }

        // 根据路径获取产品标识 如：/cvm/ins/list 则取 cvm
        const productKey = to.path.split('/')[1].toLocaleLowerCase()

        // 产品参数
        const onlineProduct = onlineProducts.find(item => item.symbol === productKey.toLocaleUpperCase())

        // 产品已上线
        if (isOnline(productKey)) {
          // 处理历史记录
          useBaseStore().setAccessHistory({
            path: '/' + productKey,
            fullPath: to.fullPath,
            name: to.name,
            params: to.params,
            query: to.query,
            meta: to.meta,
          })

          // 产品已开通
          if (onlineProduct.flag) {
            // 处理cdn离线日志
            if (to.name === 'cdn_offline_log' && !permissionStore.cdn.showOfflineLogMenu) {
              return {
                name: '404',
              }
            } else {
              return true
            }
          } else {
            console.log(`产品未开通,导航到产品开通页====>`)
            // 产品未开通,导航到产品开通页
            return {
              path: '/product/overview',
              query: {
                product: onlineProduct.symbol.toLocaleLowerCase(),
                productId: onlineProduct.productId,
              },
            }
          }
        } else {
          // 产品未上线
          const offlineProduct = productMap.find(el => el.productKey === productKey) as any
          const mock = Boolean(offlineProduct.mock)

          return mock
            ? true
            : {
                path: '/product/overview',
                query: {
                  product: offlineProduct.productKey,
                  productId: offlineProduct.productId,
                },
              }
        }
      } else {
        // 非产品模块页面 直接放行
        return true
      }
    } else {
      // 未登录
      const routeNames = ['cdn_buyFlow', 'news_subscribe'] // cdn购买页和消息订阅
      const isRedirect = routeNames.includes(to.name as string)

      return isRedirect
        ? {
            path: '/login',
            query: {
              redirect_url: `${window.location.origin}${to.fullPath}`,
            },
          }
        : { path: '/login' }
    }
  }
})
router.afterEach(() => {
  // 关闭路由加载动画
  routerLoading.value = false
})

router.beforeResolve((to, from) => {
  if (to.meta.backHeader) {
    const backHeader = to.meta.backHeader as Record<string, any>
    let everyHas = false
    for (const key in backHeader) {
      if (backHeader[key] === undefined) {
        everyHas = false
        break
      } else {
        everyHas = true
      }
    }
    if (!everyHas) {
      return { path: '/' }
    }
  }
  return true
})

export default router
