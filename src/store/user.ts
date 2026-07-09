import { defineStore } from 'pinia'
import { _getDetail } from '@/apis/account-system/user'
import { _logout } from '@/apis/login'
import { _remove, removeLocalItem, removeSessionItem } from '@/utils/storage'

import { AUTH_CONTINUE, BASE_STORE, TOKEN, USER_STORE } from '@/config/constant-config'
import useBaseStore from './base'
import useOssStore from './oss'
import { removeCookies } from '@/utils/cookie'
import { clearTaskManagerInstance } from '@/views/oss/hooks/use-task-manager'

/**
 * @desc 用户
 */

export type User = any
export type PermissionType = {
  show: boolean
  i18nKey: string
}

const useUserStore = defineStore(USER_STORE, {
  state: () => {
    return {
      user: {} as User, // userinfo
      permissionDialog: {
        show: false,
        i18nKey: '',
      } as PermissionType, // 权限弹窗
      token: '',
    }
  },
  getters: {},
  actions: {
    async getUser() {
      try {
        const res = await _getDetail()
        if (res.success) {
          this.user = res.data
        }

        return res.data
      } catch (error) {
        console.log('获取user失败', error)
      }
    },
    setUser(userInfo: User) {
      this.user = userInfo
    },
    setToken(token: string) {
      this.token = token
    },
    setPermission(permissionDialog: PermissionType) {
      this.permissionDialog = permissionDialog
    },
    async logOut() {
      const res = await _logout()
      if (res.success) {
        const { goRoute, pushRoute } = await import('@/utils/router-jump')
        removeCookies(TOKEN)
        removeCookies(USER_STORE)
        // useBaseStore().selectedKeys = ''
        useBaseStore().initAccessHistory({})
        removeLocalItem('accessHistory')
        _remove(TOKEN)
        _remove(USER_STORE)
        _remove(BASE_STORE)
        _remove(AUTH_CONTINUE)
        removeSessionItem('cdn_domain_page_type')
        removeSessionItem('cdn_monitor_tab_type')
        removeSessionItem('cdn_count_tab_type')
        pushRoute({ name: 'Login' }).then(() => {
          goRoute(-window.history.length - 1)
        })
        // 清空oss 任务中心数据
        const ossStore = useOssStore()
        ossStore.clearTasks()
        // 断开websocket连接
        clearTaskManagerInstance()
      }
    },
  },
  persist: true,
})

export const userId = () => {
  return useUserStore() ? useUserStore().user.id : null
}

export default useUserStore
