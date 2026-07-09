import { _checkOssWhite } from '@/apis/oss/user'
import OssOpenFailDialog from '../components/oss-open-fail-dialog.vue'
import { h, render } from 'vue'

import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'

export const useOpenOss = () => {
  const isOssWhite = ref<boolean>(true) // 是否白名单

  // 获取oss白名单信息
  const checkOssWhite = async () => {
    try {
      const res = await _checkOssWhite()

      if (res.success) {
        isOssWhite.value = res.data?.white
      } else {
        isOssWhite.value = false
      }
    } catch (err) {
      console.log('err', err)
    }
  }

  const openDialog = () => {
    const container = document.createElement('div')

    const vnode = h(OssOpenFailDialog, {
      onGoRecharge() {
        pushRoute({
          name: 'cost_center_account_recharge',
          query: {
            title: 'accountCostCenter.accountInfo',
            path: '/cost-center/account/info',
          },
        })
        render(null, container)
        container.remove()
      },
    })

    render(vnode, container)
    document.body.appendChild(container)
  }

  // oss跳转
  const openOss = (openRes: { code: number; success: boolean; msg: string }) => {
    if (openRes.success) {
      // 开通成功：若大于等于50USD则点击【开通服务】按钮 → 显示完整控制台并跳转到存储桶列表页
      message.success(openRes.msg)
      pushRoute({ name: 'bucket' })
    } else {
      // 开通失败：小于50USD则点击【开通服务按钮】 → 显示开通失败提示弹窗
      if (openRes.code === 20061) {
        openDialog()
      } else {
        message.warning(openRes.msg)
      }
    }
  }

  onMounted(() => {
    // checkOssWhite()
  })

  return {
    openOss,
    toOss: () => pushRoute({ name: 'bucket' }),
  }
}
