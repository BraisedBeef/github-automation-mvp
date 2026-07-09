import { useUserStore } from '@/store'

/**
 * @name 该指令适用于布局权限
 * @desc 权限处理方式如下:
 * @desc 页面权限 (无权限时 页面展示无权限) 须在路由表配置 permissions字段
 * @desc 表格权限 (无权限时 表格内容展示无权限)
 * @desc 布局权限 (无权限时用v-if v-show 布局 或者 使用v-permission自定义指令)
 * @desc 按钮权限（无权限时点击弹出无权限弹窗)
 * @desc 上面权限都有对应样式看设计图
 */
export const permission = {
  mounted(el: HTMLElement, binding: any) {
    // console.log(`注册权限指令===>`, binding)
    const userStore = useUserStore()
    const permissions = userStore.user.permissions || [] // 所有权限集合
    const accountType = userStore.user.accountType

    // 子用户
    if (accountType !== 1) {
      let checkPermissionRes = false

      if (permissions.includes('**')) {
        checkPermissionRes = true // 子用户拥有最高权限
      } else {
        if (binding.value instanceof Array) {
          checkPermissionRes = binding.value.every(el => permissions.includes(el))
        } else {
          checkPermissionRes = permissions.includes(binding.value)
        }
      }

      console.log(`checkPermissionRes===>`, checkPermissionRes)

      if (!checkPermissionRes) {
        el.style.display = 'none'
      }
    } else {
      // 主账户 默认拥有所有权限
      // el.style.display = 'none'
    }
  },
}

export default permission
