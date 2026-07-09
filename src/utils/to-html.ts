import { DEFAULT_LANG, LANG, LANGUAGE_MAP } from '@/config/constant-config'
import { _getItem } from '@/utils/storage'

/**
 * @desc 本地开发访问html页面，请执行preview命令
 */
// 服务协议
export const toServiceAgreement = () => {
  const lang = _getItem(LANG, true)
  window.open(`/service-agreement-${LANGUAGE_MAP[lang || DEFAULT_LANG].apiParam}.html`)
}

// 隐私政策 隐私声明
export const toPrivacyPolicy = () => {
  const lang = _getItem(LANG, true)
  window.open(`/privacy-policy-${LANGUAGE_MAP[lang || DEFAULT_LANG].apiParam}.html`)
}

// 云服务协议
export const toCvmAgreement = () => {
  const lang = _getItem(LANG, true)
  window.open(`/cvm-agreement-${LANGUAGE_MAP[lang || DEFAULT_LANG].apiParam}.html`)
}

// 欠费说明
export const toCvmArrears = () => {
  const lang = _getItem(LANG, true)
  window.open(`/cvm-arrears-${LANGUAGE_MAP[lang || DEFAULT_LANG].apiParam}.html`)
}

// 共享流量包退款说明
export const toCvmFlowPacket = () => {
  const lang = _getItem(LANG, true)
  window.open(`/cvm-flow-packet-${LANGUAGE_MAP[lang || DEFAULT_LANG].apiParam}.html`)
}
