export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export interface WebSocketOptions {
  /** WebSocket 服务器地址 */
  url: string
  /** 重连次数，默认 5 次 */
  reconnectLimit?: number
  /** 重连间隔(ms)，默认 3000ms */
  reconnectInterval?: number
  /** 心跳间隔(ms)，默认 20000ms */
  heartInterval?: number
  /** 是否自动连接，默认 true */
  autoConnect?: boolean
  /** 是否开启心跳检测，默认 true */
  heartCheck?: boolean
  /** 连接成功回调 */
  onOpen?: (event: Event) => void
  /** 收到消息回调 */
  onMessage?: (data: any, event: MessageEvent) => void
  /** 连接关闭回调 */
  onClose?: (event: CloseEvent) => void
  /** 错误回调 */
  onError?: (event: Event) => void
  /** 重连开始回调 */
  onReconnect?: (count: number) => void
}
