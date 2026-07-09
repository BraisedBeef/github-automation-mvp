<template>
  <div class="cdn-flow-order-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <template v-if="isConfirmStep && confirmProduct">
      <section class="cdn-flow-order-v2__panel">
        <h2 class="cdn-flow-order-v2__page-title">
          {{ confirmInfoTitle }}
        </h2>
        <div class="cdn-flow-order-v2__notice-row">
          <span class="cdn-flow-order-v2__tag">{{ t('oderIns') }}</span>
          <span class="cdn-flow-order-v2__notice-text">{{ t('sureProductInfoTip1') }}</span>
          <strong>{{ t('sureProductInfoTip2') }}</strong>
        </div>
      </section>

      <section class="cdn-flow-order-v2__panel cdn-flow-order-v2__panel--confirm">
        <h2 class="cdn-flow-order-v2__section-title">
          {{ t('prodList') }}
        </h2>

        <div class="cdn-flow-order-v2__group-table">
          <div class="cdn-flow-order-v2__group-head">
            <button
              class="cdn-flow-order-v2__group-title"
              type="button"
              @click="confirmGroupExpanded = !confirmGroupExpanded"
            >
              <SvgIcon
                name="sub-back"
                class="cdn-flow-order-v2__group-arrow"
                :class="{ 'is-expanded': confirmGroupExpanded }"
              />
              <span>{{ t('payment.prepaidProducts', [1]) }}</span>
            </button>
            <div class="cdn-flow-order-v2__group-amount">
              <span>{{ t('showPayable') }}：</span>
              <strong>${{ formatPrice(confirmAmount) }} USD</strong>
            </div>
          </div>

          <div v-show="confirmGroupExpanded" class="cdn-flow-order-v2__table">
            <div class="cdn-flow-order-v2__tr cdn-flow-order-v2__tr--head">
              <div>{{ t('productName') }}</div>
              <div>{{ t('config') }}</div>
              <div>{{ t('type') }}</div>
              <div>{{ t('unitPrice') }}</div>
              <div>{{ t('quantity') }}</div>
              <div>{{ t('timeLong') }}</div>
              <div>{{ t('orderPrice') }}</div>
            </div>
            <div class="cdn-flow-order-v2__tr">
              <div class="cdn-flow-order-v2__cell-name">
                {{ confirmProduct.productName }}
              </div>
              <div class="cdn-flow-order-v2__config">
                <div v-for="item in confirmProduct.configs" :key="item.label">
                  <span>{{ item.label }}：</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
              <div>{{ t('newBuy') }}</div>
              <div>${{ formatPrice(confirmProduct.unitPrice) }} USD/{{ t('numUnit') }}</div>
              <div>{{ confirmProduct.quantity }}</div>
              <div>{{ confirmProduct.duration }}</div>
              <div class="cdn-flow-order-v2__price">${{ formatPrice(confirmProduct.amount) }} USD</div>
            </div>
          </div>
        </div>
        <div class="cdn-flow-order-v2__confirm-footer">
          <div class="cdn-flow-order-v2__confirm-side">
            <section class="cdn-flow-order-v2__summary-float">
              <div class="cdn-flow-order-v2__summary-alert">
                {{ t('payment.actualPriceTip') }}
              </div>
              <div class="cdn-flow-order-v2__summary-row">
                <span>{{ t('payment.prePay') }}</span>
                <span>${{ formatPrice(confirmAmount) }} USD</span>
              </div>
              <div class="cdn-flow-order-v2__summary-total">
                <span>{{ t('payment.actualPrice') }}</span>
                <strong>${{ formatPrice(confirmAmount) }} USD</strong>
              </div>
              <i class="cdn-flow-order-v2__summary-caret" />
            </section>
            <div class="cdn-flow-order-v2__confirm-price">
              <span>{{ t('payment.actualPrice') }}：</span>
              <strong>${{ formatPrice(confirmAmount) }}</strong>
              <small>USD</small>
            </div>
          </div>
          <el-button type="primary" :loading="submitLoading" @click="handlePrimaryAction">
            {{ t('toPay') }}
          </el-button>
        </div>
      </section>
    </template>

    <template v-else-if="isPayStep && payProduct">
      <section class="cdn-flow-order-v2__panel">
        <h2 class="cdn-flow-order-v2__page-title">
          {{ t('payment.payOrder') }}
        </h2>
        <div class="cdn-flow-order-v2__notice-row">
          <span class="cdn-flow-order-v2__tag">{{ t('payment.orderInstruct') }}</span>
          <span class="cdn-flow-order-v2__notice-text">{{ t('payment.orderInstructDesc1') }}</span>
          <button class="cdn-flow-order-v2__link" type="button" @click="toInvoice">
            <span>{{ t('payment.orderInstructDesc2') }}</span>
            <SvgIcon name="account-link-outlined" />
          </button>
        </div>
      </section>

      <section class="cdn-flow-order-v2__panel cdn-flow-order-v2__panel--pay">
        <h2 class="cdn-flow-order-v2__section-title">
          {{ pendingOrderTitle }}
        </h2>

        <div class="cdn-flow-order-v2__group-table">
          <div class="cdn-flow-order-v2__group-head">
            <button class="cdn-flow-order-v2__group-title" type="button" @click="payGroupExpanded = !payGroupExpanded">
              <SvgIcon
                name="sub-back"
                class="cdn-flow-order-v2__group-arrow"
                :class="{ 'is-expanded': payGroupExpanded }"
              />
              <span>{{ t('payment.prepaidProducts', [1]) }}</span>
            </button>
            <div class="cdn-flow-order-v2__group-amount">
              <span>{{ t('showPayable') }}：</span>
              <strong>${{ formatPrice(payAmount) }} USD</strong>
            </div>
          </div>

          <div v-show="payGroupExpanded" class="cdn-flow-order-v2__table cdn-flow-order-v2__table--pay">
            <div class="cdn-flow-order-v2__tr cdn-flow-order-v2__tr--head cdn-flow-order-v2__tr--pay-head">
              <div>{{ t('order.tradeNo') }}</div>
              <div>{{ t('productName') }}</div>
              <div>{{ t('config') }}</div>
              <div>{{ t('type') }}</div>
              <div>{{ t('unitPrice') }}</div>
              <div>{{ t('quantity') }}</div>
              <div>{{ t('timeLong') }}</div>
              <div>{{ t('orderPrice') }}</div>
            </div>
            <div class="cdn-flow-order-v2__tr cdn-flow-order-v2__tr--pay-row">
              <div>{{ payProduct.tradeNo }}</div>
              <div class="cdn-flow-order-v2__cell-name">
                {{ payProduct.productName }}
              </div>
              <div class="cdn-flow-order-v2__config">
                <div v-for="item in payProduct.configs" :key="item.label">
                  <span>{{ item.label }}：</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
              <div>{{ t('newBuy') }}</div>
              <div>${{ formatPrice(payProduct.unitPrice) }} USD</div>
              <div>{{ payProduct.quantity }}</div>
              <div>{{ payProduct.duration }}</div>
              <div class="cdn-flow-order-v2__price">${{ formatPrice(payProduct.amount) }} USD</div>
            </div>
          </div>
        </div>

        <div class="cdn-flow-order-v2__pay-section">
          <h3 class="cdn-flow-order-v2__pay-title">
            {{ t('payment.selectPaymentMethod') }}
          </h3>
          <div class="cdn-flow-order-v2__pay-cards">
            <button
              class="cdn-flow-order-v2__pay-card"
              :class="{ 'is-active': paymentWay.activeIndex === 1, 'is-disabled': balancePayDisable }"
              type="button"
              @click="changePaymentWay(1)"
            >
              <div class="cdn-flow-order-v2__pay-main">
                <div class="cdn-flow-order-v2__pay-icon">
                  <SvgIcon name="v2-payment-wallet" />
                </div>
                <div class="cdn-flow-order-v2__pay-copy">
                  <div class="cdn-flow-order-v2__pay-name">
                    {{ t('payment.balance') }}
                  </div>
                  <div class="cdn-flow-order-v2__pay-desc">
                    {{ availableBalanceLabel }}
                    <span>${{ formatPrice(balanceValue) }} USD</span>
                  </div>
                </div>
              </div>
              <div class="cdn-flow-order-v2__pay-amount">支付：${{ formatPrice(actualPrice.balancePay) }} USD</div>
              <SvgIcon name="v2-payment-balance" class="cdn-flow-order-v2__pay-watermark" />
              <span v-if="paymentWay.activeIndex === 1" class="cdn-flow-order-v2__pay-check" />
            </button>

            <button
              class="cdn-flow-order-v2__pay-card"
              :class="{ 'is-active': paymentWay.activeIndex === 2, 'is-disabled': onlinePayDisable }"
              type="button"
              @click="changePaymentWay(2)"
            >
              <div class="cdn-flow-order-v2__pay-main">
                <div class="cdn-flow-order-v2__pay-icon">
                  <SvgIcon name="v2-payment-online" />
                </div>
                <div class="cdn-flow-order-v2__pay-copy">
                  <div class="cdn-flow-order-v2__pay-name">
                    {{ t('payment.online') }}
                  </div>
                  <div class="cdn-flow-order-v2__pay-desc cdn-flow-order-v2__pay-desc--icons">
                    <span>{{ supportLabel }}</span>
                    <SvgIcon name="pay-alipay" />
                    <SvgIcon name="pay-union" />
                    <SvgIcon name="pay-usdt" />
                    <span>{{ multipleMethodsText }}</span>
                  </div>
                </div>
              </div>
              <div class="cdn-flow-order-v2__pay-amount">支付：${{ formatPrice(actualPrice.rechargePay) }} USD</div>
              <span v-if="paymentWay.activeIndex === 2" class="cdn-flow-order-v2__pay-check" />
            </button>
          </div>
        </div>

        <div class="cdn-flow-order-v2__pay-footer">
          <div class="cdn-flow-order-v2__pay-footer-price">
            <span>{{ t('realPay') }}：</span>
            <strong>${{ formatPrice(stickyAmount) }}</strong>
            <small>USD</small>
          </div>
          <el-button type="primary" :loading="submitLoading" @click="handlePrimaryAction">
            {{ t('payment.goPay') }}
          </el-button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  _balancePayOrder,
  _createProductOrder,
  _createProductOrder2,
  _createRechargeOrder,
  _queryProductOrder,
} from '@/apis/cost-center/payment'
import { _getAccountInfo } from '@/apis/cost-center/user'
import { areaList1, resourcePkgList, resourcePkgType } from '@/assets/data/common'
import { documentUrl } from '@/config/base-config'
import { getValueMap } from '@/utils/collection-utils'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { formatPrice } from '@/utils/number-utils'
import { pushRoute } from '@/utils/router-jump'
import { getFlux, getRequest } from '@/utils/unit'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'

type PaymentWay = 1 | 2

const route = useRoute()
const { queryPreProductOrder } = usePreProductOrder()

const confirmDetail = ref<any>()
const payDetail = ref<any>()
const account = ref<any>({})
const confirmGroupExpanded = ref(true)
const payGroupExpanded = ref(true)
const payMethod = ref<number>(0)
const paymentWay = reactive<{ activeIndex: PaymentWay | -1 }>({
  activeIndex: 1,
})
const submitLoading = ref(false)
const parsedProduct = computed(() => {
  try {
    return route.query.product ? JSON.parse(atob(route.query.product as string)) : null
  } catch (error) {
    return null
  }
})

const confirmInfoTitle = '确认产品信息'
const pendingOrderTitle = '待支付订单'
const availableBalanceLabel = '账户可用余额'
const supportLabel = '支持'
const multipleMethodsText = '多种支付方式'

const serialNo = computed(() => String(route.query.serialNo || ''))
const tradeNo = computed(() => String(route.query.tradeNo || ''))
const isPayStep = computed(() => route.query.step === 'pay' || !!tradeNo.value)
const isConfirmStep = computed(() => !isPayStep.value)
const tradeNoList = computed(() => (tradeNo.value ? tradeNo.value.split('-').filter(Boolean) : []))

const breadcrumbItems = computed(() =>
  isPayStep.value
    ? [t('resourcePkgManage'), t('buyPkg'), confirmInfoTitle, t('payment.payOrder')]
    : [t('resourcePkgManage'), t('buyPkg'), confirmInfoTitle],
)

const confirmProduct = computed(() => {
  const row = confirmDetail.value?.subPreOrderDetailDTOS?.[0]
  if (row) {
    return {
      productName: row.productDesc || row.subProductTypeName || '',
      configs: normalizeConfigs(row.configs),
      unitPrice: Number(row.price || 0),
      quantity: Number(row.num || 0),
      duration: row.duration ? `${row.duration}${row.durationUnit || ''}` : '-',
      amount: Number(row.amount || confirmDetail.value?.amount || 0),
    }
  }

  if (parsedProduct.value) {
    return {
      productName: getLegacyProductName(parsedProduct.value),
      configs: [
        { label: t('effectiveRegion'), value: getValueMap(areaList1, parsedProduct.value.accelerationRegion) },
        { label: t('moneyUseClass'), value: getValueMap(resourcePkgType, parsedProduct.value.class) },
        {
          label: t('resourcePkgType'),
          value: parsedProduct.value.fluxType ? t('idleTimeFlux') : t('fullTimeFlux'),
        },
        {
          label: t('specifications'),
          value: parsedProduct.value.class ? getRequest(parsedProduct.value.flux) : getFlux(parsedProduct.value.flux),
        },
      ],
      unitPrice: Number(parsedProduct.value.price || 0),
      quantity: Number(parsedProduct.value.count || 0),
      duration: t('numMonth', { num: parsedProduct.value.fluxPeriod }),
      amount: Number(parsedProduct.value.totalAmount || parsedProduct.value.price * parsedProduct.value.count || 0),
    }
  }

  return null
})

const confirmAmount = computed(() => Number(confirmDetail.value?.amount || confirmProduct.value?.amount || 0))

const payProduct = computed(() => {
  const order = payDetail.value?.orderList?.[0]
  const row = order?.subOrderList?.[0]
  if (!order || !row) return null

  return {
    tradeNo: order.tradeNo,
    productName: row.subProductTypeName || row.productName || '',
    configs: normalizeConfigs(row.configs),
    unitPrice: Number(row.price || 0),
    quantity: Number(row.num || 0),
    duration: row.duration || row.duration === 0 ? `${row.duration}${row.durationUnit || ''}` : '-',
    amount: Number(row.amount || 0),
  }
})

const payAmount = computed(() => Number(payDetail.value?.totalAmount || payProduct.value?.amount || 0))
const balanceValue = computed(() => Number(account.value?.usableBalance ?? account.value?.usableQuota ?? 0))

const balancePayDisable = computed(() => {
  if (!payAmount.value) return true
  if (account.value?.advanceStatus === 2) {
    return Number(account.value?.usableQuota || 0) - payAmount.value < 0
  }
  return Number(account.value?.usableBalance || 0) - payAmount.value < 0
})

const onlinePayDisable = computed(() => ![0, 2].includes(Number(payMethod.value)))

const actualPrice = computed(() => {
  const usableBalance = Number(account.value?.usableBalance || 0)
  const rechargePay = usableBalance < 0 ? payAmount.value + Math.abs(usableBalance) : payAmount.value
  return {
    balancePay: payAmount.value,
    rechargePay,
  }
})

const stickyAmount = computed(() =>
  isPayStep.value
    ? paymentWay.activeIndex === 2
      ? actualPrice.value.rechargePay
      : actualPrice.value.balancePay
    : confirmAmount.value,
)

const normalizeConfigs = (configs: Array<{ key: string; value: string }> = []) =>
  configs
    .filter(item => item?.value)
    .map(item => ({
      label: String(item.key || '').replace(/：$/, ''),
      value: item.value,
    }))

const getLegacyProductName = (product: any) =>
  `${getValueMap(areaList1, product.accelerationRegion)} ${product.accelerationType ? 'ECDN' : 'CDN'} ${getValueMap(
    resourcePkgList,
    product.class,
  )}`

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const toInvoice = () => {
  pushRoute({ name: 'expense_bill_invoice_list' })
}

const getAccountInfo = async () => {
  const res = await _getAccountInfo()
  if (!res.success) return

  account.value = res.data || {}
  if (balancePayDisable.value && onlinePayDisable.value) {
    paymentWay.activeIndex = -1
  } else if (balancePayDisable.value) {
    paymentWay.activeIndex = 2
  } else if (onlinePayDisable.value) {
    paymentWay.activeIndex = 1
  }
}

const queryPayOrder = async () => {
  if (!tradeNoList.value.length) return
  const res = await _queryProductOrder({
    tradeNoList: tradeNoList.value,
  })
  if (res.success) {
    payDetail.value = res.data || {}
    payMethod.value = Number(res.data?.orderList?.[0]?.payMethod || 0)
  }
}

const queryConfirmOrder = async () => {
  if (serialNo.value) {
    await queryPreProductOrder(serialNo.value, res => {
      if (res.success) {
        confirmDetail.value = res.data || {}
      }
    })
  }
}

const refreshPage = async () => {
  if (isPayStep.value) {
    await Promise.all([queryPayOrder(), getAccountInfo()])
  } else {
    await queryConfirmOrder()
  }
}

const createPreOrderFromLegacy = async () => {
  if (!parsedProduct.value) return ''
  const { data, code } = await _createProductOrder2({
    pkgID: parsedProduct.value.productID,
    pkgVersion: parsedProduct.value.version,
    num: parsedProduct.value.count,
  })
  return code === 200 ? data?.serialNo || '' : ''
}

const goToPayStep = async () => {
  const currentSerialNo = serialNo.value || (await createPreOrderFromLegacy())
  if (!currentSerialNo) {
    message.error(t('common.error_cd'))
    return
  }

  const res = await _createProductOrder({
    serialNo: currentSerialNo,
  })
  if (!res.success || !res.data?.tradeNo) {
    message.warning(res.msg || t('common.error_cd'))
    return
  }

  pushRoute({
    path: '/cdn/order',
    query: {
      serialNo: currentSerialNo,
      tradeNo: res.data.tradeNo,
      step: 'pay',
    },
  })
}

const changePaymentWay = (type: PaymentWay) => {
  if (type === 1 && balancePayDisable.value) return
  if (type === 2 && onlinePayDisable.value) return
  paymentWay.activeIndex = type
}

const createRechargeOrder = async () => {
  const res = await _createRechargeOrder({
    scene: 2,
    amount: actualPrice.value.rechargePay,
    productTradeNoList: tradeNoList.value,
  })
  if (!res.success) {
    message.warning(res.msg || t('common.error_cd'))
    return
  }
  const origin = window.location.origin
  window.open(`${origin}/cost-center/payment/online/${res.data.tradeNo}?type=${route.query.type || 'cdn'}`, '_blank')
}

const balancePayOrder = async () => {
  const res = await _balancePayOrder({
    tradeNoList: tradeNoList.value,
  })
  if (!res.success) {
    message.warning(res.msg || t('common.error_cd'))
    return
  }
  switch (res.data?.status) {
    case 1:
      message.success(t('payment.paySuccessTit'))
      await queryPayOrder()
      break
    case 2:
      message.warning(res.data?.msg || t('payment.payFailTit'))
      break
    case 3:
      message.warning('订单已过期')
      break
    default:
      break
  }
}

const handlePrimaryAction = async () => {
  try {
    submitLoading.value = true
    if (isConfirmStep.value) {
      await goToPayStep()
      return
    }

    if (paymentWay.activeIndex === 1) {
      await balancePayOrder()
    } else if (paymentWay.activeIndex === 2) {
      await createRechargeOrder()
    }
  } finally {
    submitLoading.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    refreshPage()
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.cdn-flow-order-v2 {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.cdn-flow-order-v2__panel,
.cdn-flow-order-v2__sticky,
.cdn-flow-order-v2__summary-float {
  background: #fff;
}

.cdn-flow-order-v2__panel {
  padding: 20px;
}

.cdn-flow-order-v2__panel--confirm {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-bottom: 0;
}

.cdn-flow-order-v2__panel--pay {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-bottom: 0;
}

.cdn-flow-order-v2__page-title,
.cdn-flow-order-v2__section-title,
.cdn-flow-order-v2__pay-title {
  margin: 0;
  font-weight: 600;
  color: #191c23;
}

.cdn-flow-order-v2__page-title {
  font-size: 18px;
  line-height: 32px;
}

.cdn-flow-order-v2__section-title,
.cdn-flow-order-v2__pay-title {
  font-size: 18px;
  line-height: 24px;
}

.cdn-flow-order-v2__notice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin-top: 16px;
  font-size: 15px;
  line-height: 24px;
  color: #98a1b2;
}

.cdn-flow-order-v2__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  color: #06f;
  background: #edf4ff;
}

.cdn-flow-order-v2__notice-text {
  color: #98a1b2;
}

.cdn-flow-order-v2__notice-row strong {
  color: #ff5d3d;
}

.cdn-flow-order-v2__link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 0;
  font: inherit;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.cdn-flow-order-v2__group-table {
  margin-top: 24px;
  border: 1px solid #e8ecf3;
}

.cdn-flow-order-v2__group-head,
.cdn-flow-order-v2__group-title,
.cdn-flow-order-v2__group-amount,
.cdn-flow-order-v2__summary-row,
.cdn-flow-order-v2__summary-total,
.cdn-flow-order-v2__pay-footer,
.cdn-flow-order-v2__pay-footer-price {
  display: flex;
  align-items: center;
}

.cdn-flow-order-v2__group-head,
.cdn-flow-order-v2__summary-row,
.cdn-flow-order-v2__summary-total,
.cdn-flow-order-v2__pay-footer {
  justify-content: space-between;
}

.cdn-flow-order-v2__group-head {
  min-height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid #e8ecf3;
}

.cdn-flow-order-v2__group-title {
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

.cdn-flow-order-v2__group-arrow {
  width: 16px;
  height: 16px;
  color: #4d5663;
  transition: transform 0.2s ease;
  transform: rotate(-180deg);
}

.cdn-flow-order-v2__group-arrow.is-expanded {
  transform: rotate(-90deg);
}

.cdn-flow-order-v2__group-amount {
  gap: 6px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-flow-order-v2__group-amount strong,
.cdn-flow-order-v2__price,
.cdn-flow-order-v2__summary-total strong,
.cdn-flow-order-v2__sticky-price strong {
  color: #ff720d;
}

.cdn-flow-order-v2__table {
  display: grid;
  grid-template-columns: 1fr;
}

.cdn-flow-order-v2__tr {
  display: grid;
  grid-template-columns: 1.35fr 1.35fr 0.7fr 1fr 0.6fr 0.7fr 1fr;
}

.cdn-flow-order-v2__tr--pay-head,
.cdn-flow-order-v2__tr--pay-row {
  grid-template-columns: 1.2fr 1.1fr 1.4fr 0.6fr 0.9fr 0.5fr 0.6fr 0.9fr;
}

.cdn-flow-order-v2__tr > div {
  min-height: 56px;
  padding: 16px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  border-right: 1px solid #e8ecf3;
  border-bottom: 1px solid #e8ecf3;
}

.cdn-flow-order-v2__tr > div:last-child {
  border-right: 0;
}

.cdn-flow-order-v2__tr--head > div {
  min-height: 46px;
  padding-top: 13px;
  padding-bottom: 13px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  background: #f9fafc;
}

.cdn-flow-order-v2__tr:last-child > div {
  border-bottom: 0;
}

.cdn-flow-order-v2__cell-name {
  display: flex;
  align-items: center;
}

.cdn-flow-order-v2__config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cdn-flow-order-v2__config span {
  color: #98a1b2;
}

.cdn-flow-order-v2__config strong {
  font-weight: 400;
  color: #191c23;
}

.cdn-flow-order-v2__summary-float {
  position: absolute;
  right: 0;
  bottom: calc(100% + 12px);
  width: min(446px, 100%);
  padding: 20px 20px 22px;
  border: 1px solid #f3d9d3;
  box-shadow: 0 4px 10px rgb(0 0 0 / 8%);
}

.cdn-flow-order-v2__summary-alert {
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 22px;
  color: #e54839;
  background: #fff2ef;
}

.cdn-flow-order-v2__summary-row {
  padding-bottom: 16px;
  margin-bottom: 18px;
  font-size: 14px;
  line-height: 22px;
  color: #4d5663;
  border-bottom: 1px solid #e8ecf3;
}

.cdn-flow-order-v2__summary-total {
  align-items: baseline;
}

.cdn-flow-order-v2__summary-total strong {
  font-size: 28px;
  line-height: 1.1;
}

.cdn-flow-order-v2__summary-caret {
  position: absolute;
  right: 62px;
  bottom: -10px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-right: 1px solid #f3d9d3;
  border-bottom: 1px solid #f3d9d3;
  transform: rotate(45deg);
}

.cdn-flow-order-v2__confirm-footer {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: center;
  justify-content: flex-end;
  padding: 24px 20px;
  margin-top: auto;
  margin-right: -28px;
  margin-left: -28px;
  border-top: 1px solid #e8ecf3;
}

.cdn-flow-order-v2__confirm-side {
  position: relative;
  display: flex;
  justify-content: flex-end;
  min-width: 446px;
}

.cdn-flow-order-v2__confirm-price {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-flow-order-v2__confirm-price span {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
}

.cdn-flow-order-v2__confirm-price strong {
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  color: #ff720d;
}

.cdn-flow-order-v2__confirm-price small {
  font-size: 14px;
  line-height: 22px;
  color: #ff720d;
}

.cdn-flow-order-v2__pay-section {
  margin-top: 28px;
}

.cdn-flow-order-v2__pay-footer {
  gap: 24px;
  padding: 24px 20px;
  margin: auto -20px 0;
  border-top: 1px solid #e8ecf3;
}

.cdn-flow-order-v2__pay-footer-price {
  gap: 6px;
  align-items: baseline;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-flow-order-v2__pay-footer-price strong {
  font-size: 24px;
  line-height: 32px;
  color: #ff720d;
}

.cdn-flow-order-v2__pay-footer-price small {
  font-size: 14px;
  line-height: 22px;
  color: #ff720d;
}

.cdn-flow-order-v2__pay-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.cdn-flow-order-v2__pay-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 156px;
  padding: 20px;
  overflow: hidden;
  font: inherit;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cdn-flow-order-v2__pay-card.is-active {
  background: rgb(0 102 255 / 2%);
  border-color: #06f;
}

.cdn-flow-order-v2__pay-card.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.cdn-flow-order-v2__pay-main {
  display: flex;
  gap: 20px;
  align-items: center;
}

.cdn-flow-order-v2__pay-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgb(0 102 255 / 8%);
  border-radius: 999px;

  :deep(svg) {
    width: 24px;
    height: 24px;
    color: #06f;
  }
}

.cdn-flow-order-v2__pay-copy {
  position: relative;
  z-index: 1;
}

.cdn-flow-order-v2__pay-name {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.cdn-flow-order-v2__pay-desc {
  margin-top: 4px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-flow-order-v2__pay-desc span:last-child {
  color: #06f;
}

.cdn-flow-order-v2__pay-desc--icons {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.cdn-flow-order-v2__pay-desc--icons :deep(svg) {
  width: 14px;
  height: 14px;
}

.cdn-flow-order-v2__pay-desc--icons span:last-child {
  color: #828b9c;
}

.cdn-flow-order-v2__pay-amount {
  position: relative;
  z-index: 1;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-flow-order-v2__pay-watermark {
  position: absolute;
  right: -10px;
  bottom: -18px;
  width: 112px;
  height: 112px;
  color: rgb(0 102 255 / 6%);
}

.cdn-flow-order-v2__pay-check {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, transparent 48%, #06f 48%);
}

.cdn-flow-order-v2__pay-check::after {
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 8px;
  height: 4px;
  content: '';
  border-bottom: 2px solid #fff;
  border-left: 2px solid #fff;
  transform: rotate(-45deg);
}

@media (width <= 1200px) {
  .cdn-flow-order-v2__pay-cards {
    grid-template-columns: 1fr;
  }
}

@media (width <= 1024px) {
  .cdn-flow-order-v2__panel {
    padding: 20px 16px;
  }

  .cdn-flow-order-v2 {
    min-height: auto;
  }

  .cdn-flow-order-v2__panel--confirm,
  .cdn-flow-order-v2__panel--pay {
    min-height: auto;
  }

  .cdn-flow-order-v2__group-table {
    overflow-x: auto;
  }

  .cdn-flow-order-v2__table {
    min-width: 920px;
  }

  .cdn-flow-order-v2__table--pay {
    min-width: 1100px;
  }

  .cdn-flow-order-v2__summary-float {
    width: 100%;
  }

  .cdn-flow-order-v2__confirm-stage {
    min-height: auto;
    padding: 20px 0 0;
  }

  .cdn-flow-order-v2__confirm-footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 20px 16px;
    margin-right: -16px;
    margin-left: -16px;
  }

  .cdn-flow-order-v2__confirm-side {
    min-width: 0;
  }

  .cdn-flow-order-v2__summary-float {
    position: relative;
    right: auto;
    bottom: auto;
    width: 100%;
    margin-bottom: 16px;
  }

  .cdn-flow-order-v2__pay-footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
