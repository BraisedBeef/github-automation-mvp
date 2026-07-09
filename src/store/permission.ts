import { defineStore } from 'pinia'
import { PERM_STORE } from '@/config/constant-config'
import { _getUserCdnMenus } from '@/apis/cdn/permission'

/**
 * @desc 权限(角色策略权限，产品开通权限，cvm功能权限，cdn菜单权限)
 */

type RolePermType = {
  showDialog: boolean
  dialogText: string
  perms: string[]
}

type CdnPermType = {
  showOfflineLogMenu: boolean
  menus: any[]
}

export type DialogStateType = { showDialog: true; dialogText: string } | { showDialog: false }

const initState = () => {
  return {
    role: {
      showDialog: false, // 显示角色策略权限弹窗
      dialogText: '', // 角色策略权限弹窗文案
      perms: [], // 登录用户所有角色策略权限标识
    } as RolePermType,
    cdn: {
      showOfflineLogMenu: false, // 显示离线日志菜单
      menus: [], // 登录用户所有cdn权限菜单
    } as CdnPermType,
    cvm: {},
    product: {
      onlins: [], // 所有上线产品
    },
  }
}

export default defineStore(PERM_STORE, {
  state: () => {
    return initState()
  },
  getters: {},
  actions: {
    setRoleDialog(dialogState: DialogStateType) {
      this.role.showDialog = dialogState.showDialog

      if (dialogState.showDialog) {
        this.role.dialogText = dialogState.dialogText
      }
    },
    cleanPermission() {
      this.role = {
        showDialog: false,
        dialogText: '',
        perms: [],
      }

      this.cdn = { showOfflineLogMenu: false, menus: [] }
      this.cvm = {}
      this.product = { onlins: [] }
    },
    setRolePerms(perms: string[]) {
      this.role.perms = perms
    },
    setCdnMenus(menus: any[]) {
      this.cdn.menus = menus
      const offlineLog = menus.find(el => el.id === 'cdn_offline_log')

      this.cdn.showOfflineLogMenu = offlineLog?.status ? true : false
    },
    async getUserCdnMenus() {
      try {
        const res = await _getUserCdnMenus()
        this.setCdnMenus(res.data?.menus || [])
        return res.data
      } catch (error) {
        return {}
      }
    },
  },
  persist: true,
})
