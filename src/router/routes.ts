import { dnsRoutes } from './dns'
import { cdnRoutes } from './cdn'
import { domainRoutes } from './domain'
import { authRoutes } from './auth'
import { costRoutes } from './cost-center'
import { userRoutes } from './account-system'
import { cvmRoutes } from './cvm'
import { networkRoutes } from './network'
import { sslRoutes } from './ssl-certificate'
import { ossRoutes } from './oss'
import { homeRoutes } from './home'
import { productRoutes } from './product'
import { viewTestRoutes } from './test'

const legacySelfManagedHeaderRoutes = new Set([
  '/cvm/disk/list',
  '/cvm/disk/detail/:id',
  '/cvm/image/list',
  '/cvm/image/common/detail/:id',
  '/cvm/image/custom/detail/:id',
  '/cvm/ins/list',
  '/cvm/ins/detail/:id/:uuid/:name',
  '/cvm/recovery/ins',
  '/cvm/recovery/disk',
  '/cvm/snapshot/list',
  '/cvm/snapshot/detail/:id',
  '/cvm/snapshot/chain/:id',
  '/cvm/ssh-key/list',
  '/cvm/ssh-key/detail/:id',
  '/dns/batch-operation',
  '/dns/domain-layout',
  '/dns/add-monitor',
  '/oss/bucket/list',
  '/oss/bucket/detail/:id/:region/:name',
])

const isEntryRouteComponent = (component: PlusRouteRecordRaw['component']) => {
  return typeof component === 'function' && component.toString().includes('/entry.vue')
}

const withAutoRouteMeta = (routeList: PlusRouteRecordRaw[]) => {
  routeList.forEach(route => {
    if (isEntryRouteComponent(route.component)) {
      route.meta = {
        ...route.meta,
        ...(legacySelfManagedHeaderRoutes.has(route.path) ? { hidePageHeaderInV1: true } : {}),
        hidePageHeaderInV2: true,
      }
    }

    if (route.children?.length) {
      withAutoRouteMeta(route.children)
    }
  })
}

// 外界
const outRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/google-auth',
    name: 'GoogleAuth', // 谷歌验证码
    component: () => import('@/views/special/google-auth.vue'),
  },
]

// 外壳
export const coverRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/layout',
    name: 'Layout',
    component: () => import('@/layout/default-layout.vue'),
    children: [
      ...dnsRoutes, // dns
      ...cdnRoutes, // cdn
      ...domainRoutes, //domain
      ...costRoutes, // 费用中心
      ...userRoutes, // 用户系统
      ...cvmRoutes, // cvm
      ...networkRoutes, // network
      ...sslRoutes, // ssl 证书管理
      ...ossRoutes, // oss
      ...viewTestRoutes,
      ...homeRoutes, // 首页
      ...productRoutes, // 产品预览
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('@/views/error/404.vue'),
  },
]

// 杂项
const otherRoutes: PlusRouteRecordRaw[] = [
  {
    path: '/coder',
    name: 'Coder',
    component: () => import('@/views/special/coder.vue'),
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('@/views/special/practice.vue'),
  },
]

export const routes: PlusRouteRecordRaw[] = [
  {
    path: '/',
    name: '/',
    redirect: '/layout',
  },
  {
    path: '/from-admin',
    name: 'FromAdmin',
    component: () => import('@/views/special/from-admin.vue'),
    meta: {
      public: true,
    },
  },
  ...otherRoutes,
  ...coverRoutes,
  ...authRoutes,
  ...outRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('@/views/error/404.vue'),
  },
]

withAutoRouteMeta(routes)
