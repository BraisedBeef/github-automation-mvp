// src/views/oss/hooks/useClipboard.ts

import t from '@/utils/i18n'
import { ElMessage } from 'element-plus'

interface ClipboardItem {
  key: string
  name: string
  type: string
  bucketName: string
  region: string
}

interface ClipboardData {
  files: ClipboardItem[]
  path: string
  bucket: string
}

export function useClipboard() {
  const isPaste = ref(false)
  const clipboardContent = ref<string | ClipboardItem[] | null>(null)

  const checkClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) {
        isPaste.value = false
        clipboardContent.value = null
        return
      }

      // 尝试解析为 JSON
      try {
        const data = JSON.parse(text)
        console.log(
          '123',
          data,
          Array.isArray(data.files),
          data.files.every(item => item.key),
        )
        // 检查是否是数组且包含必要的桶信息字段
        if (Array.isArray(data.files) && data.files.every(item => item.key)) {
          isPaste.value = true
          clipboardContent.value = data
        } else {
          isPaste.value = false
          clipboardContent.value = text
        }
      } catch (error) {
        // 如果不是 JSON 格式，直接存储文本
        isPaste.value = false
        clipboardContent.value = text
        console.log(error)
      }
    } catch (error) {
      isPaste.value = false
      clipboardContent.value = null
      console.log(error)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async (data: ClipboardData | string) => {
    try {
      const text = typeof data === 'string' ? data : JSON.stringify(data)
      await navigator.clipboard.writeText(text)
      ElMessage.success(t('oss.s6.copySuccess'))
      isPaste.value = true
    } catch {
      // 降级方案：创建临时文本域
      const textarea = document.createElement('textarea')
      textarea.value = typeof data === 'string' ? data : JSON.stringify(data)
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success(t('oss.s6.copySuccess'))
      isPaste.value = true
    }
  }

  // 从剪贴板读取
  const readFromClipboard = async (): Promise<ClipboardData | string | null> => {
    try {
      const text = await navigator.clipboard.readText()
      try {
        const data: ClipboardData | string | null = JSON.parse(text)

        return data
      } catch {
        return text
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err)
      ElMessage.error(t('oss.s7.pasteFailed'))
      return null
    }
  }

  // 组件挂载时监听剪贴板变化
  onMounted(() => {
    checkClipboard()
    window.addEventListener('focus', checkClipboard)
  })

  // 组件卸载时移除监听
  onBeforeUnmount(() => {
    window.removeEventListener('focus', checkClipboard)
  })

  return {
    isPaste,
    clipboardContent,
    checkClipboard,
    copyToClipboard,
    readFromClipboard,
  }
}
