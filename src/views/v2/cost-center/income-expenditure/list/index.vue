<template>
  <div class="income-expenditure-v2">
    <PageBreadcrumbToolbar :items="[t('costCenterRoutes.incomeExpenditure')]" @doc="openHelpDoc" />

    <InfoNotice class="income-expenditure-v2__notice">
      <div class="income-expenditure-v2__notice-list">
        <div>{{ t('incomeExpenditure.incomeExpenditureTip1') }}</div>
        <div>{{ t('incomeExpenditure.incomeExpenditureTip2') }}</div>
        <div>{{ t('incomeExpenditure.incomeExpenditureTip3') }}</div>
        <div>{{ t('incomeExpenditure.incomeExpenditureTip4') }}</div>
      </div>
    </InfoNotice>

    <section class="income-expenditure-v2__toolbar-card">
      <div class="income-expenditure-v2__toolbar">
        <div class="income-expenditure-v2__filters">
          <div class="income-expenditure-v2__periods">
            <button
              v-for="item in btnsGroupList"
              :key="item.value"
              class="income-expenditure-v2__period"
              :style="btnStyle"
              :class="{ 'is-active': btnValue.value === item.value }"
              type="button"
              @click="changeDate(item)"
            >
              {{ item.label }}
            </button>
          </div>

          <el-date-picker
            v-model="dateTime"
            class="income-expenditure-v2__date-picker"
            type="daterange"
            start-placeholder=""
            end-placeholder=""
            :shortcuts="shortcuts"
            :range-separator="t('export.to')"
            :clearable="false"
            value-format="YYYY-MM-DD"
          />

          <el-select
            v-model="query.type"
            class="income-expenditure-v2__select"
            :teleported="true"
            :placeholder="t('incomeExpenditure.allTypePlaceholder')"
            @change="getList"
          >
            <el-option v-for="item in query.selectOpts" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>

          <el-checkbox
            v-model="query.show"
            class="income-expenditure-v2__checkbox"
            :label="t('incomeExpenditure.showZero')"
            @change="getList"
          />
        </div>

        <el-button class="income-expenditure-v2__download" @click="download">
          <SvgIcon name="cat-cdn-download" />
        </el-button>
      </div>
    </section>

    <section class="income-expenditure-v2__summary-card">
      <div class="income-expenditure-v2__summary-heading">
        {{ t('incomeExpenditure.summaryDesc1') }}
      </div>
      <div class="income-expenditure-v2__summary-panels">
        <div class="income-expenditure-v2__summary-panel">
          <div class="income-expenditure-v2__summary-panel-inner">
            <div class="income-expenditure-v2__summary-panel-label">
              {{ summaryIncomeLabel }}
            </div>
            <div class="income-expenditure-v2__summary-panel-total">
              {{ formatAmount(tableData.info?.incomeMoney) }}
              <span>USD</span>
            </div>
          </div>
          <div class="income-expenditure-v2__summary-breakdown">
            <template v-for="(item, index) in incomeSummaryItems" :key="item.label">
              <div class="income-expenditure-v2__summary-breakdown-item">
                <div class="income-expenditure-v2__summary-breakdown-label">
                  {{ item.label }}
                </div>
                <div class="income-expenditure-v2__summary-breakdown-value">{{ formatAmount(item.value) }} USD</div>
              </div>
              <div v-if="index < incomeSummaryItems.length - 1" class="income-expenditure-v2__summary-breakdown-plus">
                <span>+</span>
              </div>
            </template>
          </div>
        </div>

        <div class="income-expenditure-v2__summary-panel">
          <div class="income-expenditure-v2__summary-panel-inner">
            <div class="income-expenditure-v2__summary-panel-label">
              {{ summaryPayoutLabel }}
            </div>
            <div class="income-expenditure-v2__summary-panel-total">
              {{ formatAmount(tableData.info?.payoutMoney) }}
              <span>USD</span>
            </div>
          </div>
          <div class="income-expenditure-v2__summary-breakdown">
            <template v-for="(item, index) in payoutSummaryItems" :key="item.label">
              <div class="income-expenditure-v2__summary-breakdown-item">
                <div class="income-expenditure-v2__summary-breakdown-label">
                  {{ item.label }}
                </div>
                <div class="income-expenditure-v2__summary-breakdown-value">{{ formatAmount(item.value) }} USD</div>
              </div>
              <div v-if="index < payoutSummaryItems.length - 1" class="income-expenditure-v2__summary-breakdown-plus">
                <span>+</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <section class="income-expenditure-v2__table-card">
      <TableV2
        v-loading="loading"
        :data="tableData.list"
        :total="paginationConfig.total"
        :pagination="pagination"
        show-pagination
        @update:pagination="handlePaginationChange"
      >
        <el-table-column min-width="220" prop="transTime">
          <template #header>
            <div class="income-expenditure-v2__th-with-icon">
              <span>{{ t('incomeExpenditure.transTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="income-expenditure-v2__help-icon" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <span>{{ row.transTime ? maoYunDayJs(row.transTime).format(FORMAT_TIME) : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="120" prop="incomeType" :label="t('incomeExpenditure.incomeType')">
          <template #default="{ row }">
            {{ query.selectOpts.find(i => i.value === row.incomeType)?.label }}
          </template>
        </el-table-column>

        <el-table-column min-width="120" prop="channel" :label="t('incomeExpenditure.channel')">
          <template #default="{ row }">
            {{ CHANNEL_MAP[row.channel] || '-' }}
          </template>
        </el-table-column>

        <el-table-column min-width="300" prop="description" :label="t('incomeExpenditure.description')" />

        <el-table-column min-width="110" :label="t('incomeExpenditure.enter')">
          <template #default="{ row }">
            <span v-if="row.moneyType === 1" class="income-expenditure-v2__amount is-income">
              +{{ formatAmount(row.money) }}
            </span>
            <span v-else>{{ EMPTY_TEXT }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="110" :label="t('incomeExpenditure.expenditure')">
          <template #default="{ row }">
            <span v-if="row.moneyType === 2" class="income-expenditure-v2__amount is-expense">
              -{{ formatAmount(row.money) }}
            </span>
            <span v-else>{{ EMPTY_TEXT }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="120" prop="transMonth" :label="t('incomeExpenditure.transMonth')" />

        <el-table-column min-width="120" :label="t('incomeExpenditure.freezePrice')">
          <template #default="{ row }">
            {{ formatAmount(row.freezeMoney) }}
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="t('incomeExpenditure.balance')">
          <template #default="{ row }">
            {{ formatAmount(row.balance) }}
          </template>
        </el-table-column>

        <el-table-column min-width="120" :label="t('incomeExpenditure.giveMoney')">
          <template #default="{ row }">
            {{ formatAmount(row.giveMoney) }}
          </template>
        </el-table-column>

        <el-table-column min-width="160" :label="t('incomeExpenditure.advancePayBalance')">
          <template #default="{ row }">
            {{ formatAmount(row.advanceMoney) }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" min-width="80" :label="t('common.operation')">
          <template #default="{ row }">
            <button
              v-if="isSeeDetail(row.incomeType)"
              class="income-expenditure-v2__action"
              type="button"
              @click="goDetail(row)"
            >
              {{ t('incomeExpenditure.detail') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { _incomeRecordList, _incomeRecordExport } from '@/apis/cost-center/income-expenditure'
import type { IncomeRecordExportReq, IncomeRecordListReq } from '@/apis/cost-center/income-expenditure/type'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import t from '@/utils/i18n'
import { maoYunDayJs, FORMAT_DAY_NO_UTC, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'
import type { IPagination } from '@/views/account-system/type'
import { CHANNEL_MAP, INCOME_TYPE_ARR_MAP, isSeeDetail } from '@/views/cost-center/income-expenditure/config'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

interface TableDataType {
  id: number
  incomeType: number
  channel: number
  description: string
  moneyType: number
  money: number
  giveMoney: number
  balance: number
  advanceMoney: number
  freezeMoney?: number
  transMonth: string
  transTime: string
  incomeSerialNo?: string
}

interface TableDataInfo {
  incomeMoney?: number
  payoutMoney?: number
  rechargeMoney?: number
  deductionMoney?: number
  refundMoney?: number
  freezeMoney?: number
  unfreezeMoney?: number
}

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const btnStyleMap = {
  [ja]: {
    width: '80px',
  },
  [en]: {
    width: '140px',
  },
  [zh]: {
    width: '80px',
  },
}

const btnStyle = useI18nStyle(btnStyleMap)
const pagination = computed(() => paginationConfig.pagination)
const EMPTY_TEXT = '--'

const btnsGroupList = [
  {
    label: t('incomeExpenditure.curMonth'),
    value: 'curMonth',
  },
  {
    label: t('incomeExpenditure.lastMonth'),
    value: 'lastMonth',
  },
]

const btnValue = ref<any>(btnsGroupList[0])

const shortcuts = [
  {
    text: t('incomeExpenditure.curMonth'),
    value: () => {
      const end = maoYunDayJs()
      const start = end.startOf('month')
      return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
    },
  },
  {
    text: t('incomeExpenditure.lastMonth'),
    value: () => {
      const end = maoYunDayJs().subtract(1, 'month')
      const start = end.startOf('month')
      return [start.format(FORMAT_DAY_NO_UTC), end.endOf('month').format(FORMAT_DAY_NO_UTC)]
    },
  },
  {
    text: t('incomeExpenditure.lastMonths'),
    value: () => {
      const end = maoYunDayJs()
      const start = end.subtract(1, 'month')
      return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
    },
  },
  {
    text: t('incomeExpenditure.lastThreeMonths'),
    value: () => {
      const end = maoYunDayJs()
      const start = end.subtract(3, 'month')
      return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
    },
  },
]

const defaultTime = shortcuts[0].value()
const dateTime = ref<any>(defaultTime)
const query = reactive<{
  selectOpts: any[]
  type: any
  show: boolean
}>({
  type: 0,
  selectOpts: INCOME_TYPE_ARR_MAP,
  show: false,
})
const tableData = reactive<{
  list: TableDataType[]
  info: TableDataInfo
}>({
  list: [],
  info: {},
})
const loading = ref(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const formatAmount = (value?: number | string | null) => {
  const amount = Number(value ?? 0)

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)
}

const stripUnitText = (label: string) => label.replace(/\s*[（(][^）)]*[）)]\s*/g, '').trim()

const summaryIncomeLabel = computed(() => stripUnitText(t('incomeExpenditure.enter')))
const summaryPayoutLabel = computed(() => stripUnitText(t('incomeExpenditure.expenditure')))

const incomeSummaryItems = computed(() => [
  {
    label: t('incomeExpenditure.rechargeMoney'),
    value: tableData.info?.rechargeMoney,
  },
  {
    label: t('incomeExpenditure.refund'),
    value: tableData.info?.refundMoney,
  },
  {
    label: t('incomeExpenditure.thaw'),
    value: tableData.info?.unfreezeMoney,
  },
])

const payoutSummaryItems = computed(() => [
  {
    label: t('incomeExpenditure.deductionMoney'),
    value: tableData.info?.deductionMoney,
  },
  {
    label: t('incomeExpenditure.freeze'),
    value: tableData.info?.freezeMoney,
  },
])

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const changeDate = (v: any) => {
  btnValue.value = v
  if (v.value === 'curMonth') {
    dateTime.value = shortcuts[0].value()
  } else {
    dateTime.value = shortcuts[1].value()
  }
}

const goDetail = (row: any) => {
  if (row.incomeType === 2) {
    pushRoute({
      name: 'expense_bill_bill_list',
      query: {
        active: 4,
        incomeSerialNo: row.incomeSerialNo,
      },
    })
  } else {
    pushRoute({
      name: 'income_expenditure_detail',
      params: {
        id: row.id,
        incomeType: row.incomeType,
      },
      query: {
        title: 'incomeExpenditure.incomeExpenditure',
        path: '/cost-center/income-expenditure/list',
      },
    })
  }
}

const download = async () => {
  const params: IncomeRecordExportReq = {
    beginDate: dateTime.value[0],
    endDate: dateTime.value[1],
    showZero: query.show ? 1 : 2,
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
  }
  if (query.type !== 0) {
    params.transType = query.type
  }

  const res = await _incomeRecordExport(params)
  if (res.success) {
    pushRoute({
      name: 'export',
      query: {
        type: 7,
      },
    })
  }
}

const getList = async () => {
  try {
    loading.value = true
    const params: IncomeRecordListReq = {
      beginDate: dateTime.value[0],
      endDate: dateTime.value[1],
      showZero: query.show ? 1 : 2,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    }

    if (query.type !== 0) {
      params.transType = query.type
    }

    const res = await _incomeRecordList(params)
    if (res.success) {
      tableData.info = {
        incomeMoney: res.data.incomeMoney,
        payoutMoney: res.data.payoutMoney,
        rechargeMoney: res.data.rechargeMoney,
        deductionMoney: res.data.deductionMoney,
        refundMoney: res.data.refundMoney,
        freezeMoney: res.data.freezeMoney,
        unfreezeMoney: res.data.unfreezeMoney,
      }
    }

    tableData.list = res.data?.list || []
    paginationConfig.total = res.data.recordCnt
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const handlePaginationChange = (nextPagination: { page: number; pageSize: number }) => {
  paginationConfig.pagination.page = nextPagination.page
  paginationConfig.pagination.pageSize = nextPagination.pageSize
  getList()
}

watch(dateTime, () => {
  const curMonthTime = shortcuts[0].value()
  const lastMonthTime = shortcuts[1].value()
  const isCurrentMonth = curMonthTime[0] === dateTime.value[0] && curMonthTime[1] === dateTime.value[1]
  const isLastMonth = lastMonthTime[0] === dateTime.value[0] && lastMonthTime[1] === dateTime.value[1]

  if (isCurrentMonth) {
    btnValue.value = btnsGroupList[0]
  } else if (isLastMonth) {
    btnValue.value = btnsGroupList[1]
  } else {
    btnValue.value = {}
  }

  paginationConfig.pagination.page = 1
  getList()
})

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.income-expenditure-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.income-expenditure-v2__notice-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.income-expenditure-v2__toolbar-card,
.income-expenditure-v2__summary-card,
.income-expenditure-v2__table-card {
  background: #fff;
  border: 1px solid #e8ecf3;
}

.income-expenditure-v2__toolbar-card {
  padding: 20px;
}

.income-expenditure-v2__toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.income-expenditure-v2__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.income-expenditure-v2__periods {
  display: inline-flex;
}

.income-expenditure-v2__period {
  min-width: 80px;
  height: 32px;
  padding: 0 22px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d8deeb;
}

.income-expenditure-v2__period + .income-expenditure-v2__period {
  margin-left: -1px;
}

.income-expenditure-v2__period:first-child {
  border-radius: 4px 0 0 4px;
}

.income-expenditure-v2__period:last-child {
  border-radius: 0 4px 4px 0;
}

.income-expenditure-v2__period.is-active {
  position: relative;
  z-index: 1;
  color: #06f;
  background: #fff;
  border-color: #06f;
}

.income-expenditure-v2__th-with-icon {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.income-expenditure-v2__help-icon {
  color: #b7c0cd;
}

.income-expenditure-v2__date-picker {
  width: 234px;
}

.income-expenditure-v2__select {
  width: 146px;
}

.income-expenditure-v2__checkbox {
  margin-left: 2px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.income-expenditure-v2__download {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 16px;
  color: #4c5461;
  border: 1px solid #d8deeb;
  border-radius: 0;
}

.income-expenditure-v2__summary-card {
  padding: 20px;
}

.income-expenditure-v2__summary-heading {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.income-expenditure-v2__summary-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.income-expenditure-v2__summary-panel {
  border: 1px solid #e8ecf3;
}

.income-expenditure-v2__summary-panel-inner {
  padding: 20px;
}

.income-expenditure-v2__summary-panel-label {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 24px;
  color: #191c23;
}

.income-expenditure-v2__summary-panel-total {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  font-size: 28px;
  font-weight: 600;
  line-height: 40px;
  color: #191c23;

  span {
    padding-bottom: 4px;
    font-size: 14px;
    line-height: 22px;
  }
}

.income-expenditure-v2__summary-breakdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafc;
  border-top: 1px solid #e8ecf3;
}

.income-expenditure-v2__summary-breakdown-item {
  display: flex;

  // flex: 1 1 0;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 14px 16px 12px;
}

.income-expenditure-v2__summary-breakdown-label {
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 22px;
  color: #98a2b3;
}

.income-expenditure-v2__summary-breakdown-value {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: #191c23;
}

.income-expenditure-v2__summary-breakdown-plus {
  display: flex;
  flex: 0 0 72px;
  align-items: center;
  justify-content: center;

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 18px;
    line-height: 1;
    color: #191c23;
  }
}

.income-expenditure-v2__table-card {
  padding: 20px;
}

.income-expenditure-v2__amount {
  font-weight: 500;

  &.is-income {
    color: #17b26a;
  }

  &.is-expense {
    color: #f04438;
  }
}

.income-expenditure-v2__action {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

@media (width <= 1200px) {
  .income-expenditure-v2__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .income-expenditure-v2__filters {
    flex-wrap: wrap;
  }

  .income-expenditure-v2__summary-card {
    padding: 24px 20px;
  }

  .income-expenditure-v2__summary-panels {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .income-expenditure-v2__toolbar-card,
  .income-expenditure-v2__summary-card,
  .income-expenditure-v2__table-card {
    padding: 16px;
  }

  .income-expenditure-v2__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .income-expenditure-v2__periods {
    width: 100%;
  }

  .income-expenditure-v2__period {
    width: 100% !important;
  }

  .income-expenditure-v2__date-picker,
  .income-expenditure-v2__select {
    width: 100%;
  }

  .income-expenditure-v2__summary-panel-inner {
    padding: 20px 18px 22px;
  }

  .income-expenditure-v2__summary-panel-total {
    gap: 8px;
    font-size: 40px;
  }

  .income-expenditure-v2__summary-breakdown,
  .income-expenditure-v2__summary-panel:last-child .income-expenditure-v2__summary-breakdown {
    flex-direction: column;
  }

  .income-expenditure-v2__summary-breakdown-item {
    padding: 16px 18px;
    border-top: 1px solid #e8ecf3;
  }

  .income-expenditure-v2__summary-breakdown-plus {
    flex: 0 0 24px;
  }
}
</style>
