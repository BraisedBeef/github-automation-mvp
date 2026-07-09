import i18n from '@/locales'
import { appNameMap } from '@/config/base-config'
import { useI18n } from 'vue-i18n'

export function useHtmlTitle() {
  const route = useRoute()
  const { locale } = useI18n()

  const updateTitle = () => {
    document.title = appNameMap[locale.value]
  }

  // 监听语言变化
  watch(i18n.global.locale, updateTitle)

  // 监听路由变化
  watch(() => route.fullPath, updateTitle, { immediate: true })
}
