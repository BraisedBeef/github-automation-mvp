import image404Cat from '@/assets/images/error/404-cat.png'
import image404ZhuQue from '@/assets/images/error/404-zhuque.png'
import imageContactQrCode1ZhuQue from '@/assets/images/contact/contact-qr-code-1-zhuque.png'
import imageContactQrCode2ZhuQue from '@/assets/images/contact/contact-qr-code-2-zhuque.png'
import imageContactQrCode1Cat from '@/assets/images/contact/contact-qr-code-1-cat.png'
import imageContactQrCode2Cat from '@/assets/images/contact/contact-qr-code-2-cat.png'

// mode
export const mode = import.meta.env.VITE_APP_MODE
// 请求地址
export const httpUrl = import.meta.env.VITE_APP_HTTP_URL
// Univapay appId
export const univapayAppId = import.meta.env.VITE_APP_UNIVAPAY_APPID
// Tg bot url
export const tgBotUrl = import.meta.env.VITE_APP_TG_BOT_URL
// Tg bot name
export const tgBotName = import.meta.env.VITE_APP_TG_BOT_NAME
// 设置Cookie域名范围
export const domainUrl = import.meta.env.VITE_APP_DOMAIN_URL
// 官网地址
export const owUrl = import.meta.env.VITE_APP_OW_URL
// 机场
export const airportUrl = import.meta.env.VITE_APP_AIRPORT_URL
// 文档中心
export const documentUrl = import.meta.env.VITE_APP_DOCUMENT_URL
// 密钥
export const privateKey = import.meta.env.VITE_APP_PRIVATE_KEY
// logo
export const logoName = mode === 'prod' ? 'logo-cat' : 'logo-zhuque'
export const logoTextName = mode === 'prod' ? 'logo-cat-text' : 'logo-zhuque-text'
// app name
export const appNameMap =
  mode === 'prod'
    ? {
        zh: '猫云',
        en: 'maoyun',
        ja: '猫雲',
      }
    : {
        zh: '朱雀',
        en: 'zhuque',
        ja: 'すざく',
      }

export const appDomain = mode === 'prod' ? 'maoyun.' : 'zhuque.'
// 404
export const image404 = mode === 'prod' ? image404Cat : image404ZhuQue
// contact
export const imageContactQrCode1 = mode === 'prod' ? imageContactQrCode1Cat : imageContactQrCode1ZhuQue
export const imageContactQrCode2 = mode === 'prod' ? imageContactQrCode2Cat : imageContactQrCode2ZhuQue
