import { SSE } from 'sse.js'
import qs from 'qs'
import { TOKEN } from '@/config/constant-config'
import { _getItem } from '@/utils/storage'
import { KEYUTIL, KJUR, hextob64 } from 'jsrsasign'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { privateKey } from '@/config/base-config'

interface ParamsType {
  [k: string]: any
}

/**
 * SSE 连接管理类
 */
class SSEManager {
  private sse: SSE | null = null
  private url: string = ''
  private onMessageCallback: (data: any) => void = () => {}
  private onErrorCallback: (error: Event) => void = () => {}
  private onOpenCallback: () => void = () => {}

  /**
   * 加密签名
   */
  private doSign(str: string): string {
    const key = KEYUTIL.getKey(privateKey)
    const signature = new KJUR.crypto.Signature({
      alg: 'SHA256withRSA',
    })
    signature.init(key)
    signature.updateString(str)
    const a = signature.sign()
    const sign = hextob64(a)
    return sign
  }

  /**
   * 生成 SSE 连接选项
   */
  private getOptions(params: ParamsType) {
    // 时间戳
    const timestamp = maoYunDayJs().valueOf()
    // 随机数
    const nonce = timestamp
    // 签名参数
    const signParams = {
      ...(params || {}),
      timestamp,
      nonce,
    }

    // 排序
    const sortSignData = Object.keys(signParams)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = signParams[key]
          return acc
        },
        {} as Record<string, any>,
      )

    // 对签名参数进行字符串化
    const signParamsStr = Object.keys(sortSignData)
      .map(key => {
        return `${key}=${typeof sortSignData[key] === 'object' ? JSON.stringify(sortSignData[key]) : sortSignData[key]}`
      })
      .join('&')

    // 签名结果
    const sign = this.doSign(signParamsStr.replaceAll(' ', ''))

    // 设置 token
    const token = _getItem(TOKEN, true)

    return {
      start: true,
      headers: { sign, timestamp, nonce, token },
      reconnect: {
        minTimeout: 1000, // 初始重连延迟 1 秒
        maxTimeout: 5000, // 最大重连延迟 5 秒
        factor: 2, // 每次重连间隔递增的因子
      },
    }
  }

  /**
   * 建立 SSE 连接
   * @param {string} url SSE 服务端地址
   * @param {object} params 查询参数 { action, taskId }
   * @param {Function} onMessage 消息回调
   * @param {Function} onError 错误回调
   * @param {Function} onOpen 连接打开回调
   */
  connect(
    url: string,
    params: ParamsType,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onOpen?: () => void,
  ): void {
    this.onMessageCallback = onMessage
    this.onErrorCallback = onError || (() => {})
    this.onOpenCallback = onOpen || (() => {})

    // 生成连接选项
    const options = this.getOptions(params)
    // 构建完整 URL（带查询参数）
    this.url = params ? `${url}?${qs.stringify(params)}` : url

    // 创建 SSE 实例
    this.sse = new SSE(this.url, options as any)

    // 监听 open 事件
    this.sse.addEventListener('open', (event: any) => {
      console.log('SSE 连接已建立:', event)
      this.onOpenCallback()
    })

    // 监听 delete-progress 事件
    this.sse.addEventListener('message', (event: any) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        console.log('解析后的数据:', data)
        this.onMessageCallback(data)
      } catch (error) {
        console.error('SSE 消息解析错误:', error)
      }
    })

    // 监听 error 事件
    this.sse.addEventListener('error', (error: any) => {
      console.error('SSE 连接错误:', error)
      this.onErrorCallback(error)
    })
  }

  /**
   * 关闭 SSE 连接
   */
  close(): void {
    if (this.sse) {
      this.sse.close()
      this.sse = null
      console.log('SSE 连接已关闭')
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.sse !== null && (this.sse as any).readyState === 1 // readyState: 1 = OPEN
  }
}

// 导出单例
export const sseManager = new SSEManager()
