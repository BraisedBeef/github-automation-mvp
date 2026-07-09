<template>
  <div class="invoice-record-v2">
    <PageBreadcrumbToolbar :items="[t('invoice.invoicedMana'), t('invoice.record')]" @doc="openHelpDoc" />

    <InfoNotice class="invoice-record-v2__notice">
      <div>{{ t('invoice.recordTip') }}</div>
    </InfoNotice>

    <section class="invoice-record-v2__panel">
      <div class="invoice-record-v2__toolbar">
        <p class="invoice-record-v2__summary">
          {{ t('invoice.recordDesc', [summary.invoiceCount || 0, summary.invoiceAmount || 0]) }}
        </p>

        <div class="invoice-record-v2__filters">
          <div class="invoice-record-v2__time-label">
            <span>{{ t('common.select_time') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="invoice-record-v2__help-icon" />
            </el-tooltip>
          </div>

          <el-date-picker
            v-model="dateTime"
            class="invoice-record-v2__date-picker"
            type="daterange"
            start-placeholder=""
            end-placeholder=""
            :shortcuts="shortcuts"
            :range-separator="t('export.to')"
            :clearable="false"
            value-format="YYYY-MM-DD"
          />

          <el-input
            v-model="condition"
            class="invoice-record-v2__search"
            :placeholder="t('invoice.recordSeacrchPlaceholder')"
          >
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <TableV2
        v-loading="loading"
        :data="list"
        :total="paginationConfig.total"
        :pagination="paginationConfig.pagination"
        show-pagination
        class="invoice-record-v2__table"
        @update:pagination="handlePaginationChange"
      >
        <el-table-column min-width="180">
          <template #header>
            <div class="invoice-record-v2__th-with-icon">
              <span>{{ t('invoice.applyTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="invoice-record-v2__help-icon" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <span>{{ row.applyTime ? maoYunDayJs(row.applyTime).format(FORMAT_TIME) : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="applyType" :label="t('invoice.applyType')" min-width="130">
          <template #default="{ row }">
            <span>{{ INVOICE_APPLY_TYPE_MAP[row.applyType] || t('invoice.other') }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="companyName" :label="t('invoice.companyName')" min-width="160" />

        <el-table-column prop="invoiceType" :label="t('invoice.invoiceType')" min-width="120">
          <template #default="{ row }">
            <span>{{ INVOICE_TYPE_MAP[row.invoiceType] || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="invoiceMedium" :label="t('invoice.invoiceMedium')" min-width="120">
          <template #default="{ row }">
            <span>{{ INVOICE_MEDIUM_MAP[row.invoiceMedium] || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="invoiceNo" :label="t('invoice.invoiceNo')" min-width="220" />

        <el-table-column prop="invoiceAmount" :label="t('invoice.invoiceAmount')" min-width="120" />

        <el-table-column prop="invoiceStatus" :label="t('invoice.invoiceStatus')" min-width="90">
          <template #default="{ row }">
            <span class="invoice-record-v2__status" :class="invoiceStatusClassMap[row.invoiceStatus] || ''">
              <span v-if="row.invoiceStatus === 1" class="invoice-record-v2__status-dot" />
              {{ INVOICE_STATUS_MAP[row.invoiceStatus] || '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column :label="t('common.operation')" :min-width="optTableColMinWidth" fixed="right">
          <template #default="{ row }">
            <button class="invoice-record-v2__link" type="button" @click="download(row.fileUrl)">
              {{ t('invoice.download') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { documentUrl } from '@/config/base-config'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { _getInvoiceRecord, _getInvoiceSummary } from '@/apis/cost-center/expense-bill'
import { FORMAT_DAY_NO_UTC, FORMAT_TIME, ManipulateType, maoYunDayJs } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import type { IPagination } from '@/views/account-system/type'
import {
  INVOICE_APPLY_TYPE_MAP,
  INVOICE_MEDIUM_MAP,
  INVOICE_STATUS_MAP,
  INVOICE_TYPE_MAP,
} from '@/views/cost-center/expense-bill/config'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const optTableColMinWidthMap = {
  [ja]: 180,
  [en]: 220,
  [zh]: 132,
}

const optTableColMinWidth = useI18nStyle(optTableColMinWidthMap)

const getDateTime = (value: number, unit: ManipulateType) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
}

const shortcuts = [
  {
    text: t('invoice.oneWeek'),
    value: () => getDateTime(1, 'week'),
  },
  {
    text: t('invoice.oneMonth'),
    value: () => getDateTime(1, 'month'),
  },
  {
    text: t('invoice.threeMonth'),
    value: () => getDateTime(3, 'month'),
  },
]

const defaultTime = shortcuts[0].value()
const loading = ref(false)
const dateTime = ref<any>(defaultTime)
const condition = ref('')
const list = ref<any[]>([])
const summary = ref<Record<string, any>>({})
const timeId = ref<number | null>(null)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const invoiceStatusClassMap: Record<number, string> = {
  1: 'is-success',
  2: 'is-error',
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const download = (url: string) => {
  if (url) {
    window.open(url)
    return
  }

  message.warning(t('export.downloadFail'))
}

const getInvoiceRecord = async () => {
  try {
    loading.value = true

    const res = await _getInvoiceRecord({
      startTime: dateTime.value[0],
      endTime: dateTime.value[1],
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      invoiceNo: condition.value,
    })

    if (res.success) {
      list.value = res.data.list || []
      paginationConfig.total = res.data.recordCnt
    }
  } finally {
    loading.value = false
  }
}

const getInvoiceSummary = async () => {
  const res = await _getInvoiceSummary()

  if (res.success) {
    summary.value = res.data || {}
  }
}

const handlePaginationChange = (nextPagination: { page: number; pageSize: number }) => {
  paginationConfig.pagination.page = nextPagination.page
  paginationConfig.pagination.pageSize = nextPagination.pageSize
  getInvoiceRecord()
}

watch(condition, () => {
  paginationConfig.pagination.page = 1
  getInvoiceRecord()
})

watch(dateTime, () => {
  paginationConfig.pagination.page = 1
  getInvoiceRecord()
})

onMounted(() => {
  getInvoiceRecord()
  getInvoiceSummary()

  timeId.value = window.setInterval(() => {
    getInvoiceRecord()
    getInvoiceSummary()
  }, 3 * 1000)
})

onBeforeUnmount(() => {
  if (timeId.value) {
    clearInterval(timeId.value)
  }
})
</script>

<style scoped lang="scss">
.invoice-record-v2 {
  display: flex;
  flex-direction: column;
}

.invoice-record-v2__notice {
  margin: 16px 0;
}

.invoice-record-v2__panel {
  padding: 20px;
  background: #fff;
}

.invoice-record-v2__toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.invoice-record-v2__summary {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.invoice-record-v2__filters {
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
  align-items: center;
}

.invoice-record-v2__time-label,
.invoice-record-v2__th-with-icon {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.invoice-record-v2__help-icon {
  color: #b7c0cd;
}

.invoice-record-v2__date-picker {
  width: 252px;
}

.invoice-record-v2__search {
  width: 254px;
}

.invoice-record-v2__table {
  :deep(.account-table-v2__footer) {
    justify-content: space-between;
  }
}

.invoice-record-v2__status {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  color: #191c23;

  &.is-success {
    color: #17b26a;
  }

  &.is-error {
    color: #f04438;
  }
}

.invoice-record-v2__status-dot {
  width: 6px;
  height: 6px;
  background: currentcolor;
  border-radius: 50%;
}

.invoice-record-v2__link {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

@media (width <= 1200px) {
  .invoice-record-v2__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .invoice-record-v2__filters {
    flex-wrap: wrap;
  }
}

@media (width <= 768px) {
  .invoice-record-v2__panel {
    padding: 16px;
  }

  .invoice-record-v2__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .invoice-record-v2__date-picker,
  .invoice-record-v2__search {
    width: 100%;
  }
}
</style>
