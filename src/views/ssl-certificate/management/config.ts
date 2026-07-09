import t from '@/utils/i18n'
import { IPv4_REG, DOMAIN_REG, DOMAIN_WI_REG } from '@/utils/reg'
import { EnumCertificateVerify, EnumCertificateVerifyKey } from '../config'

// ~~~ 自定义配置
// 购买时长
export const BUY_TIME_MAP = [
  {
    label: t('ssl-certificate.management.config.844970-0'),
    value: 1,
  },
  {
    label: t('ssl-certificate.management.config.844970-1'),
    value: 2,
  },
  {
    label: t('ssl-certificate.management.config.844970-2'),
    value: 3,
  },
]

//~~~ 证书列表
// 证书列表tab
export const SSL_CERTIFICATE_MANAGEMENT_TAB = 'ssl-certificate-management-tab'
// 证书状态
export enum StatusTypeEnum {
  // ALL = 0,
  // 申请中
  APPLYING = 1,
  // 待提交
  SUBMIT = 2,
  // 待验证
  VERIFY = 3,
  // 待签发
  ISSUED = 4,
  // 已签发
  ISSUED_SUCCESS = 5,
  // 审核失败
  ISSUED_FAIL = 6,
  // 即将过期
  EXPIRING = 7,
  // 已过期
  EXPIRED = 8,
  // 已吊销
  REVOKED = 9,
  // 待下载 （内部状态）与待签发相同
  DOWNLOADING = 10,
  // 已取消
  CANCEL = 11,
}
export const STATUS_TYPE_MAP: {
  label: string
  color?: string
  issueStatus?: boolean
  filter?: boolean
  value?: number
}[] = [
  {
    label: t('ssl-certificate.management.config.844970-3'),
    value: undefined,
    filter: true,
  },
  {
    label: t('ssl-certificate.management.config.844970-7'),
    color: '#222222',
    issueStatus: false,
    filter: true,
    value: StatusTypeEnum.APPLYING,
  },
  {
    label: t('ssl-certificate.management.config.844970-8'),
    color: '#FC8C00',
    issueStatus: false,
    filter: false,
    value: StatusTypeEnum.SUBMIT,
  },
  {
    label: t('ssl-certificate.management.config.844970-9'),
    color: '#FC8C00',
    issueStatus: false,
    filter: true,
    value: StatusTypeEnum.VERIFY,
  },
  {
    label: t('ssl-certificate.management.config.844970-10'),
    color: '#FC8C00',
    issueStatus: false,
    filter: true,
    value: StatusTypeEnum.ISSUED,
  },
  {
    label: t('ssl-certificate.management.config.844970-11'),
    color: '#0FBE5B',
    issueStatus: true,
    filter: true,
    value: StatusTypeEnum.ISSUED_SUCCESS,
  },
  {
    label: t('ssl-certificate.management.config.844970-12'),
    color: '#FE4D4F',
    issueStatus: true,
    filter: false,
    value: StatusTypeEnum.ISSUED_FAIL,
  },
  {
    label: t('ssl-certificate.management.config.844970-13'),
    color: '#FC8C00',
    issueStatus: true,
    filter: true,
    value: StatusTypeEnum.EXPIRING,
  },
  {
    label: t('ssl-certificate.management.config.844970-14'),
    color: '#FE4D4F',
    issueStatus: true,
    filter: true,
    value: StatusTypeEnum.EXPIRED,
  },
  {
    label: t('ssl-certificate.management.config.844970-15'),
    color: '#222222',
    issueStatus: true,
    filter: false,
    value: StatusTypeEnum.REVOKED,
  },
  {
    // 待下载 （内部状态）与待签发相同
    label: t('ssl-certificate.management.config.844970-10'),
    color: '#FC8C00',
    issueStatus: false,
    filter: false,
    value: StatusTypeEnum.DOWNLOADING,
  },
  {
    label: t('ssl-certificate.management.config.844970-16'),
    color: '#FC8C00',
    issueStatus: false,
    filter: true,
    value: StatusTypeEnum.CANCEL,
  },
]
////~

//~~~ 证书详情
// 证书详情tab
export const SSL_CERTIFICATE_DETAILS_TAB = 'ssl-certificate-details-tab'
////~

// 免费申请证书表单
export const SSL_CERTIFICATE_APPLY_TAB = 'ssl-certificate-apply-tab'
export const SSL_CERTIFICATE_CERT_DOMAIN_TYPE = 'ssl-certificate-cert-domain-type'
export const SSL_CERTIFICATE_VERIFY_TYPE = 'ssl-certificate-verify-type'
export const SSL_CERTIFICATE_FACTORY_ID = 'ssl-certificate-factory-id'

// 证书类型
export const certificateRadios = [
  {
    label: t('ssl-certificate.management.config.844970-17'),
    value: 1,
    tips: `
      ${t('ssl-certificate.management.config.844970-18')}
       <br>
      ${t('ssl-certificate.management.config.844970-19')}
    `,
  },
  {
    label: t('ssl-certificate.management.config.844970-20'),
    value: 2,
    tips: `
      ${t('ssl-certificate.management.config.844970-21')}
       `,
  },
  {
    label: t('ssl-certificate.management.config.844970-22'),
    value: 3,
    tips: `
      ${t('ssl-certificate.management.config.844970-23')}
      <br />
      ${t('ssl-certificate.management.config.844970-24')}
    `,
  },
]

//~ 提交证书申请
interface CsrRadiosType {
  label: string
  value: number
  tips: string
  tooltip?: string
  disabled?: (domain_type: number) => boolean
}
// CSR生成方式
export const csrCreateRadios: CsrRadiosType[] = [
  {
    label: t('ssl-certificate.management.config.844970-25'),
    value: 1,
    tips: `
      ${t('ssl-certificate.management.config.844970-26')}`,
  },
  {
    label: t('ssl-certificate.management.config.844970-27'),
    value: 2,
    tips: `
    ${t('ssl-certificate.management.config.844970-26')}
       `,
  },
  {
    label: t('ssl-certificate.management.config.844970-28'),
    value: 3,
    tips: `
    ${t('ssl-certificate.management.config.844970-29')}
       `,
  },
]

//~ 提交证书申请
interface CertificateRadiosType {
  label: string
  value: number
  key: number
  tips: string
  tooltip?: string
  disabled?: (domain_type: number) => boolean
}
// 证书验证方式
export const certificateVerifyRadios: CertificateRadiosType[] = [
  {
    label: t('ssl-certificate.management.config.844970-30'),
    value: EnumCertificateVerify.MANUAL,
    key: EnumCertificateVerifyKey.MANUAL,
    tips: `
    ${t('ssl-certificate.management.config.844970-31')}
       `,
    //  多域名时，手动DNS验证不可用
    // disabled: domain_type => [2].includes(domain_type),
  },
  {
    label: t('ssl-certificate.management.config.844970-32'),
    value: EnumCertificateVerify.MANUAL,
    key: EnumCertificateVerifyKey.AUTO,
    tooltip: t('ssl-certificate.management.config.844970-33'),
    tips: `
    ${t('ssl-certificate.management.config.844970-34')}
       `,
  },
  {
    label: t('ssl-certificate.management.config.844970-35'),
    value: EnumCertificateVerify.FILE,
    key: EnumCertificateVerifyKey.FILE,
    tips: `
    ${t('ssl-certificate.management.config.844970-36')}
       `,
    // 多域名、通配符域名时, 文件验证不可用
    disabled: domain_type => [2, 3].includes(domain_type),
  },
]

/**
 * 单域名校验规则
 * @param domain 域名
 * @returns 是否合法
 */
export const validSingleDomain = (domain: string) => {
  // ip格式或者域名格式
  if (!IPv4_REG.test(domain) && !DOMAIN_REG.test(domain)) return false

  return true
}

/**
 * 通配符域名校验规则
 * @param domains 域名列表
 * @returns 是否合法
 */
export const validWildcardDomain = (domain: string) => {
  return DOMAIN_WI_REG.test(domain)
}

//~ 验证域名

////~

// 部署状态
export enum DeployTypeEnum {
  NotAssociated = 1,
  CDN = 2,
  // TODO DNS = 3,
  // DNS = 3,
}
export const deploy_type_map = [
  {
    label: t('ssl-certificate.management.config.844970-37'),
    value: DeployTypeEnum.NotAssociated,
  },
  {
    label: t('ssl-certificate.management.config.844970-41'),
    value: DeployTypeEnum.CDN,
  },
]
// 托管状态
export const hosting_type_map = [
  '-',
  t('ssl-certificate.management.config.844970-39'),
  t('ssl-certificate.management.config.844970-40'),
  t('ssl-certificate.management.config.844970-38'),
]
