<template>
  <div class="wrap page-box">
    <div class="top">
      <!-- 商品订单 -->
      <div v-if="route.query.type !== 'recharge'" class="order-wrap mb20 df">
        <p class="name" :style="layoutStyle">
          {{ t('payment.productTradeNoList') }}
        </p>
        <span class="value">{{ detail.productTradeNoList }}</span>
      </div>

      <!-- 支付金额 -->
      <div class="payment-price-wrap">
        <div class="df mb20">
          <p class="name" :style="layoutStyle">
            {{ t('payment.payAmount') }}
          </p>
          <div class="value df">
            <span class="price-text text-18">${{ detail.amount }} USD</span>
            <p class="df ac cursor-pointer" @click="isShow = !isShow">
              <span class="ml20 detail-text mr4">{{ t('payment.orderDetail') }}</span>
              <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
                <CaretBottom />
              </el-icon>
            </p>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="isShow" class="df">
            <!-- 占位 -->
            <div :style="layoutStyle" />
            <!-- 详情 -->
            <div class="info">
              <p>
                <span class="key">{{ t('payment.subject') }}</span
                ><span class="value">{{ detail.subject }}</span>
              </p>
              <p>
                <span class="key">{{ t('payment.ordertradeNo') }}</span
                ><span class="value">{{ detail.tradeNo }}</span>
              </p>
              <p>
                <span class="key">{{ t('payment.amounts') }}</span
                ><span class="value">${{ detail.amount }} USD</span>
              </p>
              <p>
                <span class="key">{{ t('payment.createTime') }}</span
                ><span class="value">{{ maoYunDayJs(detail.createTime).format(FORMAT_DAY) }}</span>
              </p>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </div>

    <!-- <el-divider class="divider" /> -->
    <div class="line" />

    <div class="bottom df">
      <p class="name" :style="layoutStyle">
        {{ t('payment.payMethod') }}
      </p>
      <CatTabs v-model="active" :tabs="tabs" @change="handleTabChange">
        <!-- 网银支付 -->
        <CatTabPane :value="3">
          <div v-loading="card.viewLoading" class="bank-wrap">
            <!-- 未绑定信用卡 -->
            <template v-if="!card.list.length">
              <!-- tip -->
              <Tip :text="tips" type="OneToOne" />

              <div class="step-wrap">
                <div class="step-line" />
                <div class="step-item">
                  <div class="main df ac">
                    <div class="circle-wrap">
                      <div class="circle">1</div>
                    </div>
                    <span>{{ t('payment.cardStep1') }}</span>
                  </div>
                  <div class="sub mb20 df ac">
                    <div class="circle-wrap" />
                    <span>{{ t('payment.cardStep1Desc') }}</span>
                  </div>
                  <div class="desc-item df ac">
                    <div class="circle-wrap" />
                    <div class="key-wrap" :style="keyWrapStyle">
                      <span class="key">{{ t('payment.cardInfo1Key') }}</span>
                    </div>
                    <span>{{ t('payment.cardInfo1Value') }}</span>
                  </div>
                  <div class="desc-item df ac">
                    <div class="circle-wrap" />
                    <div class="key-wrap" :style="keyWrapStyle">
                      <span class="key">{{ t('payment.cardInfo2Key') }}</span>
                    </div>
                    <span>{{ t('payment.cardInfo2Value') }}</span>
                  </div>
                  <div class="desc-item df ac">
                    <div class="circle-wrap" />
                    <div class="key-wrap" :style="keyWrapStyle">
                      <span class="key">{{ t('payment.cardInfo3Key') }}</span>
                    </div>
                    <span>{{ t('payment.cardInfo3Value') }}</span>
                  </div>
                  <div class="desc-item df ac">
                    <div class="circle-wrap" />
                    <div class="key-wrap" :style="keyWrapStyle">
                      <span class="key">{{ t('payment.cardInfo4Key') }}</span>
                    </div>
                    <span>{{ t('payment.cardInfo4Value') }}</span>
                  </div>
                </div>

                <div class="step-item">
                  <div class="main df ac">
                    <div class="circle-wrap">
                      <div class="circle">2</div>
                    </div>
                    <span>{{ t('payment.cardStep2') }}</span>
                  </div>
                  <div class="sub df ac">
                    <div class="circle-wrap" />
                    <span>{{ t('payment.cardStep2Desc1') }} </span>
                  </div>
                  <div class="sub mb20 df ac">
                    <div class="circle-wrap" />
                    <span>{{ t('payment.cardStep2Desc2') }} </span>
                  </div>
                </div>
              </div>
              <el-button type="primary" :loading="loading" @click="handleAddCard">
                {{ t('payment.continue') }}
              </el-button>
            </template>
            <!-- 有信用卡 -->
            <template v-else>
              <p class="operation df ac jsb mb20">
                <span class="main">{{ t('payment.confirmPayMethod') }}</span>
                <span class="text-primary cursor-pointer" @click="card.show = true">{{ t('payment.otherCard') }}</span>
              </p>

              <div class="card-info mb20 df ac">
                <div class="item card-type">
                  <SvgIcon class="bank-img" :name="BANK_MAP[checkedCardList[0]?.brand]" />
                </div>
                <div class="item card-num df ac">
                  <span style="margin-right: 10px">****{{ checkedCardList[0]?.cardNo }}</span>
                  <el-tag v-if="checkedCardList[0]?.defaultPayStatus === 1">
                    {{ t('payment.default') }}
                  </el-tag>
                </div>
                <div class="item card-name">
                  <span>{{ checkedCardList[0]?.userName }}</span>
                </div>
                <div class="item card-checked df jfe">
                  <el-radio v-model="card.viewChecked" :label="checkedCardList[0]?.label" />
                </div>
              </div>

              <div class="desc-wrap">
                <p class="main-text">
                  {{ t('payment.notice') }}
                </p>
                <p class="sub-text">
                  {{ t('payment.noticeDesc1') }}
                </p>
                <p class="sub-text">
                  {{ t('payment.noticeDesc2') }}
                </p>
              </div>

              <el-button :loading="card.btnLoading" lass="continue" type="primary" @click="createSubOrder(3)">
                {{ t('payment.confirmPay') }}
              </el-button>
            </template>
          </div>
        </CatTabPane>
        <!-- 微信支付 -->
        <CatTabPane :value="1" :disabled="true">
          <div class="wechat-wrap mb20">
            <!-- 过期时间 -->
            <div class="expireTime-tip df ac">
              <span v-html="t('payment.expireTimeTip', [orderList.wechat.countdown])" />
            </div>
            <div class="df">
              <!-- 二维码 -->
              <QrCode
                :url="orderList.wechat.url"
                :overdue="[4, 5].includes(orderList.wechat.state)"
                :loading="orderList.wechat.loading"
                @click-cover="createSubOrder(1)"
              />
              <el-image style="width: 136px; height: 212px" :src="wechatImg" />
            </div>
            <p class="desc">
              <span class="text-success fz-12px">{{ t('payment.wechatDesc') }}</span>
            </p>
          </div>
        </CatTabPane>
        <!-- 支付宝支付 -->
        <CatTabPane :value="2">
          <div class="alipay-wrap mb20">
            <!-- 过期时间 -->
            <div class="expireTime-tip df ac">
              <span v-html="t('payment.expireTimeTip', [orderList.alipay.countdown])" />
            </div>

            <div class="df">
              <!-- 二维码 -->
              <QrCode
                :url="orderList.alipay.url"
                :overdue="[4, 5].includes(orderList.alipay.state)"
                :loading="orderList.alipay.loading"
                @click-cover="createSubOrder(2)"
              />
              <el-image style="width: 136px; height: 212px" :src="alipayImg" />
            </div>
            <p class="desc">
              <span class="text-primary fz-12px">{{ t('payment.alipayDesc') }}</span>
            </p>
          </div>
        </CatTabPane>
        <!-- usdt支付 -->
        <CatTabPane :value="5">
          <div class="usdt-wrap ac">
            <!-- 过期时间 -->
            <div class="expireTime-tip df ac jc">
              <span v-html="t('payment.expireTimeTip', [orderList.usdt.countdown])" />
            </div>

            <div class="df jc">
              <!-- 二维码 -->
              <QrCode
                :url="
                  orderList.usdt.activeIndex === 0 ? orderList.usdt.erc20Address.url : orderList.usdt.trc20Address.url
                "
                :overdue="[4, 5].includes(orderList.usdt.state)"
                :loading="orderList.usdt.loading"
                @click-cover="createSubOrder(5)"
              />
            </div>
            <!-- Network -->
            <div class="chain-wrap">
              <div class="key-wrap">Network</div>
              <div class="btn-wrap df ac jsb">
                <!-- eth -->
                <!-- <div
                  class="btn df ac mr10 cursor-pointer"
                  :class="orderList.usdt.activeIndex === 0 ? 'actived' : ''"
                  @click="changeChain(0)"
                >
                  <SvgIcon name="eth" /><span class="ml4">Ethereum(ERC20)</span>
                </div> -->
                <!-- tron -->
                <div
                  class="btn df ac cursor-pointer"
                  :class="orderList.usdt.activeIndex === 1 ? 'actived' : ''"
                  @click="changeChain(1)"
                >
                  <SvgIcon name="tron" /><span class="ml4">Tron(TRC20) </span>
                </div>
              </div>
            </div>

            <!-- address -->
            <div class="address-wrap">
              <div class="key-wrap">Address</div>
              <div class="address df ac jsb">
                <span class="mr20">{{
                  orderList.usdt.activeIndex === 0
                    ? orderList.usdt.erc20Address.value
                    : orderList.usdt.trc20Address.value
                }}</span>

                <SvgIcon
                  name="copy"
                  @click="
                    handleCopy(
                      orderList.usdt.activeIndex === 0
                        ? orderList.usdt.erc20Address.value
                        : orderList.usdt.trc20Address.value,
                    )
                  "
                />
              </div>
            </div>
          </div>
        </CatTabPane>
      </CatTabs>
    </div>

    <!-- 信用卡管理 -->
    <CatDialog
      v-model:dialog="card.show"
      :title="t('payment.cardTit')"
      width="720px"
      destroy-on-close
      :confirm-text="t('payment.cardConfirmText')"
      class="dialog"
      @confirm="confirmCardHandle"
      @update:dialog="card.checked = card.viewChecked"
    >
      <p class="operation df ac jsb mb20">
        <span class="main">{{ t('payment.card') }}</span>
        <span class="text-primary cursor-pointer" @click="pushRoute({ name: 'capital_payment' })">{{
          t('payment.addCardMethod')
        }}</span>
      </p>

      <el-table v-loading="loading" :data="card.list" class="mt20 w-full border-1-t" :show-header="false">
        <el-table-column :label="t('payment.type')">
          <template #default="{ row }">
            <SvgIcon class="bank-img" :name="BANK_MAP[row.brand]" />
          </template>
        </el-table-column>
        <el-table-column prop="cardNo" :label="t('payment.cardNo')">
          <template #default="{ row }">
            <div class="df ac">
              <span style="margin-right: 10px">****{{ row.cardNo }}</span>
              <el-tag v-if="row.defaultPayStatus === 1">
                {{ t('payment.default') }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="userName" :label="t('payment.userName')" />
        <el-table-column :label="t('payment.check')" align="right">
          <template #default="{ row }">
            <div style="padding-right: 20px">
              <el-radio v-model="card.checked" :label="row.label" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { _getCreditcardList, _addCreditcard } from '@/apis/cost-center/card'
import wechatImg from '@/assets/images/cost-center/payment/wechat.png'
import alipayImg from '@/assets/images/cost-center/payment/alipay.png'
import QRCode from 'qrcode'
import { maoYunDayJs, FORMAT_DAY } from '@/utils/mao-yun-day-js'
import { _createSubOrder, _queryRechargeOrder } from '@/apis/cost-center/payment'
import QrCode from './components/qr-code.vue'
import { message } from '@/utils/message'
import { CaretBottom } from '@element-plus/icons-vue'
import t from '@/utils/i18n'
import { useUserStore } from '@/store'

import { handleCopyValue } from '@/utils/dom-utils'
import { BANK_MAP } from '@/views/cost-center/capital/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { univapayAppId } from '@/config/base-config'
import { pushRoute, replaceRoute } from '@/utils/router-jump'

interface OrderItem {
  url?: string // 二维码地址
  expireTime: number // 过期时间
  loading: boolean // 二维码loading
  state: number // state 1 待支付 2 已支付 3 已失败 4 已取消 5 已关闭
  countdown: string // 倒计时
}

const zero = `00:00`
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const layoutStyleMap = {
  [ja]: {
    width: '100px',
  },
  [en]: {
    width: '170px',
  },
  [zh]: {
    width: '100px',
  },
}
const keyWrapStyleMap = {
  [ja]: {
    width: '180px',
  },
  [en]: {
    width: '160px',
  },
  [zh]: {
    width: '110px',
  },
}

const layoutStyle = useI18nStyle(layoutStyleMap)
const keyWrapStyle = useI18nStyle(keyWrapStyleMap)
const userStore = useUserStore()
const route = useRoute()

const isShow = ref<boolean>(true) // 是否显示订单详情
const timeId = ref<any>(null) // 定时器
const countdownTimeId = ref<any>(null) // 定时器
const active = ref(2) // 支付方式 默认展示支付宝
const tabs = [
  { label: t('payment.bank'), value: 3, key: 'bank' },
  // { label: t('payment.wechat'), value: 1, key: 'wechat' },
  { label: t('payment.alipay'), value: 2, key: 'alipay' },
  { label: t('payment.usdt'), value: 5, key: 'usdt' },
] // 主充值订单详情
const detail = reactive<any>({})

// 支付宝/微信/Foxpay子订单详情
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

const loading = ref<boolean>(false)
const tradeNo = ref<string>(route.params.tradeNo as string) // 订单号

// 信用卡
const card = reactive<{
  checked: number
  show: boolean
  list: any[]
  viewChecked: number
  viewLoading: boolean
  btnLoading: boolean
}>({
  checked: 0, // 勾选
  show: false, // 显示弹窗
  list: [], // 信用卡列表
  viewChecked: 0, // 最终展示
  viewLoading: false, // 视图loading
  btnLoading: false, // 支付按钮loading
})

const tips = computed(() => [
  {
    main: t('payment.noCardTip'),
  },
])

// 开启倒计时
const openCountdown = () => {
  if (countdownTimeId.value) return

  countdownTimeId.value = setInterval(() => {
    // 微信
    if (active.value === 1) {
      orderList.wechat.countdown = updateCountdown(orderList.wechat.expireTime)
    }
    // 支付宝
    if (active.value === 2) {
      orderList.alipay.countdown = updateCountdown(orderList.alipay.expireTime)
    }
    // usdt
    if (active.value === 5) {
      orderList.usdt.countdown = updateCountdown(orderList.usdt.expireTime)
    }
  }, 1000)
}

// 更新倒计时
const updateCountdown = (expiryTimestamp: number) => {
  const now = maoYunDayJs().valueOf()
  const distance = expiryTimestamp - now

  if (distance < 0) {
    return zero
  }

  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 复制
const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}

// 切换链
const changeChain = (index: number) => {
  orderList.usdt.activeIndex = index
}

// 点击添加信用卡
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
        console.log(`onSuccess===>`, result)

        if (result.response.data.card.brand !== '') {
          let month = String(result.response.data.card.expMonth)
          const year = String(result.response.data.card.expYear)

          const validDate = (month.length < 2 ? `0${month}` : month) + '/' + year

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
      callback(callback) {
        getCreditcardList()
        console.log(`callback===>`, callback)
      },
      closed(closed) {
        console.log(`closed===>`, closed)
      },
      onError: function (error) {
        console.log(`onError===>`, error)
      },
    })

    checkout.open()
  }
}

// 添加信用卡
const addCreditcard = async data => {
  console.log(`addCreditcard===>`, data)

  const res = await _addCreditcard(data)

  console.log('_addCreditcard', res)

  if (res.success) {
    message.success(t('payment.addCardSuccess'))
    getCreditcardList()
  }
}

// 确认选择
const confirmCardHandle = () => {
  card.viewChecked = card.checked
  card.show = false
}

// 确认付款方式列表
const checkedCardList = computed(() => {
  return card.list.filter(el => el.label === card.viewChecked)
})

// tab 切换
const handleTabChange = (item: any) => {
  console.log(`handleTabChange===>`, item)

  // 支付宝/微信/usdt
  if ([1, 2, 5].includes(item.value)) {
    createSubOrder(item.value)
  } else {
    // 信用卡
    getCreditcardList()
  }
}

// 创建支付宝/微信/usdt/信用卡 充值子订单
const createSubOrder = async (payChannel: number) => {
  try {
    switch (payChannel) {
      case 1: // 微信
        orderList.wechat.loading = true
        break
      case 2: // 支付宝
        orderList.alipay.loading = true
        break
      case 3: // 信用卡
        card.btnLoading = true
        break
      case 5: // usdt
        orderList.usdt.loading = true
        break
      default:
        break
    }

    // 是否为信用卡支付
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
    console.log(`createSubOrder params===>`, payChannel, params, card.list[card.viewChecked])
    const res = await _createSubOrder(params)

    console.log(`_createSubOrder===>`, res)

    if (res.success) {
      // 微信/支付宝
      if ([1, 2].includes(payChannel)) {
        QRCode.toDataURL(res.data?.qrCode, {
          errorCorrectionLevel: 'H',
          type: 'image/jpeg',
          quality: 0.3,
          margin: 1,
        })
          .then(url => {
            // console.log(`url===>`, url)
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

      // usdt
      if ([5].includes(payChannel)) {
        orderList.usdt.expireTime = res.data?.expireTime

        const address = ['erc20Address', 'trc20Address']
        for (const addr of address) {
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
      console.log(`query===>`, route.query.type)
      const type = route.query.type

      // 信用卡支付失败
      if (payChannel === 3) {
        replaceRoute({
          name: 'payment_fail',
          query: {
            type,
            msg: res.msg,
          },
        })
      } else {
        // 错误处理 => 创建支付宝/微信/usdt订单失败
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

// 查询充值订单
const queryRechargeOrder = async () => {
  const res = await _queryRechargeOrder({
    tradeNo: tradeNo.value,
  })

  console.log(`_queryRechargeOrder===>`, res)

  if (res.success) {
    detail.description = res.data?.description
    detail.expireTime = res.data?.expireTime
    detail.tradeNo = res.data?.tradeNo
    detail.subject = res.data?.subject
    detail.createTime = res.data?.createTime
    detail.amount = res.data?.amount
    detail.productTradeNoList = (res.data?.productTradeNoList || []).join('-')
    detail.state = res.data?.state // 1 待支付 2交易成功 3 已过期

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

// 信用卡列表
const getCreditcardList = async () => {
  try {
    card.viewLoading = true
    const res = await _getCreditcardList()

    console.log('_getCreditcardList', res)

    if (res.success) {
      const list = res.data || []

      // 数据结构
      card.list = list.map((el, index) => {
        return {
          ...el,
          label: index,
        }
      })

      // 信用卡勾选情况
      if (list.length) {
        // 初始化 取默认信用卡
        if (!card.viewChecked) {
          console.log(`信用卡勾选初始化===>`)

          const i = list.findIndex(el => el.defaultPayStatus === 1)
          // console.log(`i==>`, i)

          if (i !== -1) {
            card.viewChecked = i
            card.checked = i
          }
        } else {
          console.log(`信用卡勾选===>`)
          // card.viewChecked = 0
          // card.checked = 0
        }
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    card.viewLoading = false
  }
}

// 监听充值订单状态
watch(
  () => detail.state,
  v => {
    if (v === 2) {
      console.log(`query===>`, route.query.type)
      userStore.getUser()
      const type = route.query.type
      // 已成功
      replaceRoute({
        name: 'payment_success',
        query: {
          type,
        },
      })
    }
  },
)

onMounted(() => {
  createSubOrder(2) // 默认支付宝
  getCreditcardList()
  queryRechargeOrder()
  // 轮询
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
.wrap {
  box-sizing: border-box;
  min-height: 100%;
  padding: 80px 120px;
  margin: 0 auto;
  background-color: #fff;

  .name {
    flex-shrink: 0;
    width: 80px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 16px;

    // font-weight: 500;
    color: var(--table-text);
  }

  .top {
    .order-wrap {
      .value {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 16px;
        font-weight: 400;
        line-height: 22px;
        color: var(--table-text);
      }
    }

    .payment-price-wrap {
      .value {
        .text-18 {
          font-size: 18px;
        }

        .detail-text {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: var(--table-text);
        }
      }

      .info {
        /* margin-left: 100px; */

        .key {
          width: 261px;
          height: 89px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: var(--common-text);
        }

        .key {
          width: 261px;
          height: 89px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: var(--table-text);
        }
      }
    }
  }

  .line {
    height: 1px;
    margin-top: 40px;
    margin-bottom: 36px;
    background-color: var(--border-c);
  }

  .bottom {
    :deep(.cat-tabs) {
      .cat-tab__item {
        padding-top: 0;
        padding-bottom: 10px;
        font-size: 14px;
      }
    }

    // 倒计时
    .expireTime-tip {
      margin-top: 32px;
      margin-bottom: 32px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      color: var(--common-text);
    }

    // 二维码
    .qrcode {
      position: relative;
      width: 200px;
      height: 200px;
      margin-right: 64px;
      overflow: hidden;
      background: #fff;
      border: 1px solid var(--border-c);
      border-radius: 10px;

      .cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgb(0 0 0 / 40%);
        backdrop-filter: blur(2px);
        border-radius: 10px;

        .cover-desc {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #fff;
          text-align: center;
        }
      }
    }

    .usdt-wrap {
      flex-direction: column;
      width: 450px;

      .qrcode {
        margin-right: 0;
      }

      .key-wrap {
        margin-top: 24px !important;
        margin-bottom: 12px !important;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        color: var(--common-text);
      }

      .chain-wrap {
        .btn-wrap {
          margin-bottom: 24px;

          .btn {
            box-sizing: border-box;
            flex: 1;

            /* width: 217px; */
            height: 34px;
            padding-left: 14px;
            border: 1px solid var(--border-c);
            border-radius: 4px;
          }

          .actived {
            background: var(--selected-bgc);
            border: 1px solid var(--primary-color);
          }
        }
      }

      .address {
        box-sizing: border-box;
        height: 34px;
        padding: 0 13px;
        background: rgb(221 221 221 / 30%);
        border-radius: 4px;
      }
    }

    .wechat-wrap {
      .desc {
        display: inline-block;
        min-height: 34px;
        padding: 0 10px;
        margin-top: 14px;
        font-size: 12px;
        line-height: 34px;
        text-align: center;
        background: rgb(2 222 109 / 10%);
        border-radius: 4px;
      }
    }

    .alipay-wrap {
      .desc {
        display: inline-block;
        height: 34px;
        padding: 0 10px;
        margin-top: 14px;
        font-size: 12px;
        line-height: 34px;
        text-align: center;
        background: rgb(57 74 255 / 10%);
        border-radius: 4px;
      }
    }

    .bank-wrap {
      padding-top: 20px;

      .operation {
        margin-top: 40px;
        font-size: 14px;

        .main {
          font-family: PingFangSC, 'PingFang SC';

          // font-weight: 500;
          font-size: 14px;
          color: var(--table-text);
        }
      }

      .card-info {
        height: 80px;
        padding: 0 20px;
        background: rgb(255 255 255 / 5%);
        border: 1px solid var(--border-c);
        border-radius: 4px;

        .item {
          /* width: 25%; */

          /* flex: 1; */
        }

        .card-type {
          width: 15%;
        }

        .card-num {
          width: 35%;
        }

        .card-name {
          width: 35%;
        }

        .card-checked {
          width: 15%;
        }
      }

      .desc-wrap {
        margin-bottom: 40px;

        .main-text {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: var(--table-text);
        }

        .sub-text {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: var(--common-text);
        }
      }

      .step-wrap {
        position: relative;
        margin-bottom: 40px;

        .step-line {
          position: absolute;
          top: 15px;
          left: 15px;
          width: 0;
          height: 200px;
          border-right: 1px dashed var(--border-c);
        }

        .step-item {
          .circle-wrap {
            width: 45px;

            .circle {
              position: relative;
              z-index: 1;
              width: 30px;
              height: 30px;
              font-family: PingFangSC, 'PingFang SC';
              font-size: 16px;
              font-weight: 400;
              line-height: 30px;
              color: #fff;
              text-align: center;
              background: var(--primary-color);
              border-radius: 50%;
            }
          }

          .main {
            font-family: PingFangSC, 'PingFang SC';

            // font-weight: 500;
            font-size: 16px;
            color: var(--primary-text);
          }

          .sub {
            font-family: PingFangSC, 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: var(--table-text);
          }

          .desc-item {
            margin-bottom: 13px;

            .key-wrap {
              width: 110px;

              .key {
                font-family: PingFangSC, 'PingFang SC';
                font-size: 14px;
                font-weight: 400;
                color: var(--common-text);
              }
            }

            .value {
              font-family: PingFangSC, 'PingFang SC';
              font-size: 14px;
              font-weight: 400;
              color: var(--primary-text);
            }
          }
        }
      }

      .bank-img {
        width: 24px;
        height: 24px;
        margin-left: 10px;
      }
    }
  }

  .price-text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--warning-color);
  }
}

.is-reverse {
  transform: rotateZ(-180deg);
}

.dialog {
  .border-1-t {
    border-top: 1px solid var(--border-c);
  }
}

:deep(.el-radio__label) {
  display: none;
}

.w80px {
  width: 80px;
}

.w15px {
  width: 150px;
}
</style>
