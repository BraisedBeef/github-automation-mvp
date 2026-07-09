import { useBaseStore, useUserStore, useLoginStore } from '@/store'
import { message } from '@/utils/message'
import { addUserInfoCookie } from '@/views/v2/auth/config'
import { setCookies } from '@/utils/cookie'
import { _setItem } from '@/utils/storage'
import { TOKEN, USER_STORE, LANGUAGE_MAP, DOMAIN_DICT } from '@/config/constant-config'
import t from '@/utils/i18n'
import { _login } from '@/apis/login'
import { _getSyDict } from '@/apis/domain'
import { pushRoute } from '@/utils/router-jump'

export const useLogin = () => {
  const userStore = useUserStore()
  const baseStore = useBaseStore()
  const loginStore = useLoginStore()
  const route = useRoute()

  const loading = ref<boolean>(false) // login status

  /**
   * @name 登录
   * @desc 入口1：控制台登录:登录成功后跳转layout
   * @desc 入口2：云服务官网登录：domian?redirect_url=xxx，登录成功后跳转到云服务官网，实现1级域名共享userinfo和token
   */
  const login = async (loginType, loginForm) => {
    // console.log(`login===>`, loginType, loginForm)

    try {
      loading.value = true
      // console.log(`loading===>`, loading.value)

      // 重定向地址
      const redirect_url = route.query?.redirect_url as string

      // 海外 主账号/子用户登录
      if (['mainAccount', 'subAccount'].includes(loginType)) {
        const res = await _login(loginForm)
        console.log(`res===>`, res)

        if (res.success) {
          // 存放token
          _setItem(TOKEN, res.data.token)
          userStore.setToken(res.data.token)
          userStore.setUser(res.data)

          // 存放cookie
          setCookies(TOKEN, res.data.token)
          setCookies(USER_STORE, JSON.stringify(addUserInfoCookie(res.data)))

          // 获取并存放域名字典
          _getSyDict().then(({ code, data, message }) => {
            if (code === 20000) {
              _setItem(DOMAIN_DICT, JSON.stringify(data))
            } else {
              console.error(message)
            }
          })
          message.success(t('login.loginSuccess'))

          // 更新lang
          const cb = () => {
            if (res.data.langCode) {
              const key = res.data.langCode.split('-')[0]
              console.log(`cb===>`, res.data.langCode, res.data.langCode.split('-'), key)

              const lang = LANGUAGE_MAP[key].i18nParam
              baseStore.switchLanguage(lang)
            }

            loginStore.clearAll()
          }

          // 需要重定向
          if (redirect_url) {
            // window.open(redirect_url, '_self ')
            window.location.href = redirect_url
          } else {
            // 无需重定向
            pushRoute({
              name: 'Layout',
            }).then(() => cb())
          }
        } else {
          message.warning(res.msg)
        }

        // 20029 => 密码重置
        if (res.code === 20029) {
          console.log(`密码重置页面===>`)

          pushRoute({ name: 'ForgetPwd' })
        }

        // 20042 => 登录保护
        // 20044 => 异地登录
        if (res.code === 20042 || res.code === 20044) {
          console.log(`登录验证页面===>`)

          loginStore.setLoginProtectForm({
            email: res.data?.contactEmail || '',
          })

          loginStore.setLoginType(loginType)

          loginStore.setLoginForm(loginForm)

          const query = redirect_url
            ? {
                type: res.code === 20042 ? 'loginProtection' : 'remoteLogin',
                redirect_url,
              }
            : {
                type: res.code === 20042 ? 'loginProtection' : 'remoteLogin',
              }
          pushRoute({ name: 'LoginProtect', query })
        }
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    login,
  }
}
