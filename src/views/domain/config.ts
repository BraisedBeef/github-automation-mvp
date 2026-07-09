import t from '@/utils/i18n'

export const statusList: any = [
  { label: t('domain.config.746619-0'), value: 0, color: '' },
  { label: t('domain.config.746619-1'), value: 1, color: 'var(--success-color)' },
  { label: t('domain.config.746619-2'), value: 2, color: 'var(--warning-color)' },
  { label: t('domain.config.746619-3'), value: 3, color: '' },
  { label: t('domain.config.746619-4'), value: 4, color: 'var(--error-color)' },
  { label: t('domain.config.746619-5'), value: 5, color: 'var(--primary-color)' },
]

export const autoPayList: any = [
  { label: t('domain.config.746619-0'), value: 0 },
  { label: t('domain.config.746619-6'), value: 1 },
  { label: t('domain.config.746619-7'), value: 2 },
]

export const batchList: any = [
  { label: t('domain.config.746619-8'), value: 0 },
  { label: t('domain.config.746619-9'), value: 1 },
  { label: t('domain.config.746619-10'), value: 2 },
  { label: t('domain.config.746619-11'), value: 3 },
  { label: t('domain.config.746619-12'), value: 4 },
]

export const domainTemplateXlsx = 'https://maoyun-yuming-1324647293.cos.ap-guangzhou.myqcloud.com/domains.xls'

export const moreBatchList: any = [
  {
    label: t('domain.config.746619-13'),
    value: 0,
  },
  {
    label: t('domain.config.746619-14'),
    value: 1,
  },
  {
    label: t('domain.config.746619-15'),
    value: 2,
  },
  {
    label: t('domain.config.746619-16'),
    value: 3,
  },
  {
    label: t('domain.config.746619-17'),
    value: 4,
  },
  {
    label: t('domain.config.746619-18'),
    value: 5,
  },
  {
    label: t('domain.config.746619-19'),
    value: 6,
  },
]

export const yearList: any = [
  { label: t('domain.config.746619-20'), value: 1 },
  { label: t('domain.config.746619-21'), value: 2 },
]

export const dnsTypeList: any = [
  { label: t('domain.config.746619-22'), value: 0 },
  { label: t('domain.config.746619-23'), value: 1 },
]

export const initDomain = (domain: string) => {
  return domain
    .replace(/[^0-9a-z-]/gi, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 53)
}

export const sortIconList = ['sort', 'sort-down', 'sort-up']

export const download = (url: string) => {
  const link = document.createElement('a')
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const TOP_DOMAIN_REG1 = /^([a-z0-9]{1,}\.)([a-z]{2,10})$/
const TOP_DOMAIN_REG2 = /^([a-z0-9]{1,}(?!.*--)[a-z0-9-]{0,}[a-z0-9]{1,}\.)([a-z]{2,10})$/

export const validTopDomain = (domain_string: string) => {
  const arr = domain_string?.trim().split('\n')
  return arr.every(v => (TOP_DOMAIN_REG1.test(v) || TOP_DOMAIN_REG2.test(v)) && v.length < 76)
}

const suffix = ['eu', 'in', 'nl', 'uk', 'us']
export const validTopDomainSuffix = (domain_string: string) => {
  const arr = domain_string
    ?.trim()
    .split('\n')
    .map(v => v.split('.')[1])
  return arr.every(v => !suffix.includes(v))
}
