<template>
  <div class="wrap">
    <!-- title -->
    <div class="title-wrap df">
      <span class="title mr20">{{ t('payment.payOrder') }}</span>
      <p class="df ac">
        <span class="text-primary back cursor-pointer" @click="pushRoute({ name: 'order' })">{{
          t('payment.backOrder')
        }}</span>
        <SvgIcon name="cat-cdn-back" class="ml4" />
      </p>
    </div>
    <!-- desc -->
    <el-row class="desc-wrap" align="middle">
      <el-tag>{{ t('payment.orderInstruct') }}</el-tag>
      <span class="ml14">{{ t('payment.orderInstructDesc1') }}</span>
      <span class="text-primary cursor-pointer" @click="pushRoute({ name: 'expense_bill_invoice_list' })">{{
        t('payment.orderInstructDesc2')
      }}</span>
    </el-row>

    <!-- 产品清单 -->
    <div class="product-wrap">
      <div class="name df ac mb20">
        <div class="react" />
        <span>{{ t('payment.productList') }}</span>
      </div>

      <div class="df ac jsb amount-row pd0-20">
        <span class="lt"
          ><SvgIcon
            class="icon-hover"
            name="cat-cdn-slide"
            :style="{ transform: `rotate(${tableHeight ? 0 : -90}deg)` }"
            @click="showTable"
          />{{ t('payment.prepaidProducts', [orderList.length || 0]) }}</span
        >
        <p class="rt">
          <span>{{ t('payment.paySum') }}</span
          ><span class="text-warning ml20 font-bold">${{ detail.totalAmount }} USD</span>
        </p>
      </div>
      <el-table
        ref="tableRef"
        v-loading="loading.list"
        class="table"
        :data="orderList"
        :highlight-current-row="false"
        :span-method="objectSpanMethod"
        :style="{ height: tableHeight ? 'auto' : 0 }"
        table-layout="auto"
      >
        <!-- 订单号 -->
        <el-table-column :label="t('order.tradeNo')">
          <template #default="{ row }">
            <span class="table-text">{{ row.publicInfo.tradeNo }}</span>
          </template>
        </el-table-column>
        <!-- 产品名称 -->
        <el-table-column prop="productName" :label="t('payment.productName')">
          <template #default="{ row }">
            <span class="table-text">{{ row.subProductTypeName }}</span>
          </template>
        </el-table-column>
        <!-- 配置 -->
        <el-table-column :label="t('payment.configurate')" min-width="500">
          <!-- 多个子订单 -->
          <template v-if="isManySubOrder" #default="{ row }">
            <div class="configurate-wrap">
              <table class="table_box">
                <tbody>
                  <template v-for="(item, index) in row.configs" :key="index">
                    <tr v-if="item.value">
                      <td class="key pr20">
                        {{ item.key }}
                      </td>
                      <td class="value">
                        {{ item.value }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>

              <span
                v-if="[OSS_KEY].includes(row.productSymbol)"
                class="text-primary cursor-pointer"
                @click="showSubOrderDetail(row)"
                >{{ t('payment.detail') }}</span
              >
            </div>
          </template>
          <!-- 单个子订单 -->
          <template v-else #default="{ row }">
            <div class="configurate-wrap">
              <table class="table_box">
                <tbody>
                  <template v-for="(item, index) in row.configs" :key="index">
                    <tr v-if="item.value">
                      <td class="key pr20">
                        {{ item.key }}
                      </td>
                      <td class="value">
                        {{ item.value }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </template>
        </el-table-column>
        <!-- 类型 -->
        <el-table-column :label="t('type')">
          <template #default="{ row }">
            <span class="table-text">{{ ORDER_TYPE_MAP[row.publicInfo.type] }}</span>
          </template>
        </el-table-column>
        <!-- 单价 -->
        <el-table-column prop="price" :label="t('payment.price')">
          <template #default="{ row }">
            <span class="table-text">${{ row.price }} USD</span>
          </template>
        </el-table-column>
        <!-- 数量 -->
        <el-table-column prop="num" :label="t('payment.num')">
          <template #default="{ row }">
            <span class="table-text">{{ row.num }}</span>
          </template>
        </el-table-column>
        <!-- 时长 -->
        <el-table-column :label="t('payment.duration')">
          <template #default="{ row }">
            <span class="table-text">{{ `${row.duration}${row.durationUnit}` }}</span>
          </template>
        </el-table-column>
        <!-- 订单金额 -->
        <el-table-column align="right">
          <template #header>
            <span class="mr20">{{ t('payment.amount') }}</span>
          </template>
          <template #default="{ row }">
            <span class="text-warning mr20">${{ row.amount }} USD</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 选择优惠券 后续开发 -->
    <div v-if="false" class="coupon-wrap">
      <div class="name df ac mb10">
        <div class="react mr14" />
        <span>选择优惠券</span>
      </div>

      <div class="df ac jsb top pd0-20 mt20">
        <div class="text-primary key">
          <span>代金券</span>
          <div class="underline" />
        </div>
        <p>优惠券抵扣：<span class="text-warning">$-0.00 USD</span></p>
      </div>
      <el-divider class="mt10 mb20" />

      <div class="center mb20">
        <el-checkbox v-model="coupon.check" label="使用代金券抵扣" />
        <p>您有1张代金券，其中1张与订单中产品相关，本次有一张可用</p>
      </div>

      <div class="bottom df">
        <!-- 代金券 -->
        <div
          class="coupon df cursor-pointer"
          :class="0 === coupon.activeIndex && 'coupon-active'"
          @click="coupon.activeIndex = 0"
        >
          <div class="left df ac jc">
            <div>
              <p>代</p>
              <p>金</p>
              <p>券</p>
            </div>
          </div>
          <div class="right">
            <p class="price mb10"><span>$</span><span class="text-30 mr4">0.00</span><span>无金额门槛</span></p>
            <p class="attr mb10">全产品通用</p>
            <p class="date">2023/09/21-2023/11/20</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 选择支付方式 -->
    <div class="payment-way-wrap">
      <div class="name df ac mb20">
        <div class="react" />
        <span>{{ t('payment.selectPaymentMethod') }}</span>
      </div>

      <div class="list df">
        <!-- 余额支付 -->
        <div
          class="item pd20 df jsb cursor-pointer"
          :class="[paymentWay.activeIndex === 1 && 'item-active', balancePayDisable && 'item-disable']"
          @click="changePaymentWay(1)"
        >
          <div class="left df">
            <SvgIcon style="width: 48px; height: 48px; margin-right: 10px" name="payment-balance" />
            <div class="info">
              <div class="key font-bold">
                {{ t('payment.balance') }}
              </div>
              <!-- 垫付状态开启 1关闭 2开启 -->
              <div v-if="account.advanceStatus === 2" class="desc">
                <!-- 账户可用余额大于支付额度 -->
                <span
                  v-if="account.usableQuota > detail.totalAmount"
                  v-html="t('payment.balancePayAdvanceOpen1', [account.usableQuota])"
                />
                <!-- 账户可用余额小于支付额度 -->
                <span v-else v-html="t('payment.balancePayAdvanceOpen2', [account.usableQuota])" />
              </div>
              <!-- 垫付状态关闭 -->
              <div v-else class="desc">
                <span v-html="t('payment.balancePayAdvanceClose', [account.usableBalance])" />
              </div>
            </div>
          </div>
          <div class="right">
            <span>{{ t('payment.pay') }}</span>
            <span class="text-warning">${{ actualPrice.balancePay }} USD</span>
          </div>
        </div>
        <!-- 使用在线支付 -->
        <div
          class="item pd20 df jsb cursor-pointer"
          :class="[paymentWay.activeIndex === 2 && 'item-active', onlinePayDisable && 'item-disable']"
          @click="changePaymentWay(2)"
        >
          <div class="left df">
            <SvgIcon style="width: 48px; height: 48px; margin-right: 10px" name="payment-online" />
            <div class="info">
              <div class="key font-bold">
                {{ t('payment.online') }}
              </div>
              <div class="desc">
                <OnlineDesc />
              </div>
            </div>
          </div>
          <div class="right">
            <span>{{ t('payment.pay') }}</span>
            <span class="text-warning">${{ actualPrice.rechargePay }} USD</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 支付 -->
    <div class="fixed-wrap df jfe ac shadow">
      <div class="df ac">
        <!-- 优惠券抵扣 后续开发-->
        <!-- <p class="mr20 text-14">
          <span class="mr4">{{ t('payment.couponDeductions') }}</span
          ><span class="text-warning">${{ 0.0 }} USD</span>
        </p> -->
        <el-popover placement="top" :disabled="!showActualPrices" :width="200" trigger="hover" :teleported="false">
          <template #reference>
            <!-- 实付金额 -->
            <div class="mr20 df ac">
              <div class="text-14 mr20 actual">
                <span>{{ t('payment.actualPrices') }} </span>
                <div v-if="showActualPrices" class="line" />
              </div>
              <span class="text-warning text-24"
                >${{ paymentWay.activeIndex === 1 ? actualPrice.balancePay : actualPrice.rechargePay }} USD</span
              >
            </div>
          </template>
          <template #default>
            <!-- 实付详情 -->
            <div class="actual-prices-wrap" :style="actualPricesWrapStyle">
              <!-- 预付费应用 -->
              <div class="df ac jsb text-14 mb20 prePay">
                <span class="key">{{ t('payment.prePay') }}</span>
                <span class="value font-bold">${{ detail.totalAmount }} USD</span>
              </div>
              <!-- 欠费 -->
              <div class="df ac jsb text-14 mb20">
                <p class="df ac">
                  <span class="mr4">{{ t('payment.owingMoney') }}</span>
                  <el-tooltip :content="t('payment.owingMoneyTooltip')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-warning" style="width: 14px; height: 14px" />
                  </el-tooltip>
                </p>
                <span>${{ Math.abs(account.debtMoney) }} USD</span>
              </div>
              <div class="line mb20" />
              <!-- 实付金额 -->
              <div class="df ac jsb actualPrices text-16">
                <span class="key font-bold">{{ t('payment.actualPrice') }}</span>
                <span class="text-warning font-bold"
                  >${{ paymentWay.activeIndex === 1 ? actualPrice.balancePay : actualPrice.rechargePay }} USD</span
                >
              </div>
              <div class="df ac jfe">
                <span class="text-error text-12">{{ t('payment.actualPriceTip') }}</span>
              </div>
            </div>
          </template>
        </el-popover>

        <el-button :loading="loading.btn" type="primary" :disabled="false" @click="goPay">
          {{ t('payment.goPay') }}
        </el-button>
      </div>
    </div>

    <!-- 确认支付操作 -->
    <ComfirmPayDialog ref="comfirmPayDialogRef" @comfirm-pay="handleComfirmPay" @no-pay="handleNoPay" />
    <!-- 尚未完成支付，请继续支付 -->
    <NoPayDialog ref="noPayDialogRef" />
    <!-- 订单过期 -->
    <OrderExpireDialog ref="orderExpireDialogRef" />
    <!-- 订单处理失败 -->
    <OrderHandleFailDialog ref="orderHandleFailDialogRef" />
    <!-- 订单失效 -->
    <OrderLoseEfficacyDialog ref="orderLoseEfficacyDialogRef" />
    <!-- 订单支付成功 -->
    <OrderPaySuccessDialog ref="orderPaySuccessDialogRef" />
    <!-- 订单支付失败 -->
    <OrderPayFailDialog ref="orderPayFailDialogRef" :text="failMsg" />
    <!-- 子订单详情 -->
    <SubOrderDialog ref="subOrderDialogRef" :detail="subOrderDetail" />
  </div>
</template>

<script setup lang="ts">
import { useBaseStore, useUserStore } from '@/store'
import { _queryProductOrder, _balancePayOrder, _createRechargeOrder } from '@/apis/cost-center/payment'
import { _getAccountInfo } from '@/apis/cost-center/user'
import OrderExpireDialog from './components/order-expire-dialog.vue'
import OrderPaySuccessDialog from './components/order-pay-success-dialog.vue'
import OrderPayFailDialog from './components/order-pay-fail-dialog.vue'
import SubOrderDialog from './components/sub-order-dialog.vue'
import NoPayDialog from './components/no-pay-dialog.vue'
import ComfirmPayDialog from './components/comfirm-pay-dialog.vue'
import OrderLoseEfficacyDialog from './components/order-lose-efficacy-dialog.vue'
import OrderHandleFailDialog from './components/order-handle-fail-dialog.vue'
import OnlineDesc from './components/online-desc.vue'
import { message } from '@/utils/message'
import t from '@/utils/i18n'

import NP from 'number-precision'
import { ORDER_TYPE_MAP } from '@/views/cost-center/order/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP, OSS_KEY } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'

NP.enableBoundaryChecking(false)

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w160px',
  [en]: 'key-wrap-w160px',
  [zh]: 'key-wrap-w110px',
}
const actualPricesWrapStyleMap = {
  [ja]: {
    width: '380px',
  },
  [en]: {
    width: '450px',
  },
  [zh]: {
    width: '380px',
  },
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)
const actualPricesWrapStyle = useI18nStyle(actualPricesWrapStyleMap)
const baseStore = useBaseStore()
const userStore = useUserStore()
const route = useRoute()

const orderExpireDialogRef = ref<InstanceType<typeof OrderExpireDialog>>() // 订单过期
const orderPaySuccessDialogRef = ref<InstanceType<typeof OrderPaySuccessDialog>>() // 订单支付成功
const orderPayFailDialogRef = ref<InstanceType<typeof OrderPayFailDialog>>() // 订单支付失败
const subOrderDialogRef = ref<InstanceType<typeof SubOrderDialog>>() // 子订单详情
const noPayDialogRef = ref<InstanceType<typeof NoPayDialog>>() // 尚未完成支付，请继续支付
const comfirmPayDialogRef = ref<InstanceType<typeof ComfirmPayDialog>>() // 确认支付操作
const orderHandleFailDialogRef = ref<InstanceType<typeof OrderHandleFailDialog>>() // 订单处理失败
const orderLoseEfficacyDialogRef = ref<InstanceType<typeof OrderLoseEfficacyDialog>>() // 订单失效

// 子订单详情
const subOrderDetail = ref<any>({})

//代金券
const coupon = reactive<{
  activeIndex: number
  check: boolean
}>({
  activeIndex: 0,
  check: false,
})

//选择支付方式
const paymentWay = reactive<{
  activeIndex: number
  scene: number
}>({
  activeIndex: 1, // 默认是余额支付
  scene: 2, // 1 在线充值 2 产品订单支付
})
const payMethod = ref<number>(0) // 支付方式 0全部 1余额支付 2在线支付
const loading = reactive<{
  list: boolean
  btn: boolean
}>({
  list: false,
  btn: false,
})
const tradeNoList = ref<any[]>([]) // 订单号
const detail = ref<any>({}) // 订单详情
const account = ref<any>({}) // 账户详情
const isManySubOrder = ref<boolean>(false) // 是否为多子订单
const failMsg = ref<string>('') // 支付失败原因
const timeId = ref<any>(null) // 定时器
const tableHeight = ref<number>(1)

// 在线支付+欠费时显示实付详情弹窗
const showActualPrices = computed(() => {
  if (paymentWay.activeIndex === 2) {
    return account.value.usableBalance < 0 ? true : false
  } else {
    return false
  }
})

// 是否禁止余额支付
const balancePayDisable = computed(() => {
  // 垫付状态开启 1关闭 2开启
  if (account.value.advanceStatus === 2) {
    return account.value.usableQuota - detail.value.totalAmount >= 0 ? false : true
  } else {
    // 垫付状态关闭
    return account.value.usableBalance - detail.value.totalAmount >= 0 ? false : true
  }
})

// 是否禁止在线支付
const onlinePayDisable = computed(() => {
  return [0, 2].includes(payMethod.value) ? false : true
})

const showTable = () => {
  tableHeight.value = +!tableHeight.value
}

// 弹窗展示
const showDialog = (ins: any, show?: boolean, cb?: () => void) => {
  if (!ins) return
  const res = show === undefined ? true : show
  ins.show = res
  cb && cb()
}

// 订单实付金额
const actualPrice = computed(() => {
  const actualPrice: any = {
    balancePay: 0, // 余额支付
    rechargePay: 0, // 线上充值支付
  }

  // 余额支付方式
  actualPrice.balancePay = detail.value.totalAmount

  // 在线支付
  // 可用余额usableBalance=余额+赠送金-垫付待还款金额
  // 可用余额usableBalance是负数，支付金额 =  usableBalance +  totalAmount；反之 支付金额 = totalAmount；反之
  const amount =
    account.value.usableBalance < 0
      ? NP.plus(detail.value.totalAmount, Math.abs(account.value.usableBalance))
      : detail.value.totalAmount
  actualPrice.rechargePay = amount
  console.log(`detail.value.totalAmount==>`, detail.value.totalAmount)
  console.log(`account.value.usableBalance==>`, account.value.usableBalance)

  return actualPrice
})

// 订单列表扁平化
const orderList = computed(() => {
  console.log(`detail.orderList===>`, detail.value.orderList)

  const list: any[] = []

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

    // 标记合并多少行
    const rowspan = order.subOrderList.length
    // 标记合并多少列/只合并产品名称这列
    const colspan = 1

    if (order.subOrderList?.length) {
      if (order.subOrderList.length > 1) {
        isManySubOrder.value = true
      }

      for (let i = 0; i < order.subOrderList.length; i++) {
        console.log(i)

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

// 查看子订单详情
const showSubOrderDetail = (row: any) => {
  showDialog(subOrderDialogRef.value, true, () => {
    subOrderDetail.value = row
  })
}

// 点击已成功支付
const handleComfirmPay = () => {
  showDialog(comfirmPayDialogRef.value, false, () => {
    queryProductOrder()
  })
}

// 点击未完成支付
const handleNoPay = () => {
  console.log(`点击未完成支付===>`)
  showDialog(noPayDialogRef.value)
}

//配置合并行或列
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  // console.log(`objectSpanMethod row`, row)
  // console.log(`objectSpanMethod column`, column)
  // console.log(`objectSpanMethod rowIndex`, rowIndex)
  // console.log(`objectSpanMethod columnIndex`, columnIndex)
  // }

  if (columnIndex === 0) {
    if (row.rowspan) {
      return {
        rowspan: row.rowspan,
        colspan: row.colspan,
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
  }
}

// 切换支付类型
const changePaymentWay = (activeIndex: number) => {
  if (activeIndex === 1) {
    // 余额支付方式 只有可用余额余额大于支付金额才可以选择
    if (!balancePayDisable.value) {
      paymentWay.activeIndex = activeIndex
      getAccountInfo()
    }
  } else {
    // 在线支付方式
    if (!onlinePayDisable.value) {
      paymentWay.activeIndex = activeIndex
      getAccountInfo()
    }
  }
}

// 解析路由参数tradeNo
const getPathtradeNo = () => {
  console.log(`route.params.tradeNo===>`, route.params.tradeNo)

  const tradeNoPath = route.params.tradeNo as string

  tradeNoList.value = tradeNoPath ? tradeNoPath.split('-') : []
}

// 支付
const goPay = () => {
  switch (paymentWay.activeIndex) {
    case 1:
      // 余额支付
      balancePayOrder()
      break

    case 2:
      // 在线支付 创建充值订单
      createRechargeOrder()
      break

    default:
      break
  }
}

// 查询登录用户账户
const getAccountInfo = async () => {
  const res = await _getAccountInfo()

  console.log(`_getAccountInfo===>`, res)

  if (res.success) {
    account.value = res.data || {}

    // 禁止余额支付和在线支付
    if (balancePayDisable.value && onlinePayDisable.value) {
      paymentWay.activeIndex = -1
    } else {
      // 禁止余额支付
      if (balancePayDisable.value) {
        if (paymentWay.activeIndex === 1) paymentWay.activeIndex = 2
      }

      // 禁止在线支付
      if (onlinePayDisable.value) {
        if (paymentWay.activeIndex === 2) paymentWay.activeIndex = 1
      }
    }
  }
}

// 创建在线支付方式的充值订单
const createRechargeOrder = async () => {
  try {
    loading.btn = true

    const res = await _createRechargeOrder({
      scene: paymentWay.scene, // 1 在线充值 2 产品订单支付
      amount: actualPrice.value.rechargePay, // 支付金额
      productTradeNoList: tradeNoList.value,
    })

    console.log(`_createRechargeOrder===>`, res)

    if (res.success) {
      var origin = window.location.origin
      // console.log(`origin===>`, origin);
      window.open(origin + `/cost-center/payment/online/${res.data.tradeNo}?type=${route.query.type}`, '_blank')
      showDialog(comfirmPayDialogRef.value)
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.btn = false
  }
}

// 余额支付订单
const balancePayOrder = async () => {
  try {
    loading.btn = true
    const res = await _balancePayOrder({
      tradeNoList: tradeNoList.value,
    })

    console.log(`_balancePayOrder===>`, res)

    if (res.success) {
      switch (res.data.status) {
        case 1:
          // 订单支付成功
          showDialog(orderPaySuccessDialogRef.value)
          userStore.getUser()
          break
        case 2:
          // 订单支付失败
          failMsg.value = res.data.msg
          showDialog(orderPayFailDialogRef.value)
          break
        case 3:
          // 订单过期
          showDialog(orderExpireDialogRef.value)
          break

        default:
          break
      }
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.btn = false
  }
}

// 查询产品订单详情
const queryProductOrder = async () => {
  try {
    // 轮询不需要loading
    if (!timeId.value) {
      loading.list = true
    }
    const res = await _queryProductOrder({
      tradeNoList: tradeNoList.value,
    })

    console.log(`_queryProductOrder===>`, res)

    if (res.success) {
      detail.value = res.data || {}

      payMethod.value = res.data.orderList[0]?.payMethod

      // 监听产品订单状态
      const state = res.data.orderList[0]?.state // 1 待支付 2 交易成功 3 已取消 4 已过期
      // 订单支付成功
      if (state === 2) {
        showDialog(comfirmPayDialogRef.value, false)
        showDialog(orderPaySuccessDialogRef.value)
      }
      // 订单过期
      if (state === 4) {
        showDialog(comfirmPayDialogRef.value, false)
        showDialog(orderExpireDialogRef.value)
      }
      // 订单失效
      if (state === 5) {
        showDialog(comfirmPayDialogRef.value, false)
        showDialog(orderLoseEfficacyDialogRef.value)
      }
      // 订单处理失败
      if (state === 9) {
        showDialog(comfirmPayDialogRef.value, false)
        showDialog(orderHandleFailDialogRef.value)
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.list = false
  }
}

// 路由
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

  // 轮询
  timeId.value = setInterval(() => {
    queryProductOrder()
  }, 3 * 1000)
})

onBeforeUnmount(() => {
  clearInterval(timeId.value)
})
</script>

<style lang="scss" scoped>
.wrap {
  min-height: 100%;
  padding: 40px 60px 80px;
  margin: 0 auto;
  background-color: #fff;
}

.title-wrap {
  margin-bottom: 40px;

  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 32px;
    line-height: 33px;

    // font-weight: 500;
    color: var(--table-text);
  }
}

.desc-wrap {
  margin-bottom: 40px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--common-text);
}

.name {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 18px;
  font-weight: 700 !important;
  color: var(--primary-text);

  .react {
    width: 2px;
    height: 20px;
    margin-right: 8px;
    background: var(--primary-color);
  }
}

.product-wrap {
  margin-bottom: 40px;

  .amount-row {
    height: 60px;
    background: #f9fafc;
    border: 1px solid #eee;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;

    .lt {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      font-weight: 400;
      color: var(--common-text);

      .icon-hover {
        margin-top: 2px;
        margin-right: 10px;
      }
    }

    .rt {
      span {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--common-text);
      }
    }
  }

  .table-text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }

  .configurate-wrap {
    padding: 20px 0 10px;

    .key {
      flex-shrink: 0;
      margin-right: 10px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
      overflow-wrap: break-word; /* 自动换行 */
      white-space: normal; /* 默认换行 */
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--common-text);
      overflow-wrap: break-word; /* 自动换行 */
      white-space: normal; /* 默认换行 */
    }

    .key-wrap-w90px {
      width: 90px;
    }

    .key-wrap-w160px {
      width: 160px;
    }

    .key-wrap-w110px {
      width: 110px;
    }

    .pr20 {
      padding-right: 20px;
    }

    .table_box {
      tr {
        background-color: rgb(255 255 255 / 0%);
      }
    }
  }

  .text-over {
    @include text-over(1);

    width: calc(100% - 40px);
  }

  .table {
    border-right: 1px solid #ebeef5;
    border-left: 1px solid #ebeef5;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;

    :deep(.el-table__header-wrapper) {
      th {
        background: #fff !important;
      }
    }

    :deep(tbody .cell) {
      padding-left: 10px !important;
    }
  }
}

.coupon-wrap {
  margin-bottom: 40px;

  .top {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;

    // font-weight: 500;
    line-height: 20px;

    .key {
      position: relative;
      padding: 0 10px;

      .underline {
        position: absolute;
        top: 30px;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 1px;
        border: 1px solid var(--primary-color);
      }
    }
  }

  .center {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--common-text);
  }

  .bottom {
    flex-wrap: wrap;
    gap: 20px;

    .coupon {
      box-sizing: border-box;
      width: 380px;
      height: 120px;
      overflow: hidden;
      background-image: url('../../../../assets/images/cost-center/payment/coupon.png');
      border-radius: 3px;

      .left {
        width: 60px;
        height: 100%;

        /* background-color: var(--primary-color); */
        color: #fff;
      }

      .right {
        box-sizing: border-box;
        width: 320px;
        height: 100%;
        padding-top: 20px;
        padding-left: 30px;

        .price {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: var(--primary-text);

          .text-30 {
            font-size: 30px;
          }
        }

        .attr {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: var(--primary-text);
        }

        .date {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: var(--common-text);
        }
      }
    }

    .coupon-active {
      background-image: url('../../../../assets/images/cost-center/payment/coupon-active.png');
    }
  }
}

.payment-way-wrap {
  margin-bottom: 55px;

  .list {
    gap: 20px;

    .item {
      box-sizing: border-box;
      width: 50%;
      height: 120px;
      background: #f9fafc;
      border: 1px solid #eee;
      border-radius: 4px;

      .left {
        .icon {
          width: 24px;
          height: 24px;
        }

        .info {
          .key {
            margin-bottom: 10px;
            font-family: PingFangSC, 'PingFang SC';

            // font-weight: 500;
            font-size: 16px;
            color: var(--primary-text);
          }

          .desc {
            font-family: PingFangSC, 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: var(--common-text);
          }
        }
      }

      .right {
        flex-shrink: 0;
      }
    }

    .item-active {
      /* background: var(--selected-bgc); */
      background: #fff;
      background-image: url('../../../../assets/images/cost-center/payment/payment-way-active.png');
      background-repeat: no-repeat;
      background-position: bottom right;
      border: 1px solid var(--primary-color);
    }

    .item-disable {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}

.fixed-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 74px;
  padding-right: 60px;
  background: #fff;

  .text-24 {
    font-size: 24px;
  }

  .text-14 {
    font-size: 14px;
  }

  .text-12 {
    font-size: 12px;
  }

  .text-16 {
    font-size: 16px;
  }

  .actual {
    position: relative;

    span {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-style: normal;
      color: var(--common-text);

      /* text-decoration-line: underline; */
    }

    .line {
      position: absolute;
      bottom: 3px;
      left: 0;
      width: calc(100% - 1ch);
      height: 1px;
      background-color: #000;
    }
  }

  .actual-prices-wrap {
    box-sizing: border-box;

    /* width: 380px; */
    height: 177px;
    padding: 12px;
    background: #fff;

    .prePay {
      .key {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--common-text);
      }

      .value {
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 14px;
        color: var(--primary-text);
      }
    }

    .line {
      height: 1px;
      background-color: var(--border-c);
    }

    .actualPrices {
      .key {
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 16px;
        color: var(--primary-text);
      }

      .value {
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 16px;
      }
    }

    .actual-prices-key {
      color: var(--primary-text);
    }

    .actual-prices-value {
      color: var(--warning-color);
    }
  }
}
</style>
