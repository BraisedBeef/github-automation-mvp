import t from '@/utils/i18n'

export const ORDER_TYPE_MAP = {
  1: t('order.orderType1'), // 新购
  2: t('order.orderType2'), // 升配
  3: t('order.orderType3'), // 降配
  4: t('order.orderType4'), // 续费
  5: t('order.refund'), // 退款
} // 订单类型

export const ORDER_STATUS_MAP = {
  1: t('order.status1'), // 待支付
  2: t('order.status2'), // 交易成功
  3: t('order.status3'), // 已取消
  4: t('order.status4'), // 已过期
  5: t('order.status5'), // 已失效
  6: t('order.status6'), // 待处理
  7: t('order.status7'), // 已退款
  8: t('order.status8'), // 处理中
  9: t('order.status9'), // 处理失败
} // 订单状态

export const ORDER_STATUS_CLASS_NAME_MAP = {
  1: 'text-warning',
  2: 'text-success',
  3: 'cancel-text',
  4: 'cancel-text',
  5: 'text-error',
  6: 'cancel-text',
  7: 'text-warning',
  8: 'cancel-text',
  9: 'cancel-text',
} // 订单状态颜色

// 是否能查看详情
export const isSeeDetail = (state: number) => {
  return ![6, 8].includes(state)
}

// 是否能付款
export const isPay = (state: number) => {
  return [1].includes(state)
}
