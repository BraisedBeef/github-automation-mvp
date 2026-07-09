import t from '@/utils/i18n'

export const RECEIVING_CHANNELS_MAP = {
  TG: 'Telegram',
  MAIL: t('user.mail'),
} // 接收渠道类型

export const SUBSCRIBE_MAP = {
  OPERATION: t('subscribe.operation'), // 运维消息
  DYNAMIC: t('subscribe.dynamic'), // 动态消息
  PRODUCT_SUBSCRIBE: t('subscribe.productSubscribe'), // 产品消息
  SECURITY: t('subscribe.security'), // 安全消息
  FINANCE: t('subscribe.finance'), // 财务消息
  OTHER: t('subscribe.other'), // 其他消息
} // 消息类型

export const ROLE_NAME_REG = /^[a-zA-Z0-9\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]{1,32}$/ // 角色名正则
