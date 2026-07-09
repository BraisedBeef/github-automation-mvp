// websocket.ts
import { KEYUTIL, KJUR, hextob64 } from 'jsrsasign'
import { WebSocketOptions, WebSocketState } from './types/websocket'
import { ParamsType } from '@/views/oss/types'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { _getItem } from '@/utils/storage'
import { TOKEN } from '@/config/constant-config'
import { privateKey } from '@/config/base-config'

export default class WebSocketService {
  // WebSocket 实例
  private ws: WebSocket | null = null
  // 配置项
  private options: Required<WebSocketOptions>
  // 重连次数计数
  private reconnectCount = 0
  // 心跳定时器
  private heartTimer: NodeJS.Timeout | null = null
  // 重连定时器
  private reconnectTimer: NodeJS.Timeout | null = null
  // 消息队列（连接断开时缓存消息）
  private messageQueue: any[] = []
  // 连接状态
  private isConnected = false
  // 手动关闭标志（手动关闭时不重连）
  private isManualClose = false

  constructor(options: WebSocketOptions) {
    this.options = {
      reconnectLimit: 5,
      reconnectInterval: 3000,
      heartInterval: 20000,
      autoConnect: true,
      heartCheck: true,
      onOpen: () => {},
      onMessage: () => {},
      onClose: () => {},
      onError: () => {},
      onReconnect: () => {},
      ...options,
    }

    if (this.options.autoConnect) {
      this.connect()
    }
  }
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

    return { sign, timestamp, nonce, token }
  }

  /**
   * 建立 WebSocket 连接
   */
  public connect(): void {
    if (this.ws) {
      this.close()
    }

    this.isManualClose = false
    this.ws = new WebSocket(this.options.url)

    this.ws.onopen = (event: Event) => {
      console.log('WebSocket 连接成功')
      this.isConnected = true

      this.send({ ...this.getOptions({}) }) // 发送认证信息
      // this.reconnectCount = 0
      // 连接成功后发送缓存的消息
      this.flushMessageQueue()

      // 开始心跳检测
      if (this.options.heartCheck) {
        this.startHeartCheck()
      }

      this.options.onOpen(event)
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        // 重置心跳检测（收到任何消息都认为连接正常）
        if (this.options.heartCheck) {
          this.resetHeartCheck()
        }

        this.options.onMessage(data, event)
      } catch (error) {
        // 如果是pong响应，重置心跳
        if (event.data === '') {
          this.resetHeartCheck()
          return
        }
        // 如果解析失败，直接传递原始数据
        this.options.onMessage(event.data, event)
      }
    }

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket 连接关闭', event.code, event.reason)
      this.isConnected = false
      this.stopHeartCheck()

      // 非手动关闭且需要重连时，尝试重连
      if (!this.isManualClose && this.reconnectCount < this.options.reconnectLimit) {
        this.reconnect()
      }

      this.options.onClose(event)
    }

    this.ws.onerror = (event: Event) => {
      console.error('WebSocket 发生错误')
      this.options.onError(event)
    }
  }

  /**
   * 发送消息
   */
  public send(message: any): boolean {
    if (this.ws && this.isConnected) {
      if (typeof message !== 'string') {
        message = JSON.stringify(message)
      }
      this.ws.send(message)
      return true
    } else {
      // 未连接时，将消息加入队列
      console.warn('WebSocket 未连接，消息已加入队列')
      this.messageQueue.push(message)
      return false
    }
  }

  /**
   * 关闭连接
   */
  public close(): void {
    this.isManualClose = true
    this.stopHeartCheck()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.messageQueue = []
    // this.reconnectCount = 0
  }

  /**
   * 重新连接
   */
  private reconnect(): void {
    console.log(
      `重连检查: isManualClose=${this.isManualClose}, reconnectCount=${this.reconnectCount}, reconnectLimit=${this.options.reconnectLimit}`,
    )

    if (this.isManualClose || this.reconnectCount >= this.options.reconnectLimit) {
      console.log(
        `跳过重连: isManualClose=${this.isManualClose}, 已达到重连限制? ${this.reconnectCount >= this.options.reconnectLimit}`,
      )
      return
    }

    this.reconnectCount++
    console.log(`尝试第 ${this.reconnectCount} 次重连...`)

    this.options.onReconnect(this.reconnectCount)

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.options.reconnectInterval)
  }

  /**
   * 开始心跳检测
   */
  private startHeartCheck(): void {
    this.stopHeartCheck()

    this.heartTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        // 使用原生ping帧替代自定义消息
        this.ws.send('') // 发送空消息触发ping帧
      } else {
        this.stopHeartCheck()
      }
    }, this.options.heartInterval)
  }

  /**
   * 重置心跳检测
   */
  private resetHeartCheck(): void {
    if (this.options.heartCheck) {
      this.stopHeartCheck()
      this.startHeartCheck()
    }
  }

  /**
   * 停止心跳检测
   */
  private stopHeartCheck(): void {
    if (this.heartTimer) {
      clearInterval(this.heartTimer)
      this.heartTimer = null
    }
  }

  /**
   * 发送消息队列中的所有消息
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.send(message)
    }
  }

  /**
   * 获取当前连接状态
   */
  public getState(): WebSocketState {
    return this.ws?.readyState ?? WebSocketState.CLOSED
  }

  /**
   * 是否已连接
   */
  public getIsConnected(): boolean {
    return this.isConnected
  }

  /**
   * 获取重连次数
   */
  public getReconnectCount(): number {
    return this.reconnectCount
  }

  /**
   * 获取待发送消息队列
   */
  public getMessageQueue(): any[] {
    return [...this.messageQueue]
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.close()
    this.messageQueue = []
    this.reconnectCount = 0
  }
}
