import t from '@/utils/i18n'

// ~~~ 自定义配置
// TODO 购买时长
export const BUY_TIME_MAP = [
  {
    label: t('ssl-certificate.purchase.config.279541-0'),
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
export const ENCRYPTION_STANDARDS_AMP = [
  {
    id: 1,
    code: '',
    name: t('ssl-certificate.purchase.config.279541-1'),
    status: 1,
    remark: t('ssl-certificate.purchase.config.279541-2'),
    iconName: 'standard',
  },
]
// 证书品牌
enum CertificateBrands {
  // letsencrypt 厂商
  LETSENCRYPT = 2,
  // zerossl 厂商
  ZEROSSL = 1,
}
export const CERTIFICATE_BRANDS_MAP = [
  {
    id: CertificateBrands.LETSENCRYPT,
    code: 'letsencrypt',
    name: 'letsencrypt',
    status: 1,
    remark: t('ssl-certificate.purchase.config.279541-4'),
    iconName: 'windmill',
  },
  {
    id: CertificateBrands.ZEROSSL,
    code: 'zerossl',
    name: 'zerossl',
    status: 1,
    remark: t('ssl-certificate.purchase.config.279541-3'),
    iconName: 'encryption',
  },
]

// 证书种类TYPES
enum CertificateIds {
  DV = 1,
  OV = 2,
}
export const CERTIFICATE_TYPES_MAP = [
  {
    id: CertificateIds.DV,
    code: '',
    name: 'DV',
    status: 1,
    remark: t('ssl-certificate.purchase.config.279541-5', { f: '|' }),
  },
  {
    id: CertificateIds.OV,
    code: '',
    name: 'OV',
    status: 1,
    remark: t('ssl-certificate.purchase.config.279541-8', { f: '|' }),
  },
]
// 域名类型
enum CertDomainTypes {
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
    name: t('ssl-certificate.purchase.config.279541-9'),
    code: '',
    status: '',
    remark: `
      ${t('ssl-certificate.purchase.config.279541-10')}
       <br>
       ${t('ssl-certificate.purchase.config.279541-11')}
    `,
  },
  {
    id: CertDomainTypes.MULTIPLE,
    name: t('ssl-certificate.purchase.config.279541-12'),
    code: '',
    status: '',
    remark: `
    ${t('ssl-certificate.purchase.config.279541-13')}
       `,
  },
  {
    id: CertDomainTypes.WILDCARD,
    name: t('ssl-certificate.purchase.config.279541-14'),
    code: '',
    status: '',
    remark: `
      ${t('ssl-certificate.purchase.config.279541-15')}
      <br />
      ${t('ssl-certificate.purchase.config.279541-16')}
    `,
  },
]
