import { _domainRegisterCnt, _getDnsDomain, _getDomainCount, _getMetricValue, _productApilist } from '@/apis/home'
import { CDN, CDN_KEY, CVM, CVM_KEY, DNS, DNS_KEY, DOMAIN, DOMAIN_KEY } from '@/config/constant-config'
import { documentUrl } from '@/config/base-config'
import { handleCopyValue } from '@/utils/dom-utils'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { getRequestDetail } from '@/utils/unit'
import { getFluxDetail } from '@/utils/unit'
import { getRouteModel } from '@/router/map'
import { pushRoute } from '@/utils/router-jump'
import { useBaseStore, useUserStore } from '@/store'
import { productOverviews } from '@/views/product/overview/config'
import { usePermission } from '@/hooks/permission/use-permission'
import { _filterRoutes } from '@/utils/router-utils'

type MetricState = {
  inland: number
  overseas: number
  total: number
  overseasP: string
  inlandP: string
}

const createMetricState = (): MetricState => ({
  inland: 0,
  overseas: 0,
  total: 0,
  overseasP: '0%',
  inlandP: '0%',
})

const featuredProducts = [
  {
    key: DNS_KEY,
    productId: DNS,
    titleKey: 'home.dnsProduct',
    descKey: 'home.v2FeaturedDnsDesc',
    supportKey: 'home.v2FeaturedDnsSupport',
    badgeKey: 'home.v2FeaturedBadge',
    actionKey: 'home.v2StartUsing',
  },
  {
    key: DOMAIN_KEY,
    productId: DOMAIN,
    titleKey: 'home.domainRegister',
    descKey: 'home.v2FeaturedDomainDesc',
    supportKey: 'home.v2FeaturedDomainSupport',
    badgeKey: 'home.v2FeaturedBadgeAlt',
    actionKey: 'home.v2StartRegister',
  },
  {
    key: CVM_KEY,
    productId: CVM,
    titleKey: 'home.cloudServer',
    descKey: 'home.v2FeaturedCvmDesc',
    supportKey: 'home.v2FeaturedCvmSupport',
    badgeKey: 'home.v2FeaturedBadgeAlt',
    actionKey: 'home.v2StartUsing',
  },
] as const

const getMetricPercent = (value: number, total: number) => {
  if (!total) return '0%'
  return `${(value / total) * 100}%`
}

export const useHomeMainDashboard = () => {
  const userStore = useUserStore()
  const baseStore = useBaseStore()
  const cdnPermission = usePermission('cdn:**')
  const dnsPermission = usePermission('dns:**')
  const cvmPermission = usePermission('vcloudCvm:**')
  const domainPermission = usePermission('domain:**')

  const cdn = ref<any>({})
  const domain = ref<any>({})
  const dns = ref({
    domain: 0,
    invalid_domain: 0,
    effective_domain: 0,
    parse: 0,
    ssl: 0,
  })
  const productDocs = ref<any[]>([])
  const activeFeaturedKey = ref<string>(DNS_KEY)

  const flowMetric = reactive<MetricState>(createMetricState())
  const reqMetric = reactive<MetricState>(createMetricState())

  const accessHistory = computed(() => {
    const userId = userStore.user?.id
    if (!userId) return []
    return baseStore.accessHistory[userId] || []
  })

  const resourceCards = computed(() => {
    const cards = []

    if (cdnPermission.checkPermissionRes && flowMetric.total) {
      const flowDetail = getFluxDetail(flowMetric.total)
      cards.push({
        key: CDN_KEY,
        icon: 'v2-cdn',
        productId: CDN,
        title: t('home.cdn'),
        value: flowDetail.count,
        unit: flowDetail.unit,
        detail: t('home.yesterdayDataUsage'),
        detailValue: `${t('home.yesterdayDataUsage')} ${flowDetail.count} ${flowDetail.unit}`,
        routeKey: 'cdn',
      })
    }

    if (dnsPermission.checkPermissionRes && dns.value?.domain) {
      cards.push({
        key: DNS_KEY,
        icon: 'v2-dns',
        productId: DNS,
        title: t('home.dnsProduct'),
        value: dns.value.domain,
        unit: t('home.indivual'),
        detail: t('home.dnsNum'),
        detailValue: `${dns.value.domain} ${t('home.indivual')}`,
        routeKey: 'dns',
      })
    }

    if (cvmPermission.checkPermissionRes && userStore.user.instanceNum) {
      cards.push({
        key: CVM_KEY,
        icon: 'v2-server',
        productId: CVM,
        title: t('home.cloudServer'),
        value: userStore.user.instanceNum,
        unit: t('home.tower'),
        detail: t('home.cloudServer'),
        detailValue: `${userStore.user.instanceNum} ${t('home.tower')}`,
        routeKey: 'cvm',
      })
    }

    if (domainPermission.checkPermissionRes && domain.value?.cnt) {
      cards.push({
        key: DOMAIN_KEY,
        icon: 'menu-overview-domain',
        productId: DOMAIN,
        title: t('home.domainRegister'),
        value: domain.value.cnt,
        unit: t('home.indivual'),
        detail: t('home.domainRegisterNum'),
        detailValue: `${domain.value.cnt} ${t('home.indivual')}`,
        routeKey: 'domain',
      })
    }

    return cards
  })

  const showResourceEmpty = computed(() => {
    if (
      !dnsPermission.checkPermissionRes &&
      !cdnPermission.checkPermissionRes &&
      !cvmPermission.checkPermissionRes &&
      !domainPermission.checkPermissionRes
    ) {
      return true
    }

    return resourceCards.value.length === 0
  })

  const featuredItems = computed(() => {
    const productDTOS = userStore.user?.productDTOS || []

    return featuredProducts.map(item => {
      const product = productDTOS.find(productItem => productItem.productId === item.productId)

      return {
        ...item,
        ...product,
        online: !!product,
        title: t(item.titleKey),
        description: t(item.descKey),
        supportText: t(item.supportKey),
        badge: t(item.badgeKey),
        actionText: t(item.actionKey),
      }
    })
  })

  const activeFeatured = computed(() => {
    return featuredItems.value.find(item => item.key === activeFeaturedKey.value) || featuredItems.value[0]
  })

  const cdnFluxDetail = computed(() => getFluxDetail(flowMetric.total))
  const reqFluxDetail = computed(() => getRequestDetail(reqMetric.total))

  const handleCopy = async (value: string | number) => {
    await handleCopyValue(value)
    message.success(t('domainSet2.copySuccess'))
  }

  const openAccessRoute = (item: any) => {
    const route = getRouteModel(item.path)?.routes?.[0]
    if (route?.path) {
      pushRoute({ path: route.path })
    }
  }

  const toUserCreate = () => {
    pushRoute({
      name: 'access_user_create',
      query: {
        title: t('home.console'),
        path: '/home',
      },
    })
  }

  const toRoleCreate = () => {
    pushRoute({
      name: 'access_role_create',
      query: {
        title: t('home.console'),
        path: '/home',
      },
    })
  }

  const toOrder = () => {
    pushRoute({
      name: 'order',
      query: {
        title: t('home.console'),
        path: '/home',
      },
    })
  }

  const toRecharge = () => {
    pushRoute({
      name: 'cost_center_account_recharge',
      query: {
        title: t('home.console'),
        path: '/home',
      },
    })
  }

  const registerDomain = () => {
    pushRoute({
      name: 'domain_overview',
      query: {
        title: t('home.console'),
        path: '/home',
      },
    })
  }

  const addDns = () => {
    pushRoute({
      name: 'MyDomains',
      query: {
        title: t('home.console'),
        path: '/home',
      },
    })
  }

  const goCdn = () => {
    pushRoute({ name: 'cdn_service' })
  }

  const goDocumentCenter = () => {
    window.open(documentUrl, '_blank')
  }

  const goOfficialDoc = (productId: number) => {
    const url = `${documentUrl}document/detail/${productId}`
    window.open(url, '_blank')
  }

  const goConsole = (item: any) => {
    if (!item) return

    if (!item.online) {
      pushRoute({
        name: 'product_overview',
        query: {
          product: item.key,
          productId: item.productId,
        },
      })
      return
    }

    if (item.flag) {
      const routeName = productOverviews[item.key]?.console?.routeName
      if (routeName) {
        pushRoute({ name: routeName })
      }
      return
    }

    pushRoute({
      name: 'product_overview',
      query: {
        product: item.key,
        productId: item.productId,
      },
    })
  }

  const goResourceConsole = (item: any) => {
    if (!item?.routeKey) return
    const routeModel = getRouteModel(('/' + item.routeKey.toLowerCase()) as any)
    const route = _filterRoutes(routeModel?.routes || [])[0]

    if (route) {
      pushRoute(route)
    }
  }

  const startTrial = () => {
    const target = featuredItems.value.find(item => item.key === CVM_KEY) || activeFeatured.value
    goConsole(target)
  }

  const fetchDomainRegisterCount = async () => {
    try {
      const res = await _domainRegisterCnt()
      if (res.data) {
        domain.value = res.data
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchDnsDomain = async () => {
    try {
      const res = await _getDnsDomain()
      if (res.data) {
        dns.value = res.data
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchDomainCount = async () => {
    try {
      const res = await _getDomainCount()
      if (res.data) {
        cdn.value = res.data.total || {}
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchMetricValue = async (metric: number) => {
    const now = maoYunDayJs()
    const yesterday = now.subtract(1, 'day')

    try {
      const res = await _getMetricValue({
        metric,
        startTime: yesterday.startOf('day').unix(),
        endTime: yesterday.endOf('day').unix(),
      })

      if (!res.data) return

      if (metric === 0) {
        flowMetric.inland = res.data.inland
        flowMetric.overseas = res.data.overseas
        flowMetric.total = res.data.total
        flowMetric.overseasP = getMetricPercent(res.data.overseas, res.data.total)
        flowMetric.inlandP = getMetricPercent(res.data.inland, res.data.total)
      }

      if (metric === 2) {
        reqMetric.inland = res.data.inland
        reqMetric.overseas = res.data.overseas
        reqMetric.total = res.data.total
        reqMetric.overseasP = getMetricPercent(res.data.overseas, res.data.total)
        reqMetric.inlandP = getMetricPercent(res.data.inland, res.data.total)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchProductDocs = async () => {
    try {
      const res = await _productApilist()
      if (res.code === 10000) {
        productDocs.value = res.data || []
      }
    } catch (error) {
      console.log(error)
    }
  }

  const init = async () => {
    await userStore.getUser()

    if (!featuredItems.value.find(item => item.key === activeFeaturedKey.value)) {
      activeFeaturedKey.value = featuredItems.value[0]?.key || DNS_KEY
    }

    fetchMetricValue(0)
    fetchMetricValue(2)
    fetchDomainCount()
    fetchDnsDomain()
    fetchDomainRegisterCount()
    fetchProductDocs()
  }

  return {
    accessHistory,
    activeFeatured,
    activeFeaturedKey,
    cdn,
    cdnFluxDetail,
    dns,
    domain,
    featuredItems,
    flowMetric,
    goCdn,
    goConsole,
    goResourceConsole,
    goDocumentCenter,
    goOfficialDoc,
    handleCopy,
    init,
    openAccessRoute,
    productDocs,
    registerDomain,
    reqFluxDetail,
    reqMetric,
    resourceCards,
    showResourceEmpty,
    startTrial,
    toOrder,
    toRecharge,
    toRoleCreate,
    toUserCreate,
    addDns,
    userStore,
  }
}
