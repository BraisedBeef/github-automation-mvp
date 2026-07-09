import { createI18n } from 'vue-i18n'
import { getCookies } from '@/utils/cookie'
import zh from './zh'
import en from './en'
import ja from './ja'
import { LANG, LANGUAGE_MAP, DEFAULT_LANG } from '@/config/constant-config'
import { getLocalItemRaw, setLocalItemRaw } from '@/utils/storage'

const messages = {
  en,
  zh,
  ja,
}

const local_language: any = getCookies(LANG) || getLocalItemRaw(LANG)

let current_language
if (Object.keys(LANGUAGE_MAP).includes(local_language)) {
  current_language = local_language
} else {
  current_language = DEFAULT_LANG
}
if (getCookies(LANG) !== getLocalItemRaw(LANG)) {
  setLocalItemRaw(LANG, current_language)
}
const i18n = createI18n({
  legacy: false,
  locale: LANGUAGE_MAP[current_language].i18nParam,
  fallbackLocale: 'en',
  messages,
  missingWarn: false,
})

export default i18n
