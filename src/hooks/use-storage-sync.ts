import { TOKEN, LANG } from '@/config/constant-config'

export function useStorageSync() {
  const handleStorage = async (e: StorageEvent) => {
    // 监听token
    if (e.key === TOKEN) {
      // console.log('检测到 token 变化:', e.newValue)

      location.reload()
    }

    // 监听lang
    if (e.key === LANG) {
      // console.log('检测到 lang变化:', e.newValue)

      location.reload()
    }
  }

  onMounted(() => {
    window.addEventListener('storage', handleStorage)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('storage', handleStorage)
  })
}
