import { defineStore } from 'pinia'
import { LOGIN_STORE } from '@/config/constant-config'

export type LoginProtectForm = {
  email: string
}

export type LoginGoogleForm = LoginProtectForm

export type LoginRedirect = {
  name: string
  params: any
  query: any
}

export type CacheGoogle = {
  code: string
  res: boolean
}

export default defineStore(LOGIN_STORE, {
  state: () => {
    return {
      cacheGoogle: {
        code: '',
        res: false,
      }, // 缓存谷歌登录
      loginGoogleForm: {
        email: '',
      } as LoginGoogleForm, // 谷歌登录
      loginProtectForm: {
        email: '',
      } as LoginProtectForm, // 登录保护
      loginForm: {} as any, // 登录参数 => 登录保护验证通过，需拿参数继续登录
      loginType: '', // 登录类型 => 海外 主账号/子用户登录
    }
  },
  getters: {},
  actions: {
    setCacheGoogle(payload: CacheGoogle) {
      this.cacheGoogle = payload
    },
    clearCacheGoogle() {
      this.cacheGoogle = {
        code: '',
        res: false,
      }
    },
    setLoginGoogleForm(form: LoginGoogleForm) {
      this.loginGoogleForm = form
    },
    clearLoginGoogleForm() {
      this.loginGoogleForm = {
        email: '',
      }
    },
    setLoginProtectForm(form: LoginProtectForm) {
      this.loginProtectForm = form
    },
    clearLoginProtectForm() {
      this.loginProtectForm = {
        email: '',
      }
    },
    setLoginForm(form: any) {
      this.loginForm = form
    },
    clearLoginForm() {
      this.loginForm = {}
    },
    setLoginType(loginType: string) {
      this.loginType = loginType
    },
    clearLoginType() {
      this.loginType = ''
    },
    clearAll() {
      this.clearLoginProtectForm()
      this.clearLoginForm()
      this.clearLoginType()
      this.clearLoginGoogleForm()
      this.clearCacheGoogle()
    },
  },
  persist: true,
})
