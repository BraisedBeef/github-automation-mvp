<template>
  <div>
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <el-card shadow="never" class="page-box">
      <div class="title-wrap border-b-1 mb20">
        {{ t('accountCostCenter.onlineRecharge') }}
      </div>
      <div class="info-wrap">
        <!-- 充值帐户 -->
        <div class="df ac mb20">
          <div class="key-wrap" :style="keyWrapStyle">
            <span class="key">{{ t('accountCostCenter.rechargeAccount') }}</span>
          </div>

          <div class="value">
            {{ userStore.user.email || '-' }}
          </div>
        </div>
        <!-- 可用额度 -->
        <div class="df ac mb20">
          <div class="key-wrap" :style="keyWrapStyle">
            <span class="key">{{ t('accountCostCenter.usableQuota') }}</span>
          </div>

          <div class="value">
            {{ priceNum(accountInfo.usableQuota || 0) }}
          </div>
        </div>
        <div class="calculate-wrap df ac mb20">
          <!-- 现金余额 -->
          <div class="total-wrap">
            <div class="top df ac">
              <span class="mr4">{{ t('accountCostCenter.balance') }}</span>
              <el-tooltip :content="t('accountCostCenter.balanceTooltip')" placement="top" effect="light">
                <SvgIcon name="question" />
              </el-tooltip>
            </div>
            <div class="bottom price-text">
              <span class="text-14" /><span>{{ priceNum(accountInfo.balance || 0) }}</span>
            </div>
          </div>
          <span v-if="accountInfo.advanceStatus === 2" class="symbol">+</span>
          <!-- 信用额度 -->
          <div v-if="accountInfo.advanceStatus === 2" class="credit-wrap">
            <div class="top df ac">
              <span class="mr4">{{ t('accountCostCenter.advanceQuota') }}</span
              ><el-tooltip :content="t('accountCostCenter.advanceQuotaTooltip')" placement="top" effect="light">
                <SvgIcon name="question" />
              </el-tooltip>
            </div>
            <div class="bottom">
              <span class="text-14">$</span><span>{{ accountInfo.advanceQuota || 0 }} USD</span>
            </div>
          </div>
          <span class="symbol">+</span>
          <!-- 赠送金余额 -->
          <div class="cash-wrap">
            <div class="top df ac">
              <span class="mr4">{{ t('accountCostCenter.giveMoney') }}</span
              ><el-tooltip :content="t('accountCostCenter.giveMoneyTooltip')" placement="top" effect="light">
                <SvgIcon name="question" />
              </el-tooltip>
            </div>
            <div class="bottom">
              <span class="text-14">$</span><span>{{ accountInfo.giveMoney || 0 }} USD</span>
            </div>
          </div>
          <span v-if="accountInfo.advanceStatus === 2" class="symbol">-</span>
          <!-- 欠费金额 -->
          <div v-if="accountInfo.advanceStatus === 2" class="vouchers-wrap">
            <div class="top">
              {{ t('accountCostCenter.advanceWaitRefundMoney') }}
            </div>
            <div class="bottom">
              <span class="text-14">$</span><span>{{ accountInfo.advanceWaitRefundMoney || 0 }} USD</span>
            </div>
          </div>
        </div>
        <!-- 充值金额 -->
        <div class="df mb20">
          <div class="key-wrap" :style="keyWrapStyle">
            <span class="key">{{ t('accountCostCenter.rechargeNum') }}</span>
          </div>

          <div class="value">
            <div class="df ac">
              <el-input
                v-model="amount"
                style="width: 410px"
                :min="0"
                :step="0.01"
                @blur="handleBlur"
                @input="handleAmount"
              />
              <div class="df ac ml20">
                <span>{{ t('accountCostCenter.support') }}</span>
                <SvgIcon
                  v-for="(item, index) in payList"
                  :key="index"
                  class="bank-img cursor-pointer"
                  :name="item.name"
                /><span>{{ t('accountCostCenter.morePayment') }}</span>
              </div>
            </div>
            <div class="checkbox-wrap mt10">
              <el-checkbox v-model="checked" :label="t('accountCostCenter.rechargeDesc')" name="type" />
            </div>
            <el-button :loading="loading" type="primary" @click="handleRecharge">
              {{ t('accountCostCenter.goRecharge') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { _createRechargeOrder } from '@/apis/cost-center/payment'
import { message } from '@/utils/message'
import { _getAccountInfo } from '@/apis/cost-center/user'
import { useUserStore } from '@/store'
import { thousandsCount } from '@/utils/number-utils'
import t from '@/utils/i18n'
import { useBaseStore } from '@/store'

import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const keyWrapStyleMap = {
  [ja]: {
    width: '150px',
  },
  [en]: {
    width: '150px',
  },
  [zh]: {
    width: '100px',
  },
}

const keyWrapStyle = useI18nStyle(keyWrapStyleMap)
const baseStore = useBaseStore()
const userStore = useUserStore()

const accountInfo = ref<any>({}) // 账户详情
const loading = ref<boolean>(false)
const amount = ref<string>('') // 输入金额
const checked = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('accountCostCenter.rechargeTip1'),
    sub: [
      t('accountCostCenter.rechargeTip2'),
      t('accountCostCenter.rechargeTip3'),
      t('accountCostCenter.rechargeTip4'),
    ],
  },
])

const payList = computed(() => {
  return [
    {
      name: 'pay-jcb',
    },
    {
      name: 'pay-visa',
    },
    {
      name: 'pay-amex',
    },
    {
      name: 'pay-union',
    },
    {
      name: 'pay-master',
    },
    // {
    //   name: 'pay-wechat',
    // },
    {
      name: 'pay-alipay',
    },
    {
      name: 'pay-usdt',
    },
  ]
})

// $ usd 单位
const priceNum = (num: string | number) => {
  num = Number(num)

  if (num < 0) {
    return `-$${Math.abs(num)} USD`
  } else {
    return `$${num} USD`
  }
}

const handleBlur = () => {
  if (amount.value && Number(amount.value) - 1 < 0) {
    message.warning(t('accountCostCenter.rechargeNumWarn1'))
  }
}

// 充值输入
const handleAmount = (value: string) => {
  // 过滤非法字符
  amount.value = value.replace(/[^\d.]/g, '')
  // 限制小数位数为两位
  const reg = /^\d+(\.\d{0,2})?/
  amount.value = amount.value.match(reg) ? (amount.value as any).match(reg)[0] : ''
}

// 点击充值
const handleRecharge = () => {
  if (!amount.value) {
    return message.warning(t('accountCostCenter.rechargeNumWarn2'))
  }
  if (Number(amount.value) - 1 < 0) {
    return message.warning(t('accountCostCenter.rechargeNumWarn1'))
  }
  if (!checked.value) {
    return message.warning(t('accountCostCenter.rechargeNumWarn3'))
  }
  createRechargeOrder()
}

// 创建在线支付方式的充值订单
const createRechargeOrder = async () => {
  try {
    loading.value = true
    const res = await _createRechargeOrder({
      scene: 1, // 1 在线充值 2 产品订单支付
      amount: Number(amount.value), // 支付金额
    })

    console.log(`_createRechargeOrder===>`, res)

    if (res.success) {
      pushRoute({
        name: 'payment_online',
        params: {
          tradeNo: res.data.tradeNo,
        },
        query: {
          type: 'recharge',
        },
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 查询登录用户账户
const getAccountInfo = async () => {
  const res = await _getAccountInfo()

  console.log(`_getAccountInfo===>`, res)

  if (res.success) {
    accountInfo.value = res.data
  }
}

onMounted(() => {
  getAccountInfo()
})

onBeforeMount(() => {
  // baseStore.routeModel = '/cost'
  // baseStore.selectedKeys = 'cost_center_account_recharge'
})
</script>

<style lang="scss" scoped>
.title-wrap {
  padding-bottom: 20px;
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 16px;
  color: var(--table-text);
}

.info-wrap {
  .key-wrap {
    /* width: 100px; */

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

    .bank-img {
      width: 24px;
      height: 24px;
      margin-right: 5px;
      margin-left: 5px;
    }

    .checkbox-wrap {
      margin-bottom: 40px;
    }
  }
}

.calculate-wrap {
  box-sizing: border-box;
  height: 65px;
  padding: 13px;
  background: #f9fafc;

  .top {
    margin-bottom: 6px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }

  .bottom {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;

    // font-weight: 500;
  }

  .cash-wrap,
  .vouchers-wrap {
    color: var(--primary-text);
  }

  .symbol {
    margin-right: 75px;
    margin-left: 75px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }
}

.border-b-1 {
  border-bottom: 1px solid var(--border-c);
}

.text-14 {
  font-size: 14px;
}
</style>
