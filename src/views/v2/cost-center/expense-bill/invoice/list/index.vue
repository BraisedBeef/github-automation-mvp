<template>
  <div class="invoice-list-v2">
    <PageBreadcrumbToolbar :items="[t('costCenterRoutes.invoice')]" @doc="openHelpDoc" />

    <InfoNotice class="invoice-list-v2__notice">
      <div class="invoice-list-v2__notice-list">
        <div class="invoice-list-v2__notice-item">
          <div>{{ t('invoice.invoiceTip1') }}</div>
          <div class="invoice-list-v2__notice-sub">
            {{ t('invoice.invoiceTip2') }}
          </div>
        </div>
        <div class="invoice-list-v2__notice-item">
          <div>{{ t('invoice.invoiceTip3') }}</div>
          <div class="invoice-list-v2__notice-sub">
            {{ t('invoice.invoiceTip4') }}
          </div>
        </div>
      </div>
    </InfoNotice>

    <section class="invoice-list-v2__summary">
      <div class="invoice-list-v2__summary-main">
        <div class="invoice-list-v2__summary-title">
          <span>{{ t('invoice.amountInvoice') }}</span>
          <el-tooltip placement="top" effect="light">
            <template #content>
              <p>{{ t('invoice.amountInvoiceTooltip1') }}</p>
              <p>{{ t('invoice.amountInvoiceTooltip2') }}</p>
              <p>{{ t('invoice.amountInvoiceTooltip3') }}</p>
            </template>
            <SvgIcon name="cat-cdn-warning" class="invoice-list-v2__summary-help" />
          </el-tooltip>
        </div>

        <div class="invoice-list-v2__summary-row">
          <div>
            <span class="invoice-list-v2__summary-price">${{ invoiceSummary.invoicableAmount }} </span>
            <span class="invoice-list-v2__summary-unit">USD</span>
          </div>

          <button class="invoice-list-v2__summary-link" type="button" @click="toInvoiceRecord">
            {{ t('invoice.record') }}
          </button>

          <button class="invoice-list-v2__summary-link" type="button" @click="toInvoiceManage">
            {{ t('invoice.mana') }}
          </button>
        </div>
      </div>
    </section>
    <ProcessSteps class="invoice-list-v2__steps" :steps="step.steps" :active="step.active" />
    <section class="invoice-list-v2__panel" :style="listWrapStyle">
      <div class="invoice-list-v2__toolbar">
        <div class="invoice-list-v2__tabs">
          <button
            class="invoice-list-v2__tab"
            :style="btnStyle"
            :class="{ 'is-active': invoice.active === 1 }"
            type="button"
            @click="handleTabActive(1)"
          >
            {{ t('invoice.consumption') }}
          </button>
          <button
            class="invoice-list-v2__tab"
            :style="btnStyle"
            :class="{ 'is-active': invoice.active === 2 }"
            type="button"
            @click="handleTabActive(2)"
          >
            {{ t('invoice.month') }}
          </button>
        </div>

        <div class="invoice-list-v2__filters">
          <div class="invoice-list-v2__time-label">
            <span>{{ t('common.select_time') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="invoice-list-v2__help-icon" />
            </el-tooltip>
          </div>

          <el-date-picker
            v-if="invoice.active === 1"
            v-model="consumptionTime"
            class="invoice-list-v2__date-picker"
            type="daterange"
            start-placeholder=""
            end-placeholder=""
            :shortcuts="consumptionShortcuts"
            :range-separator="t('export.to')"
            :clearable="false"
            value-format="YYYY-MM-DD"
          />

          <el-date-picker
            v-if="invoice.active === 2"
            v-model="monthTime"
            class="invoice-list-v2__date-picker"
            type="monthrange"
            start-placeholder=""
            end-placeholder=""
            :shortcuts="monthShortcuts"
            :range-separator="t('export.to')"
            :clearable="false"
            value-format="YYYY-MM"
          />

          <el-input v-model="condition" class="invoice-list-v2__search" :placeholder="t('invoice.searchPlaceholder')">
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <div v-show="invoice.active === 1" class="invoice-list-v2__table-wrap">
        <div class="invoice-list-v2__select-bar">
          <el-checkbox v-model="consumption.all" @change="() => handleAll(consumption.all)" />
          <span>{{ t('invoice.consumptionCheckAll', [consumption.paginationConfig.total]) }}</span>
        </div>

        <TableV2
          v-loading="consumption.loading"
          :data="consumption.list"
          :total="consumption.paginationConfig.total"
          :pagination="consumption.paginationConfig.pagination"
          show-pagination
          @update:pagination="handleConsumptionPaginationChange"
        >
          <el-table-column min-width="280">
            <template #header>
              <div class="invoice-list-v2__head-check">
                <el-checkbox :model-value="consumption.curPageAll" @click="changeCurPageAll(!consumption.curPageAll)" />
                <span>{{ t('invoice.billId') }}</span>
              </div>
            </template>
            <template #default="{ row }">
              <div class="invoice-list-v2__bill-cell">
                <el-checkbox
                  :disabled="row.disabled"
                  :model-value="row.checkStatus"
                  @click="changeCheckStatus(!row.checkStatus, row)"
                />
                <span>{{ row.billId || '-' }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column min-width="160" prop="productId" :label="t('invoice.productId')">
            <template #default="{ row }">
              <span>{{ row.productId || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="160" prop="resourceId" :label="t('invoice.resourceId')" />

          <el-table-column min-width="120" prop="taxRate" :label="t('invoice.taxRate')">
            <template #default="{ row }">
              <span>{{ row.taxRate || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="160" prop="costType" :label="t('invoice.costType')">
            <template #default="{ row }">
              {{ COST_TYPE_MAP[row.costType] }}
            </template>
          </el-table-column>

          <el-table-column min-width="240" prop="consumeTime">
            <template #header>
              <div class="invoice-list-v2__th-with-icon">
                <span>{{ t('invoice.consumeTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="invoice-list-v2__help-icon" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <span>{{ row?.consumeTime ? maoYunDayJs(row.consumeTime).format(FORMAT_TIME) : '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="160" prop="cashAmount" :label="t('invoice.cashAmounts')" />
          <el-table-column min-width="160" prop="invoicableAmount" :label="t('invoice.invoicableAmounts')" />
        </TableV2>
      </div>

      <div v-show="invoice.active === 2" class="invoice-list-v2__table-wrap">
        <div class="invoice-list-v2__select-bar">
          <el-checkbox v-model="month.all" @change="() => handleAll(month.all)" />
          <span>{{ t('invoice.monthCheckAll', [month.paginationConfig.total]) }}</span>
        </div>

        <TableV2
          v-loading="month.loading"
          :data="visibleMonthRows"
          :total="month.paginationConfig.total"
          :pagination="month.paginationConfig.pagination"
          show-pagination
          :row-class-name="getMonthRowClassName"
          :span-method="monthTableSpanMethod"
          @update:pagination="handleMonthPaginationChange"
        >
          <el-table-column min-width="260">
            <template #header>
              <div class="invoice-list-v2__head-check">
                <el-checkbox :model-value="month.curPageAll" @click="changeCurPageAll(!month.curPageAll)" />
                <span>{{ t('invoice.billPeriod') }}</span>
              </div>
            </template>
            <template #default="{ row }">
              <div v-if="isMonthDetailRow(row)" class="invoice-list-v2__detail-panel">
                <TableV2 class="invoice-list-v2__month-detail-table" :data="row.parentRow.list || []">
                  <el-table-column min-width="188" prop="productId" :label="t('invoice.productId')" />
                  <el-table-column min-width="188" prop="taxRate" :label="t('invoice.taxRate')">
                    <template #default="{ row: childRow }">
                      <span>{{ childRow.taxRate || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column min-width="188" prop="billingMode" :label="t('invoice.billingMode')">
                    <template #default="{ row: childRow }">
                      {{ COST_TYPE_MAP[childRow.billingMode] }}
                    </template>
                  </el-table-column>
                  <el-table-column min-width="152" prop="cashAmount" :label="t('invoice.originalPrice')" />
                  <el-table-column min-width="188" prop="invoicedAmount" :label="t('invoice.invoicedAmounts')" />
                  <el-table-column min-width="188" prop="invoicableAmount" :label="t('invoice.invoicableAmounts')" />
                </TableV2>
              </div>

              <div v-else class="invoice-list-v2__bill-cell">
                <button class="invoice-list-v2__expand-button" type="button" @click.stop="toggleMonthRowExpanded(row)">
                  <SvgIcon
                    name="table-tree-arrow"
                    class="invoice-list-v2__expand-icon"
                    :class="{ 'is-expanded': isMonthExpanded(row.id) }"
                  />
                </button>
                <el-checkbox
                  :disabled="row.disabled"
                  :model-value="row.checkStatus"
                  @click="changeCheckStatus(!row.checkStatus, row)"
                />
                <span>{{ formatTimeMonthBill(row.billPeriod) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column min-width="190" prop="cashAmount" :label="t('invoice.cashAmounts')" />
          <el-table-column min-width="190" prop="invoicableAmount" :label="t('invoice.invoicableAmount_actual')" />
          <el-table-column min-width="150" prop="invoicedAmount" :label="t('invoice.invoicedAmount')" />
          <el-table-column min-width="190" prop="invoicableAmount" :label="t('invoice.invoicableAmounts')" />
        </TableV2>
      </div>

      <div class="invoice-list-v2__footer-wrap">
        <div class="invoice-list-v2__footer">
          <el-button
            class="invoice-list-v2__footer-button"
            :type="invoiceAmountTotal - 0 > 0 ? 'primary' : ''"
            @click="next"
          >
            {{ t('invoice.applyInvoice') }}
          </el-button>
          <p class="invoice-list-v2__footer-text">
            <span>{{ t('invoice.amountInvoiced') }}</span>
            <span class="invoice-list-v2__footer-price">${{ invoiceAmountTotal }} USD</span>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { documentUrl } from '@/config/base-config'
import {
  _getInvoicableSummary,
  _getInvoicableResourceBill,
  _getInvoicableMonthBill,
  _preInvoice,
} from '@/apis/cost-center/expense-bill'
import { message } from '@/utils/message'
import {
  FORMAT_DAY_NO_UTC,
  FORMAT_MONTH_NO_UTC,
  FORMAT_TIME,
  ManipulateType,
  maoYunDayJs,
} from '@/utils/mao-yun-day-js'
import * as ExpenseBillType from '@/apis/cost-center/expense-bill/type'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { COST_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import ProcessSteps from '@/views/v2/account-system/components/process-steps.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { useTableV2DetailRows } from '@/views/v2/account-system/components/use-table-v2-detail-rows'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const btnStyleMap = {
  [ja]: {
    width: '210px',
  },
  [en]: {
    width: '250px',
  },
  [zh]: {
    width: '180px',
  },
}

const btnStyle = useI18nStyle(btnStyleMap)

const getDateTime = (value: number, unit: ManipulateType, formatStr: string) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(formatStr), end.format(formatStr)]
}

const step = ref({
  active: 'a',
  steps: [
    { label: t('invoice.step1'), value: 'a' },
    { label: t('invoice.step2'), value: 'b' },
    { label: t('invoice.step3'), value: 'c' },
    { label: t('invoice.step4'), value: 'd' },
  ],
})
const invoice = reactive({
  active: 1,
})

const consumptionShortcuts = [
  {
    text: t('order.oneWeek'),
    value: () => getDateTime(1, 'week', FORMAT_DAY_NO_UTC),
  },
  {
    text: t('order.oneMonth'),
    value: () => getDateTime(1, 'month', FORMAT_DAY_NO_UTC),
  },
  {
    text: t('order.threeMonth'),
    value: () => getDateTime(3, 'month', FORMAT_DAY_NO_UTC),
  },
]

const monthShortcuts = [
  {
    text: t('invoice.oneMonth'),
    value: () => getDateTime(1, 'month', FORMAT_MONTH_NO_UTC),
  },
  {
    text: t('invoice.threeMonth'),
    value: () => getDateTime(3, 'month', FORMAT_MONTH_NO_UTC),
  },
]

const defaultTimeConsumption = consumptionShortcuts[1].value()
const consumptionTime = ref<any>(defaultTimeConsumption)
const defaultTimeMonth = monthShortcuts[1].value()
const monthTime = ref<any>(defaultTimeMonth)
const condition = ref('')
const invoiceSummary = ref<any>({})

const consumption = reactive<{
  loading: boolean
  list: any[]
  all: boolean
  paginationConfig: IPagination
  selectList: any[]
  totalAmount: number
  curPageAll: boolean
  indeterminate: boolean
}>({
  loading: false,
  list: [],
  all: false,
  paginationConfig: {
    pagination: {
      pageSize: 10,
      page: 1,
    },
    total: 0,
  },
  selectList: [],
  totalAmount: 0,
  curPageAll: false,
  indeterminate: false,
})

const month = reactive<{
  loading: boolean
  list: any[]
  all: boolean
  paginationConfig: IPagination
  selectList: any[]
  totalAmount: number
  curPageAll: boolean
  indeterminate: boolean
}>({
  loading: false,
  list: [],
  all: false,
  paginationConfig: {
    pagination: {
      pageSize: 10,
      page: 1,
    },
    total: 0,
  },
  selectList: [],
  totalAmount: 0,
  curPageAll: false,
  indeterminate: false,
})

const monthMainRows = computed(() => {
  return month.list.map(row => ({
    ...row,
    id: row.billPeriod,
  }))
})

const {
  visibleRows: visibleMonthRows,
  isExpanded: isMonthExpanded,
  isDetailRow: isMonthDetailRow,
  toggleRowExpanded: toggleMonthRowExpanded,
} = useTableV2DetailRows(monthMainRows)

const listWrapStyle = computed(() => ({}))

const invoiceAmountTotal = computed(() => {
  return invoice.active === 1 ? consumption.totalAmount : month.totalAmount
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const toInvoiceRecord = () => {
  pushRoute({
    name: 'expense_bill_invoice_record',
    query: {
      title: 'invoice.invoicedMana',
      path: '/cost-center/expense-bill/invoice/list',
    },
  })
}

const toInvoiceManage = () => {
  pushRoute({
    name: 'expense_bill_invoice_manage',
    query: { title: 'invoice.invoice', path: '/cost-center/expense-bill/invoice/list' },
  })
}

const formatTimeMonthBill = (str: string) => {
  const arr = str.split('-')
  const year = arr[0]
  const monthValue = arr[1]
  return t('invoice.formatTimeMonthBill', [year, monthValue])
}

const handleConsumptionPaginationChange = async (pagination: { page: number; pageSize: number }) => {
  consumption.paginationConfig.pagination.page = pagination.page
  consumption.paginationConfig.pagination.pageSize = pagination.pageSize
  await changePagination()
}

const handleMonthPaginationChange = async (pagination: { page: number; pageSize: number }) => {
  month.paginationConfig.pagination.page = pagination.page
  month.paginationConfig.pagination.pageSize = pagination.pageSize
  await changePagination()
}

const changePagination = async () => {
  if (invoice.active === 1) {
    consumption.selectList = []
    consumption.curPageAll = consumption.all
    await getInvoicableResourceBill()
    preInvoice()
  } else {
    month.selectList = []
    month.curPageAll = month.all
    await getInvoicableMonthBill()
    preInvoice()
  }
}

const next = () => {
  const query: any = {
    invoiceType: invoice.active,
  }

  if (invoice.active === 1) {
    if (!consumption.all && !consumption.selectList.length) {
      return message.warning(t('invoice.selectWarn'))
    }

    if (consumption.all && !consumption.list.length) {
      return message.warning(t('invoice.noDataWarn'))
    }

    const billIds: string = consumption.all ? 'all' : consumption.selectList.map(el => el.billId).join('_')
    query.billIds = billIds
  }

  if (invoice.active === 2) {
    if (!month.all && !month.selectList.length) {
      return message.warning(t('invoice.selectWarn'))
    }

    if (month.all && !month.list.length) {
      return message.warning(t('invoice.noDataWarn'))
    }

    const months: string = month.all ? 'all' : month.selectList.map(el => el.billPeriod).join('_')
    query.months = months
  }

  if (invoiceAmountTotal.value - 0 > 0) {
    pushRoute({
      name: 'expense_bill_invoice_info',
      params: {
        price: invoiceAmountTotal.value,
      },
      query,
    })
  }
}

const handleTabActive = async (active: number) => {
  invoice.active = active
  condition.value = ''
}

const changeCheckStatus = (ischeck, row) => {
  if (invoice.active === 1) {
    if (consumption.all) return
    row.checkStatus = ischeck
    consumption.selectList = consumption.list.filter(el => el.checkStatus && !el.disabled)
    consumption.curPageAll = consumption.selectList.length === consumption.list.length
  } else {
    if (month.all) return
    row.checkStatus = ischeck
    month.selectList = month.list.filter(el => el.checkStatus && !el.disabled)
    month.curPageAll = month.selectList.length === month.list.length
  }

  preInvoice()
}

const changeCurPageAll = isCheck => {
  if (invoice.active === 1) {
    if (consumption.all) return
    consumption.curPageAll = isCheck
    consumption.list = consumption.list.map(el => ({
      ...el,
      checkStatus: isCheck,
    }))
    consumption.selectList = consumption.list.filter(el => el.checkStatus && !el.disabled)
    consumption.indeterminate = false
  } else {
    if (month.all) return
    month.curPageAll = isCheck
    month.list = month.list.map(el => ({
      ...el,
      checkStatus: isCheck,
    }))
    month.selectList = month.list.filter(el => el.checkStatus && !el.disabled)
    month.indeterminate = false
  }

  preInvoice()
}

const handleAll = isCheck => {
  if (invoice.active === 1) {
    consumption.list = consumption.list.map(el => ({
      ...el,
      checkStatus: isCheck,
    }))
    consumption.selectList = []
    consumption.curPageAll = isCheck
    consumption.indeterminate = false
  } else {
    month.list = month.list.map(el => ({
      ...el,
      checkStatus: isCheck,
    }))
    month.selectList = []
    month.curPageAll = isCheck
    month.indeterminate = false
  }

  preInvoice()
}

const preInvoice = () => {
  let params: ExpenseBillType.GetPreInvoiceReq = {
    invoiceType: invoice.active,
  }

  if (invoice.active === 1) {
    const billIds: any[] = consumption.all ? [] : consumption.selectList.map(el => el.billId)
    params.billIds = billIds
  } else {
    const months: any[] = month.all ? [] : month.selectList.map(el => el.billPeriod)
    params.months = months
  }

  const cb = async () => {
    const res = await _preInvoice(params)
    if (res.success) {
      if (invoice.active === 1) {
        consumption.totalAmount = res.data.totalAmount
      } else {
        month.totalAmount = res.data.totalAmount
      }
    }
  }

  if (invoice.active === 1) {
    if (!params.billIds?.length && !consumption.all) {
      consumption.totalAmount = 0
    } else {
      cb()
    }
  } else {
    if (!params.months?.length && !month.all) {
      month.totalAmount = 0
    } else {
      cb()
    }
  }
}

const getInvoicableSummary = async () => {
  const res = await _getInvoicableSummary()
  if (res.success) {
    invoiceSummary.value = res.data || {}
  }
}

const getInvoicableResourceBill = async () => {
  try {
    consumption.loading = true

    const startTime = consumptionTime.value[0]
    const endTime = consumptionTime.value[1]

    const res = await _getInvoicableResourceBill({
      startTime,
      endTime,
      pageIndex: consumption.paginationConfig.pagination.page,
      pageSize: consumption.paginationConfig.pagination.pageSize,
      billId: condition.value,
      productId: '',
    })

    if (res.success) {
      consumption.list = (res.data.list || []).map(el => {
        const checkStatus = consumption.all
        const disabled = el.invoicableAmount - 0 <= 0

        return {
          ...el,
          checkStatus,
          disabled,
        }
      })
      consumption.paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    consumption.loading = false
  }
}

const getInvoicableMonthBill = async () => {
  try {
    month.loading = true

    const startTime = monthTime.value[0]
    const endTime = monthTime.value[1]

    const res = await _getInvoicableMonthBill({
      startTime,
      endTime,
      pageIndex: month.paginationConfig.pagination.page,
      pageSize: month.paginationConfig.pagination.pageSize,
      billId: condition.value,
      productId: '',
    })

    if (res.success) {
      month.list = (res.data.list || []).map(el => {
        const checkStatus = month.all
        const disabled = el.invoicableAmount - 0 <= 0

        return {
          ...el,
          checkStatus,
          disabled,
        }
      })
      month.paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    month.loading = false
  }
}

const monthTableSpanMethod = ({ row, columnIndex }) => {
  if (!isMonthDetailRow(row)) {
    return [1, 1]
  }

  if (columnIndex === 0) {
    return [1, 5]
  }

  return [0, 0]
}

const getMonthRowClassName = ({ row }) => {
  return isMonthDetailRow(row) ? 'invoice-list-v2__row--detail' : 'invoice-list-v2__row--main'
}

watch(condition, () => {
  invoice.active === 1 ? getInvoicableResourceBill() : getInvoicableMonthBill()
})

watch(consumptionTime, () => {
  getInvoicableResourceBill()
})

watch(monthTime, () => {
  getInvoicableMonthBill()
})

watch(monthTime, (newValue, oldValue) => {
  if (newValue && newValue.length === 2) {
    const monthsBetween = newValue[1].getMonth() - newValue[0].getMonth() + 1
    if (monthsBetween > 5) {
      message.warning(t('invoice.monthsBetweenWarn'))
      monthTime.value = oldValue
    }
  }
})

onMounted(async () => {
  getInvoicableSummary()
  await getInvoicableResourceBill()
  await getInvoicableMonthBill()
})
</script>

<style scoped lang="scss">
.invoice-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  background: #f2f4f7;
}

.invoice-list-v2__notice-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invoice-list-v2__notice-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.invoice-list-v2__notice-sub {
  padding-left: 18px;
}

.invoice-list-v2__summary {
  display: flex;
  align-items: stretch;
  min-height: 118px;
  padding: 20px;
  background: #fff;
  background-image: url('../../../../../../assets/images/cost-center/invoice/bg.png');
  background-repeat: no-repeat;
  background-position: right center;
}

.invoice-list-v2__summary-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invoice-list-v2__summary-title {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 16px;
  line-height: 22px;
  color: #191c23;
}

.invoice-list-v2__summary-help {
  width: 17px;
  height: 17px;
}

.invoice-list-v2__summary-row {
  display: flex;
  gap: 24px;
  align-items: baseline;
}

.invoice-list-v2__summary-price {
  font-size: 32px;
  line-height: 40px;
  color: #191c23;
}

.invoice-list-v2__summary-unit {
  padding-left: 10px;

  /* Body/中 */
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  color: #191c23;
}

.invoice-list-v2__summary-link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.invoice-list-v2__panel {
  position: relative;
  padding: 20px 20px 0;
  background: #fff;
}

.invoice-list-v2__toolbar {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.invoice-list-v2__tabs {
  display: inline-flex;
}

.invoice-list-v2__tab {
  height: 34px;
  padding: 0 20px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.invoice-list-v2__tab + .invoice-list-v2__tab {
  margin-left: -1px;
}

// .invoice-list-v2__tab:first-child {
//   border-radius: 4px 0 0 4px;
// }

// .invoice-list-v2__tab:last-child {
//   border-radius: 0 4px 4px 0;
// }

.invoice-list-v2__tab.is-active {
  position: relative;
  z-index: 1;
  color: #06f;
  background: #f5f8ff;
  border-color: #06f;
}

.invoice-list-v2__filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.invoice-list-v2__time-label,
.invoice-list-v2__th-with-icon,
.invoice-list-v2__head-check {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.invoice-list-v2__time-label {
  flex-shrink: 0;
}

.invoice-list-v2__help-icon {
  color: #b7c0cd;
}

.invoice-list-v2__date-picker,
.invoice-list-v2__search {
  width: 240px;
}

.invoice-list-v2__select-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 50px;
  padding: 0 16px;
  border-top: 1px solid #e8ecf3;
  border-bottom: 1px solid #e8ecf3;
}

.invoice-list-v2__bill-cell {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 56px;
}

.invoice-list-v2__expand-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.invoice-list-v2__expand-icon {
  width: 6px;
  height: 10px;
  color: #191c23;
  transition: transform 0.2s ease;
}

.invoice-list-v2__expand-icon.is-expanded {
  transform: rotate(90deg);
}

.invoice-list-v2__detail-panel {
  padding: 20px;
}

.invoice-list-v2__month-detail-table {
  border: 1px solid #e8ecf3;
}

.invoice-list-v2__footer-wrap {
  margin-top: 20px;
  border-top: 1px solid #e8ecf3;
}

.invoice-list-v2__footer {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 76px;
  padding: 16px 0;
  background: #fff;
}

.invoice-list-v2__footer-button {
  min-width: 88px;
}

.invoice-list-v2__footer-text {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin: 0;
  font-size: 12px;
  line-height: 22px;
}

.invoice-list-v2__footer-price {
  font-size: 24px;
  line-height: 40px;
  color: #ff8a00;
}

// .invoice-list-v2 :deep(.invoice-list-v2__row--detail td.el-table__cell) {
//   padding: 0 !important;
//   background: #fff;
// }

// .invoice-list-v2 :deep(.invoice-list-v2__row--detail td.el-table__cell .cell) {
//   display: block;
//   padding: 0 !important;
// }

.invoice-list-v2 :deep(.invoice-list-v2__row--main:hover > td.el-table__cell) {
  background: #f9fbff;
}

@media (width <= 1200px) {
  .invoice-list-v2__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .invoice-list-v2__filters {
    flex-wrap: wrap;
  }
}

@media (width <= 768px) {
  .invoice-list-v2__summary {
    padding: 16px;
    background-image: none;
  }

  .invoice-list-v2__summary-row {
    flex-wrap: wrap;
  }

  .invoice-list-v2__summary-price {
    font-size: 28px;
    line-height: 32px;
  }

  .invoice-list-v2__panel {
    padding: 16px 16px 0;
  }

  .invoice-list-v2__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .invoice-list-v2__date-picker,
  .invoice-list-v2__search {
    width: 100%;
  }

  .invoice-list-v2__footer {
    gap: 12px;
    padding: 0 16px;
  }

  .invoice-list-v2__footer-text {
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
  }

  .invoice-list-v2__footer-price {
    font-size: 24px;
    line-height: 32px;
  }
}
</style>
