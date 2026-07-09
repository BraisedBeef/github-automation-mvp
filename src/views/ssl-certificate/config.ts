import t from '@/utils/i18n'

// ~~~ 自定义配置
// TODO 购买时长
export const BUY_TIME_MAP = [
  {
    label: t('ssl-certificate.config.441712-0'),
    value: 1,
    validity: 90,
  },
  // {
  //   label: '1年',
  //   value: 2,
  //   validity: 365,
  // },
]
// 加密标准
export enum EncryptionStandardsEnum {
  InternationalStandards = 1,
}
export const ENCRYPTION_STANDARDS_AMP = [
  {
    id: EncryptionStandardsEnum.InternationalStandards,
    code: '',
    name: t('ssl-certificate.config.441712-1'),
    status: 1,
    remark: t('ssl-certificate.config.441712-2'),
    iconName: 'standard',
  },
]
// 证书品牌
export enum CertificateBrandsIds {
  zerossl = 1,
  letsencrypt = 2,
}
export const CERTIFICATE_BRANDS_MAP = [
  {
    id: CertificateBrandsIds.letsencrypt,
    code: 'letsencrypt',
    name: 'letsencrypt',
    status: 1,
    remark: t('ssl-certificate.config.441712-3'),
    iconName: 'windmill',
  },
  {
    id: CertificateBrandsIds.zerossl,
    code: 'zerossl',
    name: 'zerossl',
    status: 1,
    remark: t('ssl-certificate.config.441712-4'),
    iconName: 'encryption',
  },
]

// 证书种类TYPES
export enum CertificateIds {
  DV = 1,
  OV = 2,
}
export const CERTIFICATE_TYPES_MAP = [
  {
    id: CertificateIds.DV,
    code: '',
    desc: t('ssl-certificate.purchase.custom.755827-9'),
    name: 'DV',
    fullName: `${t('ssl-certificate.purchase.custom.755827-9')}(DV)`,
    status: 1,
    remark: t('ssl-certificate.config.441712-5', { f: '|' }),
  },
  {
    id: CertificateIds.OV,
    code: t('ssl-certificate.purchase.custom.755827-24'),
    name: 'OV',
    fullName: `${t('ssl-certificate.purchase.custom.755827-24')}(OV)`,
    status: 1,
    remark: t('ssl-certificate.config.441712-8', { f: '|' }),
  },
]
// 域名类型
export enum CertDomainTypes {
  // 单域名
  SINGLE = 1,
  // 多域名
  MULTIPLE = 2,
  // 通配符
  WILDCARD = 3,
}
export const CERT_DOMAIN_TYPES_MAP = [
  {
    id: CertDomainTypes.SINGLE,
    name: t('ssl-certificate.config.441712-9'),
    code: '',
    status: '',
    remark: `
      ${t('ssl-certificate.config.441712-10')}
       <br>
      ${t('ssl-certificate.config.441712-11')}
    `,
  },
  {
    id: CertDomainTypes.MULTIPLE,
    name: t('ssl-certificate.config.441712-12'),
    code: '',
    status: '',
    remark: `
      ${t('ssl-certificate.config.441712-13')}
       `,
  },
  {
    id: CertDomainTypes.WILDCARD,
    name: t('ssl-certificate.config.441712-14'),
    code: '',
    status: '',
    remark: `
      ${t('ssl-certificate.config.441712-15')}
       <br />
       ${t('ssl-certificate.config.441712-16')}
    `,
  },
]

// 密钥算法MAP
export enum EncryptionTypes {
  RSA = 1,
  ECDSA = 2,
}
export const ENCRYPTION_MAP = [
  {
    label: 'RSA',
    value: EncryptionTypes.RSA,
  },
  {
    label: 'ECDSA',
    value: EncryptionTypes.ECDSA,
  },
]

// 密钥强度MAP
export const KEY_LENGTH_MAP = [
  {
    label: '2048',
    value: 1,
    encryption: 1,
  },
  {
    label: '3072',
    value: 2,
    encryption: 1,
  },
  {
    label: '4096',
    value: 2,
    encryption: 1,
  },
  {
    label: 'P256',
    value: 4,
    encryption: 2,
  },
  {
    label: 'P384',
    value: 5,
    encryption: 2,
  },
  {
    label: 'P521',
    value: 6,
    encryption: 2,
  },
  {
    label: 'P224',
    value: 7,
    encryption: 2,
  },
]

// 证书来源
export enum CertificateSource {
  ALL = 0,
  FREE = 1,
  SELF = 2,
  SystemGeneration = 99,
}
export const CERTIFICATE_SOURCE_MAP = [
  {
    label: t('ssl-certificate.config.441712-17'),
    value: CertificateSource.FREE,
  },
  {
    label: t('ssl-certificate.config.441712-18'),
    value: CertificateSource.SELF,
  },
  {
    label: t('ssl-certificate.config.441712-19'),
    value: CertificateSource.SystemGeneration,
  },
]

// 证书验证方式
export enum EnumCertificateVerify {
  MANUAL = 1,
  FILE = 2,
}
// 证书验证方式MAP
export enum EnumCertificateVerifyKey {
  MANUAL = 1,
  FILE = 2,
  AUTO = 3,
}

// 证书下载类型
export enum SSLCertDownloadEnum {
  // Apache（crt文件、key文件）
  Apache = 1,
  // Nginx（适合大部分场景）（pem文件、crt文件、key文件）
  Nginx = 2,
  // 腾讯云宝塔面板（pem文件、crt文件、key文件）
  IIS = 3,
}
export const SSLCertTypes = [
  {
    tips: t('ssl-certificate.management.index.922533-58'),
    type: 'Apache',
    content: 'Apache',
    value: SSLCertDownloadEnum.Apache,
  },
  {
    tips: t('ssl-certificate.management.index.922533-59'),
    type: 'Nginx',
    content: 'Nginx',
    value: SSLCertDownloadEnum.Nginx,
  },
  {
    tips: t('ssl-certificate.management.index.922533-60'),
    type: 'IIS',
    content: 'BT',
    value: SSLCertDownloadEnum.IIS,
  },
]

// 托管状态
export enum HostingStatusEnum {
  // 全部
  Status0 = 0,
  // 托管中
  Status1 = 1,
  // 托管完成
  Status2 = 2,
  // 取消托管
  Status3 = 3,
  // 托管失败
  Status4 = 4,
}
export const StatusTypeMap: {
  label: string
  color?: string
  filter?: boolean
  value?: number
}[] = [
  {
    label: t('ssl-certificate.hoting.index.614567-45'),
    value: HostingStatusEnum.Status0,
    filter: true,
  },
  {
    label: t('ssl-certificate.hoting.index.614567-63'),
    value: HostingStatusEnum.Status1,
  },
  {
    label: t('ssl-certificate.hoting.index.614567-64'),
    value: HostingStatusEnum.Status2,
  },
  {
    label: t('ssl-certificate.hoting.index.614567-65'),
    value: HostingStatusEnum.Status3,
  },
  {
    label: t('ssl-certificate.hoting.index.614567-66'),
    value: HostingStatusEnum.Status4,
  },
]

export enum AssociatedTypeEnum {
  // 系统自动检检测
  AUTO = 1,
  // 用户指定证书
  MANUAL = 2,
}
export const associatedTypeMap = [
  {
    label: t('ssl-certificate.hoting.index.614567-43'),
    value: AssociatedTypeEnum.AUTO,
    desc: t('ssl-certificate.hoting.index.614567-22-0'),
  },
  {
    label: t('ssl-certificate.hoting.index.614567-21'),
    value: AssociatedTypeEnum.MANUAL,
    desc: t('ssl-certificate.hoting.index.614567-22'),
  },
]
