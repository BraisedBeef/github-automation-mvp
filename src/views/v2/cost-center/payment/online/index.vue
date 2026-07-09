<template>
  <div class="payment-online-v2">
    <section class="payment-online-v2__panel">
      <h2 class="payment-online-v2__title">订单详情</h2>

      <div class="payment-online-v2__detail-list">
        <div v-if="route.query.type !== 'recharge'" class="payment-online-v2__detail-row">
          <span class="payment-online-v2__detail-label">{{ t('payment.productTradeNoList') }}</span>
          <span class="payment-online-v2__detail-value">{{ detail.productTradeNoList || '-' }}</span>
        </div>

        <div class="payment-online-v2__detail-row payment-online-v2__detail-row--amount">
          <span class="payment-online-v2__detail-label">{{ t('payment.payAmount') }}</span>
          <span class="payment-online-v2__amount">${{ detail.amount || 0 }} USD</span>
        </div>

        <div class="payment-online-v2__detail-row">
          <span class="payment-online-v2__detail-label">{{ t('payment.subject') }}</span>
          <span class="payment-online-v2__detail-value">{{ detail.subject || '-' }}</span>
        </div>

        <div class="payment-online-v2__detail-row">
          <span class="payment-online-v2__detail-label">{{ t('payment.ordertradeNo') }}</span>
          <span class="payment-online-v2__detail-value">{{ detail.tradeNo || '-' }}</span>
        </div>

        <div class="payment-online-v2__detail-row">
          <span class="payment-online-v2__detail-label">{{ t('payment.amounts') }}</span>
          <span class="payment-online-v2__detail-value">${{ detail.amount || 0 }} USD</span>
        </div>

        <div class="payment-online-v2__detail-row">
          <span class="payment-online-v2__detail-label">{{ t('payment.createTime') }}</span>
          <span class="payment-online-v2__detail-value">{{ formatCreateTime }}</span>
        </div>
      </div>
    </section>

    <section class="payment-online-v2__panel payment-online-v2__panel--content">
      <div class="payment-online-v2__section-title">
        {{ t('payment.payMethod') }}
      </div>

      <div class="payment-online-v2__tabs">
        <button
          v-for="tab in paymentTabs"
          :key="tab.value"
          class="payment-online-v2__tab"
          :class="{
            'is-active': active === tab.value,
            'is-disabled': tab.disabled,
          }"
          type="button"
          :disabled="tab.disabled"
          @click="selectTab(tab)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="payment-online-v2__body">
        <template v-if="active === 3">
          <div v-if="!card.list.length" v-loading="card.viewLoading" class="payment-online-v2__credit-empty">
            <div class="payment-online-v2__info-banner">
              {{ t('payment.noCardTip') }}
            </div>

            <div class="payment-online-v2__steps">
              <div class="payment-online-v2__step payment-online-v2__step--with-line">
                <div class="payment-online-v2__step-rail">
                  <div class="payment-online-v2__step-index">1</div>
                  <div class="payment-online-v2__step-line" />
                </div>
                <div class="payment-online-v2__step-content">
                  <h3>{{ t('payment.cardStep1') }}</h3>
                  <p>{{ t('payment.cardStep1Desc') }}</p>
                  <div class="payment-online-v2__kv-list">
                    <div class="payment-online-v2__kv-row">
                      <span>{{ t('payment.cardInfo1Key') }}</span>
                      <strong>{{ t('payment.cardInfo1Value') }}</strong>
                    </div>
                    <div class="payment-online-v2__kv-row">
                      <span>{{ t('payment.cardInfo2Key') }}</span>
                      <strong>{{ t('payment.cardInfo2Value') }}</strong>
                    </div>
                    <div class="payment-online-v2__kv-row">
                      <span>{{ t('payment.cardInfo3Key') }}</span>
                      <strong>{{ t('payment.cardInfo3Value') }}</strong>
                    </div>
                    <div class="payment-online-v2__kv-row">
                      <span>{{ t('payment.cardInfo4Key') }}</span>
                      <strong>{{ t('payment.cardInfo4Value') }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="payment-online-v2__step">
                <div class="payment-online-v2__step-rail">
                  <div class="payment-online-v2__step-index">2</div>
                </div>
                <div class="payment-online-v2__step-content">
                  <h3>{{ t('payment.cardStep2') }}</h3>
                  <p>{{ t('payment.cardStep2Desc1') }}</p>
                  <p>{{ t('payment.cardStep2Desc2') }}</p>
                </div>
              </div>
            </div>

            <el-button class="payment-online-v2_confirm_btn" type="primary" :loading="loading" @click="handleAddCard">
              {{ t('payment.continue') }}
            </el-button>
          </div>

          <div v-else v-loading="card.viewLoading" class="payment-online-v2__credit-list">
            <div class="payment-online-v2__credit-head">
              <span>{{ t('payment.confirmPayMethod') }}</span>
              <button class="payment-online-v2__link" type="button" @click="pushRoute({ name: 'capital_payment' })">
                {{ t('payment.addCardMethod') }}
              </button>
            </div>

            <button
              v-for="item in card.list"
              :key="item.id"
              class="payment-online-v2__card-item"
              :class="{ 'is-active': card.viewChecked === item.label }"
              type="button"
              @click="selectCard(item.label)"
            >
              <div class="payment-online-v2__card-brand">
                <SvgIcon class="payment-online-v2__bank-icon" :name="BANK_MAP[item.brand]" />
              </div>
              <div class="payment-online-v2__card-no">
                <span>****{{ item.cardNo }}</span>
                <el-tag v-if="item.defaultPayStatus === 1">
                  {{ t('payment.default') }}
                </el-tag>
              </div>
              <div class="payment-online-v2__card-name">
                {{ item.userName }}
              </div>
              <span class="payment-online-v2__radio" :class="{ 'is-active': card.viewChecked === item.label }" />
            </button>

            <div class="payment-online-v2__info-banner">
              <p>{{ t('payment.notice') }}</p>
              <p>{{ t('payment.noticeDesc1') }}</p>
              <p>{{ t('payment.noticeDesc2') }}</p>
            </div>

            <el-button type="primary" :loading="card.btnLoading" @click="createSubOrder(3)">
              {{ t('payment.confirmPay') }}
            </el-button>
          </div>
        </template>

        <template v-else-if="active === 1 || active === 2">
          <div class="payment-online-v2__qr-panel">
            <p class="payment-online-v2__countdown">
              <span>{{ active === 1 ? t('payment.wechatDesc') : t('payment.alipayDesc') }}</span>
              <span class="payment-online-v2__countdown-time">{{ currentCountdown }}</span>
            </p>

            <div class="payment-online-v2__qr-wrap">
              <QrCode
                :url="currentQrUrl"
                :overdue="currentQrOverdue"
                :loading="currentQrLoading"
                @click-cover="createSubOrder(active)"
              />
              <div class="payment-online-v2__phone-preview">
                <img :src="active === 1 ? wechatImg : alipayImg" alt="" />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="active === 5">
          <div class="payment-online-v2__usdt-panel">
            <p class="payment-online-v2__countdown">
              <span>{{ t('payment.usdt') }}</span>
              <span class="payment-online-v2__countdown-time">{{ orderList.usdt.countdown }}</span>
            </p>

            <div class="payment-online-v2__usdt-main">
              <QrCode
                :url="currentUsdtQrUrl"
                :overdue="[4, 5].includes(orderList.usdt.state)"
                :loading="orderList.usdt.loading"
                @click-cover="createSubOrder(5)"
              />

              <div class="payment-online-v2__usdt-form">
                <div class="payment-online-v2__field">
                  <span class="payment-online-v2__field-label">Network</span>
                  <div class="payment-online-v2__network">
                    <SvgIcon name="tron" />
                    <span>Tron(TRC20)</span>
                  </div>
                </div>

                <div class="payment-online-v2__field">
                  <span class="payment-online-v2__field-label">Address</span>
                  <div class="payment-online-v2__address">
                    <span>{{ orderList.usdt.trc20Address.value }}</span>
                    <SvgIcon
                      name="copy"
                      class="payment-online-v2__copy"
                      @click="handleCopy(orderList.usdt.trc20Address.value)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { _getCreditcardList, _addCreditcard } from '@/apis/cost-center/card'
import { _createSubOrder, _queryRechargeOrder } from '@/apis/cost-center/payment'
import alipayImg from '@/assets/images/cost-center/payment/alipay.png'
import wechatImg from '@/assets/images/cost-center/payment/wechat.png'
import { univapayAppId } from '@/config/base-config'
import { BANK_MAP } from '@/views/cost-center/capital/config'
import { useUserStore } from '@/store'
import { maoYunDayJs, FORMAT_DAY } from '@/utils/mao-yun-day-js'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'
import { pushRoute, replaceRoute } from '@/utils/router-jump'
import QrCode from '@/views/cost-center/payment/online/components/qr-code.vue'
import QRCode from 'qrcode'
import t from '@/utils/i18n'

interface OrderItem {
  url?: string
  expireTime: number
  loading: boolean
  state: number
  countdown: string
}

const zero = '00:00'
const route = useRoute()
const userStore = useUserStore()

const timeId = ref<any>(null)
const countdownTimeId = ref<any>(null)
const active = ref(2)
const loading = ref(false)
const tradeNo = ref<string>(route.params.tradeNo as string)
const detail = reactive<any>({})

const paymentTabs = computed(() => [
  { label: t('payment.bank'), value: 3, disabled: false },
  { label: t('payment.alipay'), value: 2, disabled: false },
  { label: t('payment.wechat'), value: 1, disabled: false },
  { label: t('payment.usdt'), value: 5, disabled: false },
])

const orderList = reactive<{
  wechat: OrderItem
  alipay: OrderItem
  usdt: OrderItem & {
    activeIndex: number
    erc20Address: any
    trc20Address: any
  }
}>({
  wechat: {
    url: '',
    expireTime: 0,
    loading: false,
    state: 1,
    countdown: zero,
  },
  alipay: {
    url: '',
    expireTime: 0,
    loading: false,
    state: 1,
    countdown: zero,
  },
  usdt: {
    url: '',
    expireTime: 0,
    loading: false,
    state: 1,
    countdown: zero,
    activeIndex: 1,
    erc20Address: { url: '', value: '' },
    trc20Address: { url: '', value: '' },
  },
})

const card = reactive<{
  checked: number
  show: boolean
  list: any[]
  viewChecked: number
  viewLoading: boolean
  btnLoading: boolean
}>({
  checked: 0,
  show: false,
  list: [],
  viewChecked: 0,
  viewLoading: false,
  btnLoading: false,
})

const formatCreateTime = computed(() => (detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_DAY) : '-'))

const currentQrData = computed(() => {
  if (active.value === 1) return orderList.wechat
  if (active.value === 2) return orderList.alipay
  return null
})

const currentQrUrl = computed(() => currentQrData.value?.url || '')
const currentQrLoading = computed(() => currentQrData.value?.loading || false)
const currentQrOverdue = computed(() => [4, 5].includes(currentQrData.value?.state || 0))
const currentCountdown = computed(() => currentQrData.value?.countdown || zero)
const currentUsdtQrUrl = computed(() =>
  orderList.usdt.activeIndex === 0 ? orderList.usdt.erc20Address.url : orderList.usdt.trc20Address.url,
)

const openCountdown = () => {
  if (countdownTimeId.value) return

  countdownTimeId.value = setInterval(() => {
    if (active.value === 1) {
      orderList.wechat.countdown = updateCountdown(orderList.wechat.expireTime)
    }
    if (active.value === 2) {
      orderList.alipay.countdown = updateCountdown(orderList.alipay.expireTime)
    }
    if (active.value === 5) {
      orderList.usdt.countdown = updateCountdown(orderList.usdt.expireTime)
    }
  }, 1000)
}

const updateCountdown = (expiryTimestamp: number) => {
  const now = maoYunDayJs().valueOf()
  const distance = expiryTimestamp - now

  if (distance < 0) {
    return zero
  }

  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const handleCopy = async (value: string) => {
  if (!value) return
  await handleCopyValue(value)
  message.success(t('domainSet2.copySuccess'))
}

const handleAddCard = () => {
  // @ts-ignore
  if (window.UnivapayCheckout) {
    const appId = univapayAppId
    // @ts-ignore
    const checkout = window.UnivapayCheckout.create({
      appId,
      checkout: 'token',
      paymentType: 'card',
      tokenType: 'recurring',
      cvvAuthorize: 'true',
      onSuccess(result) {
        if (result.response.data.card.brand !== '') {
          const month = String(result.response.data.card.expMonth)
          const year = String(result.response.data.card.expYear)
          const validDate = `${month.length < 2 ? `0${month}` : month}/${year}`

          addCreditcard({
            brand: result.response.data.card.brand,
            cardToken: result.response.id,
            cardNo: result.response.data.card.lastFour,
            validDate,
            email: result.response.email,
            userName: result.response.data.card.cardholder,
          })
        }
      },
      callback() {
        getCreditcardList()
      },
      closed() {},
      onError(error) {
        console.log('onError===>', error)
      },
    })

    checkout.open()
  }
}

const addCreditcard = async data => {
  const res = await _addCreditcard(data)
  if (res.success) {
    message.success(t('payment.addCardSuccess'))
    getCreditcardList()
  }
}

const selectCard = (label: number) => {
  card.checked = label
  card.viewChecked = label
}

const selectTab = (tab: { value: number; disabled?: boolean }) => {
  if (tab.disabled) return
  active.value = tab.value
  handleTabChange(tab)
}

const handleTabChange = (item: { value: number }) => {
  if ([1, 2, 5].includes(item.value)) {
    createSubOrder(item.value)
  } else {
    getCreditcardList()
  }
}

const createSubOrder = async (payChannel: number) => {
  try {
    switch (payChannel) {
      case 1:
        orderList.wechat.loading = true
        break
      case 2:
        orderList.alipay.loading = true
        break
      case 3:
        card.btnLoading = true
        break
      case 5:
        orderList.usdt.loading = true
        break
      default:
        break
    }

    const params =
      payChannel === 3
        ? {
            tradeNo: tradeNo.value,
            payChannel,
            creditcardId: card.list[card.viewChecked].id,
          }
        : {
            tradeNo: tradeNo.value,
            payChannel,
          }

    const res = await _createSubOrder(params)

    if (res.success) {
      if ([1, 2].includes(payChannel)) {
        QRCode.toDataURL(res.data?.qrCode, {
          errorCorrectionLevel: 'H',
          type: 'image/jpeg',
          quality: 0.3,
          margin: 1,
        })
          .then(url => {
            switch (payChannel) {
              case 1:
                orderList.wechat.url = url
                orderList.wechat.expireTime = res.data?.expireTime
                break
              case 2:
                orderList.alipay.url = url
                orderList.alipay.expireTime = res.data?.expireTime
                break
              default:
                break
            }
          })
          .catch(err => {
            console.error(err)
          })
      }

      if ([5].includes(payChannel)) {
        orderList.usdt.expireTime = res.data?.expireTime

        for (const addr of ['erc20Address', 'trc20Address']) {
          orderList.usdt[addr].value = res.data?.[addr]

          QRCode.toDataURL(res.data?.[addr], {
            errorCorrectionLevel: 'H',
            type: 'image/jpeg',
            quality: 0.3,
            margin: 1,
          })
            .then(url => {
              orderList.usdt[addr].url = url
            })
            .catch(err => {
              console.error(err)
            })
        }
      }
    } else {
      const type = route.query.type

      if (payChannel === 3) {
        replaceRoute({
          name: 'payment_fail',
          query: {
            type,
            msg: res.msg,
          },
        })
      } else {
        message.warning(res.msg)

        switch (payChannel) {
          case 1:
            orderList.wechat.url = ''
            orderList.wechat.expireTime = 0
            orderList.wechat.loading = false
            orderList.wechat.state = 1
            orderList.wechat.countdown = zero
            break
          case 2:
            orderList.alipay.url = ''
            orderList.alipay.expireTime = 0
            orderList.alipay.loading = false
            orderList.alipay.state = 1
            orderList.alipay.countdown = zero
            break
          case 5:
            orderList.usdt.url = ''
            orderList.usdt.expireTime = 0
            orderList.usdt.loading = false
            orderList.usdt.state = 1
            orderList.usdt.erc20Address = { url: '', value: '' }
            orderList.usdt.trc20Address = { url: '', value: '' }
            break
          default:
            break
        }
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    switch (payChannel) {
      case 1:
        orderList.wechat.loading = false
        break
      case 2:
        orderList.alipay.loading = false
        break
      case 3:
        card.btnLoading = false
        break
      case 5:
        orderList.usdt.loading = false
        break
      default:
        break
    }

    openCountdown()
  }
}

const queryRechargeOrder = async () => {
  const res = await _queryRechargeOrder({
    tradeNo: tradeNo.value,
  })

  if (res.success) {
    detail.description = res.data?.description
    detail.expireTime = res.data?.expireTime
    detail.tradeNo = res.data?.tradeNo
    detail.subject = res.data?.subject
    detail.createTime = res.data?.createTime
    detail.amount = res.data?.amount
    detail.productTradeNoList = (res.data?.productTradeNoList || []).join('-')
    detail.state = res.data?.state

    for (const item of res.data.subOrderList || []) {
      switch (item?.payChannel) {
        case 1:
          orderList.wechat.state = item?.state
          orderList.wechat.expireTime = item?.expireTime
          break
        case 2:
          orderList.alipay.state = item?.state
          orderList.alipay.expireTime = item?.expireTime
          break
        case 5:
          orderList.usdt.state = item?.state
          orderList.usdt.expireTime = item?.expireTime
          break
        default:
          break
      }
    }
  }
}

const getCreditcardList = async () => {
  try {
    card.viewLoading = true
    const res = await _getCreditcardList()

    if (res.success) {
      const list = res.data || []

      card.list = list.map((el, index) => ({
        ...el,
        label: index,
      }))

      if (list.length) {
        if (!card.viewChecked) {
          const index = list.findIndex(el => el.defaultPayStatus === 1)
          if (index !== -1) {
            card.viewChecked = index
            card.checked = index
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    card.viewLoading = false
  }
}

watch(
  () => detail.state,
  value => {
    if (value === 2) {
      userStore.getUser()
      replaceRoute({
        name: 'payment_success',
        query: {
          type: route.query.type,
        },
      })
    }
  },
)

onMounted(() => {
  createSubOrder(2)
  getCreditcardList()
  queryRechargeOrder()
  timeId.value = setInterval(() => {
    queryRechargeOrder()
  }, 3 * 1000)
})

onBeforeUnmount(() => {
  clearInterval(timeId.value)
  clearInterval(countdownTimeId.value)
})
</script>

<style lang="scss" scoped>
.payment-online-v2 {
  display: flex;
  flex: 1;
  flex-direction: column;

  // gap: 16px;
  min-height: 0;
  margin: -16px;
}

.payment-online-v2__panel {
  padding: 36px 120px 0;
  background: #fff;
}

.payment-online-v2__panel--content {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.payment-online-v2__title,
.payment-online-v2__section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.payment-online-v2__detail-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.payment-online-v2__detail-row {
  display: flex;
  gap: 36px;
  align-items: flex-start;
}

.payment-online-v2__detail-row--amount {
  align-items: flex-end;
}

.payment-online-v2__detail-label {
  width: 70px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.payment-online-v2__detail-value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-all;
}

.payment-online-v2__amount {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: #ff720d;
}

.payment-online-v2__tabs {
  display: flex;
  gap: 32px;
  margin-top: 16px;
  border-bottom: 1px solid #e8ecf3;
}

.payment-online-v2__tab {
  position: relative;
  padding: 10px 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.payment-online-v2__tab.is-active {
  font-weight: 500;
  color: #06f;
}

.payment-online-v2__tab.is-active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  content: '';
  background: #06f;
}

.payment-online-v2__tab.is-disabled {
  color: #b6beca;
  cursor: not-allowed;
}

.payment-online-v2__body {
  // padding-top: 24px;
}

.payment-online-v2__info-banner {
  width: 100%;
  padding: 12px 16px;
  margin-top: 24px;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  background: rgb(0 102 255 / 8%);
}

.payment-online-v2__info-banner p {
  margin: 0;
}

.payment-online-v2__steps {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 601px;
}

.payment-online-v2_confirm_btn {
  margin-top: 24px;
}

.payment-online-v2__step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.payment-online-v2__step--with-line {
  min-height: 316px;
}

.payment-online-v2__step-rail {
  display: flex;
  flex: 0 0 32px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
}

.payment-online-v2__step-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #fff;
  background: #06f;
  border-radius: 50%;
}

.payment-online-v2__step-line {
  flex: 1;
  width: 0;
  margin-top: 4px;
  border-left: 2px dashed #d5dbe6;
}

.payment-online-v2__step-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding-top: 4px;
  padding-bottom: 12px;
}

.payment-online-v2__step-content h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.payment-online-v2__step-content p {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #50596a;
}

.payment-online-v2__step-content > p:first-of-type {
  color: #50596a;
}

.payment-online-v2__credit-empty,
.payment-online-v2__credit-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
}

.payment-online-v2__credit-empty {
  padding-bottom: 36px;
}

.payment-online-v2__kv-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.payment-online-v2__kv-row {
  display: flex;
  gap: 36px;
  align-items: flex-start;
}

.payment-online-v2__kv-row span {
  width: 72px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.payment-online-v2__kv-row strong {
  flex: 1;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #191c23;
}

.payment-online-v2__credit-head {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.payment-online-v2__link {
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.payment-online-v2__card-item {
  display: grid;
  grid-template-columns: 64px minmax(180px, 1fr) 160px 24px;
  gap: 16px;
  align-items: center;
  width: 100%;
  min-height: 56px;
  padding: 16px 24px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.payment-online-v2__card-item.is-active {
  border-color: #06f;
  box-shadow: inset 0 0 0 1px #06f;
}

.payment-online-v2__card-brand {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.payment-online-v2__bank-icon {
  width: 32px;
  height: 22px;
}

.payment-online-v2__card-no,
.payment-online-v2__card-name {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.payment-online-v2__radio {
  width: 16px;
  height: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
}

.payment-online-v2__radio.is-active {
  border: 4px solid #06f;
}

.payment-online-v2__qr-panel,
.payment-online-v2__usdt-panel {
  display: flex;
  flex-direction: column;
  gap: 36px;
  margin-top: 36px;
}

.payment-online-v2__countdown {
  display: flex;
  gap: 4px;
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.payment-online-v2__countdown-time {
  color: #e54839;
}

.payment-online-v2__qr-wrap,
.payment-online-v2__usdt-main {
  display: flex;
  gap: 120px;
  align-items: center;
}

.qrcode {
  margin: 0;
}

.payment-online-v2__phone-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  padding: 4px;
  background: rgb(255 255 255 / 2%);
  backdrop-filter: blur(2px);
  border: 1px solid #e8ecf3;
  border-radius: 8px;
}

.payment-online-v2__phone-preview img {
  width: 80px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.payment-online-v2__usdt-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 432px;
}

.payment-online-v2__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-online-v2__field-label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.payment-online-v2__network,
.payment-online-v2__address {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 36px;
  padding: 6px 10px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.payment-online-v2__network {
  background: rgb(0 102 255 / 4%);
  border-color: #06f;
}

.payment-online-v2__address span {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payment-online-v2__copy {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

@media (width <= 1200px) {
  .payment-online-v2__card-item {
    grid-template-columns: 48px minmax(140px, 1fr) 120px 24px;
    padding-right: 16px;
    padding-left: 16px;
  }

  .payment-online-v2__qr-wrap,
  .payment-online-v2__usdt-main {
    gap: 32px;
  }

  .payment-online-v2__usdt-form {
    width: 320px;
  }
}

@media (width <= 900px) {
  .payment-online-v2__panel {
    padding: 16px;
  }

  .payment-online-v2__detail-row,
  .payment-online-v2__kv-row {
    flex-direction: column;
    gap: 8px;
  }

  .payment-online-v2__steps {
    width: 100%;
  }

  .payment-online-v2__step--with-line {
    min-height: auto;
  }

  .payment-online-v2__detail-label,
  .payment-online-v2__kv-row span {
    width: auto;
  }

  .payment-online-v2__tabs {
    gap: 20px;
    overflow-x: auto;
  }

  .payment-online-v2__card-item {
    grid-template-columns: 40px 1fr 24px;
  }

  .payment-online-v2__card-name {
    grid-column: 2 / 3;
  }

  .payment-online-v2__qr-wrap,
  .payment-online-v2__usdt-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .payment-online-v2__usdt-form {
    width: 100%;
  }
}
</style>
