import t from '@/utils/i18n'
import { OperationalModule } from '@/store/interface'
import { cdnRoutes } from './cdn'
import { domainRoutes } from './domain'
import { dnsRoutes } from './dns'
import { costRoutes } from './cost-center'
import { userRoutes } from './account-system'
import { cvmRoutes } from './cvm'
import { networkRoutes } from './network'
import { sslRoutes } from './ssl-certificate'
import { ossRoutes } from './oss'
import { homeRoutes } from './home'
import { productRoutes } from './product'
import { viewTestRoutes } from './test'

// 模块路由集合
export const modelRoutes = [
  {
    path: '/cdn',
    meta: {
      title: t('model.cdn'),
      leftIcon: 'productions-cdn',
    },
    children: [...cdnRoutes],
  },
  {
    path: '/dns',
    meta: {
      title: t('model.dns'),
      leftIcon: 'productions-dns',
    },
    children: [...dnsRoutes, ...viewTestRoutes],
  },
  {
    path: '/domain',
    meta: {
      title: t('model.domain'),
      leftIcon: 'productions-domain',
    },
    children: [...domainRoutes],
  },
  {
    path: '/cvm',
    meta: {
      title: t('model.cvm'),
      leftIcon: 'productions-cvm',
    },
    children: [...cvmRoutes],
  },
  {
    path: '/network',
    meta: {
      title: t('model.network'),
      leftIcon: 'productions-network',
    },
    children: [...networkRoutes],
  },
  {
    path: '/ssl',
    meta: {
      title: t('model.certificate'),
      leftIcon: 'productions-ssl',
    },
    children: [...sslRoutes],
  },
  {
    path: '/oss',
    meta: {
      title: t('model.oss'),
      leftIcon: 'productions-ssl',
    },
    children: [...ossRoutes],
  },
]

// 路由map
export const routesMap = new Map()

routesMap.set('/cdn', {
  title: t('model.cdn'),
  icon: 'v2-cdn',
  routes: cdnRoutes,
})

routesMap.set('/dns', {
  title: t('model.dns'),
  icon: 'productions-dns',
  routes: [...dnsRoutes, ...viewTestRoutes],
})

routesMap.set('/domain', {
  title: t('model.domain'),
  icon: 'productions-domain',
  routes: domainRoutes,
})

routesMap.set('/account-system', {
  title: t('model.user'),
  icon: 'menu-user',
  routes: userRoutes,
})

routesMap.set('/cost-center', {
  title: t('model.cost'),
  icon: 'menu-cost-center-user',
  routes: costRoutes,
})

routesMap.set('/cvm', {
  title: t('model.cvm'),
  icon: 'productions-cvm',
  routes: cvmRoutes,
})

routesMap.set('/network', {
  title: t('model.network'),
  icon: 'productions-network',
  routes: networkRoutes,
})

routesMap.set('/home', {
  title: t('model.home'),
  icon: 'menu-user',
  routes: homeRoutes,
})

routesMap.set('/product', {
  title: t('model.product'),
  icon: 'menu-cost-center-user',
  routes: productRoutes,
})

routesMap.set('/ssl', {
  title: t('model.certificate'),
  icon: 'productions-ssl',
  routes: sslRoutes,
})

routesMap.set('/oss', {
  title: t('model.oss'),
  routes: ossRoutes,
})

export const getRouteModel = (
  key: OperationalModule,
): { title: string; icon: string; routes: PlusRouteRecordRaw[] } | undefined => {
  return routesMap.get(key)
}
