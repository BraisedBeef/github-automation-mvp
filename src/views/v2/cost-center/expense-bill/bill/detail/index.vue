<template>
  <div class="expense-bill-detail-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <section class="expense-bill-detail-v2__card">
      <div class="expense-bill-detail-v2__section-title">
        {{ t('bill.detail') }}
      </div>
      <div class="expense-bill-detail-v2__section-desc">
        {{ detailTipText }}
      </div>

      <div class="expense-bill-detail-v2__info-grid">
        <div v-for="item in infoRows" :key="item.label" class="expense-bill-detail-v2__info-item">
          <div class="expense-bill-detail-v2__info-label">
            {{ item.label }}
          </div>
          <div class="expense-bill-detail-v2__info-value">
            {{ item.value }}
          </div>
        </div>
      </div>
    </section>

    <section class="expense-bill-detail-v2__card">
      <div class="expense-bill-detail-v2__section-title">
        {{ t('bill.costComposition') }}
      </div>

      <div class="expense-bill-detail-v2__summary-row">
        <div class="expense-bill-detail-v2__summary-main expense-bill-detail-v2__summary-main--total">
          <div class="expense-bill-detail-v2__summary-label">
            {{ t('bill.totalMoney') }}
          </div>
          <div class="expense-bill-detail-v2__summary-value">
            <span>{{ detail.discountedPrice || '0.00' }}</span>
            <span class="expense-bill-detail-v2__summary-unit">USD</span>
          </div>
        </div>

        <div class="expense-bill-detail-v2__summary-symbol">=</div>

        <template v-for="(item, index) in summaryItems" :key="item.label">
          <div class="expense-bill-detail-v2__summary-main">
            <div class="expense-bill-detail-v2__summary-label">
              {{ item.label }}
            </div>
            <div class="expense-bill-detail-v2__summary-value">
              <span>{{ item.value }}</span>
              <span class="expense-bill-detail-v2__summary-unit">USD</span>
            </div>
          </div>

          <div v-if="index !== summaryItems.length - 1" class="expense-bill-detail-v2__summary-symbol">+</div>
        </template>
      </div>

      <TableV2
        v-loading="loading"
        :data="detail.subBill || []"
        :empty-min-height="120"
        class="expense-bill-detail-v2__table"
      >
        <el-table-column prop="subProductName" :label="t('bill.subProductName')" min-width="180">
          <template #default="{ row }">
            {{ row.subProductName || '-' }}
          </template>
        </el-table-column>

        <el-table-column :label="t('bill.cpn')" min-width="140">
          <template #default="{ row }">
            {{ row.componentName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="used" :label="t('bill.used')" min-width="120">
          <template #default="{ row }">
            {{ row.used || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="usedDuration" :label="t('bill.usedDurations')" min-width="120">
          <template #default="{ row }">
            {{ row.usedDuration || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="discountedPrice" :label="t('bill.originalPriceUnit')" min-width="140" />

        <el-table-column prop="totalMoneyRatio" :label="t('bill.totalMoneyRatio')" min-width="120">
          <template #default="{ row }">
            {{ row.totalMoneyRatio ? `${NP.times(row.totalMoneyRatio, 100)}%` : '-' }}
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <section class="expense-bill-detail-v2__card">
      <div class="expense-bill-detail-v2__trend-head">
        <div>
          <div class="expense-bill-detail-v2__section-title">
            {{ t('bill.costTrends') }}
          </div>
          <div class="expense-bill-detail-v2__trend-desc">
            <span>{{ transMonthBillCost.time }}</span>
            <span>{{ averageLabel }}</span>
            <span class="expense-bill-detail-v2__trend-highlight">${{ transMonthBillCost.average }} USD</span>
          </div>
        </div>

        <div class="expense-bill-detail-v2__trend-toolbar">
          <div class="expense-bill-detail-v2__segmented">
            <button
              class="expense-bill-detail-v2__segmented-btn"
              :class="{ 'is-active': transMonthBillOverview.dateActive === 1 }"
              type="button"
              @click="transMonthBillOverview.dateActive = 1"
            >
              {{ t('bill.halfYear') }}
            </button>
            <button
              class="expense-bill-detail-v2__segmented-btn"
              :class="{ 'is-active': transMonthBillOverview.dateActive === 2 }"
              type="button"
              @click="transMonthBillOverview.dateActive = 2"
            >
              {{ t('bill.oneYear') }}
            </button>
          </div>

          <el-select v-model="transMonthBillOverview.type" value-key="value" class="expense-bill-detail-v2__select">
            <el-option
              v-for="item in transMonthBillOverview.selectOptions"
              :key="item.value"
              :value="item"
              :label="item.label"
            />
          </el-select>
        </div>
      </div>

      <div id="cost-chart-v2" class="expense-bill-detail-v2__chart" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { _getBill, _getTransMonthBillOverview } from '@/apis/cost-center/expense-bill'
import * as echarts from 'echarts'
import NP from 'number-precision'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { FORMAT_ONLY_MONTH_NO_UTC, FORMAT_TIME, FORMAT_YEAR_NO_UTC, maoYunDayJs } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { PRIMARY_COLOR, TRANSACTION_TYPE_MAP, _toFixed } from '@/views/cost-center/expense-bill/config'

const route = useRoute()

const billId = ref(route.params.billId as string)
const transMonth = ref(route.query.transMonth as string)
const loading = ref(false)
const detail = ref<any>({})

const breadcrumbItems = computed(() => [
  t('costCenterRoutes.bill'),
  t('bill.naturalResources'),
  t('costCenterRoutes.billDetail'),
])

const detailTipText = computed(() => {
  const startDate = detail.value.useStartDate
  if (!startDate) {
    return ''
  }

  return t('bill.detailTipValue', [
    maoYunDayJs(startDate).format(FORMAT_YEAR_NO_UTC),
    maoYunDayJs(startDate).format(FORMAT_ONLY_MONTH_NO_UTC),
  ])
})

const infoRows = computed(() => [
  { label: t('bill.resourceIds'), value: detail.value.instanceId || '-' },
  { label: t('bill.alias'), value: detail.value.alias || '--' },
  { label: t('bill.userUin'), value: detail.value.userUin || '-' },
  { label: t('bill.productId'), value: detail.value.productName || '-' },
  {
    label: t('bill.useStartDate'),
    value: detail.value.useStartDate ? maoYunDayJs(detail.value.useStartDate).format(FORMAT_TIME) : '-',
  },
  { label: t('bill.subProductName'), value: detail.value.subProductName || '-' },
  { label: t('incomeExpenditure.incomeType'), value: TRANSACTION_TYPE_MAP[detail.value.transactionType] || '-' },
  {
    label: t('bill.useEndDate'),
    value: detail.value.useEndDate ? maoYunDayJs(detail.value.useEndDate).format(FORMAT_TIME) : '-',
  },
  { label: t('bill.regionName'), value: detail.value.regionName || '-' },
  { label: t('bill.projectId'), value: detail.value.productName || '-' },
  { label: t('bill.expand'), value: detail.value.description || '-' },
  { label: t('bill.zoneName'), value: detail.value.zoneName || '-' },
])

const summaryItems = computed(() => [
  { label: t('bill.money'), value: detail.value.money || '0.00' },
  { label: t('bill.voucherMoney'), value: detail.value.voucherMoney || '0.00' },
  { label: t('bill.giftGoldMoney'), value: detail.value.giftGoldMoney || '0.00' },
  { label: t('bill.platformAdvancePaymentMoney'), value: detail.value.platformAdvancePaymentMoney || '0.00' },
])

const transMonthBillOverview = reactive<{
  options: any
  chart: any
  list: any[]
  type: { value: string; label: string }
  dateActive: number
  selectOptions: { value: string; label: string }[]
}>({
  options: {
    tooltip: {
      trigger: 'item',
    },
    xAxis: {},
    yAxis: {},
    series: [],
  },
  chart: null,
  list: [],
  type: {
    value: 'all',
    label: t('bill.totalMoney'),
  },
  dateActive: 1,
  selectOptions: [
    { value: 'all', label: t('bill.totalMoney') },
    { value: 'money', label: t('bill.money') },
    { value: 'voucher', label: t('bill.voucherMoney') },
    { value: 'giftGoldMoney', label: t('bill.giftGoldMoney') },
    { value: 'platformAdvancePaymentMoney', label: t('bill.platformAdvancePaymentMoney') },
  ],
})

const transMonthBillCost = computed(() => {
  const map = {
    all: 'discountPrice',
    money: 'money',
    voucher: 'voucherMoney',
    giftGoldMoney: 'giftGoldMoney',
    platformAdvancePaymentMoney: 'platformAdvancePaymentMoney',
  } as const

  const key = map[transMonthBillOverview.type.value as keyof typeof map]

  let sum = 0
  let time = ''
  let average: string | number = 0

  if (transMonthBillOverview.list.length) {
    for (const el of transMonthBillOverview.list) {
      sum += Number(el[key] || 0)
    }

    time = `${transMonthBillOverview.list[0].transDate} ~ ${transMonthBillOverview.list[transMonthBillOverview.list.length - 1].transDate}`
    average = _toFixed(sum / transMonthBillOverview.list.length)
  }

  return {
    time,
    average,
  }
})

const averageLabel = computed(() => {
  switch (transMonthBillOverview.type.value) {
    case 'money':
      return t('bill.averageMonthMoney')
    case 'voucher':
      return t('bill.averageMonthVoucher')
    case 'giftGoldMoney':
      return t('bill.averageMonthGiftGoldMoney')
    case 'platformAdvancePaymentMoney':
      return t('bill.averageMonthPlatformAdvancePaymentMoney')
    default:
      return t('bill.averageMonthTotal')
  }
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const getBill = async () => {
  try {
    loading.value = true
    const res = await _getBill({ billId: billId.value })

    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const getTransMonthBillOverview = async () => {
  const res = await _getTransMonthBillOverview({
    transMonth: transMonth.value,
    queryType: transMonthBillOverview.dateActive,
  })

  if (res.success) {
    transMonthBillOverview.list = res.data || []
    setTransMonthBillOverviewChart()
  }
}

const setTransMonthBillOverviewChart = () => {
  const chartDom = document.getElementById('cost-chart-v2')
  if (!chartDom) return

  if (!transMonthBillOverview.chart) {
    transMonthBillOverview.chart = markRaw(echarts.init(chartDom))
  }

  const rawXAxisData: any[] = []
  const rawMoneyData: any[] = []
  const rawVoucherData: any[] = []
  const rawGiftGoldMoneyData: any[] = []
  const rawPlatformAdvancePaymentMoneyData: any[] = []

  for (const el of transMonthBillOverview.list) {
    rawXAxisData.push(el.transDate)
    rawMoneyData.push(el.money)
    rawVoucherData.push(el.voucherMoney)
    rawGiftGoldMoneyData.push(el.giftGoldMoney)
    rawPlatformAdvancePaymentMoneyData.push(el.platformAdvancePaymentMoney)
  }

  const options: any = {
    grid: {
      left: 0,
      right: 0,
      top: '10%',
      bottom: '18%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: rawXAxisData,
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#e8ecf3',
          type: 'dashed',
        },
      },
    },
    legend: {
      top: 'bottom',
    },
  }

  if (transMonthBillOverview.type.value === 'all') {
    options.color = [PRIMARY_COLOR, '#0FBE5B', '#FA8D15', '#67CDFD']
    options.legend.data = [
      t('bill.money'),
      t('bill.voucherMoney'),
      t('bill.giftGoldMoney'),
      t('bill.platformAdvancePaymentMoney'),
    ]
    options.series = [
      { name: t('bill.money'), type: 'bar', stack: 'cost', data: rawMoneyData, barWidth: '28' },
      { name: t('bill.voucherMoney'), type: 'bar', stack: 'cost', data: rawVoucherData, barWidth: '28' },
      { name: t('bill.giftGoldMoney'), type: 'bar', stack: 'cost', data: rawGiftGoldMoneyData, barWidth: '28' },
      {
        name: t('bill.platformAdvancePaymentMoney'),
        type: 'bar',
        stack: 'cost',
        data: rawPlatformAdvancePaymentMoneyData,
        barWidth: '28',
      },
    ]
  } else {
    const configMap = {
      money: { color: PRIMARY_COLOR, label: t('bill.money'), data: rawMoneyData },
      voucher: { color: '#0FBE5B', label: t('bill.voucherMoney'), data: rawVoucherData },
      giftGoldMoney: { color: '#FA8D15', label: t('bill.giftGoldMoney'), data: rawGiftGoldMoneyData },
      platformAdvancePaymentMoney: {
        color: '#67CDFD',
        label: t('bill.platformAdvancePaymentMoney'),
        data: rawPlatformAdvancePaymentMoneyData,
      },
    } as const

    const current = configMap[transMonthBillOverview.type.value as keyof typeof configMap]
    options.color = [current.color]
    options.legend.data = [current.label]
    options.series = [{ name: current.label, type: 'bar', stack: 'cost', data: current.data, barWidth: '28' }]
  }

  transMonthBillOverview.chart.clear()
  transMonthBillOverview.chart.setOption(options)
}

watch(
  () => transMonthBillOverview.dateActive,
  () => {
    getTransMonthBillOverview()
  },
)

watch(
  () => transMonthBillOverview.type,
  () => {
    setTransMonthBillOverviewChart()
  },
)

onMounted(() => {
  getBill()
  getTransMonthBillOverview()
})

onUnmounted(() => {
  if (transMonthBillOverview.chart) {
    transMonthBillOverview.chart.dispose()
    transMonthBillOverview.chart = null
  }
})
</script>

<style scoped lang="scss">
.expense-bill-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.expense-bill-detail-v2__card {
  padding: 20px;
  background: #fff;
}

.expense-bill-detail-v2__section-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.expense-bill-detail-v2__section-desc {
  margin-top: 10px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.expense-bill-detail-v2__info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 20px;
  border-top: 1px solid #e8ecf3;
  border-left: 1px solid #e8ecf3;
}

.expense-bill-detail-v2__info-item {
  display: grid;
  grid-template-columns: 136px minmax(0, 1fr);
  grid-column: span 2;
}

.expense-bill-detail-v2__info-label,
.expense-bill-detail-v2__info-value {
  min-height: 48px;
  padding: 12px 18px;
  font-size: 14px;
  line-height: 24px;
  border-right: 1px solid #e8ecf3;
  border-bottom: 1px solid #e8ecf3;
}

.expense-bill-detail-v2__info-label {
  color: #828b9c;
  background: #f9fafc;
}

.expense-bill-detail-v2__info-value {
  color: #191c23;
  word-break: break-word;
  background: #fff;
}

.expense-bill-detail-v2__summary-row {
  display: flex;
  gap: 32px;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 24px;
}

.expense-bill-detail-v2__summary-main {
  min-width: 0;
}

.expense-bill-detail-v2__summary-main--total .expense-bill-detail-v2__summary-value {
  color: #ff7a00;
}

.expense-bill-detail-v2__summary-label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.expense-bill-detail-v2__summary-value {
  margin-top: 10px;
  font-size: 32px;
  font-weight: 600;
  line-height: 52px;
  color: #191c23;
}

.expense-bill-detail-v2__summary-unit {
  margin-left: 8px;
  font-size: 14px;
  line-height: 24px;
}

.expense-bill-detail-v2__summary-symbol {
  margin-top: 30px;
  font-size: 24px;
  line-height: 24px;
  color: #191c23;
}

.expense-bill-detail-v2__table {
  margin-top: 8px;
}

.expense-bill-detail-v2__trend-head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.expense-bill-detail-v2__trend-desc {
  margin-top: 8px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.expense-bill-detail-v2__trend-highlight {
  color: #06f;
}

.expense-bill-detail-v2__trend-toolbar {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.expense-bill-detail-v2__segmented {
  display: inline-flex;
}

.expense-bill-detail-v2__segmented-btn {
  min-width: 88px;
  height: 40px;
  padding: 0 18px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.expense-bill-detail-v2__segmented-btn + .expense-bill-detail-v2__segmented-btn {
  margin-left: -1px;
}

.expense-bill-detail-v2__segmented-btn.is-active {
  position: relative;
  z-index: 1;
  color: #06f;
  background: #f5f8ff;
  border-color: #06f;
}

.expense-bill-detail-v2__select {
  width: 136px;
}

.expense-bill-detail-v2__chart {
  width: 100%;
  height: 360px;
  margin-top: 20px;
}

@media (width <= 1024px) {
  .expense-bill-detail-v2__info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .expense-bill-detail-v2__info-item {
    grid-column: span 2;
  }

  .expense-bill-detail-v2__summary-row {
    flex-wrap: wrap;
  }

  .expense-bill-detail-v2__trend-head {
    flex-direction: column;
  }
}

@media (width <= 768px) {
  .expense-bill-detail-v2__card {
    padding: 16px;
  }

  .expense-bill-detail-v2__info-item {
    grid-template-columns: 1fr;
  }

  .expense-bill-detail-v2__summary-value {
    font-size: 32px;
    line-height: 40px;
  }

  .expense-bill-detail-v2__trend-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .expense-bill-detail-v2__segmented,
  .expense-bill-detail-v2__segmented-btn,
  .expense-bill-detail-v2__select {
    width: 100%;
  }

  .expense-bill-detail-v2__chart {
    height: 300px;
  }
}
</style>
