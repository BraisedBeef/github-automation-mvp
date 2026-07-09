import { defineStore } from 'pinia'
import { TEMP_STORE } from '@/config/constant-config'
// tempStore不参与本地缓存: 刷新就会丢失 适用于存放一些不需要缓存的数据
export default defineStore(TEMP_STORE, {
  // 相当于data
  state: () => {
    return {
      showSlider: true, // 是否展示侧边栏
      pageHeader: true, // 是否展示pageHeader -> 关闭后就可以自定义pageHeader了
      prodSlider: false, // 产品的slider
      storageTitleList: [] as string[],
      closeTimeout: undefined as any,
    }
  },
  // 相当于计算属性
  getters: {},
  // 相当于vuex的 mutation + action，可以同时写同步和异步的代码
  actions: {
    set(key: string, value: any) {
      ;(this as any)[key] = value
    },
    get(key: string) {
      return (this as any)[key] || void 0
    },
    setSlider(s: boolean) {
      this.showSlider = s
    },
    setPageHeader(s: boolean) {
      // console.log('触发我', s)

      this.pageHeader = s
    },
    setProdSlider(s: boolean) {
      if (s) {
        if (this.closeTimeout) {
          clearTimeout(this.closeTimeout)
          this.closeTimeout = undefined
        }
        if (this.prodSlider) return
        this.prodSlider = true
        return
      }

      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout)
      }

      if (!this.prodSlider) {
        this.closeTimeout = undefined
        return
      }

      // 给按钮和面板之间的 hover 承接留一点缓冲，避免误关
      this.closeTimeout = setTimeout(() => {
        this.prodSlider = false
        this.closeTimeout = undefined
      }, 160)
    },
    setStorageTitleList(list: string[]) {
      return new Promise(resolve => {
        this.storageTitleList = list
        resolve(1)
      })
    },
  },
})
