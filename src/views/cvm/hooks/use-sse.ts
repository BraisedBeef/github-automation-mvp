import { SSE } from 'sse.js'
import qs from 'qs'
import { TOKEN } from '@/config/constant-config'
import { _getItem } from '@/utils/storage'
import { KEYUTIL, KJUR, hextob64 } from 'jsrsasign'
import { _closeSSE } from '@/apis/cvm/base'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { privateKey } from '@/config/base-config'

interface ParamsType {
  [k: string]: any
}

export interface ConfigType {
  url: string
  params?: ParamsType
  startNow?: boolean
}

export function useSSE(config: ConfigType) {
  const sseData = ref<any>(null)
  const isConnected = ref<boolean>(false)
  const sse = ref<SSE | null>(null)
  config.startNow = Object.keys(config).includes('startNow') ? config.startNow : true

  // 加密
  const doSign = str => {
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

  const getOptions = () => {
    // date
    const timestamp = maoYunDayJs().valueOf()
    // 随机数
    const nonce = timestamp
    // 签名参数
    let signParams = {}

    signParams = {
      ...(config.params || {}),
      timestamp,
      nonce,
    }

    // 排序
    const sortSignData = Object.keys(signParams)
      .sort()
      .reduce((acc, key) => {
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
    const sign = doSign(signParamsStr.replaceAll(' ', ''))
    // console.log(`sign===>`, sign)

    // 设置token
    const token = _getItem(TOKEN, true)

    return {
      start: config.startNow,
      headers: { sign, timestamp, nonce, token },
      reconnect: {
        // retries: 10, // 最大重连次数 =>默认没有重连限制
        minTimeout: 1000, // 初始重连延迟 1 秒
        maxTimeout: 5000, // 最大重连延迟 5 秒
        factor: 2, // 每次重连间隔递增的因子
      },
    }
  }

  // 开启 SSE并设置事件监听
  const startSSE = async () => {
    // console.log('我后执行了start，创建了新的connet');
    const options = getOptions()
    const url = config.params ? `${config.url}?${qs.stringify(config.params)}` : config.url
    sse.value = new SSE(url, options as any)

    // 手动开启 需调用stream
    !config.startNow && sse.value.stream()

    // 监听 open 事件
    sse.value.addEventListener('open', (event: any) => {
      // console.log('SSE 已连接:', event)
      isConnected.value = true
    })

    // 监听 message 事件
    sse.value.addEventListener('message', (event: any) => {
      // console.log('SSE message:', event)

      // const data = event.data ? JSON.parse(event.data) : []
      const data = event.data ? JSON.parse(JSON.parse(event.data)) : []
      // console.log(`message==>`, data, typeof data);

      sseData.value = data
      // console.log(`sseData.value===>`, sseData.value);
    })

    // 监听 error 事件
    sse.value.addEventListener('error', (error: any) => {
      // console.error('SSE 连接错误:', error)
      isConnected.value = false
      startSSE()
    })
  }

  // 关闭 SSE 连接
  const closeSSE = () => {
    if (sse.value) {
      sse.value.close()
      sse.value = null
      isConnected.value = false
    }
  }

  onMounted(() => {
    config.startNow && startSSE()
  })

  onUnmounted(() => {
    closeSSE()
  })

  return {
    sse,
    sseData,
    isConnected,
    startSSE,
    closeSSE,
  }
}
