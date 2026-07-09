import t from '@/utils/i18n'
// 监控方式
export const monitorMethods = [
  { label: 'HTTP', value: 1 },
  { label: 'HTTPS', value: 2 },
  { label: 'TCP', value: 3 },
]

// 监控类型
export const monitorTypes = [
  { label: t('monitorList.monitorType1'), value: 1 },
  { label: t('monitorList.monitorType2'), value: 2 },
]

// 报警规则
export const reportTriggerRules = [
  { label: t('monitorList.alarmStatus1'), active: false, value: 1 },
  { label: t('monitorList.alarmStatus2'), active: false, value: 2 },
  { label: t('monitorList.alarmStatus3'), active: false, value: 3 },
]

// 监控状态
export const monitorStatus = [
  { label: t('monitorList.status1'), value: 1, status: 'success' },
  { label: t('monitorList.status0'), value: 0, status: 'error' },
]

export const EMIAL_REG = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
