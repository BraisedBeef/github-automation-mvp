import zh_cn from 'element-plus/dist/locale/zh-cn.js'
import en_us from 'element-plus/dist/locale/en.js'
import ja_jp from 'element-plus/dist/locale/ja.js'
import { mode } from './base-config'

export const LANG = 'lang'
export const THEME_VERSION = 'theme-version'
export const AUTH_CONTINUE = 'cat-auth-continue-' + mode
export const TOKEN = 'cat-cloud-token-' + mode
export const BASE_STORE = 'cat-cloud-base-' + mode
export const USER_STORE = 'cat-cloud-user-' + mode
export const TEMP_STORE = 'cat-cloud-temp-' + mode
export const STORAGE_STORE = 'cat-cloud-storage-' + mode
export const SUB_USER_CREATE_STORE = 'cat-cloud-sub-user-create-' + mode
export const LOGIN_STORE = 'cat-cloud-login-' + mode
export const CVM_STORE = 'cat-cloud-cvm-' + mode
export const CVM_INS_CREATE_STORE = 'cat-cloud-cvm-ins-create-' + mode
export const CVM_INS_FAST_CREATE_STORE = 'cat-cloud-cvm-ins-fast-create-' + mode
export const NETWORK_STORE = 'cat-cloud-network-' + mode
export const PERM_STORE = 'cat-cloud-perm-' + mode
export const DOMAIN_DICT = 'cat-cloud-domain-dict-' + mode
export const OSS_STORE = 'cat-cloud-oss-' + mode
export const DEVICE_ID = 'cat-cloud-X-DEVICE-ID-' + mode
export const USER = 'cat-cloud-user-' + mode

export const IS_PROD = import.meta.env.PROD
export const USER_HABIT = 'cat-user-habit'
export const DEFAULT_LANG = 'zh'

// 产品模块 id
export const CDN = 1635985021184
export const DNS = 1635985021185
export const OSS = 1635985021186
export const CVM = 1635985021188
export const DOMAIN = 1635985021187
export const NETWORK = 635988510721
export const PRIVATE_NETWORK = 635988510721
export const NETWORK_CARD = 635988510721
export const IP = 635988510721
export const SSL = 232943027957633

// 产品标识
export const CVM_KEY = 'cvm'
export const LIGHT_WEIGHT_SERVER_KEY = 'light-weight-server'
export const OSS_KEY = 'oss'
export const LIGHT_WEIGHT_OBJECT_STORAGE_KEY = 'light-weight-object-storage'
export const CLOUD_DEMAND_KEY = 'cloud-demand'
export const CDN_KEY = 'cdn'
export const DNS_KEY = 'dns'
export const PRIVATE_NETWORK_KEY = 'private-network'
export const NETWORK_CARD_KEY = 'network-card'
export const IP_KEY = 'ip'
export const ACCELERATOR_KEY = 'accelerator'
export const DOMAIN_KEY = 'domain'
export const NETWORK_KEY = 'network'
export const SSL_KEY = 'ssl'

// 所有产品模块
export const productMap = [
  { productKey: CVM_KEY, productId: CVM },
  { productKey: LIGHT_WEIGHT_SERVER_KEY, productId: 0 },
  { productKey: OSS_KEY, productId: OSS },
  { productKey: LIGHT_WEIGHT_OBJECT_STORAGE_KEY, productId: 0 },
  { productKey: CLOUD_DEMAND_KEY, productId: 0 },
  { productKey: CDN_KEY, productId: CDN },
  { productKey: DNS_KEY, productId: DNS },
  { productKey: PRIVATE_NETWORK_KEY, productId: NETWORK },
  { productKey: NETWORK_CARD_KEY, productId: NETWORK },
  { productKey: IP_KEY, productId: NETWORK },
  { productKey: ACCELERATOR_KEY, productId: 0 },
  { productKey: DOMAIN_KEY, productId: DOMAIN },
  { productKey: NETWORK_KEY, productId: NETWORK },
  { productKey: SSL_KEY, productId: SSL },
]

interface Language {
  [x: string]: {
    data: any
    i18nParam: LangType
    apiParam: 'zh-cn' | 'en-us' | 'ja-jp'
  }
}
export const LANGUAGE_MAP: Language = {
  zh: {
    data: zh_cn,
    i18nParam: 'zh',
    apiParam: 'zh-cn',
  },
  en: {
    data: en_us,
    i18nParam: 'en',
    apiParam: 'en-us',
  },
  ja: {
    data: ja_jp,
    i18nParam: 'ja',
    apiParam: 'ja-jp',
  },
}
