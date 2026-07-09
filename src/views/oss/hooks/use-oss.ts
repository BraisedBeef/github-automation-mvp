import {
  createResourcePackOrderApi,
  getAvailableResourcePacksApi,
  resourcePackInquiryApi,
} from '@/apis/oss/resource-pack'
import t from '@/utils/i18n'
import { _debounce } from '@/utils/timing-utils'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
import { notify } from '@/utils/notification'

export interface BucketInfo {
  name: string
  region: string
  sseAlgorithm?: string
}

const priceSource = ref<any>({
  finalTotal: 0,
  originalTotal: 0,
  items: [],
})
const priceLoading = ref(false)
const pageLoading = ref(false)
const tab = ref(2)

const form = ref({
  region: 'oversea',
  validityMonth: 1,
  autoRenew: false,
  class1: {
    type: 0,
    count: 1,
    flow: 1,
    price: 0,
    originalPrice: 0,
  },
  class2: {
    type: 2,
    count: 1,
    flow: 1,
    price: 0,
    originalPrice: 0,
  },
  class3: {
    type: 1,
    count: 1,
    flow: 1,
    price: 0,
    originalPrice: 0,
  },
})
const formAddOn = ref({
  region: 'oversea',
  category: 1,
  class: 0,
  validityMonth: 1,
  specId: undefined,
  count: 1,
  effectiveTime: 1,
  time: new Date(),
})

const resourcePackList = ref<any>([])
export const useOss = () => {
  const { toPrePayOrder } = usePreProductOrder()
  const config = {
    tabs: [
      { label: t('oss.buyPack.tab1'), value: 1 },
      { label: t('oss.buyPack.tab2'), value: 2 },
    ],
    region: [
      { label: t('oss.buyPack.region1'), value: 'oversea' },
      { label: t('oss.buyPack.region2'), value: 'mainland', disabled: true },
    ],

    // 计费项分类
    category: [
      {
        label: t('oss.buyPack.categoryLabel1'),
        value: 1,
        desc: t('oss.buyPack.categoryDesc1'),
      },
      {
        label: t('oss.buyPack.categoryLabel2'),
        value: 2,
        desc: t('oss.buyPack.categoryDesc2'),
      },
      {
        label: t('oss.buyPack.categoryLabel3'),
        value: 3,
        desc: t('oss.buyPack.categoryDesc3'),
      },
    ],
    // 生效时间
    effective: [
      { label: t('oss.buyPack.effective1'), value: 1, desc: t('oss.buyPack.effectiveDesc1') },
      { label: t('oss.buyPack.effective2'), value: 2, desc: t('oss.buyPack.effectiveDesc2') },
    ],
  }

  const validityMonthOptions = computed(() => {
    console.log('validityMonthOptions computed', resourcePackList.value)

    const list = Array.from(
      new Set(resourcePackList.value.map((item: any) => item.validityMonth).filter((v: any) => v != null)),
    ).sort((a, b) => Number(a) - Number(b))
    return list.map(item => {
      const months = Number(item)
      const label = months % 12 === 0 ? t('oss.buyPack.year', [months / 12]) : t('oss.buyPack.month', [months])
      return {
        label,
        value: months,
      }
    })
  })

  // 查看所有月份是否有完整的组合资源包
  /**
   * 检查所有月份选项是否都已完成
   * 遍历所有月份选项，验证每个月份在三个规格中是否存在对应的项
   * @returns {boolean} 如果所有月份在三个规格中都存在则返回true，否则返回false
   */
  const isComplete = computed(() => {
    const sourceList = resourcePackList.value
    // 存储容量包
    const class1Specs = sourceList.filter((item: any) => item.class === form.value.class1.type)
    // 流量包
    const class2Specs = sourceList.filter((item: any) => item.class === form.value.class2.type)
    // 请求包
    const class3Specs = sourceList.filter((item: any) => item.class === form.value.class3.type)

    const isAllComplete = validityMonthOptions.value.every((monthOption: any) => {
      const month = monthOption.value
      const hasClass1 = class1Specs.some((item: any) => item.validityMonth === month)
      const hasClass2 = class2Specs.some((item: any) => item.validityMonth === month)
      const hasClass3 = class3Specs.some((item: any) => item.validityMonth === month)
      return hasClass1 && hasClass2 && hasClass3
    })
    if (isAllComplete) {
      return true
    }
    return false
  })

  const getAvailableResourcePacks = async (params: any) => {
    try {
      pageLoading.value = true
      const res = await getAvailableResourcePacksApi(params)
      resourcePackList.value = res.data.specs || []
    } catch (error) {
      console.log(error)
    } finally {
      pageLoading.value = false
    }
  }

  // 校验组合包是否完整
  const checkComplete = (data: any, key = 'items') => {
    if (!data && !data[key]) return false
    const items = data[key] || []
    if (items.length === 0) return false
    const isC = items.every((item: any) => item.specId != null)
    if (isC) {
      return true
    }
    priceSource.value.finalTotal = 0
    priceSource.value.originalTotal = 0
    if (isComplete.value) {
      window.setTabValue = value => {
        tab.value = value
      }
      notify({
        type: 'error',
        message: `<p>${t('oss.buyPage.inquiryIncompleteError1', [`<span class="text-primary ml4 mr4 pointer" onclick="setTabValue(2)">${t('oss.buyPack.tab2')}</span>`])}</p>`,
        duration: 10000,
        dangerouslyUseHTMLString: true,
      })
    } else {
      notify({
        type: 'error',
        message: h('div', t('oss.buyPage.inquiryIncompleteError')),
      })
    }
  }

  const resourcePackInquiry = _debounce(async (data: any) => {
    try {
      if (!checkComplete(data)) return
      priceLoading.value = true
      const res = await resourcePackInquiryApi(data)
      priceSource.value.finalTotal = res.data.finalTotal || 0
      priceSource.value.originalTotal = res.data.originalTotal || 0
      priceSource.value.items = res.data.items || []
    } catch (error) {
      console.log(error)
    } finally {
      priceLoading.value = false
    }
  }, 300)

  // 创建预订单
  const createResourcePackOrder = async (data: any) => {
    try {
      const res = await createResourcePackOrderApi(data)
      console.log('createResourcePackOrder', res)
      toPrePayOrder(res.data.serialNo, 'oss')
    } catch (error) {
      console.log(error)
    }
  }

  // 立即购买
  const submit = async () => {
    const obj = {}
    if (tab.value === 1) {
      Object.assign(obj, {
        effectiveTime: 0,
        region: form.value.region, // 地区
        validityMonth: Number(form.value.validityMonth), // 生效时间
        autoRenew: form.value.autoRenew, // 到期自动续费
        packages: [
          {
            specId: form.value.class1.flow,
            quantity: form.value.class1.count,
            class: form.value.class1.type,
          },
          {
            specId: form.value.class2.flow,
            quantity: form.value.class2.count,
            class: form.value.class2.type,
          },
          {
            specId: form.value.class3.flow,
            quantity: form.value.class3.count,
            class: form.value.class3.type,
          },
        ],
      })
      if (!checkComplete(obj, 'packages')) return
    } else {
      Object.assign(obj, {
        effectiveTime: formAddOn.value.effectiveTime === 1 ? 0 : Math.floor(formAddOn.value.time.getTime() / 1000), // 生效时间
        region: formAddOn.value.region, // 地区
        validityMonth: Number(formAddOn.value.validityMonth), // 生效时间
        packages: [
          {
            specId: formAddOn.value.specId,
            quantity: formAddOn.value.count,
            class: formAddOn.value.class,
          },
        ],
      })
    }

    createResourcePackOrder(obj)
  }

  watch(
    () => tab.value,
    () => {
      // 切换tab时，重置价格信息
      priceSource.value = {
        finalTotal: 0,
        originalTotal: 0,
        items: [],
      }
      resourcePackList.value = []
    },
  )
  return {
    tab,
    config,
    priceSource,
    priceLoading,
    pageLoading,
    validityMonthOptions,
    resourcePackList,
    form,
    formAddOn,
    isComplete,
    resourcePackInquiry,
    getAvailableResourcePacks,
    createResourcePackOrder,
    submit,
  }
}
