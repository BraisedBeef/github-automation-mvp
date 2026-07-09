<template>
  <div class="payment-order-v2">
    <div class="payment-order-v2__panel">
      <div class="payment-order-v2__title-wrap">
        <span class="payment-order-v2__title">确认产品信息</span>
        <button class="payment-order-v2__back" type="button" @click="pushRoute({ name: 'order' })">
          {{ t('payment.backOrder') }}
        </button>
      </div>

      <div class="payment-order-v2__notice-row">
        <span class="payment-order-v2__tag">{{ t('oderIns') }}</span>
        <span class="payment-order-v2__notice-text">{{ t('sureProductInfoTip1') }}</span>
        <strong class="payment-order-v2__notice-strong">{{ t('sureProductInfoTip2') }}</strong>
      </div>
    </div>

    <div class="payment-order-v2__panel">
      <div class="payment-order-v2__section-title">待支付订单</div>

      <div class="payment-order-v2__table-head">
        <button class="payment-order-v2__table-toggle" type="button" @click="showTable">
          <SvgIcon
            class="payment-order-v2__table-arrow"
            name="cat-cdn-slide"
            :style="{ transform: `rotate(${tableHeight ? 0 : -90}deg)` }"
          />
          {{ t('payment.prepaidProducts', [orderList.length || 0]) }}
        </button>
        <div class="payment-order-v2__table-amount">
          <span>{{ t('payment.paySum') }}</span>
          <strong>${{ detail.totalAmount }} USD</strong>
        </div>
      </div>

      <TableV2
        v-show="tableHeight"
        v-loading="loading.list"
        class="payment-order-v2__table"
        :data="orderList"
        grouped
        :highlight-current-row="false"
        :span-method="objectSpanMethod"
      >
        <el-table-column prop="productName" :label="t('payment.productName')" min-width="180">
          <template #default="{ row }">
            <span class="payment-order-v2__table-text">{{ row.subProductTypeName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('payment.configurate')" min-width="420">
          <template #default="{ row }">
            <div class="payment-order-v2__config-wrap">
              <table class="payment-order-v2__config-table">
                <tbody>
                  <template v-for="(item, index) in row.configs" :key="index">
                    <tr v-if="item.value">
                      <td class="payment-order-v2__config-key" :class="labelWidthClass">
                        {{ item.key }}
                      </td>
                      <td class="payment-order-v2__config-value">
                        {{ item.value }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>

              <span
                v-if="isManySubOrder && [OSS_KEY].includes(row.productSymbol)"
                class="payment-order-v2__detail-link"
                @click="showSubOrderDetail(row)"
              >
                {{ t('payment.detail') }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('type')">
          <template #default="{ row }">
            <span class="payment-order-v2__table-text">{{ ORDER_TYPE_MAP[row.publicInfo.type] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" :label="t('payment.price')">
          <template #default="{ row }">
            <span class="payment-order-v2__table-text">${{ row.price }} USD</span>
          </template>
        </el-table-column>
        <el-table-column prop="num" :label="t('payment.num')">
          <template #default="{ row }">
            <span class="payment-order-v2__table-text">{{ row.num }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('payment.duration')">
          <template #default="{ row }">
            <span class="payment-order-v2__table-text">{{ `${row.duration}${row.durationUnit}` }}</span>
          </template>
        </el-table-column>
        <el-table-column align="right" min-width="140">
          <template #header>
            <span class="payment-order-v2__table-header-amount">{{ t('payment.amount') }}</span>
          </template>
          <template #default="{ row }">
            <span class="payment-order-v2__amount-text">${{ row.amount }} USD</span>
          </template>
        </el-table-column>
      </TableV2>
    </div>

    <div class="payment-order-v2__panel">
      <div class="payment-order-v2__section-title">
        {{ t('payment.selectPaymentMethod') }}
      </div>

      <div class="payment-order-v2__pay-cards">
        <button
          class="payment-order-v2__pay-card"
          :class="[paymentWay.activeIndex === 1 && 'is-active', balancePayDisable && 'is-disabled']"
          type="button"
          @click="changePaymentWay(1)"
        >
          <div class="payment-order-v2__pay-main">
            <div class="payment-order-v2__pay-icon">
              <SvgIcon name="v2-payment-wallet" />
            </div>
            <div class="payment-order-v2__pay-copy">
              <div class="payment-order-v2__pay-name">
                {{ t('payment.balance') }}
              </div>
              <div class="payment-order-v2__pay-desc" v-html="balanceDescription" />
            </div>
          </div>
          <div class="payment-order-v2__pay-amount">{{ t('payment.pay') }}: ${{ actualPrice.balancePay }} USD</div>
          <SvgIcon name="v2-payment-balance" class="payment-order-v2__pay-watermark" />
          <span v-if="paymentWay.activeIndex === 1" class="payment-order-v2__pay-check" />
        </button>

        <button
          class="payment-order-v2__pay-card"
          :class="[paymentWay.activeIndex === 2 && 'is-active', onlinePayDisable && 'is-disabled']"
          type="button"
          @click="changePaymentWay(2)"
        >
          <div class="payment-order-v2__pay-main">
            <div class="payment-order-v2__pay-icon">
              <SvgIcon name="v2-payment-online" />
            </div>
            <div class="payment-order-v2__pay-copy">
              <div class="payment-order-v2__pay-name">
                {{ t('payment.online') }}
              </div>
              <div class="payment-order-v2__pay-desc payment-order-v2__pay-desc--icons">
                <span>{{ supportLabel }}</span>
                <SvgIcon name="pay-union" />
                <SvgIcon name="pay-alipay" />
                <SvgIcon name="pay-usdt" />
                <span>{{ multipleMethodsText }}</span>
              </div>
            </div>
          </div>
          <div class="payment-order-v2__pay-amount">{{ t('payment.pay') }}: ${{ actualPrice.rechargePay }} USD</div>
          <span v-if="paymentWay.activeIndex === 2" class="payment-order-v2__pay-check" />
        </button>
      </div>
    </div>

    <div class="payment-order-v2__footer">
      <div class="payment-order-v2__footer-inner">
        <el-popover placement="top" :disabled="!showActualPrices" :width="320" trigger="hover" :teleported="false">
          <template #reference>
            <div class="payment-order-v2__footer-price">
              <span class="payment-order-v2__footer-label" :class="{ 'is-underline': showActualPrices }">
                {{ t('payment.actualPrices') }}
              </span>
              <strong>${{ paymentWay.activeIndex === 1 ? actualPrice.balancePay : actualPrice.rechargePay }}</strong>
              <small>USD</small>
            </div>
          </template>
          <template #default>
            <div class="payment-order-v2__popover">
              <div class="payment-order-v2__popover-tip">
                {{ t('payment.actualPriceTip') }}
              </div>
              <div class="payment-order-v2__popover-row">
                <span>{{ t('payment.prePay') }}</span>
                <span>${{ detail.totalAmount }} USD</span>
              </div>
              <div class="payment-order-v2__popover-row">
                <span>{{ t('payment.owingMoney') }}</span>
                <span>${{ Math.abs(account.debtMoney) }} USD</span>
              </div>
              <div class="payment-order-v2__popover-divider" />
              <div class="payment-order-v2__popover-row payment-order-v2__popover-row--total">
                <span>{{ t('payment.actualPrice') }}</span>
                <strong
                  >${{ paymentWay.activeIndex === 1 ? actualPrice.balancePay : actualPrice.rechargePay }} USD</strong
                >
              </div>
            </div>
          </template>
        </el-popover>

        <el-button :loading="loading.btn" type="primary" :disabled="paymentWay.activeIndex === -1" @click="goPay">
          {{ t('payment.goPay') }}
        </el-button>
      </div>
    </div>

    <ComfirmPayDialog ref="comfirmPayDialogRef" @comfirm-pay="handleComfirmPay" @no-pay="handleNoPay" />
    <NoPayDialog ref="noPayDialogRef" />
    <OrderExpireDialog ref="orderExpireDialogRef" />
    <OrderHandleFailDialog ref="orderHandleFailDialogRef" />
    <OrderLoseEfficacyDialog ref="orderLoseEfficacyDialogRef" />
    <OrderPaySuccessDialog ref="orderPaySuccessDialogRef" />
    <OrderPayFailDialog ref="orderPayFailDialogRef" :text="failMsg" />
    <SubOrderDialog ref="subOrderDialogRef" :detail="subOrderDetail" />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { _queryProductOrder, _balancePayOrder, _createRechargeOrder } from '@/apis/cost-center/payment'
import { _getAccountInfo } from '@/apis/cost-center/user'
import OrderExpireDialog from '@/views/cost-center/payment/order/components/order-expire-dialog.vue'
import OrderPaySuccessDialog from '@/views/cost-center/payment/order/components/order-pay-success-dialog.vue'
import OrderPayFailDialog from '@/views/cost-center/payment/order/components/order-pay-fail-dialog.vue'
import SubOrderDialog from '@/views/cost-center/payment/order/components/sub-order-dialog.vue'
import NoPayDialog from '@/views/cost-center/payment/order/components/no-pay-dialog.vue'
import ComfirmPayDialog from '@/views/cost-center/payment/order/components/comfirm-pay-dialog.vue'
import OrderLoseEfficacyDialog from '@/views/cost-center/payment/order/components/order-lose-efficacy-dialog.vue'
import OrderHandleFailDialog from '@/views/cost-center/payment/order/components/order-handle-fail-dialog.vue'
import NP from 'number-precision'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { ORDER_TYPE_MAP } from '@/views/cost-center/order/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP, OSS_KEY } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

NP.enableBoundaryChecking(false)

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'payment-order-v2__config-key--wide',
  [en]: 'payment-order-v2__config-key--wide',
  [zh]: 'payment-order-v2__config-key--normal',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)
const userStore = useUserStore()
const route = useRoute()

const orderExpireDialogRef = ref<InstanceType<typeof OrderExpireDialog>>()
const orderPaySuccessDialogRef = ref<InstanceType<typeof OrderPaySuccessDialog>>()
const orderPayFailDialogRef = ref<InstanceType<typeof OrderPayFailDialog>>()
const subOrderDialogRef = ref<InstanceType<typeof SubOrderDialog>>()
const noPayDialogRef = ref<InstanceType<typeof NoPayDialog>>()
const comfirmPayDialogRef = ref<InstanceType<typeof ComfirmPayDialog>>()
const orderHandleFailDialogRef = ref<InstanceType<typeof OrderHandleFailDialog>>()
const orderLoseEfficacyDialogRef = ref<InstanceType<typeof OrderLoseEfficacyDialog>>()

const subOrderDetail = ref<any>({})
const paymentWay = reactive<{ activeIndex: number; scene: number }>({
  activeIndex: 1,
  scene: 2,
})
const payMethod = ref<number>(0)
const loading = reactive<{ list: boolean; btn: boolean }>({
  list: false,
  btn: false,
})
const tradeNoList = ref<any[]>([])
const detail = ref<any>({})
const account = ref<any>({})
const isManySubOrder = ref<boolean>(false)
const failMsg = ref<string>('')
const timeId = ref<any>(null)
const tableHeight = ref<number>(1)

const supportLabel = '支持'
const multipleMethodsText = '多种支付方式'

const showActualPrices = computed(() => {
  if (paymentWay.activeIndex === 2) {
    return account.value.usableBalance < 0
  }
  return false
})

const balanceDescription = computed(() => {
  if (account.value.advanceStatus === 2) {
    if (account.value.usableQuota > detail.value.totalAmount) {
      return t('payment.balancePayAdvanceOpen1', [account.value.usableQuota])
    }
    return t('payment.balancePayAdvanceOpen2', [account.value.usableQuota])
  }
  return t('payment.balancePayAdvanceClose', [account.value.usableBalance])
})

const balancePayDisable = computed(() => {
  if (account.value.advanceStatus === 2) {
    return account.value.usableQuota - detail.value.totalAmount < 0
  }
  return account.value.usableBalance - detail.value.totalAmount < 0
})

const onlinePayDisable = computed(() => ([0, 2].includes(payMethod.value) ? false : true))

const actualPrice = computed(() => {
  const actualValue: any = {
    balancePay: detail.value.totalAmount,
    rechargePay: 0,
  }
  actualValue.rechargePay =
    account.value.usableBalance < 0
      ? NP.plus(detail.value.totalAmount, Math.abs(account.value.usableBalance))
      : detail.value.totalAmount
  return actualValue
})

const orderList = computed(() => {
  const list: any[] = []
  isManySubOrder.value = false

  for (const order of detail.value.orderList || []) {
    const publicInfo = {
      amount: order.amount,
      createTime: order.createTime,
      createUid: order.createUid,
      expireTime: order.expireTime,
      payTime: order.payTime,
      payUid: order.payUid,
      productSymbol: order.productSymbol,
      state: order.state,
      tradeNo: order.tradeNo,
      type: order.type,
    }

    const rowspan = order.subOrderList.length
    const colspan = 1

    if (order.subOrderList?.length) {
      if (order.subOrderList.length > 1) {
        isManySubOrder.value = true
      }

      for (let i = 0; i < order.subOrderList.length; i++) {
        list.push(
          i === 0
            ? {
                ...order.subOrderList[i],
                publicInfo,
                rowspan,
                colspan,
              }
            : { ...order.subOrderList[i], publicInfo },
        )
      }
    }
  }

  return list
})

const showTable = () => {
  tableHeight.value = +!tableHeight.value
}

const showDialog = (ins: any, show?: boolean, cb?: () => void) => {
  if (!ins) return
  ins.show = show === undefined ? true : show
  cb && cb()
}

const showSubOrderDetail = (row: any) => {
  showDialog(subOrderDialogRef.value, true, () => {
    subOrderDetail.value = row
  })
}

const handleComfirmPay = () => {
  showDialog(comfirmPayDialogRef.value, false, () => {
    queryProductOrder()
  })
}

const handleNoPay = () => {
  showDialog(noPayDialogRef.value)
}

const objectSpanMethod = ({ row, columnIndex }: any) => {
  if (columnIndex === 0) {
    if (row.rowspan) {
      return {
        rowspan: row.rowspan,
        colspan: row.colspan,
      }
    }

    return {
      rowspan: 0,
      colspan: 0,
    }
  }
}

const changePaymentWay = (activeIndex: number) => {
  if (activeIndex === 1) {
    if (!balancePayDisable.value) {
      paymentWay.activeIndex = activeIndex
      getAccountInfo()
    }
    return
  }

  if (!onlinePayDisable.value) {
    paymentWay.activeIndex = activeIndex
    getAccountInfo()
  }
}

const getPathtradeNo = () => {
  const tradeNoPath = route.params.tradeNo as string
  tradeNoList.value = tradeNoPath ? tradeNoPath.split('-') : []
}

const goPay = () => {
  switch (paymentWay.activeIndex) {
    case 1:
      balancePayOrder()
      break
    case 2:
      createRechargeOrder()
      break
    default:
      break
  }
}

const getAccountInfo = async () => {
  const res = await _getAccountInfo()
  if (res.success) {
    account.value = res.data || {}

    if (balancePayDisable.value && onlinePayDisable.value) {
      paymentWay.activeIndex = -1
    } else {
      if (balancePayDisable.value && paymentWay.activeIndex === 1) {
        paymentWay.activeIndex = 2
      }

      if (onlinePayDisable.value && paymentWay.activeIndex === 2) {
        paymentWay.activeIndex = 1
      }
    }
  }
}

const createRechargeOrder = async () => {
  try {
    loading.btn = true
    const res = await _createRechargeOrder({
      scene: paymentWay.scene,
      amount: actualPrice.value.rechargePay,
      productTradeNoList: tradeNoList.value,
    })

    if (res.success) {
      const origin = window.location.origin
      window.open(`${origin}/cost-center/payment/online/${res.data.tradeNo}?type=${route.query.type}`, '_blank')
      showDialog(comfirmPayDialogRef.value)
    } else {
      message.warning(res.msg)
    }
  } finally {
    loading.btn = false
  }
}

const balancePayOrder = async () => {
  try {
    loading.btn = true
    const res = await _balancePayOrder({
      tradeNoList: tradeNoList.value,
    })

    if (res.success) {
      switch (res.data.status) {
        case 1:
          showDialog(orderPaySuccessDialogRef.value)
          userStore.getUser()
          break
        case 2:
          failMsg.value = res.data.msg
          showDialog(orderPayFailDialogRef.value)
          break
        case 3:
          showDialog(orderExpireDialogRef.value)
          break
        default:
          break
      }
    } else {
      message.warning(res.msg)
    }
  } finally {
    loading.btn = false
  }
}

const queryProductOrder = async () => {
  try {
    if (!timeId.value) {
      loading.list = true
    }
    const res = await _queryProductOrder({
      tradeNoList: tradeNoList.value,
    })

    if (res.success) {
      detail.value = res.data || {}
      payMethod.value = res.data.orderList[0]?.payMethod

      const state = res.data.orderList[0]?.state
      if (state === 2) {
        showDialog(comfirmPayDialogRef.value, false)
        showDialog(orderPaySuccessDialogRef.value)
      }
      if (state === 4) {
        showDialog(comfirmPayDialogRef.value, false)
        showDialog(orderExpireDialogRef.value)
      }
      if (state === 5) {
        showDialog(comfirmPayDialogRef.value, false)
        showDialog(orderLoseEfficacyDialogRef.value)
      }
      if (state === 9) {
        showDialog(comfirmPayDialogRef.value, false)
        showDialog(orderHandleFailDialogRef.value)
      }
    }
  } finally {
    loading.list = false
  }
}

watch(
  () => route.params.tradeNo,
  async () => {
    getPathtradeNo()
    await queryProductOrder()
    getAccountInfo()
  },
)

onMounted(async () => {
  userStore.getUser()
  getPathtradeNo()
  await queryProductOrder()
  getAccountInfo()

  timeId.value = setInterval(() => {
    queryProductOrder()
  }, 3 * 1000)
})

onBeforeUnmount(() => {
  clearInterval(timeId.value)
})
</script>

<style lang="scss" scoped>
.payment-order-v2 {
  min-height: calc(100vh - 60px);
  padding-bottom: 80px;
  margin: -16px;
  background: #fff;
}

.payment-order-v2__panel {
  padding: 0 56px;
  margin-bottom: 48px;
  background: #fff;
}

.payment-order-v2__title-wrap {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 36px 0 42px;
}

.payment-order-v2__title {
  font-size: 18px;
  font-weight: 600;
  line-height: 32px;
  color: #191c23;
}

.payment-order-v2__back,
.payment-order-v2__detail-link {
  padding: 0;
  font: inherit;
  color: #06f;
  cursor: pointer;
  background: none;
  border: 0;
}

.payment-order-v2__back {
  font-size: 14px;
  line-height: 22px;
}

.payment-order-v2__notice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  // min-height: 66px;
  // padding: 0 12px;
}

.payment-order-v2__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 20px;
  color: #06f;
  background: #edf4ff;
  translate: all 0.2s ease;
}

.payment-order-v2__notice-text {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.payment-order-v2__notice-strong {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: #ff6a3d;
}

.payment-order-v2__section-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.payment-order-v2__table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  margin-top: 16px;
  background: #fff;
  border: 1px solid #e8ecf3;

  // border-bottom: 0;
}

.payment-order-v2__table-toggle {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: none;
  border: 0;
}

.payment-order-v2__table-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.payment-order-v2__table-amount {
  display: inline-flex;
  gap: 20px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.payment-order-v2__table-amount strong,
.payment-order-v2__amount-text {
  font-weight: 500;
  color: #ff720d;
}

.payment-order-v2__table {
  border: 1px solid #e8ecf3;

  :deep(.el-table__header-wrapper th) {
    background: #f9fafc !important;
  }

  :deep(.el-table__cell) {
    padding: 22px 0;
    border-bottom: 1px solid #e8ecf3;
  }
}

.payment-order-v2__table-text,
.payment-order-v2__config-value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.payment-order-v2__config-wrap {
  padding: 6px 0;
}

.payment-order-v2__config-table tr {
  background: transparent;
}

.payment-order-v2__config-key {
  width: 90px;
  padding-right: 20px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  vertical-align: top;
}

.payment-order-v2__config-key--wide {
  width: 160px;
}

.payment-order-v2__config-key--normal {
  width: 110px;
}

.payment-order-v2__table-header-amount {
  margin-right: 20px;
}

.payment-order-v2__detail-link {
  display: inline-block;
  margin-top: 12px;
}

.payment-order-v2__pay-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.payment-order-v2__pay-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  // min-height: 156px;
  padding: 20px 20px 40px;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.payment-order-v2__pay-card.is-active {
  background: rgb(0 102 255 / 2%);
  border-color: #06f;
  box-shadow: inset 0 0 0 1px #06f;
}

.payment-order-v2__pay-card.is-disabled {
  cursor: not-allowed;
  background: #f9fafc;
}

.payment-order-v2__pay-card.is-disabled .payment-order-v2__pay-name,
.payment-order-v2__pay-card.is-disabled .payment-order-v2__pay-desc,
.payment-order-v2__pay-card.is-disabled .payment-order-v2__pay-amount {
  color: #bbc0ca !important;
}

.payment-order-v2__pay-card.is-disabled .payment-order-v2__pay-icon {
  opacity: 0.5;
}

.payment-order-v2__pay-main {
  display: flex;
  gap: 20px;
  align-items: center;
}

.payment-order-v2__pay-icon {
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

.payment-order-v2__pay-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 4px;
}

.payment-order-v2__pay-name {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.payment-order-v2__pay-desc {
  margin-top: 4px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;

  :deep(span:last-child) {
    color: #06f;
  }
}

.payment-order-v2__pay-desc--icons {
  display: inline-flex;
  gap: 6px;
  align-items: center;

  :deep(svg) {
    width: 16px;
    height: 16px;
  }

  span:last-child {
    color: #828b9c;
  }
}

.payment-order-v2__pay-amount {
  position: relative;
  z-index: 1;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.payment-order-v2__pay-watermark {
  position: absolute;
  right: 8px;
  bottom: -20px;
  width: 96px;
  height: 96px;
  color: rgb(0 102 255 / 6%);
}

.payment-order-v2__pay-check {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, transparent 48%, #06f 48%);
}

.payment-order-v2__pay-check::after {
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

.payment-order-v2__footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  background: #fff;
  border-top: 1px solid #e8ecf3;
}

.payment-order-v2__footer-inner {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: flex-end;
  padding: 24px 32px 24px 24px;
}

.payment-order-v2__footer-price {
  display: inline-flex;
  gap: 8px;
  align-items: flex-end;
}

.payment-order-v2__footer-label {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.payment-order-v2__footer-label.is-underline {
  text-decoration: underline;
  text-decoration-style: dotted;
}

.payment-order-v2__footer-price strong,
.payment-order-v2__popover-row--total strong {
  font-size: 24px;
  line-height: 32px;
  color: #ff720d;
}

.payment-order-v2__footer-price small {
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 22px;
  color: #ff720d;
}

.payment-order-v2__popover {
  width: 288px;
  padding: 8px 4px 0;
}

.payment-order-v2__popover-tip {
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 22px;
  color: #ff6a3d;
  background: #fff1ec;
}

.payment-order-v2__popover-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 22px;
  color: #50596a;
}

.payment-order-v2__popover-divider {
  height: 1px;
  margin: 16px 0;
  background: #e8ecf3;
}

.payment-order-v2__popover-row--total {
  margin-bottom: 0;
  color: #191c23;
}

:deep(.payment-order-v2__footer .el-button) {
  min-width: 84px;
}

@media (width <= 1200px) {
  .payment-order-v2__pay-cards {
    grid-template-columns: 1fr;
  }
}
</style>
