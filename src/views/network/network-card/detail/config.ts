import t from '@/utils/i18n'
import dayjs from 'dayjs'

export const pageTabs = [
  { label: t('networkCard.basicInfo'), value: 1 },
  { label: t('networkCard.ipv4AddressManage'), value: 2 },
  { label: t('networkCard.associateSecurityGroup'), value: 3 },
]

export const eniPrivateIpIpOpts = [
  { label: t('networkCard.primaryIp'), value: 1 },
  { label: t('networkCard.secondaryIp'), value: 2 },
]

export const ruleTabList = [
  { label: t('networkCard.inboundRules'), value: 1 },
  { label: t('networkCard.outboundRules'), value: 2 },
]

export const initPaginationConfig = {
  pageSize: 10,
  pageIndex: 0,
  total: 0,
  totalPage: 0,
}

export const setInitTimeFormat = time => {
  const date = new Date(time)
  // 获取时区偏移，例如：UTC+08:00
  const timezoneOffset = -date.getTimezoneOffset() // 时区偏移，单位为分钟
  const hoursOffset = Math.floor(timezoneOffset / 60) // 转换为小时
  const minutesOffset = timezoneOffset % 60 // 剩余的分钟数
  // 处理时区格式，输出为 UTC+08:00 格式
  const offsetFormatted = ` (UTC${hoursOffset >= 0 ? '+' : '-'}${String(Math.abs(hoursOffset)).padStart(2, '0')}:${String(Math.abs(minutesOffset)).padStart(2, '0')}) Asia/Shanghai`
  return offsetFormatted
}
