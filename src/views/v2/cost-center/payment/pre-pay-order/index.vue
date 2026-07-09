<template>
  <div class="payment-pre-order-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <section class="payment-pre-order-v2__panel">
      <h2 class="payment-pre-order-v2__page-title">
        {{ pageTitle }}
      </h2>
      <div class="payment-pre-order-v2__notice-row">
        <span class="payment-pre-order-v2__tag">{{ t('oderIns') }}</span>
        <span class="payment-pre-order-v2__notice-text">{{ t('sureProductInfoTip1') }}</span>
        <strong>{{ t('sureProductInfoTip2') }}</strong>
      </div>
    </section>

    <section class="payment-pre-order-v2__panel payment-pre-order-v2__panel--confirm">
      <h2 class="payment-pre-order-v2__section-title">
        {{ t('prodList') }}
      </h2>

      <div class="payment-pre-order-v2__group-table">
        <div class="payment-pre-order-v2__group-head">
          <button class="payment-pre-order-v2__group-title" type="button" @click="groupExpanded = !groupExpanded">
            <SvgIcon
              name="sub-back"
              class="payment-pre-order-v2__group-arrow"
              :class="{ 'is-expanded': groupExpanded }"
            />
            <span>{{ t('payment.prepaidProducts', [1]) }}</span>
          </button>
          <div class="payment-pre-order-v2__group-amount">
            <span>{{ t('showPayable') }}：</span>
            <strong>${{ formatPrice(confirmAmount) }} USD</strong>
          </div>
        </div>

        <div v-show="groupExpanded" class="payment-pre-order-v2__table">
          <div class="payment-pre-order-v2__tr payment-pre-order-v2__tr--head">
            <div>{{ t('productName') }}</div>
            <div>{{ t('config') }}</div>
            <div>{{ t('type') }}</div>
            <div>{{ t('unitPrice') }}</div>
            <div>{{ t('quantity') }}</div>
            <div>{{ t('timeLong') }}</div>
            <div>{{ t('orderPrice') }}</div>
          </div>
          <div class="payment-pre-order-v2__tr">
            <div class="payment-pre-order-v2__cell-name">
              {{ confirmProduct?.productName || '-' }}
            </div>
            <div class="payment-pre-order-v2__config">
              <div v-for="item in confirmProduct?.configs || []" :key="item.label">
                <span>{{ item.label }}：</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
            <div>{{ orderTypeText }}</div>
            <div>${{ formatPrice(confirmProduct?.unitPrice || 0) }} USD</div>
            <div>{{ confirmProduct?.quantity || 0 }}</div>
            <div>{{ confirmProduct?.duration || '-' }}</div>
            <div class="payment-pre-order-v2__price">${{ formatPrice(confirmProduct?.amount || 0) }} USD</div>
          </div>
        </div>
      </div>

      <div class="payment-pre-order-v2__confirm-footer">
        <div class="payment-pre-order-v2__confirm-side">
          <div class="payment-pre-order-v2__confirm-price">
            <span class="payment-pre-order-v2__summary-trigger">
              {{ t('payment.actualPrice') }}：
              <section class="payment-pre-order-v2__summary-float">
                <div class="payment-pre-order-v2__summary-alert">
                  {{ t('payment.actualPriceTip') }}
                </div>
                <div class="payment-pre-order-v2__summary-row">
                  <span>{{ t('payment.prePay') }}</span>
                  <span>${{ formatPrice(confirmAmount) }} USD</span>
                </div>
                <div class="payment-pre-order-v2__summary-total">
                  <span>{{ t('payment.actualPrice') }}</span>
                  <strong>${{ formatPrice(confirmAmount) }} USD</strong>
                </div>
                <i class="payment-pre-order-v2__summary-caret" />
              </section>
            </span>
            <strong>${{ formatPrice(confirmAmount) }}</strong>
            <small>USD</small>
          </div>
        </div>
        <el-button type="primary" :loading="loading" @click="goPay">
          {{ t('toPay') }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { ORDER_TYPE_MAP } from '@/views/cost-center/order/config'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
import { BusinessType, useProductOrder } from '@/views/cost-center/hooks/use-product-order'
import { formatPrice } from '@/utils/number-utils'
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'

const route = useRoute()
const { queryPreProductOrder } = usePreProductOrder()
const { createProductOrder, loading } = useProductOrder()

const detail = ref<any>({})
const groupExpanded = ref(true)

const pageTitle = '确认产品信息'
const type = computed(() => String(route.query.type || 'cdn') as BusinessType)
const serialNo = computed(() => String(route.params.serialNo || ''))

const breadcrumbItems = computed(() => {
  if (type.value === 'cdn') {
    return [t('resourcePkgManage'), t('buyPkg'), pageTitle]
  }
  return [pageTitle]
})

const orderTypeText = computed(() => ORDER_TYPE_MAP[detail.value.type] || t('newBuy'))

const confirmProduct = computed(() => {
  const row = detail.value?.subPreOrderDetailDTOS?.[0]
  if (!row) return null

  return {
    productName: row.productDesc || row.subProductTypeName || '',
    configs: (row.configs || [])
      .filter((item: any) => item?.value)
      .map((item: any) => ({
        label: String(item.key || '').replace(/：$/, ''),
        value: item.value,
      })),
    unitPrice: Number(row.price || 0),
    quantity: Number(row.num || 0),
    duration: row.duration ? `${row.duration}${row.durationUnit || ''}` : '-',
    amount: Number(row.amount || detail.value?.amount || 0),
  }
})

const confirmAmount = computed(() => Number(detail.value?.amount || confirmProduct.value?.amount || 0))

const queryPreProductOrderFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      detail.value = res.data || {}
    }
  }
  if (serialNo.value) {
    queryPreProductOrder(serialNo.value, cb)
  }
}

const goPay = () => {
  if (serialNo.value) {
    createProductOrder(serialNo.value, type.value)
  }
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

onMounted(() => {
  queryPreProductOrderFn()
})

watch(
  () => route.params.serialNo,
  () => {
    queryPreProductOrderFn()
  },
)
</script>

<style lang="scss" scoped>
.payment-pre-order-v2 {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.payment-pre-order-v2__panel,
.payment-pre-order-v2__summary-float {
  background: #fff;
}

.payment-pre-order-v2__panel {
  padding: 20px;
}

.payment-pre-order-v2__panel--confirm {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-bottom: 0;
}

.payment-pre-order-v2__page-title,
.payment-pre-order-v2__section-title {
  margin: 0;
  font-weight: 600;
  color: #191c23;
}

.payment-pre-order-v2__page-title {
  font-size: 18px;
  line-height: 32px;
}

.payment-pre-order-v2__section-title {
  font-size: 18px;
  line-height: 24px;
}

.payment-pre-order-v2__notice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin-top: 16px;
  font-size: 15px;
  line-height: 24px;
  color: #98a1b2;
}

.payment-pre-order-v2__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  color: #06f;
  background: #edf4ff;
}

.payment-pre-order-v2__notice-text {
  color: #98a1b2;
}

.payment-pre-order-v2__notice-row strong {
  color: #ff5d3d;
}

.payment-pre-order-v2__group-table {
  margin-top: 24px;
  border: 1px solid #e8ecf3;
}

.payment-pre-order-v2__group-head,
.payment-pre-order-v2__group-title,
.payment-pre-order-v2__group-amount,
.payment-pre-order-v2__summary-row,
.payment-pre-order-v2__summary-total {
  display: flex;
  align-items: center;
}

.payment-pre-order-v2__group-head,
.payment-pre-order-v2__summary-row,
.payment-pre-order-v2__summary-total,
.payment-pre-order-v2__confirm-footer {
  justify-content: space-between;
}

.payment-pre-order-v2__group-head {
  min-height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid #e8ecf3;
}

.payment-pre-order-v2__group-title {
  gap: 6px;
  padding: 0;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.payment-pre-order-v2__group-arrow {
  width: 16px;
  height: 16px;
  color: #4d5663;
  transition: transform 0.2s ease;
  transform: rotate(-180deg);
}

.payment-pre-order-v2__group-arrow.is-expanded {
  transform: rotate(-90deg);
}

.payment-pre-order-v2__group-amount {
  gap: 6px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.payment-pre-order-v2__group-amount strong,
.payment-pre-order-v2__price,
.payment-pre-order-v2__summary-total strong {
  color: #ff720d;
}

.payment-pre-order-v2__table {
  display: grid;
  grid-template-columns: 1fr;
}

.payment-pre-order-v2__tr {
  display: grid;
  grid-template-columns: 1.35fr 1.35fr 0.7fr 1fr 0.6fr 0.7fr 1fr;
}

.payment-pre-order-v2__tr > div {
  min-height: 56px;
  padding: 16px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  border-right: 1px solid #e8ecf3;
  border-bottom: 1px solid #e8ecf3;
}

.payment-pre-order-v2__tr > div:last-child {
  border-right: 0;
}

.payment-pre-order-v2__tr--head > div {
  min-height: 46px;
  padding-top: 13px;
  padding-bottom: 13px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  background: #f9fafc;
}

.payment-pre-order-v2__tr:last-child > div {
  border-bottom: 0;
}

.payment-pre-order-v2__cell-name {
  display: flex;
  align-items: center;
}

.payment-pre-order-v2__config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-pre-order-v2__config span {
  color: #98a1b2;
}

.payment-pre-order-v2__config strong {
  font-weight: 400;
  color: #191c23;
}

.payment-pre-order-v2__summary-float {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  z-index: 10;
  width: 446px;
  max-width: min(446px, calc(100vw - 32px));
  padding: 20px 20px 22px;
  pointer-events: none;
  visibility: hidden;
  border: 1px solid #f3d9d3;
  box-shadow: 0 4px 10px rgb(0 0 0 / 8%);
  opacity: 0;
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease,
    transform 0.2s ease;
  transform: translate(-50%, 8px);
}

.payment-pre-order-v2__summary-alert {
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 22px;
  color: #e54839;
  background: #fff2ef;
}

.payment-pre-order-v2__summary-row {
  padding-bottom: 16px;
  margin-bottom: 18px;
  font-size: 14px;
  line-height: 22px;
  color: #4d5663;
  border-bottom: 1px solid #e8ecf3;
}

.payment-pre-order-v2__summary-total {
  align-items: baseline;
}

.payment-pre-order-v2__summary-total strong {
  font-size: 28px;
  line-height: 1.1;
}

.payment-pre-order-v2__summary-caret {
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 18px;
  height: 18px;
  background: #fff;
  border-right: 1px solid #f3d9d3;
  border-bottom: 1px solid #f3d9d3;
  transform: translateX(-50%) rotate(45deg);
}

.payment-pre-order-v2__confirm-footer {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: center;
  justify-content: flex-end;
  padding: 24px 20px;
  margin-top: auto;
  margin-right: -20px;
  margin-left: -20px;
  border-top: 1px solid #e8ecf3;
}

.payment-pre-order-v2__confirm-side {
  position: relative;
  display: flex;
  flex: 0 0 446px;
  justify-content: flex-end;
  min-width: 446px;
}

.payment-pre-order-v2__summary-trigger {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.payment-pre-order-v2__summary-trigger:hover .payment-pre-order-v2__summary-float,
.payment-pre-order-v2__summary-trigger:focus-within .payment-pre-order-v2__summary-float {
  pointer-events: auto;
  visibility: visible;
  opacity: 1;
  transform: translate(-50%, 0);
}

.payment-pre-order-v2__confirm-price {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.payment-pre-order-v2__confirm-price span {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
}

.payment-pre-order-v2__confirm-price strong {
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  color: #ff720d;
}

.payment-pre-order-v2__confirm-price small {
  font-size: 14px;
  line-height: 22px;
  color: #ff720d;
}

@media (width <= 1024px) {
  .payment-pre-order-v2__panel {
    padding: 20px 16px;
  }

  .payment-pre-order-v2__group-table {
    overflow-x: auto;
  }

  .payment-pre-order-v2__table {
    min-width: 920px;
  }

  .payment-pre-order-v2__summary-float {
    width: 100%;
  }

  .payment-pre-order-v2__confirm-footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding-right: 16px;
    padding-left: 16px;
    margin-right: -16px;
    margin-left: -16px;
  }

  .payment-pre-order-v2__confirm-side {
    flex-basis: 100%;
    width: 100%;
    min-width: 0;
  }
}
</style>
