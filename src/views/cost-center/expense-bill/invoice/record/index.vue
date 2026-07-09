<template>
  <div class="wrap">
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <el-card shadow="never" class="list-wrap page-box" :body-style="bodyStyle">
      <div class="df ac jsb">
        <p class="desc">
          {{ t('invoice.recordDesc', [summary.invoiceCount, summary.invoiceAmount]) }}
        </p>

        <div class="df ac">
          <div class="df ac mr10">
            <span class="mr10">{{ t('common.select_time') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>

          <!-- 日期选择范围 -->
          <el-date-picker
            v-model="dateTime"
            style="width: 260px"
            class="mr10"
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
            style="width: 260px"
            :placeholder="t('invoice.recordSeacrchPlaceholder')"
            :suffix-icon="Search"
          />
        </div>
      </div>
      <el-table v-loading="loading" :data="list" class="mt20 table" show-overflow-tooltip>
        <!-- 申请开票时间 -->
        <el-table-column min-width="200" prop="applyTime" :label="t('invoice.applyTime')">
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('invoice.applyTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <span>{{ row.applyTime ? maoYunDayJs(row.applyTime).format(FORMAT_TIME) : '-' }}</span>
          </template>
        </el-table-column>
        <!-- 申请开票方式 -->
        <el-table-column min-width="300" prop="applyType" :label="t('invoice.applyType')">
          <template #default="{ row }">
            <span>{{ INVOICE_APPLY_TYPE_MAP[row.applyType] || t('invoice.other') }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="200" prop="companyName" :label="t('invoice.companyName')" />
        <!-- 发票类型 -->
        <el-table-column min-width="200" prop="invoiceType" :label="t('invoice.invoiceType')">
          <template #default="{ row }">
            <span>{{ INVOICE_TYPE_MAP[row.invoiceType] }}</span>
          </template>
        </el-table-column>
        <!-- 发票介质 -->
        <el-table-column min-width="200" prop="invoiceMedium" :label="t('invoice.invoiceMedium')">
          <template #default="{ row }">
            <span>{{ INVOICE_MEDIUM_MAP[row.invoiceMedium] }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="300" prop="invoiceNo" :label="t('invoice.invoiceNo')" />
        <!-- 发票金额 -->
        <el-table-column min-width="200" prop="invoiceAmount" :label="t('invoice.invoiceAmount')" />
        <!-- 状态 -->
        <el-table-column min-width="100" prop="invoiceStatus" :label="t('invoice.invoiceStatus')">
          <template #default="{ row }">
            <span v-if="row.invoiceStatus === 0">{{ INVOICE_STATUS_MAP[row.invoiceStatus] }}</span>
            <span v-if="row.invoiceStatus === 1" class="text-success"
              >{{ INVOICE_STATUS_MAP[row.invoiceStatus] }}
            </span>
            <span v-if="row.invoiceStatus === 2" class="text-error">{{ INVOICE_STATUS_MAP[row.invoiceStatus] }}</span>
            <span v-if="row.invoiceStatus === 3">{{ INVOICE_STATUS_MAP[row.invoiceStatus] }}</span>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column :min-width="optTableColMinWidth" fixed="right" :label="t('common.operation')">
          <template #default="{ row }">
            <span class="text-primary cursor-pointer" @click="download(row.fileUrl)">{{ t('invoice.download') }}</span>
          </template>
        </el-table-column>
      </el-table>

      <CatPagination
        v-model:pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        :custom-keys="['page', 'pageSize']"
        @change="paginationChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { message } from '@/utils/message'
import { Search } from '@element-plus/icons-vue'
import { _getInvoiceSummary, _getInvoiceRecord } from '@/apis/cost-center/expense-bill'
import {
  maoYunDayJs,
  ManipulateType,
  FORMAT_MONTH_NO_UTC,
  FORMAT_TIME,
  FORMAT_DAY_NO_UTC,
} from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import {
  INVOICE_TYPE_MAP,
  INVOICE_APPLY_TYPE_MAP,
  INVOICE_MEDIUM_MAP,
  INVOICE_STATUS_MAP,
} from '@/views/cost-center/expense-bill/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const optTableColMinWidthMap = {
  [ja]: 200,
  [en]: 250,
  [zh]: 150,
}

const optTableColMinWidth = useI18nStyle(optTableColMinWidthMap)

const bodyStyle = { height: '100%' }
const loading = ref<boolean>(false)
// 获取时间
const getDateTime = (value: number, unit: ManipulateType) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
}
const shortcuts = [
  {
    text: t('invoice.oneWeek'), // 最近一周
    value: () => {
      return getDateTime(1, 'week')
    },
  },
  {
    text: t('invoice.oneMonth'), // 最近一个月
    value: () => {
      return getDateTime(1, 'month')
    },
  },
  {
    text: t('invoice.threeMonth'), // 最近三个月
    value: () => {
      return getDateTime(3, 'month')
    },
  },
]
// 日期选择范围
const defaultTime = shortcuts[0].value()
const dateTime = ref<any>(defaultTime)
const list = ref<any[]>([]) // 列表
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const condition = ref<string>('') // 查询条件
const summary = ref<any>({}) // 合计
const timeId = ref<any>(null) // 定时器

const tips = computed(() => [
  {
    main: t('invoice.recordTip'),
  },
])

// 分页
const paginationChange = () => {
  getInvoiceRecord()
}

// 点击下载
const download = url => {
  if (url) {
    window.open(url)
    // message.success(t('export.downloadSuccess'))
  } else {
    message.warning(t('export.downloadFail'))
  }
}

// 开票记录
const getInvoiceRecord = async () => {
  const startTime = dateTime.value[0]
  const endTime = dateTime.value[1]

  const res = await _getInvoiceRecord({
    startTime,
    endTime,
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    invoiceNo: condition.value,
  })

  // console.log(`_getInvoiceRecord===>`, res)
  if (res.success) {
    list.value = res.data.list || []
    paginationConfig.total = res.data.recordCnt
  }
}

// 合并汇总
const getInvoiceSummary = async () => {
  const res = await _getInvoiceSummary()
  console.log(`getInvoiceSummary===>`, res)
  if (res.success) {
    summary.value = res.data || {}
  }
}

// 条件
watch(condition, () => {
  getInvoiceRecord()
})

onMounted(() => {
  getInvoiceRecord()
  getInvoiceSummary()
  // 轮询
  timeId.value = setInterval(() => {
    getInvoiceRecord()
    getInvoiceSummary()
  }, 3 * 1000)
})

onBeforeUnmount(() => {
  clearInterval(timeId.value)
})
</script>

<style lang="scss" scoped>
.wrap {
  .list-wrap {
    .desc {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;

      // font-weight: 500;
      color: var(--primary-text);
    }
  }
}
</style>
