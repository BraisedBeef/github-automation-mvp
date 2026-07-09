import t from '@/utils/i18n'

// 0 全部 1 7天内 2 15天内 3 30天内 4 3个月内
export const timeOptionsMap = (num: number) => [
  `${t('renewalManagement.all')}(${num})`,
  `${t('renewalManagement.expiresWithin7Days')}(${num})`,
  `${t('renewalManagement.expiresWithin15Days')}(${num})`,
  `${t('renewalManagement.expiresWithin30Days')}(${num})`,
  `${t('renewalManagement.expiresWithin3Month')}(${num})`,
]

// 云服务器ID、云硬盘ID、弹性公网IPID
export const CloudServerID = '232943027957630'
export const CloudDiskID = '232943027957631'
export const ElasticIPID = '232943027957632'
