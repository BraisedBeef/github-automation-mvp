import { ElMessage } from 'element-plus'

type MessageType = 'success' | 'warning' | 'info' | 'error'

interface CatMessageOptions {
  duration?: number
  customClass?: string
  showClose?: boolean
  offset?: number
}

export class CatMessage {
  private options: Required<CatMessageOptions>

  constructor(options: CatMessageOptions = {}) {
    this.options = {
      duration: options.duration ?? 3000,
      customClass: options.customClass ?? '',
      showClose: options.showClose ?? false,
      offset: options.offset ?? 100,
    }
  }

  private createMessage(type: MessageType, message: string) {
    return ElMessage({
      type,
      message,
      ...this.options,
    })
  }

  success(message: string) {
    return this.createMessage('success', message)
  }

  error(message: string) {
    return this.createMessage('error', message)
  }

  warning(message: string) {
    return this.createMessage('warning', message)
  }

  info(message: string) {
    return this.createMessage('info', message)
  }
}

/** 默认 message（自动关闭） */
export const message = new CatMessage({
  duration: 5000,
  customClass: 'cat-message',
  showClose: false,
})

/** 常驻 message（需要手动关闭） */
export const persistentMessage = new CatMessage({
  duration: 0,
  customClass: 'cat-message',
  showClose: true,
})
