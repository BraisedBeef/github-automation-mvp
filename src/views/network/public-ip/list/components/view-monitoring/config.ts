import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { ManipulateType } from 'dayjs'

// 获取时间戳
export const getDateTime = (num: number, type: ManipulateType) => {
  const end = maoYunDayJs()
  let start = maoYunDayJs()
  if (num) {
    start = start.subtract(num, type)
  }
  console.log(start, end)
  return [start, end]
}

export const btnsGroupList = [
  {
    label: t('publicIp.fiveMin'),
    value: '5m',
  },
  {
    label: t('publicIp.oneHour'),
    value: '1h',
  },
  {
    label: t('publicIp.twelveHour'),
    value: '12h',
  },
  {
    label: t('publicIp.twoDay'),
    value: '2d',
  },
]

export const shortcuts = [
  {
    text: t('publicIp.lastTwoDay'), // 最近2天
    value: () => {
      return getDateTime(2, 'day')
    },
  },
  {
    text: t('order.oneMonth'), // 最近一个月
    value: () => {
      return getDateTime(1, 'month')
    },
  },
  {
    text: t('order.threeMonth'), // 最近三个月
    value: () => {
      return getDateTime(3, 'month')
    },
  },
]

// 实例监控指标
export const INS_MONITER_METRIC_MAP = {
  eipInBandwidth: 'eip_in_bandwidth', // 弹性公网ip 入带宽
  eipOutBandwidth: 'eip_out_bandwidth', // 弹性公网ip 出带宽
  eipInPacket: 'eip_in_packet', // 弹性公网ip 入包量
  eipOutPacket: 'eip_out_packet', // 弹性公网ip 出包量
  eipOutFlow: 'eip_out_flow', // 弹性公网ip 出流量
  // eipInFlow: 'eip_in_flow', // 弹性公网ip 入流量
}
