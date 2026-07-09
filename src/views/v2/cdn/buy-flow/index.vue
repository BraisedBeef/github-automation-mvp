<template>
  <div class="cdn-buy-flow-v2">
    <PageBreadcrumbToolbar :items="[t('resourcePkgManage'), t('buyPkg')]" @doc="openHelpDoc" />

    <section class="cdn-buy-flow-v2__panel">
      <h2 class="cdn-buy-flow-v2__section-title">
        {{ t('buyNote') }}
      </h2>
      <div class="cdn-buy-flow-v2__notice-list">
        <div v-for="item in buyNotes" :key="item.label" class="cdn-buy-flow-v2__notice-row">
          <span class="cdn-buy-flow-v2__tag">{{ item.label }}</span>
          <span class="cdn-buy-flow-v2__notice-text">{{ item.value }}</span>
        </div>
      </div>
    </section>

    <section class="cdn-buy-flow-v2__panel">
      <h2 class="cdn-buy-flow-v2__section-title">选购配置</h2>

      <div class="cdn-buy-flow-v2__form">
        <div class="cdn-buy-flow-v2__row">
          <div class="cdn-buy-flow-v2__label">
            {{ t('resourcePkgType') }}
          </div>
          <div class="cdn-buy-flow-v2__content">
            <div class="cdn-buy-flow-v2__segment">
              <button
                v-for="item in resourcePkgTypeTabs"
                :key="item.value"
                class="cdn-buy-flow-v2__segment-item"
                :class="{ 'is-active': form.class === item.value }"
                type="button"
                @click="handleClassChange(item.value)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="cdn-buy-flow-v2__row">
          <div class="cdn-buy-flow-v2__label">
            {{ t('useInstructions') }}
          </div>
          <div class="cdn-buy-flow-v2__tips">
            <div v-for="item in usageTips" :key="item" class="cdn-buy-flow-v2__tip">
              <SvgIcon name="cat-cdn-warning" />
              <span>{{ item }}</span>
            </div>
          </div>
        </div>

        <div class="cdn-buy-flow-v2__row">
          <div class="cdn-buy-flow-v2__label">
            {{ t('effectiveRegion') }}
          </div>
          <div class="cdn-buy-flow-v2__content">
            <div class="cdn-buy-flow-v2__segment">
              <button
                v-for="item in accelerationRegionList"
                :key="item.value"
                class="cdn-buy-flow-v2__segment-item"
                :class="{ 'is-active': form.accelerationRegion === item.value }"
                type="button"
                @click="handleSelectionChange(2, item.value)"
              >
                {{ item.label }}
              </button>
            </div>
            <p class="cdn-buy-flow-v2__helper">
              {{ form.accelerationRegion ? t('effectiveRegionTip1') : t('effectiveRegionTip') }}
            </p>
          </div>
        </div>

        <div class="cdn-buy-flow-v2__row">
          <div class="cdn-buy-flow-v2__label">
            {{ t('accelerationType') }}
          </div>
          <div class="cdn-buy-flow-v2__content">
            <div class="cdn-buy-flow-v2__segment">
              <button
                v-for="item in accelerationTypeList"
                :key="item.value"
                class="cdn-buy-flow-v2__segment-item"
                :class="{ 'is-active': form.accelerationType === item.value }"
                type="button"
                @click="handleSelectionChange(0, item.value)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="cdn-buy-flow-v2__row">
          <div class="cdn-buy-flow-v2__label">
            {{ t('resourcePkgSpeci') }}
          </div>
          <div class="cdn-buy-flow-v2__content">
            <div class="cdn-buy-flow-v2__spec-grid">
              <button
                v-for="item in fluxList"
                :key="item.value"
                class="cdn-buy-flow-v2__spec-item"
                :class="{ 'is-active': form.id === item.value }"
                type="button"
                @click="handleSelectionChange(4, item.value)"
              >
                <span>{{ item.label }}</span>
                <em v-if="item.discount" class="cdn-buy-flow-v2__discount">{{ item.discount }}折</em>
              </button>
            </div>
            <p class="cdn-buy-flow-v2__helper">
              {{
                form.class
                  ? t('resourcePkgRequestTip')
                  : t('resourcePkgSpeciTip', { type: form.accelerationType ? 'ECDN' : 'CDN' })
              }}
            </p>
          </div>
        </div>

        <div class="cdn-buy-flow-v2__row">
          <div class="cdn-buy-flow-v2__label">
            {{ t('validityPeriod') }}
          </div>
          <div class="cdn-buy-flow-v2__content">
            <div class="cdn-buy-flow-v2__segment">
              <button
                v-for="item in fluxPeriodList"
                :key="item.value"
                class="cdn-buy-flow-v2__segment-item"
                :class="{ 'is-active': form.fluxPeriod === item.value }"
                type="button"
                @click="handleSelectionChange(5, item.value)"
              >
                {{ item.label }}
              </button>
            </div>
            <p class="cdn-buy-flow-v2__helper">
              {{ t('validDateTip', { num: form.fluxPeriod }) }}
            </p>
          </div>
        </div>

        <div class="cdn-buy-flow-v2__row">
          <div class="cdn-buy-flow-v2__label">
            {{ t('buyNums') }}
          </div>
          <div class="cdn-buy-flow-v2__content">
            <div class="cdn-buy-flow-v2__counter">
              <button type="button" :disabled="form.count <= 1" @click="changeCount(-1)">-</button>
              <span>{{ form.count }}</span>
              <button type="button" @click="changeCount(1)">+</button>
            </div>
          </div>
        </div>
        <div class="cdn-buy-flow-v2__summary-row">
          <div class="cdn-buy-flow-v2__label cdn-buy-flow-v2__summary-label">
            {{ t('currentMoney') }}
          </div>
          <div class="cdn-buy-flow-v2__summary-content">
            <div class="cdn-buy-flow-v2__amount">
              <strong>${{ formatPrice(price) }}</strong>
              <small>USD</small>
              <span v-if="oldPrice" class="cdn-buy-flow-v2__old-price">
                {{ t('originalPrice') }}: ${{ formatPrice(oldPrice) }} USD
              </span>
            </div>

            <el-button type="primary" :disabled="priceLoading || !form.id" :loading="buyLoading" @click="goNext">
              {{ t('nowBuyIt') }}
            </el-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { _getAllProducts, _getProductPrice } from '@/apis/cdn/product'
import { _createProductOrder2 } from '@/apis/cost-center/payment'
import { resourcePkgType } from '@/assets/data/common.js'
import { documentUrl } from '@/config/base-config'
import { message } from '@/utils/message'
import { formatPrice } from '@/utils/number-utils'
import { getDiscount, getFlux, getRequest } from '@/utils/unit'
import t from '@/utils/i18n'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'

interface Product {
  class: number
  id: number
  version: number
  productID: number
  accelerationRegion: number
  accelerationType: number
  fluxType: number
  flux: number
  fluxPeriod: number
  count?: number
  price: number
  originalPrice: number
}

const route = useRoute()

const allProducts = ref<Product[]>([])
const oldPrice = ref(0)
const price = ref(0)
const priceLoading = ref(false)
const buyLoading = ref(false)
const { toPrePayOrder } = usePreProductOrder()

const form = ref<Product>({
  id: 0,
  class: 0,
  version: 0,
  productID: 0,
  accelerationRegion: 0,
  accelerationType: 0,
  fluxType: 0,
  flux: 0,
  fluxPeriod: 0,
  count: Number(route.query.count || 1),
  price: 0,
  originalPrice: 0,
})

const buyNotes = computed(() => [
  { label: t('instructions'), value: t('instructionsDetails') },
  { label: t('billingOption'), value: t('billingOptionDetails') },
  { label: t('refundRules'), value: t('refundRulesDetails') },
])

const resourcePkgTypeTabs = computed(() =>
  resourcePkgType
    .filter(item => (form.value.accelerationType === 0 ? item.value === 0 : true))
    .map(item => ({ label: item.label, value: item.value })),
)

const accelerationRegionList = computed(() => {
  const values = [
    ...new Set(allProducts.value.filter(v => v.class === form.value.class).map(v => v.accelerationRegion)),
  ]
  return values.map(value => ({
    label: value ? t('outChina') : t('inChina'),
    value,
  }))
})

const accelerationTypeList = computed(() => {
  const values = [
    ...new Set(
      allProducts.value
        .filter(v => v.class === form.value.class && v.accelerationRegion === form.value.accelerationRegion)
        .map(v => v.accelerationType),
    ),
  ]
  return values.map(value => ({
    label: value ? t('wholeAcceleration') : t('staticAcceleration'),
    value,
  }))
})

const fluxTypeList = computed(() => {
  const values = [
    ...new Set(
      allProducts.value
        .filter(
          v =>
            v.class === form.value.class &&
            v.accelerationRegion === form.value.accelerationRegion &&
            v.accelerationType === form.value.accelerationType,
        )
        .map(v => v.fluxType),
    ),
  ]
  return values.map(value => ({
    label: value ? t('idleTimeFlux') : t('fullTimeFlux'),
    value,
  }))
})

const fluxList = computed(() =>
  allProducts.value
    .filter(
      v =>
        v.class === form.value.class &&
        v.accelerationRegion === form.value.accelerationRegion &&
        v.accelerationType === form.value.accelerationType &&
        v.fluxType === form.value.fluxType,
    )
    .sort((a, b) => a.flux - b.flux)
    .map(item => ({
      label: form.value.class ? getRequest(item.flux) : getFlux(item.flux),
      value: item.id,
      discount: getDiscount(item.price, item.originalPrice),
    })),
)

const fluxPeriodList = computed(() => {
  const values = [
    ...new Set(
      allProducts.value
        .filter(
          v =>
            v.class === form.value.class &&
            v.accelerationRegion === form.value.accelerationRegion &&
            v.accelerationType === form.value.accelerationType &&
            v.fluxType === form.value.fluxType &&
            v.id === form.value.id,
        )
        .map(v => v.fluxPeriod),
    ),
  ]
  return values.map(value => ({
    label: t('numMonth', { num: value }),
    value,
  }))
})

const usageTips = computed(() =>
  form.value.class
    ? [t('useToKnow1'), t('useToKnow2'), t('useToKnow3'), t('useToKnow4')]
    : [t('useToKnow5'), t('useToKnow6'), t('useToKnow7')],
)

const getProduct = () =>
  allProducts.value.find(
    v =>
      v.class === form.value.class &&
      v.accelerationRegion === form.value.accelerationRegion &&
      v.accelerationType === form.value.accelerationType &&
      v.fluxType === form.value.fluxType &&
      v.id === form.value.id &&
      v.fluxPeriod === form.value.fluxPeriod,
  )

const updateFormWithProduct = (product?: Product) => {
  if (!product) return
  form.value = {
    ...form.value,
    ...product,
    count: Math.max(1, Number(form.value.count || 1)),
  }
}

const getProductPrice = async () => {
  const product = getProduct()
  if (!product) return

  priceLoading.value = true
  try {
    const res = await _getProductPrice({
      pkgId: product.id,
      pkgVersion: product.version,
      num: form.value.count || 1,
    })
    oldPrice.value = +(res.data?.originalTotalAmount || 0).toFixed(2)
    price.value = +(res.data?.totalAmount || 0).toFixed(2)
  } finally {
    priceLoading.value = false
  }
}

const resetCascade = (level: number) => {
  if (level < 1) {
    form.value.class = Number(resourcePkgTypeTabs.value[0]?.value || 0)
  }
  if (level < 2) {
    form.value.accelerationRegion = Number(accelerationRegionList.value[0]?.value || 0)
  }
  if (level < 3) {
    form.value.fluxType = Number(fluxTypeList.value[0]?.value || 0)
  }
  if (level < 4) {
    form.value.id = Number(fluxList.value[0]?.value || 0)
  }
  if (level < 5) {
    form.value.fluxPeriod = Number(fluxPeriodList.value[0]?.value || 0)
  }
  updateFormWithProduct(getProduct())
  getProductPrice()
}

const handleSelectionChange = (level: number, value: string | number) => {
  if (level === 0) form.value.accelerationType = Number(value)
  if (level === 2) form.value.accelerationRegion = Number(value)
  if (level === 4) form.value.id = Number(value)
  if (level === 5) form.value.fluxPeriod = Number(value)
  resetCascade(level + 1)
}

const handleClassChange = (value: string | number) => {
  form.value.class = Number(value)
  resetCascade(1)
}

const changeCount = (step: number) => {
  form.value.count = Math.max(1, Number(form.value.count || 1) + step)
  getProductPrice()
}

const goNext = async () => {
  const product = getProduct()
  if (!product) return

  try {
    buyLoading.value = true
    const { data, code } = await _createProductOrder2({
      pkgID: product.productID,
      pkgVersion: product.version,
      num: form.value.count || 1,
    })
    if (code === 200 && data?.serialNo) {
      toPrePayOrder(data.serialNo, 'cdn')
      return
    }
    message.error(t('common.error_cd'))
  } catch (error) {
    message.error(t('common.error_cd'))
  } finally {
    buyLoading.value = false
  }
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const getAllProducts = async () => {
  const res = await _getAllProducts()
  allProducts.value = (res.data?.list || []).sort((a: Product, b: Product) => a.flux - b.flux)

  if (route.query.id) {
    updateFormWithProduct(allProducts.value.find(item => item.id === Number(route.query.id)))
  } else {
    updateFormWithProduct(
      allProducts.value.find(item => item.class === 0 && item.accelerationRegion === 0 && item.accelerationType === 0),
    )
  }

  form.value.count = Math.max(1, Number(route.query.count || 1))
  resetCascade(0)
}

onMounted(() => {
  getAllProducts()
})
</script>

<style scoped lang="scss">
.cdn-buy-flow-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-buy-flow-v2__panel {
  background: #fff;
}

.cdn-buy-flow-v2__panel {
  padding: 28px 28px 24px;
}

.cdn-buy-flow-v2__section-title {
  margin: 0 0 28px;
  font-size: 18px;
  font-weight: 600;
  line-height: 32px;
  color: #191c23;
}

.cdn-buy-flow-v2__notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cdn-buy-flow-v2__notice-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.cdn-buy-flow-v2__tag {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  background: #edf4ff;
}

.cdn-buy-flow-v2__notice-text {
  padding-top: 2px;
  font-size: 15px;
  line-height: 34px;
  color: #98a1b2;
}

.cdn-buy-flow-v2__form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cdn-buy-flow-v2__row {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.cdn-buy-flow-v2__label {
  padding-top: 8px;
  font-size: 14px;
  line-height: 22px;
  color: #98a1b2;
}

.cdn-buy-flow-v2__content {
  min-width: 0;
}

.cdn-buy-flow-v2__segment {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cdn-buy-flow-v2__segment-item,
.cdn-buy-flow-v2__spec-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 132px;
  height: 34px;
  padding: 0 18px;
  font: inherit;
  font-size: 16px;
  line-height: 24px;
  color: #191c23;
  cursor: pointer;
  background: #f1f4f8;
  border: 1px solid transparent;
}

.cdn-buy-flow-v2__segment-item.is-active,
.cdn-buy-flow-v2__spec-item.is-active {
  color: #fff;
  background: #06f;
}

.cdn-buy-flow-v2__tips {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding-top: 4px;
}

.cdn-buy-flow-v2__tip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 15px;
  line-height: 24px;
  color: #191c23;

  :deep(svg) {
    width: 18px;
    height: 18px;
    color: #ff7a1a;
  }
}

.cdn-buy-flow-v2__helper {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 26px;
  color: #98a1b2;
}

.cdn-buy-flow-v2__spec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
  max-width: 702px;
}

.cdn-buy-flow-v2__spec-item {
  min-width: 0;
}

.cdn-buy-flow-v2__discount {
  position: absolute;
  top: -1px;
  right: -1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 22px;
  padding: 0 6px;
  font-size: 12px;
  font-style: normal;
  line-height: 20px;
  color: #fff;
  background: #ff7a1a;
}

.cdn-buy-flow-v2__counter {
  display: inline-grid;
  grid-template-columns: 44px 92px 44px;
  border: 1px solid #d9dde5;
}

.cdn-buy-flow-v2__counter button,
.cdn-buy-flow-v2__counter span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  font-size: 18px;
  line-height: 24px;
  color: #191c23;
  background: #fff;
}

.cdn-buy-flow-v2__counter button {
  cursor: pointer;
  border: 0;
}

.cdn-buy-flow-v2__counter button:disabled {
  color: #b7c0cd;
  cursor: not-allowed;
  background: #f7f8fa;
}

.cdn-buy-flow-v2__counter span {
  font-size: 20px;
  border-right: 1px solid #d9dde5;
  border-left: 1px solid #d9dde5;
}

.cdn-buy-flow-v2__summary-row {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 24px 28px 0;
  margin: 8px -28px 0;
  border-top: 1px solid #e8ecf3;
}

.cdn-buy-flow-v2__summary-label {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding-top: 0;
}

.cdn-buy-flow-v2__summary-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-start;
  min-width: 0;
}

.cdn-buy-flow-v2__amount {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
}

.cdn-buy-flow-v2__amount strong {
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  color: #ff720d;
}

.cdn-buy-flow-v2__amount small {
  font-size: 14px;
  line-height: 22px;
  color: #ff720d;
}

.cdn-buy-flow-v2__old-price {
  font-size: 12px;
  line-height: 20px;
  color: #98a1b2;
  text-decoration: line-through;
}

.cdn-buy-flow-v2__summary-content :deep(.el-button) {
  width: 104px;
}

@media (width <= 1024px) {
  .cdn-buy-flow-v2__row {
    grid-template-columns: 1fr;
  }

  .cdn-buy-flow-v2__summary-row {
    grid-template-columns: 1fr;
    padding-right: 20px;
    padding-left: 20px;
    margin-right: -20px;
    margin-left: -20px;
  }

  .cdn-buy-flow-v2__label {
    padding-top: 0;
  }

  .cdn-buy-flow-v2__summary-label {
    padding-top: 0;
  }

  .cdn-buy-flow-v2__amount strong {
    font-size: 24px;
  }
}
</style>
