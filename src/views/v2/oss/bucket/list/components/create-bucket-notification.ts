import { h } from 'vue'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { notify } from '@/utils/notification'

export type BucketCreateNotificationType = 'success' | 'failed'

const ICON_MAP: Record<BucketCreateNotificationType, string> = {
  success: 'dialog-success',
  failed: 'dialog-failed',
}

export const showBucketCreateNotification = (params: {
  type: BucketCreateNotificationType
  message: string
  duration?: number
}) => {
  return notify({
    customClass: `oss-bucket-create-notification oss-bucket-create-notification--${params.type}`,
    offset: 100,
    duration: params.duration ?? 3000,
    showClose: true,
    dangerouslyUseHTMLString: true,
    message: h('div', { class: 'oss-bucket-create-notification__body' }, [
      h(SvgIcon, {
        name: ICON_MAP[params.type],
        class: 'oss-bucket-create-notification__icon',
      }),
      h('div', { class: 'oss-bucket-create-notification__text' }, params.message),
    ]),
  })
}
