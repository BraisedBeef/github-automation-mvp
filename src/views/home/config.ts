import t from '@/utils/i18n'
import {
  CDN,
  DNS,
  OSS,
  CVM,
  NETWORK_CARD,
  IP,
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
  NETWORK,
  PRIVATE_NETWORK,
  NETWORK_KEY,
} from '@/config/constant-config'
import { airportUrl } from '@/config/base-config'

// 计算
export const calcList = {
  big: t('home.calc'),
  icon: 'calc-product',
  smalls: [
    {
      label: t('home.cloudServer'),
      value: CVM_KEY,
      productId: CVM,
    },
    {
      label: t('home.lightWeightServer'),
      value: LIGHT_WEIGHT_SERVER_KEY,
    },
  ],
}

// 基础存储服务
export const storageList = {
  big: t('home.storage'),
  icon: 'storage-product',
  smalls: [
    {
      label: t('home.objectStorage'),
      value: OSS_KEY,
      productId: OSS,
    },
    {
      label: t('home.lightWeightObjectStorage'),
      value: LIGHT_WEIGHT_OBJECT_STORAGE_KEY,
    },
  ],
}

// 视频服务
export const videoList = {
  big: t('home.video'),
  icon: 'video-product',
  smalls: [
    {
      label: t('home.cloudDemand'),
      value: CLOUD_DEMAND_KEY,
    },
  ],
}

// CDN与边缘平台
export const cdnList = {
  big: t('home.cdnSys'),
  icon: 'cdn-product',
  smalls: [
    {
      label: t('home.cdn'),
      value: CDN_KEY,
      productId: CDN,
    },
  ],
}

// 云上网络
export const networkList = {
  big: t('home.network'),
  icon: 'network-product',
  smalls: [
    {
      label: t('home.dnsProduct'),
      value: DNS_KEY,
      productId: DNS,
    },
    {
      label: t('home.proviateNetwork'),
      value: PRIVATE_NETWORK_KEY,
      productId: PRIVATE_NETWORK,
    },
    {
      label: t('home.networkCard'),
      value: NETWORK_CARD_KEY,
      productId: NETWORK_CARD,
    },
    {
      label: t('home.ip'),
      value: IP_KEY,
      productId: IP,
    },
    {
      label: t('home.accelerator'),
      value: ACCELERATOR_KEY,
    },
  ],
}

// 产品文档
export const docList = [
  {
    label: t('home.cloudServer'),
    value: CVM_KEY,
    official: 'document/detail?type=cvm', // 官网
  },
  {
    label: t('home.lightWeightServer'),
    value: LIGHT_WEIGHT_SERVER_KEY,
    official: 'document/detail?type=las',
  },
  {
    label: t('home.objectStorage'),
    value: OSS_KEY,
    official: 'document/detail?type=oss',
  },
  {
    label: t('home.lightWeightObjectStorage'),
    value: LIGHT_WEIGHT_OBJECT_STORAGE_KEY,
    official: 'document/detail?type=los',
  },
  {
    label: t('home.dnsProduct'),
    value: DNS_KEY,
    official: 'document/detail?type=dns',
  },
  {
    label: t('home.proviateNetwork'),
    value: PRIVATE_NETWORK_KEY,
    official: 'document/detail?type=vpc',
  },
  {
    label: t('home.networkCard'),
    value: NETWORK_CARD_KEY,
    official: 'document/detail?type=eg',
  },
  {
    label: t('home.ip'),
    value: IP_KEY,
    official: 'document/detail?type=epnip',
  },
  {
    label: t('home.accelerator'),
    value: ACCELERATOR_KEY,
    official: airportUrl,
  },
  {
    label: t('home.cloudDemand'),
    value: CLOUD_DEMAND_KEY,
    official: 'document/detail?type=vod',
  },
  {
    label: t('home.cdnProduct'),
    value: CDN_KEY,
    official: 'document/detail?type=cdn',
  },
]

export const latelyT = {
  '/dns': t('model.dns'),
  '/cdn': t('model.cdn'),
  '/oss': t('model.oss'),
  '/domain': t('model.domain'),
  '/cvm': t('model.cvm'),
  '/network': t('model.network'),
}
