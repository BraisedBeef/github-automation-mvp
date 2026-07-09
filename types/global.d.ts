declare const __APP_VERSION__: string

declare module 'element-plus/dist/locale/zh-cn.mjs'
declare module 'element-plus/dist/locale/en.mjs'
declare module 'element-plus'

declare interface Window {
  indexedDB
  mozIndexedDB
  webkitIndexedDB
  setTabValue?: (value: number) => void
}

declare const documentUrl: string
declare const render: any
declare const pushRoute: any
type LangType = 'zh' | 'en' | 'ja'
type Reactive<T = any> = T
type CSSProperties = any

interface TableColumn {
  label: string
  prop: string
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right'
  tip?: string
  utcTip?: boolean
  sort?: 'up' | 'down'
  tooltip?: boolean
  disabled?: boolean
  format?: Function
}

interface Pager {
  page: number
  pageSize: number
}

declare interface Date {
  getDateDayjs: (...args: any[]) => any
}

declare interface Object {
  [key: string]: any
}
