<template>
  <div class="cost-center-recharge-v2">
    <PageBreadcrumbToolbar
      :items="[t('accountCostCenter.accountInfo'), t('accountCostCenter.recharge')]"
      @doc="openHelpDoc"
    />

    <InfoNotice class="cost-center-recharge-v2__notice">
      <div class="cost-center-recharge-v2__notice-text">
        <p>{{ t('accountCostCenter.rechargeTip1') }}</p>
        <p>{{ t('accountCostCenter.rechargeTip2') }}</p>
        <p>{{ t('accountCostCenter.rechargeTip3') }}</p>
        <p>{{ t('accountCostCenter.rechargeTip4') }}</p>
      </div>
    </InfoNotice>

    <section class="cost-center-recharge-v2__card">
      <div class="cost-center-recharge-v2__section">
        <h2 class="cost-center-recharge-v2__title">
          {{ t('accountCostCenter.onlineRecharge') }}
        </h2>

        <div class="cost-center-recharge-v2__info-list">
          <div class="cost-center-recharge-v2__info-row">
            <div class="cost-center-recharge-v2__label">
              {{ t('accountCostCenter.rechargeAccount') }}
            </div>
            <div class="cost-center-recharge-v2__value">
              {{ userStore.user.email || '-' }}
            </div>
          </div>

          <div class="cost-center-recharge-v2__info-row cost-center-recharge-v2__info-row--quota">
            <div class="cost-center-recharge-v2__label">
              {{ t('accountCostCenter.usableQuota') }}
            </div>
            <div class="cost-center-recharge-v2__value">
              {{ priceNum(accountInfo.usableQuota || 0) }}
            </div>
          </div>
        </div>

        <div class="cost-center-recharge-v2__formula-wrap">
          <div class="cost-center-recharge-v2__formula">
            <div class="cost-center-recharge-v2__formula-corner" />

            <template v-for="(item, index) in breakdownItems" :key="item.key">
              <span v-if="index > 0" class="cost-center-recharge-v2__formula-symbol">{{ item.operator }}</span>
              <div class="cost-center-recharge-v2__formula-item">
                <div class="cost-center-recharge-v2__formula-label">
                  <span>{{ item.label }}</span>
                  <el-tooltip v-if="item.tooltip" :content="item.tooltip" placement="top" effect="light">
                    <SvgIcon name="question" class="cost-center-recharge-v2__formula-help" />
                  </el-tooltip>
                </div>
                <div class="cost-center-recharge-v2__formula-value" :class="{ 'is-danger': item.danger }">
                  {{ item.value }}
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="cost-center-recharge-v2__form">
          <div class="cost-center-recharge-v2__form-row">
            <div class="cost-center-recharge-v2__form-label">
              {{ t('accountCostCenter.rechargeNum') }}
            </div>

            <div class="cost-center-recharge-v2__form-main">
              <div class="cost-center-recharge-v2__amount-row">
                <el-input
                  v-model="amount"
                  class="cost-center-recharge-v2__amount-input"
                  :placeholder="t('accountCostCenter.rechargeNum')"
                  :min="0"
                  :step="0.01"
                  @blur="handleBlur"
                  @input="handleAmount"
                />

                <div class="cost-center-recharge-v2__payments">
                  <span class="cost-center-recharge-v2__payments-label">{{ t('accountCostCenter.support') }}</span>
                  <SvgIcon
                    v-for="item in payList"
                    :key="item.name"
                    :name="item.name"
                    class="cost-center-recharge-v2__payment-icon"
                  />
                  <span class="cost-center-recharge-v2__payments-text">{{ t('accountCostCenter.morePayment') }}</span>
                </div>
              </div>

              <label class="cost-center-recharge-v2__checkbox-row">
                <el-checkbox v-model="checked" :label="t('accountCostCenter.rechargeDesc')" name="type" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="cost-center-recharge-v2__footer">
        <el-button :loading="loading" type="primary" @click="handleRecharge">
          {{ t('accountCostCenter.goRecharge') }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { _createRechargeOrder } from '@/apis/cost-center/payment'
import { _getAccountInfo } from '@/apis/cost-center/user'
import { useUserStore } from '@/store'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const labelWidthMap = {
  [ja]: {
    width: '150px',
  },
  [en]: {
    width: '150px',
  },
  [zh]: {
    width: '88px',
  },
}

const labelWidthStyle = useI18nStyle(labelWidthMap)
const userStore = useUserStore()

const accountInfo = ref<any>({})
const loading = ref(false)
const amount = ref('')
const checked = ref(false)

const payList = computed(() => [
  { name: 'pay-jcb' },
  { name: 'pay-visa' },
  { name: 'pay-amex' },
  { name: 'pay-union' },
  { name: 'pay-master' },
  { name: 'pay-alipay' },
  { name: 'pay-usdt' },
])

const breakdownItems = computed(() => {
  const items = [
    {
      key: 'balance',
      label: t('accountCostCenter.balance'),
      tooltip: t('accountCostCenter.balanceTooltip'),
      value: priceNum(accountInfo.value.balance || 0),
      operator: '+',
      danger: false,
    },
  ]

  if (accountInfo.value.advanceStatus === 2) {
    items.push({
      key: 'advanceQuota',
      label: t('accountCostCenter.advanceQuota'),
      tooltip: t('accountCostCenter.advanceQuotaTooltip'),
      value: priceNum(accountInfo.value.advanceQuota || 0),
      operator: '+',
      danger: false,
    })
  }

  items.push({
    key: 'giveMoney',
    label: t('accountCostCenter.giveMoney'),
    tooltip: t('accountCostCenter.giveMoneyTooltip'),
    value: priceNum(accountInfo.value.giveMoney || 0),
    operator: '+',
    danger: false,
  })

  if (accountInfo.value.advanceStatus === 2) {
    items.push({
      key: 'advanceWaitRefundMoney',
      label: t('accountCostCenter.advanceWaitRefundMoney'),
      tooltip: '',
      value: priceNum(accountInfo.value.advanceWaitRefundMoney || 0),
      operator: '-',
      danger: true,
    })
  }

  return items
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const priceNum = (num: string | number) => {
  const amountNumber = Number(num)

  if (amountNumber < 0) {
    return `-$${Math.abs(amountNumber)} USD`
  }

  return `$${amountNumber} USD`
}

const handleBlur = () => {
  if (amount.value && Number(amount.value) - 1 < 0) {
    message.warning(t('accountCostCenter.rechargeNumWarn1'))
  }
}

const handleAmount = (value: string) => {
  amount.value = value.replace(/[^\d.]/g, '')
  const reg = /^\d+(\.\d{0,2})?/
  amount.value = amount.value.match(reg) ? (amount.value as any).match(reg)[0] : ''
}

const createRechargeOrder = async () => {
  try {
    loading.value = true
    const res = await _createRechargeOrder({
      scene: 1,
      amount: Number(amount.value),
    })

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
  } finally {
    loading.value = false
  }
}

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

const getAccountInfo = async () => {
  const res = await _getAccountInfo()

  if (res.success) {
    accountInfo.value = res.data || {}
  }
}

onMounted(() => {
  getAccountInfo()
})
</script>

<style scoped lang="scss">
.cost-center-recharge-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.cost-center-recharge-v2__notice {
  :deep(.v2-info-notice__text) {
    color: #06f;
  }
}

.cost-center-recharge-v2__notice-text {
  p {
    margin: 0;
  }
}

.cost-center-recharge-v2__card {
  background: #fff;
}

.cost-center-recharge-v2__section {
  padding: 20px;
}

.cost-center-recharge-v2__title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cost-center-recharge-v2__info-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cost-center-recharge-v2__info-row {
  display: flex;
  align-items: center;
}

.cost-center-recharge-v2__info-row--quota {
  margin-bottom: 6px;
}

.cost-center-recharge-v2__label,
.cost-center-recharge-v2__form-label {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cost-center-recharge-v2__label {
  width: v-bind('labelWidthStyle.width');
}

.cost-center-recharge-v2__value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cost-center-recharge-v2__formula-wrap {
  margin-bottom: 24px;
}

.cost-center-recharge-v2__formula {
  position: relative;
  display: flex;
  gap: 48px;
  align-items: center;
  padding: 16px;
  margin-top: 12px;
  overflow: visible;
  background: #f9fafc;
  border: 1px solid #e8ecf3;
}

.cost-center-recharge-v2__formula-corner {
  position: absolute;
  top: 0;
  left: 34px;
  z-index: 2;
  width: 18px;
  height: 18px;
  background: #f9fafc;
  border-top: 1px solid #e8ecf3;
  border-left: 1px solid #e8ecf3;
  transform: translateY(-50%) rotate(45deg);
}

.cost-center-recharge-v2__formula-item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
}

.cost-center-recharge-v2__formula-symbol {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 24px;
  color: #555f6d;
}

.cost-center-recharge-v2__formula-label {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cost-center-recharge-v2__formula-help {
  width: 16px;
  height: 16px;
  color: #a5adba;
}

.cost-center-recharge-v2__formula-value {
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #191c23;

  &.is-danger {
    color: #e54839;
  }
}

.cost-center-recharge-v2__form {
  padding-top: 4px;
}

.cost-center-recharge-v2__form-row {
  display: flex;
  align-items: flex-start;
}

.cost-center-recharge-v2__form-label {
  width: v-bind('labelWidthStyle.width');
  padding-top: 6px;
}

.cost-center-recharge-v2__form-main {
  flex: 1;
  min-width: 0;
}

.cost-center-recharge-v2__amount-row {
  display: flex;
  gap: 24px;
  align-items: center;
}

.cost-center-recharge-v2__amount-input {
  width: 508px;
  max-width: 100%;
}

.cost-center-recharge-v2__payments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.cost-center-recharge-v2__payments-label,
.cost-center-recharge-v2__payments-text {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cost-center-recharge-v2__payment-icon {
  width: 24px;
  height: 24px;
}

.cost-center-recharge-v2__checkbox-row {
  display: block;
  margin-top: 24px;
}

// .cost-center-recharge-v2__checkbox-row :deep(.el-checkbox) {
//   align-items: flex-start;
// }

.cost-center-recharge-v2__checkbox-row :deep(.el-checkbox__label) {
  padding-left: 8px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  white-space: normal;
}

.cost-center-recharge-v2__footer {
  padding: 20px;
  margin-top: 20px;
  border-top: 1px solid #e8ecf3;
}

@media (width <= 1100px) {
  .cost-center-recharge-v2__amount-row,
  .cost-center-recharge-v2__form-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .cost-center-recharge-v2__amount-input {
    width: 100%;
  }
}

@media (width <= 768px) {
  .cost-center-recharge-v2__section,
  .cost-center-recharge-v2__footer {
    padding: 16px;
  }

  .cost-center-recharge-v2__formula {
    flex-wrap: wrap;
    gap: 24px;
  }

  .cost-center-recharge-v2__label,
  .cost-center-recharge-v2__form-label {
    width: auto;
  }
}
</style>
