import { defineStore } from 'pinia'
import { _setItem, _getItem, setLocalItemRaw } from '@/utils/storage'
import { BASE_STORE, DEFAULT_LANG, LANG, TOKEN, LANGUAGE_MAP } from '@/config/constant-config'
import useUserStore from './user'
import { setCookies } from '@/utils/cookie'

export default defineStore(BASE_STORE, {
  state: () => {
    return {
      collapsed: false, // 侧边栏是否收缩
      projectType: '2', // 1:国内 2:海外
      lang: 'zh' as LangType,
      accessHistory: {} as any,
    }
  },
  getters: {},
  actions: {
    toggleCollaspe() {
      return new Promise(resolve => {
        this.collapsed = !this.collapsed
        resolve(this.collapsed)
      })
    },
    setProjectType(t: '1' | '2') {
      this.projectType = t
      return t
    },
    async switchLanguage(lang: LangType) {
      if (lang === this.lang) return
      if (!lang) return
      setLocalItemRaw(LANG, lang)
      setCookies(LANG, lang) // 设置多语言cookie, 联动官网多语言
      this.lang = lang
      const token = _getItem(TOKEN, true)
      if (token) {
        const { _updateLanguage } = await import('@/apis/account-system/user')
        await _updateLanguage({
          langCode: LANGUAGE_MAP[lang || DEFAULT_LANG]?.apiParam,
        })
      }
      nextTick(() => {
        location.reload()
      })
    },
    userId() {
      return useUserStore().user.id
    },
    setAccessHistory(route: any) {
      const userId = this.userId()
      if (!this.accessHistory[userId]) {
        this.accessHistory[userId] = []
      }
      let index
      for (let i = 0; i < this.accessHistory[userId].length; i++) {
        if (this.accessHistory[userId][i].path === route.path) {
          index = i
          break
        } else {
          index = undefined
        }
      }
      if (index !== undefined) {
        this.accessHistory[userId].splice(index, 1)
      }
      this.accessHistory[userId].unshift(route)
      if (this.accessHistory[userId].length > 6) {
        this.accessHistory[userId] = this.accessHistory[userId].slice(0, 6)
      }
    },
    initAccessHistory(object: object) {
      this.accessHistory = object
    },
  },
  persist: true,
})
