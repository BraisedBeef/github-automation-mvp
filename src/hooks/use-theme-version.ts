import { THEME_VERSION } from '@/config/constant-config'
import { getCookies, setCookies } from '@/utils/cookie'

export type ThemeVersion = 'v1' | 'v2'

const normalizeThemeVersion = (value?: string): ThemeVersion => {
  return value === 'v2' ? 'v2' : 'v1'
}

const themeVersion = ref<ThemeVersion>(normalizeThemeVersion(getCookies(THEME_VERSION)))
const isV2Theme = computed(() => themeVersion.value === 'v2')

const syncBodyThemeClass = () => {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('theme-v2', themeVersion.value === 'v2')
}

const syncThemeVersion = () => {
  themeVersion.value = normalizeThemeVersion(getCookies(THEME_VERSION))
  syncBodyThemeClass()
}

export const useThemeVersion = () => {
  syncThemeVersion()

  const setThemeVersion = (value: ThemeVersion) => {
    themeVersion.value = normalizeThemeVersion(value)
    setCookies(THEME_VERSION, themeVersion.value)
    syncBodyThemeClass()
  }

  const toggleThemeVersion = () => {
    setThemeVersion(themeVersion.value === 'v2' ? 'v1' : 'v2')
  }

  return {
    themeVersion,
    isV2Theme,
    setThemeVersion,
    syncThemeVersion,
    toggleThemeVersion,
  }
}
