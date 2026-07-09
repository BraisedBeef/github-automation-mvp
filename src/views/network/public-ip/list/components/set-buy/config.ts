import t from '@/utils/i18n'
import { LineTypeInterface } from './type'

export const purchaseDurationOptions = [
  { label: t('publicIp.oneMonth'), value: 1, msg: t('publicIp.discount') },
  { label: t('publicIp.twoMonths'), value: 2, msg: t('publicIp.discount') },
  { label: t('publicIp.threeMonths'), value: 3, msg: t('publicIp.discount') },
  { label: t('publicIp.fourMonths'), value: 4, msg: t('publicIp.discount') },
  { label: t('publicIp.fiveMonths'), value: 5, msg: t('publicIp.discount') },
  { label: t('publicIp.sixMonths'), value: 6, msg: t('publicIp.discount') },
  { label: t('publicIp.sevenMonths'), value: 7, msg: t('publicIp.discount') },
  { label: t('publicIp.eightMonths'), value: 8, msg: t('publicIp.discount') },
  { label: t('publicIp.nineMonths'), value: 9, msg: t('publicIp.discount') },
  { label: t('publicIp.tenMonths'), value: 10, msg: t('publicIp.discount') },
  { label: t('publicIp.elevenMonths'), value: 11, msg: t('publicIp.discount') },
  { label: t('publicIp.aYear'), value: 12, msg: t('publicIp.discount') },
]

// 按流量表单
export const initFlowForm = {
  lineType: '',
  size: 1,
  num: 1,
  name: '',
}
export const flowFormRule = {
  size: [{ required: true, message: '', trigger: 'blur' }],
  num: [{ required: true, message: '', trigger: 'blur' }],
  name: [
    {
      pattern: /^[\w\u4e00-\u9fa5.-]{1,50}$/,
      message: t('publicIp.eidtEipNameReg'),
      trigger: 'blur',
    },
  ],
}

// 包月
export const initMonthlyForm = {
  lineType: '',
  size: 1,
  num: 1,
  name: '',
  period: 1,
  autoRenewFlag: false,
}

export const initMonthlyRule = {
  size: [{ required: true, message: '', trigger: 'blur' }],
  num: [{ required: true, message: '', trigger: 'blur' }],
  period: [{ required: true, message: '', trigger: 'blur' }],
  name: [
    {
      pattern: /^[\w\u4e00-\u9fa5.-]{1,50}$/,
      message: t('publicIp.eidtEipNameReg'),
      trigger: 'blur',
    },
  ],
}

// 流量包
export const initPkgForm = {
  lineType: '',
  pkgId: '',
  size: 1,
  num: 1,
  name: '',
}

export const pkgFormRule = {
  pkgId: [{ required: true, message: '', trigger: 'blur' }],
  num: [{ required: true, message: '', trigger: 'blur' }],
  name: [
    {
      pattern: /^[\w\u4e00-\u9fa5.-]{1,50}$/,
      message: t('publicIp.eidtEipNameReg'),
      trigger: 'blur',
    },
  ],
}

export const lineTypeList: LineTypeInterface[] = [
  { label: t('publicIp.BGP'), value: 1, msg: t('publicIp.conventionalBGPIPTip') }, // 动态BGP
  { label: t('publicIp.catContinentBGP'), value: 2, msg: t('publicIp.catContinentBGPTip') }, // 猫云大陆BGP
  { label: t('publicIp.catPremiumBGP'), value: 3, msg: t('publicIp.tenCentBGPIPTip') }, // 猫云大陆精品BGP
  { label: t('publicIp.catOptimizedBGP'), value: 4, msg: t('publicIp.maoyunBGPIPTip') }, // 猫云大陆优化BGP
]
