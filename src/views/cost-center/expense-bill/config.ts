import t from '@/utils/i18n'
import { mapToKeyValueArray } from '@/views/cvm/utils'

export const COST_TYPE_MAP = {
  0: t('bill.other'), // 其他
  1: t('bill.quantity'), // 按量计费
  2: t('bill.term'), // 包年包月
} // 计费模式

export const COST_TYPE_ARR_MAP = mapToKeyValueArray(COST_TYPE_MAP, true) // 计费模式

export const COST_TYPE_MAP_CONTRARY = {
  [t('bill.other')]: 0, // 其他
  [t('bill.quantity')]: 1, // 按量计费
  [t('bill.term')]: 2, // 包年包月
} // 计费模式

export const TRANSACTION_TYPE_MAP = {
  1: t('bill.quantityHour'), // 按量计费(小时结)
  2: t('bill.quantityDay'), // 按量计费(日结)
  3: t('bill.quantityMonth'), // 按量计费(月结)
  4: t('bill.quantityRealTime'), // 按量计费(实时扣费)
  11: t('bill.termBuy'), // 包年包月(新购)
  12: t('bill.termRenew'), //包年包月(续费)
} // 按量计费模式

export const TRANSACTION_TYPE_ARR_MAP = mapToKeyValueArray(TRANSACTION_TYPE_MAP, true) // 按量计费模式

export const USED_DURATION_UNIT_MAP = {
  1: t('bill.minute'), // 分钟
  2: t('bill.hour'), // 小时
  3: t('bill.day'), // 天
  4: t('bill.month'), // 月
  5: t('bill.year'), // 年
} // 时长单位

export const USED_UNIT_MAP = {
  1: 'GB',
  2: 'TB',
  3: 'PB',
} // 用量单位

export const INVOICE_TYPE_MAP = {
  0: t('invoice.electronicInvoice'),
} // 发票类型

export const INVOICE_APPLY_TYPE_MAP = {
  0: t('invoice.manuallyInvoice'), // 手动申请开票
} // 申请开票方式

export const INVOICE_MEDIUM_MAP = {
  0: t('invoice.electronicInvoice'), // 电子票据
} // 发票介质

export const INVOICE_STATUS_MAP = {
  0: t('invoice.invoiceStatusInit'), // 初始化
  1: t('invoice.invoiceStatusSuccess'), // 完成
  2: t('invoice.invoiceStatusFail'), // 失败
  3: t('invoice.invoiceStatusLoading'), // 处理中
} //  开票状态

export const _toFixed = (num: number | string) => {
  num = Number(num)

  return num.toFixed(2)
}

export const PRIMARY_COLOR = '#0063ff'
export const GREEN_COLOR = '#02de6d'
export const RED_COLOR = '#fe4d4f'
export const YELLOW_COLOR = '#fc8c00'
export const BLUE_COLOR = '#68ceff'
export const GREY_COLOR = '#rrggbb'
