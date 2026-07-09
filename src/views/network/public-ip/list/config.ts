import t from '@/utils/i18n'
import { LineTypeInterface } from './components/set-buy/type'
import { lineTypeList as newLineTypeList } from './components/set-buy/config'
import { permMap } from '@/hooks/permission/use-cvm-and-network-permission'

// 默认请求的eip状态
export const eip_default_states = [1, 2, 3, 4, 5, 6]

export const typeList = [
  { label: t('publicIp.creating'), value: 1 }, // 创建中
  { label: t('publicIp.unbound'), value: 2 }, // 未绑定
  { label: t('publicIp.binding'), value: 3 }, // 绑定中
  { label: t('publicIp.alreadyBound'), value: 4 }, // 已绑定
  { label: t('publicIp.unbinding'), value: 5 }, // 解绑中
  { label: t('publicIp.releasing'), value: 6 }, // 释放中
]

export const recoveryTypeList = [
  { label: t('publicIp.creating'), value: 1 }, // 创建中
  { label: t('publicIp.unbound'), value: 2 }, // 未绑定
  { label: t('publicIp.binding'), value: 3 }, // 绑定中
  { label: t('publicIp.alreadyBound'), value: 4 }, // 已绑定
  { label: t('publicIp.unbinding'), value: 5 }, // 解绑中
  { label: t('publicIp.releasing'), value: 6 }, // 释放中
  { label: t('publicIp.toBeRecycle'), value: 7 }, // 待回收
  { label: t('publicIp.recyclingAndRecovery'), value: 8 }, // 回收恢复中
]

export const filterList = [
  { fieldName: t('publicIp.name'), fieldKey: 'name' },
  { fieldName: 'ID', fieldKey: 'eipUuid' },
  { fieldName: t('publicIp.state'), fieldKey: 'state', fieldType: 'check', list: typeList },
  { fieldName: 'IP', fieldKey: 'ip' },
]

export const chargeTypeList = [
  { label: t('publicIp.monthlyAndYearly'), value: 2 },
  { label: t('publicIp.hourlyTraffic'), value: 1 },
  { label: t('publicIp.flowPacket'), value: 3 },
]

export const billingModeList = [
  { label: t('publicIp.byTraffic'), value: 1 },
  { label: t('publicIp.monthlyBroadbandPackage'), value: 2 },
  { label: t('publicIp.flowPacket'), value: 3 },
]

export const adjustingBillingModeList = [
  { label: t('publicIp.byTraffic'), value: 1 },
  { label: t('publicIp.monthlyBroadbandPackage'), value: 2 },
]

// export const lineTypeList = [{ label: t('publicIp.dynamicBGP'), value: 1 }]
export const lineTypeList: LineTypeInterface[] = newLineTypeList

export const bindInstanceTypeList = [
  { label: t('publicIp.server'), value: 1 },
  { label: t('publicIp.networkCard'), value: 2 },
]

/**
 * @name 计算从开始时间累加月份之天数和
 * @param deadlineTime 当前开始时间（毫秒值）
 * @param monthsToAdd 累计增加月份数
 */
export function calculateDaysFromNow(deadlineTime: number, monthsToAdd: number) {
  const currentDate = new Date(deadlineTime)
  let totalDays = 0
  const tempDate = new Date(currentDate)
  for (let i = 0; i < monthsToAdd; i++) {
    // 当前月的天数
    const year = tempDate.getFullYear()
    const month = tempDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDateDayjs()
    totalDays += daysInMonth
    // 加一个月
    tempDate.setMonth(tempDate.getMonth() + 1)
  }
  return totalDays * 24 * 60 * 60 * 1000
}

// 带宽
export const bandwidthSliderConfig = {
  min: 1,
  max: 500,
  marks: {
    100: '100Mbps',
    200: '200Mbps',
    300: '300Mbps',
    500: {
      style: {
        marginLeft: '-25px',
      },
      label: '500Mbps',
    },
  },
}

// 更多操作
export const PUBLIC_IP_MORE_OPTS = [
  // 解绑
  {
    label: t('publicIp.unbind'),
    value: 'unbind',
    hasFn: row => {
      return row.state === 4
    },
    perm: permMap.eip.UNBIND_EIP,
  },
  // 绑定
  {
    label: t('publicIp.bind'),
    value: 'bind',
    hasFn: row => {
      return row.state === 2
    },
    perm: permMap.eip.BIND_EIP,
  },
  // 续费
  {
    label: t('publicIp.renew'),
    value: 'renew',
    hasFn: row => {
      return row.chargeType === 2
    },
    perm: permMap.eip.RENEW_EIP,
  },
  // 释放
  {
    label: t('publicIp.release'),
    value: 'release',
    disabledFn: row => {
      return row.state !== 2
    },
    perm: permMap.eip.ONE_RELEASE_EIP,
  },
  // 申请变更计费模式
  {
    label: t('publicIp.applyChange'),
    value: 'applyChange',
    hasFn: row => {
      return row.chargeType === 1 && row.enableChangeMonthly === 2
    },
    perm: permMap.eip.APPLY_CHANGE_BILLING_MODE,
  },
]
