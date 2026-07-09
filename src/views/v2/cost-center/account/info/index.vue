<template>
  <div class="cost-center-account-v2">
    <PageToolbar :title="t('accountCostCenter.accountInfo')" @doc="openHelpDoc" />

    <section class="cost-center-account-v2__card cost-center-account-v2__hero">
      <div class="cost-center-account-v2__section-title">
        {{ t('accountCostCenter.usableQuota') }}
      </div>

      <div class="cost-center-account-v2__hero-main">
        <div class="cost-center-account-v2__hero-amount">
          <span class="cost-center-account-v2__hero-value">{{ displayAmount(accountInfo.usableQuota || 0) }}</span>
          <span class="cost-center-account-v2__hero-unit">USD</span>
        </div>

        <div class="cost-center-account-v2__hero-actions">
          <el-button v-permission="['feeApi:createRechargeOrder']" type="primary" @click="toRecharge">
            {{ t('accountCostCenter.recharge') }}
          </el-button>
          <el-button v-permission="['feeApi:queryIncomeRecordList']" @click="toIncomeExpenditure">
            {{ t('incomeExpenditure.incomeExpenditure') }}
          </el-button>
        </div>
      </div>

      <div class="cost-center-account-v2__formula">
        <div class="cost-center-account-v2__formula-corner" />

        <template v-for="(item, index) in breakdownItems" :key="item.key">
          <span v-if="index > 0" class="cost-center-account-v2__formula-symbol">{{ item.operator }}</span>
          <div class="cost-center-account-v2__formula-item">
            <div class="cost-center-account-v2__formula-label">
              <span>{{ item.label }}</span>
              <el-tooltip v-if="item.tooltip" :content="item.tooltip" placement="top" effect="light">
                <SvgIcon name="question" class="cost-center-account-v2__formula-help" />
              </el-tooltip>
            </div>
            <div class="cost-center-account-v2__formula-value" :class="{ 'is-danger': item.danger }">
              {{ item.value }}
            </div>
          </div>
        </template>
      </div>
    </section>

    <section
      class="cost-center-account-v2__card cost-center-account-v2__meta"
      :class="{ 'has-advance': accountInfo.advanceStatus === 2 }"
    >
      <article class="cost-center-account-v2__meta-item">
        <div class="cost-center-account-v2__meta-label">
          {{ t('accountCostCenter.coupon') }}
        </div>
        <div class="cost-center-account-v2__meta-value">
          <span class="cost-center-account-v2__meta-number">0</span>
          <span class="cost-center-account-v2__meta-unit">{{ t('accountCostCenter.couponNum') }}</span>
        </div>
      </article>

      <article
        v-if="accountInfo.advanceStatus === 2"
        class="cost-center-account-v2__meta-item cost-center-account-v2__meta-item--split"
      >
        <div class="cost-center-account-v2__meta-label">
          {{ t('accountCostCenter.advanceWaitRefundMoneys') }}
        </div>
        <div class="cost-center-account-v2__meta-value">
          <span class="cost-center-account-v2__meta-number">{{
            displayAmount(accountInfo.advanceWaitRefundMoney || 0)
          }}</span>
          <span class="cost-center-account-v2__meta-unit">USD</span>
        </div>
        <button
          v-if="accountInfo.advanceWaitRefundMoney"
          type="button"
          class="cost-center-account-v2__link"
          @click="toRepayment"
        >
          {{ t('accountCostCenter.payment') }}
        </button>
      </article>

      <article class="cost-center-account-v2__meta-item cost-center-account-v2__meta-item--split">
        <div class="cost-center-account-v2__meta-label">
          {{ t('accountCostCenter.invoicableAmount') }}
        </div>
        <div class="cost-center-account-v2__meta-value">
          <span class="cost-center-account-v2__meta-number">{{
            displayAmount(invoiceSummary.invoicableAmount || 0)
          }}</span>
          <span class="cost-center-account-v2__meta-unit">USD</span>
        </div>
        <button
          v-if="invoiceSummary.invoicableAmount"
          type="button"
          class="cost-center-account-v2__link"
          @click="toExpenseBillInvoice"
        >
          {{ t('accountCostCenter.invoice') }}
        </button>
      </article>
    </section>

    <section class="cost-center-account-v2__grid">
      <article
        v-permission="['feeApi:queryProductOrderPage']"
        v-loading="queryOrder.loading"
        class="cost-center-account-v2__card cost-center-account-v2__list-card"
      >
        <div class="cost-center-account-v2__list-head">
          <h3 class="cost-center-account-v2__list-title">
            {{ t('accountCostCenter.paidOrder', [queryOrder.total]) }}
          </h3>
          <button
            v-if="queryOrder.list.length"
            type="button"
            class="cost-center-account-v2__more"
            @click="showQueryOrderMore"
          >
            <span>{{ t('accountCostCenter.more') }}</span>
            <SvgIcon name="step-arrow" />
          </button>
        </div>

        <template v-if="queryOrder.list.length">
          <div class="cost-center-account-v2__list-body">
            <div
              v-for="(item, index) in queryOrder.list"
              :key="`${item.createTime}-${index}`"
              class="cost-center-account-v2__row"
            >
              <div class="cost-center-account-v2__row-main">
                <div class="cost-center-account-v2__row-primary">
                  {{ maoYunDayJs(item?.createTime).format(FORMAT_TIME) }}
                </div>
                <div class="cost-center-account-v2__row-secondary">
                  {{ item?.subProductNameList?.join(',') || '-' }}
                </div>
              </div>
              <div class="cost-center-account-v2__row-side">
                <div class="cost-center-account-v2__row-price is-warning">
                  {{ t('accountCostCenter.priceNum', [item.amount]) }}
                </div>
                <div class="cost-center-account-v2__row-original">${{ item.originalAmount }} USD</div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="cost-center-account-v2__empty">
            <div class="cost-center-account-v2__empty-icon-wrap">
              <SvgIcon name="v2-no-data-order" class="cost-center-account-v2__empty-icon" />
            </div>
            <div class="cost-center-account-v2__empty-text">
              {{ t('accountCostCenter.noDataPaid') }}
            </div>
          </div>
        </template>
      </article>

      <article
        v-permission="['feeApi:getTransMonthBillOverview']"
        v-loading="transMonthBillOverview.loading"
        class="cost-center-account-v2__card cost-center-account-v2__list-card"
      >
        <div class="cost-center-account-v2__list-head">
          <h3 class="cost-center-account-v2__list-title">
            {{ t('accountCostCenter.monthBill') }}
          </h3>
          <button
            v-if="transMonthBillOverview.list.length"
            type="button"
            class="cost-center-account-v2__more"
            @click="showMonthMore"
          >
            <span>{{ t('accountCostCenter.more') }}</span>
            <SvgIcon name="step-arrow" />
          </button>
        </div>

        <template v-if="transMonthBillOverview.list.length">
          <div class="cost-center-account-v2__list-body">
            <div
              v-for="(item, index) in transMonthBillOverview.list"
              :key="`${item.transDate}-${index}`"
              class="cost-center-account-v2__row cost-center-account-v2__row--month"
            >
              <div class="cost-center-account-v2__row-primary">
                {{ item.transDate }}
              </div>
              <div class="cost-center-account-v2__row-price">
                {{ t('accountCostCenter.priceNum', [item.discountPrice]) }}
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="cost-center-account-v2__empty">
            <div class="cost-center-account-v2__empty-icon-wrap">
              <SvgIcon name="no-data-month" class="cost-center-account-v2__empty-icon" />
            </div>
            <div class="cost-center-account-v2__empty-text">
              {{ t('accountCostCenter.noDataMonth') }}
            </div>
          </div>
        </template>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { _getAccountInfo, _getTransMonthBillOverview, _queryOrderPage } from '@/apis/cost-center/user'
import { _getInvoicableSummary } from '@/apis/cost-center/expense-bill'
import { FORMAT_DAY_NO_UTC, FORMAT_MONTH_NO_UTC, FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'
import t from '@/utils/i18n'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'

type QueryOrderType = {
  createTime?: string
  productName?: string
  subProductNameList?: string[]
  amount?: number
  originalAmount?: number
}

type TransMonthBillOverviewType = {
  transDate: string
  discountPrice: number
}

const accountInfo = ref<any>({})
const invoiceSummary = ref<any>({})

const queryOrder = reactive<{
  list: QueryOrderType[]
  allList: QueryOrderType[]
  total: number
  loading: boolean
}>({
  list: [],
  allList: [],
  total: 0,
  loading: false,
})

const transMonthBillOverview = reactive<{
  list: TransMonthBillOverviewType[]
  allList: TransMonthBillOverviewType[]
  loading: boolean
}>({
  list: [],
  allList: [],
  loading: false,
})

const displayAmount = (num: string | number) => {
  const amount = Number(num)
  return amount < 0 ? `-${Math.abs(amount)}` : `${amount}`
}

const formatUsd = (num: string | number) => `${displayAmount(num)} USD`

const breakdownItems = computed(() => {
  const items = [
    {
      key: 'balance',
      label: t('accountCostCenter.balance'),
      tooltip: t('accountCostCenter.balanceTooltip'),
      value: formatUsd(accountInfo.value.balance || 0),
      operator: '+',
      danger: false,
    },
  ]

  if (accountInfo.value.advanceStatus === 2) {
    items.push({
      key: 'advanceQuota',
      label: t('accountCostCenter.advanceQuota'),
      tooltip: t('accountCostCenter.advanceQuotaTooltip'),
      value: formatUsd(accountInfo.value.advanceQuota || 0),
      operator: '+',
      danger: false,
    })
  }

  items.push({
    key: 'giveMoney',
    label: t('accountCostCenter.giveMoney'),
    tooltip: t('accountCostCenter.giveMoneyTooltip'),
    value: formatUsd(accountInfo.value.giveMoney || 0),
    operator: '+',
    danger: false,
  })

  if (accountInfo.value.advanceStatus === 2) {
    items.push({
      key: 'advanceWaitRefundMoney',
      label: t('accountCostCenter.advanceWaitRefundMoney'),
      tooltip: '',
      value: formatUsd(accountInfo.value.advanceWaitRefundMoney || 0),
      operator: '-',
      danger: true,
    })
  }

  return items
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const getAccountInfo = async () => {
  const res = await _getAccountInfo()

  if (res.success) {
    accountInfo.value = res.data || {}
  }
}

const getInvoicableSummary = async () => {
  const res = await _getInvoicableSummary()

  if (res.success) {
    invoiceSummary.value = res.data || {}
  }
}

const getQueryOrderPage = async () => {
  try {
    queryOrder.loading = true
    const end = maoYunDayJs()
    const beginDate = end.subtract(1, 'year').format(FORMAT_DAY_NO_UTC)
    const endDate = end.format(FORMAT_DAY_NO_UTC)
    const params = {
      pageIndex: 1,
      pageSize: 1000,
      beginDate,
      endDate,
      status: 1,
    }
    const res = await _queryOrderPage(params)

    if (res.success) {
      const list = res.data?.list || []
      queryOrder.allList = list
      queryOrder.list = list.slice(0, 4)
      queryOrder.total = res.data?.recordCnt || 0
    }
  } finally {
    queryOrder.loading = false
  }
}

const getTransMonthBillOverview = async () => {
  try {
    transMonthBillOverview.loading = true
    const params = {
      transMonth: maoYunDayJs().format(FORMAT_MONTH_NO_UTC),
      queryType: 1,
    }
    const res = await _getTransMonthBillOverview(params)

    if (res.success) {
      const list = Array.isArray(res.data) ? res.data : []
      transMonthBillOverview.allList = list
      transMonthBillOverview.list = [...list].reverse().slice(0, 4)
    }
  } finally {
    transMonthBillOverview.loading = false
  }
}

const toRecharge = () => {
  pushRoute({
    name: 'cost_center_account_recharge',
    query: {
      title: 'accountCostCenter.accountInfo',
      path: '/cost-center/account/info',
    },
  })
}

const toIncomeExpenditure = () => {
  pushRoute({ name: 'income_expenditure' })
}

const toExpenseBillInvoice = () => {
  pushRoute({ name: 'expense_bill_invoice_list' })
}

const toRepayment = () => {
  pushRoute({
    name: 'cost_center_account_recharge',
    query: {
      title: 'accountCostCenter.accountInfo',
      path: '/cost-center/account/info',
    },
  })
}

const showQueryOrderMore = () => {
  pushRoute({ name: 'order' })
}

const showMonthMore = () => {
  pushRoute({ name: 'expense_bill_bill_list' })
}

onMounted(() => {
  getAccountInfo()
  getQueryOrderPage()
  getTransMonthBillOverview()
  getInvoicableSummary()
})
</script>

<style scoped lang="scss">
.cost-center-account-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.cost-center-account-v2__card {
  background: #fff;
}

.cost-center-account-v2__hero,
.cost-center-account-v2__meta,
.cost-center-account-v2__list-card {
  padding: 20px;
}

.cost-center-account-v2__section-title,
.cost-center-account-v2__list-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cost-center-account-v2__hero {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cost-center-account-v2__hero-main {
  display: flex;
  gap: 48px;
  align-items: center;

  // justify-content: space-between;
}

.cost-center-account-v2__hero-amount {
  display: flex;
  gap: 8px;
  align-items: baseline;
  min-width: 0;
}

.cost-center-account-v2__hero-value {
  font-size: 32px;
  font-weight: 500;
  line-height: 40px;
  color: #191c23;
}

.cost-center-account-v2__hero-unit {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cost-center-account-v2__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.cost-center-account-v2__hero-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.cost-center-account-v2__formula {
  position: relative;
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 16px;
  margin-top: 12px;
  overflow: visible;
  background: #f9fafc;
  border: 1px solid #e8ecf3;
}

.cost-center-account-v2__formula-corner {
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

.cost-center-account-v2__formula-item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
}

.cost-center-account-v2__formula-symbol {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 24px;
  color: #555f6d;
}

.cost-center-account-v2__formula-label {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cost-center-account-v2__formula-help {
  width: 16px;
  height: 16px;
  color: #a5adba;
}

.cost-center-account-v2__formula-value {
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #191c23;

  &.is-danger {
    color: #e54839;
  }
}

.cost-center-account-v2__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.cost-center-account-v2__meta.has-advance {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.cost-center-account-v2__meta-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.cost-center-account-v2__meta-item--split {
  padding-left: 32px;
  border-left: 1px solid #e8ecf3;
}

.cost-center-account-v2__meta-label {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cost-center-account-v2__meta-value {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.cost-center-account-v2__meta-number {
  font-size: 32px;
  font-weight: 500;
  line-height: 40px;
  color: #191c23;
}

.cost-center-account-v2__meta-unit {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cost-center-account-v2__link,
.cost-center-account-v2__more {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  align-self: flex-start;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cost-center-account-v2__more {
  color: #828b9c;
}

.cost-center-account-v2__more :deep(svg) {
  width: 12px;
  height: 12px;
}

.cost-center-account-v2__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 16px;
}

.cost-center-account-v2__list-card {
  display: flex;
  flex-direction: column;
  min-height: 340px;
}

.cost-center-account-v2__list-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cost-center-account-v2__list-body {
  display: flex;
  flex-direction: column;
}

.cost-center-account-v2__row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e8ecf3;
}

.cost-center-account-v2__row:last-child {
  border-bottom: 0;
}

.cost-center-account-v2__row-main {
  flex: 1;
  min-width: 0;
}

.cost-center-account-v2__row-primary {
  overflow: hidden;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cost-center-account-v2__row-secondary {
  margin-top: 2px;
  overflow: hidden;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cost-center-account-v2__row-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 88px;
}

.cost-center-account-v2__row-price {
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #191c23;

  &.is-warning {
    color: #ff720d;
  }
}

.cost-center-account-v2__row-original {
  margin-top: 2px;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
  text-decoration: line-through;
}

.cost-center-account-v2__row--month {
  min-height: 68px;
}

.cost-center-account-v2__empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.cost-center-account-v2__empty-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f9fafc;
  border-radius: 999px;
}

.cost-center-account-v2__empty-icon {
  width: 48px;
  height: 48px;
}

.cost-center-account-v2__empty-text {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  text-align: center;
}

@media (width <= 900px) {
  .cost-center-account-v2__hero-main,
  .cost-center-account-v2__list-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .cost-center-account-v2__meta {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .cost-center-account-v2__meta.has-advance {
    grid-template-columns: 1fr;
  }

  .cost-center-account-v2__meta-item--split {
    padding-top: 24px;
    padding-left: 0;
    border-top: 1px solid #e8ecf3;
    border-left: 0;
  }

  .cost-center-account-v2__grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .cost-center-account-v2__hero,
  .cost-center-account-v2__meta,
  .cost-center-account-v2__list-card {
    padding: 16px;
  }

  .cost-center-account-v2__formula {
    gap: 16px;
  }

  .cost-center-account-v2__hero-value,
  .cost-center-account-v2__meta-number {
    font-size: 28px;
    line-height: 36px;
  }
}
</style>
