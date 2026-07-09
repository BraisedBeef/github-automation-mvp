
// 监控下面每个tab的NAME
export type PageName =
  | 'broadband'
  | 'flow'
  | 'request'
  | 'hit'
  | 'status'
  | 'back'
  | 'backFlow'
  | 'backRequest'
  | 'backStatus'

export interface RemainFlux {
  chinese_remain: number
  chinese_total: number;
  overseas_remain: number
  overseas_total: number;
}
