import { useUserStore } from '@/store'
import { PermissionType } from '@/store/user'

const userStore = useUserStore()

/**
 * @desc 弹出权限提示弹窗
 */
const dialog = (permission: PermissionType) => {
  userStore.setPermission(permission)
}

/**
 * @desc 是否有该权限
 */
const checkPermission = (perm: string | string[]) => {
  // console.log(`perm===>`, perm, userStore.user.permissions)

  const permissions = userStore.user.permissions || [] // 所有权限集合
  const accountType = userStore.user.accountType

  if (accountType == 1) {
    // 主账户 默认拥有所有权限
    return true
    // return false
  } else {
    // 子用户
    if (permissions.includes('**')) {
      return true // 子用户拥有最高权限
    } else {
      if (perm instanceof Array) {
        return perm.every(el => permissions.includes(el))
      } else {
        return permissions.includes(perm)
      }
    }
  }
}

/**
 * @name 控制权限提示弹窗和是否有该权限结果
 */
export const usePermission = (permStr: string | string[]) => {
  const perm = ref<string | string[]>(permStr) // 权限标识符
  const checkPermissionRes = ref<boolean>(false) // 是否有权限

  watch(
    () => userStore.user,
    () => {
      checkPermissionRes.value = checkPermission(perm.value)
    },
    {
      immediate: true,
      deep: true,
    },
  )

  return {
    dialog,
    checkPermissionRes: checkPermissionRes.value,
  }
}
