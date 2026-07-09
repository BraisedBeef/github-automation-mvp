import {
  LANG,
  TOKEN,
  USER_STORE,
  BASE_STORE,
  AUTH_CONTINUE,
  DEFAULT_LANG,
  LANGUAGE_MAP,
} from '@/config/constant-config'
import { _getItem, _remove } from '@/utils/storage'
import { showSensity } from '@/components/account-system/sensity'
import { KEYUTIL, KJUR, hextob64 } from 'jsrsasign'
import { httpErrorHandler } from './http-error'
import useOssStore from '@/store/oss'
import { removeCookies } from '@/utils/cookie'
import t from '@/utils/i18n'
import { clearTaskManagerInstance } from '@/views/oss/hooks/use-task-manager'
import { createRequest } from './http'
import { privateKey, httpUrl } from '@/config/base-config'
import { notify } from '@/utils/notification'

let isShowTokenExpired = false // token过期

// 加密
const doSign = (str: string, privateKey: string) => {
  // 建立 key 对象, 构建 signature 实例, 传入 key 初始化 -> 签名
  const key = KEYUTIL.getKey(privateKey)
  // 创建 Signature 对象，设置签名编码算法
  const signature = new KJUR.crypto.Signature({
    alg: 'SHA256withRSA',
  })
  // 传入key实例, 初始化signature实例
  signature.init(key)
  // 传入待加密字符串
  signature.updateString(str)
  // 签名, 得到16进制字符结果
  const a = signature.sign()
  const sign = hextob64(a)
  return sign
}

export const createHttpClient = (baseURL: string, transmit: boolean) => {
  const requestClient = createRequest({
    baseURL,
    timeout: 30 * 1000,
    withCredentials: true,
    errorHandler: error => httpErrorHandler(transmit, error),
    interceptors: {
      requestInterceptor: async config => {
        // console.log(`请求拦截正常 config===>`, config)

        // date
        const timestamp = +new Date()
        // 随机数
        const nonce = timestamp
        // 签名参数
        let signParams: any = {}

        // get
        if (config.method === 'get') {
          signParams = {
            ...(config.params || {}),
            timestamp,
            nonce,
          }
        }
        // post
        if (config.method === 'post') {
          if (config.data) {
            const bodyData: any = {}

            bodyData['body'] = config.data

            signParams = {
              ...bodyData,
              timestamp,
              nonce,
            }
          } else {
            signParams = {
              timestamp,
              nonce,
            }
          }
        }
        // console.log(`signParams===>`, signParams)

        // 排序
        const sortSignData = Object.keys(signParams)
          .sort()
          .reduce((acc: any, key) => {
            acc[key] = signParams[key]
            return acc
          }, {})
        // console.log(`sortSignData===>`, sortSignData)

        // 对签名参数进行qs
        const signParamsStr = Object.keys(sortSignData)
          .map(key => {
            return `${key}=${typeof sortSignData[key] === 'object' ? JSON.stringify(sortSignData[key]) : sortSignData[key]}`
          })
          .join('&')

        // console.log(`signParamsStr===>`, signParamsStr)
        // 签名结果
        const sign = doSign(signParamsStr.replaceAll(' ', ''), privateKey)
        // console.log(`sign===>`, sign)

        // 设置签名
        if (sign) {
          config.headers['sign'] = sign
          config.headers['timestamp'] = timestamp
          config.headers['nonce'] = nonce
        }

        // 设置token
        const token = _getItem(TOKEN, true)
        // console.log(`token===>`, token, typeof token)

        if (token) {
          config.headers['token'] = token
        }

        // 设置语言
        const language = LANGUAGE_MAP[_getItem(LANG, true)]?.apiParam || LANGUAGE_MAP[DEFAULT_LANG]?.apiParam
        if (language) {
          config.headers[transmit ? 'Accept-Language' : 'language'] = language
        }

        return config
      },
      requestInterceptorCatch: error => {
        // console.log(`请求拦截捕获错误===>`, error);
        return Promise.reject(error)
      },
      responseInterceptor: (response: any) => {
        // 10010 => 敏感验证
        if (response.data.code === 10010) {
          return new Promise<{
            success: boolean
          }>((resolve1, reject1) => {
            // 敏感验证第一步
            showSensity({
              contentType: 'AuthenticationDialog',
              confirm: resolve1,
              close: reject1,
            })
          })
            .then(res1 => {
              console.log(`res1===>`, res1)
              console.log(`response===>`, response.data.data.perms)
              if (res1?.success) {
                return new Promise<{
                  success: boolean
                }>((resolve2, reject2) => {
                  // 敏感验证第二步
                  showSensity({
                    contentType: 'OperateDialog',
                    confirm: resolve2,
                    close: reject2,
                    perms: response.data.data.component,
                  })
                })
              }
            })
            .then(async res2 => {
              console.log(`res2===>`, res2)
              if (res2?.success) {
                return requestClient.retry(response.config)
              }
            })
        }

        // 10025 => TOKEN过期
        if (response.data.code === 10025) {
          console.log(`TOKEN过期===>`)

          // token过期提示进行节流处理
          if (!isShowTokenExpired) {
            isShowTokenExpired = true

            notify.warning({
              message: t('login.loginExpired'),
              offset: 100,
              duration: 3000,
              onClose: () => {
                isShowTokenExpired = false
              },
            })
          }

          // 删除cookies
          removeCookies(TOKEN)
          removeCookies(USER_STORE)

          _remove(TOKEN)
          _remove(USER_STORE)
          _remove(BASE_STORE)
          _remove(AUTH_CONTINUE)
          // 清空oss 任务中心数据
          const ossStore = useOssStore()
          ossStore.clearTasks()
          // 断开websocket连接
          clearTaskManagerInstance()

          window.location.href = `/login${location.search}`
        }

        return response.data
      },
      responseInterceptorCatch: error => {
        if (error?.code === 'ERR_CANCELED') {
          return Promise.reject(error)
        }

        // 响应错误拦截 成都
        if (transmit) {
          const data = error?.response?.data
          const status = error?.response?.status
          if (status === 500) {
            notify.error({
              message: t('common.error_cd'),
              offset: 100,
              duration: 5000,
              dangerouslyUseHTMLString: true,
            })
          } else {
            if (!error?.config?.headers?.['Disabled-Global-Error-Msg']) {
              notify.error({
                message: (data as any)?.msg,
                offset: 100,
                duration: 5000,
                customClass: 'cdn-notification',
              })
            }
          }
        } else {
          // 响应错误拦截 长沙
          const message = (error.response?.data as any)?.msg || t('common.error_cs')

          // 提示错误
          notify.error({
            message: message,
            offset: 100,
            duration: 5000,
          })
        }

        return Promise.reject(error)
      },
    },
  })
  return requestClient
}

const reqUrlCs = httpUrl + '/api/vcloud/v1'
const reqUrlCd = httpUrl
const reqCvmUrlCs = httpUrl + '/api/vcloudCvm/v1/'
const reqCvmBaseUrlCs = httpUrl + '/api/vcloudBase/v1'

export const requestCs = createHttpClient(reqUrlCs, false)
export const requestCd = createHttpClient(reqUrlCd, true)
export const requestCvmCs = createHttpClient(reqCvmUrlCs, false)
export const requestCvmBaseCs = createHttpClient(reqCvmBaseUrlCs, false)
