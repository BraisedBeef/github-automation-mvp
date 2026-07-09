import t from '@/utils/i18n'
import {
  CVM_KEY,
  LIGHT_WEIGHT_SERVER_KEY,
  OSS_KEY,
  LIGHT_WEIGHT_OBJECT_STORAGE_KEY,
  CLOUD_DEMAND_KEY,
  CDN_KEY,
  DNS_KEY,
  PRIVATE_NETWORK_KEY,
  NETWORK_CARD_KEY,
  IP_KEY,
  ACCELERATOR_KEY,
  DOMAIN_KEY,
  NETWORK_KEY,
  SSL_KEY,
} from '@/config/constant-config'
import { airportUrl } from '@/config/base-config'

// 所有产品服务概览
export const productOverviews = {
  [CVM_KEY]: {
    title: t('productOverview.cloudServer'),
    desc: t('productOverview.cloudServerDesc'),
    official: 'product/cvm', // 官网
    console: {
      routeName: 'ins', // 控制台路由名
    },
  },
  [LIGHT_WEIGHT_SERVER_KEY]: {
    title: t('productOverview.lightWeightServer'),
    desc: t('productOverview.lightWeightServerDesc'),
    official: 'product/las',
    console: {
      routeName: '',
    },
  },
  [OSS_KEY]: {
    title: t('productOverview.objectStorage'),
    desc: t('productOverview.objectStorageDesc'),
    official: 'product/oss',
    console: {
      routeName: 'bucket',
    },
  },
  [LIGHT_WEIGHT_OBJECT_STORAGE_KEY]: {
    title: t('productOverview.lightWeightObjectStorage'),
    desc: t('productOverview.lightWeightObjectStorageDesc'),
    official: 'product/los',
    console: {
      routeName: '',
    },
  },
  [CLOUD_DEMAND_KEY]: {
    title: t('productOverview.cloudDemandServer'),
    desc: t('productOverview.cloudDemandServerDesc'),
    official: 'product/vod',
    console: {
      routeName: '',
    },
  },
  [CDN_KEY]: {
    title: t('productOverview.cdn'),
    desc: t('productOverview.cdnDesc'),
    official: 'product/cdn',
    console: {
      routeName: 'cdn_service',
    },
  },
  [DNS_KEY]: {
    title: t('productOverview.dns'),
    desc: t('productOverview.dnsDesc'),
    official: 'product/dns',
    console: {
      routeName: 'MyDomains',
    },
  },
  [PRIVATE_NETWORK_KEY]: {
    title: t('productOverview.network'),
    desc: t('productOverview.networkDesc'),
    official: 'product/vpc',
    console: {
      routeName: 'network_security_private_network_list',
    },
  },
  [NETWORK_CARD_KEY]: {
    title: t('productOverview.network'),
    desc: t('productOverview.networkDesc'),
    official: 'product/eg',
    console: {
      routeName: 'network_security_network_card_list',
    },
  },
  [IP_KEY]: {
    title: t('productOverview.network'),
    desc: t('productOverview.networkDesc'),
    official: 'product/epnip',
    console: {
      routeName: 'network_security_public_ip_list',
    },
  },
  [ACCELERATOR_KEY]: {
    title: t('productOverview.accelerator'),
    desc: t('productOverview.acceleratorDesc'),
    official: airportUrl,
    console: {
      routeName: '',
    },
  },
  [DOMAIN_KEY]: {
    title: t('productOverview.domain'),
    desc: t('productOverview.domainDesc'),
    official: 'product/domain/home',
    console: {
      routeName: 'domain_overview',
    },
  },
  [NETWORK_KEY]: {
    title: t('productOverview.network'),
    desc: t('productOverview.networkDesc'),
    official: '',
    console: {
      routeName: 'network_security_private_network_list',
    },
  },
  [SSL_KEY]: {
    title: t('productOverview.ssl'),
    desc: t('productOverview.sslDesc'),
    official: '',
    console: {
      routeName: 'ssl_certificate_management',
    },
  },
}
