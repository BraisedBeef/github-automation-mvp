import { ElNotification } from 'element-plus'
import { h } from 'vue'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import t from '@/utils/i18n'

type NotifyOptions = string | Record<string, any>

const formatOptions = (options: NotifyOptions, defaults: Record<string, any> = {}) => {
  if (typeof options === 'string') {
    return {
      ...defaults,
      message: options,
    }
  }
  return {
    ...defaults,
    ...options,
  }
}

const notify = ((options: NotifyOptions) => {
  return ElNotification(formatOptions(options))
}) as any

notify.success = (options: NotifyOptions) => ElNotification.success(formatOptions(options))
notify.warning = (options: NotifyOptions) => ElNotification.warning(formatOptions(options))
notify.info = (options: NotifyOptions) => ElNotification.info(formatOptions(options))
notify.error = (options: NotifyOptions) => ElNotification.error(formatOptions(options))
notify.primary = (options: NotifyOptions) => ElNotification.primary(formatOptions(options))
notify.closeAll = () => ElNotification.closeAll()

export const notifyStatus = (params: {
  type: 'success' | 'failed'
  msg: string
  duration?: number
  showClose?: boolean
}) => {
  const icon = {
    success: 'dialog-success',
    failed: 'dialog-failed',
  }
  return notify({
    customClass: `notification-${params.type}`,
    offset: 100,
    duration: params.duration ?? 1500,
    showClose: params.showClose ?? true,
    dangerouslyUseHTMLString: true,
    message: h('div', { style: 'display:flex;align-items:center' }, [
      h(SvgIcon, { name: icon[params.type], style: 'margin-right: 6px;' }),
      h('div', {}, t(params.msg)),
    ]),
  })
}

export const notifyLoading = (params: { msg: string; duration?: number }) => {
  return notify({
    offset: 100,
    duration: params.duration ?? 1500,
    showClose: false,
    dangerouslyUseHTMLString: true,
    message: h('div', { style: 'display:flex;align-items:center' }, [
      h(SvgIcon, {
        name: 'dialog-loading',
        loading: true,
        style: 'margin-right:6px',
      }),
      h('div', {}, t(params.msg)),
    ]),
  })
}

export { notify }
export default notify
