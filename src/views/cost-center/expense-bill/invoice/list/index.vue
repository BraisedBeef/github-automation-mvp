<template>
  <div class="wrap">
    <!-- tip -->
    <Tip :text="tips" type="ManyToMany" />

    <el-card shadow="never" class="cost-wrap page-box mb20" :body-style="bodyStyle">
      <div class="title mb10">
        <div class="df ac">
          <span class="mr4">{{ t('invoice.amountInvoice') }}</span
          ><el-tooltip placement="top" effect="light">
            <template #content>
              <p>{{ t('invoice.amountInvoiceTooltip1') }}</p>
              <p>{{ t('invoice.amountInvoiceTooltip2') }}</p>
              <p>{{ t('invoice.amountInvoiceTooltip3') }}</p>
            </template>
            <SvgIcon name="cat-cdn-warning" style="width: 17px; height: 17px" />
          </el-tooltip>
        </div>
      </div>

      <div>
        <!-- 可开票金额 -->
        <span class="invoicableAmount mr20">${{ invoiceSummary.invoicableAmount }} USD</span>
        <span
          class="text-primary text-14 cursor-pointer mr20"
          @click="
            pushRoute({
              name: 'expense_bill_invoice_record',
              query: {
                title: 'invoice.invoicedMana',
                path: '/cost-center/expense-bill/invoice/list',
              },
            })
          "
          >{{ t('invoice.record') }}</span
        >

        <span
          class="text-primary text-14 cursor-pointer"
          @click="
            pushRoute({
              name: 'expense_bill_invoice_manage',
              query: { title: 'invoice.invoice', path: '/cost-center/expense-bill/invoice/list' },
            })
          "
          >{{ t('invoice.mana') }}</span
        >
      </div>
    </el-card>

    <el-card shadow="never" class="list-wrap page-box mb20" :body-style="{ ...bodyStyle, ...listWrapStyle }">
      <div class="step-wrap df ac mb20">
        <CatStep
          v-model="step.active"
          :default-highlight="true"
          class="df jc mt20"
          :steps="step.steps"
          :v-change="false"
          :step-item-style="{
            mixWidth: '200px',
          }"
        />
      </div>

      <div class="df ac jsb">
        <!-- date -->
        <div class="btn-wrap df cursor-pointer">
          <div
            class="btn left"
            :style="btnStyle"
            :class="invoice.active === 1 ? 'actived' : ''"
            @click="() => handleTabActive(1)"
          >
            {{ t('invoice.consumption') }}
          </div>
          <div
            class="btn right"
            :style="btnStyle"
            :class="invoice.active === 2 ? 'actived' : ''"
            @click="() => handleTabActive(2)"
          >
            {{ t('invoice.month') }}
          </div>
        </div>

        <div class="df ac">
          <div class="df ac mr10">
            <span class="mr10">{{ t('common.select_time') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
          <!-- 消费明细日期选择范围 -->
          <el-date-picker
            v-if="invoice.active === 1"
            v-model="consumptionTime"
            style="width: 260px"
            class="mr20"
            type="daterange"
            start-placeholder=""
            end-placeholder=""
            :shortcuts="consumptionShortcuts"
            :range-separator="t('export.to')"
            :clearable="false"
            value-format="YYYY-MM-DD"
          />
          <!-- 按月账单日期选择范围 -->
          <el-date-picker
            v-if="invoice.active === 2"
            v-model="monthTime"
            style="width: 260px"
            class="mr20"
            type="monthrange"
            start-placeholder=""
            end-placeholder=""
            :shortcuts="monthShortcuts"
            :range-separator="t('export.to')"
            :clearable="false"
            value-format="YYYY-MM"
          />
          <!-- 后端模糊查询只支持查询订单号 -->
          <el-input
            v-model="condition"
            style="width: 260px"
            :placeholder="t('invoice.searchPlaceholder')"
            :suffix-icon="Search"
          />
        </div>
      </div>
      <!-- 按消费明细开票 -->
      <div v-show="invoice.active === 1">
        <div v-show="invoice.active === 1" class="select-all mt20 df ac">
          <div class="pl20" style="width: 40px">
            <!-- 跨分页勾选 -->
            <el-checkbox v-model="consumption.all" @change="() => handleAll(consumptionTableRef, consumption.all)" />
          </div>
          <span class="pl20">{{ t('invoice.consumptionCheckAll', [consumption.paginationConfig.total]) }}</span>
        </div>
        <el-table ref="consumptionTableRef" v-loading="consumption.loading" :data="consumption.list">
          <el-table-column width="40">
            <template #header>
              <div
                :style="{
                  cursor: consumption.all ? '' : '',
                }"
              >
                <!-- 当前页勾选 -->
                <el-checkbox :model-value="consumption.curPageAll" @click="changeCurPageAll(!consumption.curPageAll)" />
              </div>
            </template>
            <template #default="{ row }">
              <div
                :style="{
                  cursor: consumption.all || row.disabled ? '' : '',
                }"
              >
                <!-- 当前行勾选 -->
                <el-checkbox
                  :disabled="row.disabled"
                  :model-value="row.checkStatus"
                  @click="changeCheckStatus(!row.checkStatus, row)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="280" prop="billId" :label="t('invoice.billId')" />
          <!-- 资源id -->
          <el-table-column min-width="160" prop="productId" :label="t('invoice.productId')">
            <template #default="{ row }">
              <span>{{ row.productId || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="160" prop="resourceId" :label="t('invoice.resourceId')" />
          <el-table-column min-width="160" prop="taxRate" :label="t('invoice.taxRate')">
            <template #default="{ row }">
              <span>{{ row.taxRate || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="160" prop="costType" :label="t('invoice.costType')">
            <template #default="{ row }">
              {{ COST_TYPE_MAP[row.costType] }}
            </template>
          </el-table-column>
          <!-- 订单扣费时间 -->
          <el-table-column min-width="220" prop="consumeTime" :label="t('invoice.consumeTime')">
            <template #header>
              <div class="df ac">
                <span>{{ t('invoice.consumeTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row?.consumeTime ? maoYunDayJs(row.consumeTime).format(FORMAT_TIME) : '' }}</div>
            </template>
          </el-table-column>
          <el-table-column min-width="180" prop="cashAmount" :label="t('invoice.cashAmounts')" />
          <el-table-column min-width="180" prop="invoicableAmount" :label="t('invoice.invoicableAmounts')" />
        </el-table>

        <CatPagination
          v-model:pagination="consumption.paginationConfig.pagination"
          :total="consumption.paginationConfig.total"
          :custom-keys="['page', 'pageSize']"
          @change="changePagination"
        />
      </div>
      <!-- 按月账单汇总开单 -->
      <div v-show="invoice.active === 2">
        <div v-show="invoice.active === 2" class="select-all mt20 df ac">
          <div class="pl20" style="width: 40px">
            <el-checkbox v-model="month.all" @change="() => handleAll(monthTableRef, month.all)" />
          </div>
          <span class="pl20">{{ t('invoice.monthCheckAll', [month.paginationConfig.total]) }}</span>
        </div>

        <el-table ref="monthTableRef" v-loading="month.loading" :data="month.list">
          <!-- 展开行 -->
          <el-table-column type="expand" width="40">
            <template #default="{ row }">
              <div class="expand-wrap">
                <el-table :data="row.list" class="subTable" show-overflow-tooltip>
                  <el-table-column prop="productId" min-width="200" :label="t('invoice.productId')" />
                  <el-table-column prop="taxRate" min-width="150" :label="t('invoice.taxRate')">
                    <template #default="{ row }">
                      <span>{{ row.taxRate || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="billingMode" min-width="200" :label="t('invoice.billingMode')">
                    <template #default="{ row }">
                      {{ COST_TYPE_MAP[row.billingMode] }}
                    </template>
                  </el-table-column>
                  <!-- 实际可开票余额 -->
                  <el-table-column prop="cashAmount" min-width="250" :label="t('invoice.originalPrice')" />
                  <el-table-column prop="invoicedAmount" min-width="200" :label="t('invoice.invoicedAmounts')" />
                  <el-table-column prop="invoicableAmount" min-width="200" :label="t('invoice.invoicableAmounts')" />
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="40">
            <template #header>
              <div
                :style="{
                  cursor: month.all ? '' : '',
                }"
              >
                <!-- 当前页勾选 -->
                <el-checkbox :model-value="month.curPageAll" @click="changeCurPageAll(!month.curPageAll)" />
              </div>
            </template>
            <template #default="{ row }">
              <div
                :style="{
                  cursor: month.all || row.disabled ? '' : '',
                }"
              >
                <!-- 当前行勾选 -->
                <el-checkbox
                  :disabled="row.disabled"
                  :model-value="row.checkStatus"
                  @click="changeCheckStatus(!row.checkStatus, row)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="300" prop="billPeriod" :label="t('invoice.billPeriod')">
            <template #default="{ row }">
              {{ formatTimeMonthBill(row.billPeriod) }}
            </template>
          </el-table-column>
          <el-table-column min-width="200" prop="cashAmount" :label="t('invoice.cashAmounts')" />
          <el-table-column min-width="200" prop="invoicableAmount" :label="t('invoice.invoicableAmount_actual')" />
          <el-table-column min-width="200" prop="invoicedAmount" :label="t('invoice.invoicedAmount')" />
          <el-table-column min-width="200" prop="invoicableAmount" :label="t('invoice.invoicableAmounts')" />
        </el-table>

        <CatPagination
          v-model:pagination="month.paginationConfig.pagination"
          :total="month.paginationConfig.total"
          :custom-keys="['page', 'pageSize']"
          @change="changePagination"
        />
      </div>

      <!-- 开票 -->
      <div class="invoice-wrap shadow" :style="invoiceWrapStyle">
        <div class="invoice w-full h-full df jsb ac page-box">
          <p class="text-14">
            <span class="mr4">{{ t('invoice.amountInvoiced') }} </span
            ><span class="price-text text-24">${{ invoiceAmountTotal }} USD</span>
          </p>
          <el-button :type="invoiceAmountTotal - 0 > 0 ? 'primary' : ''" @click="next">
            {{ t('invoice.applyInvoice') }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { message } from '@/utils/message'
import { Search } from '@element-plus/icons-vue'
import type { CSSProperties } from 'vue'
import {
  _getInvoicableSummary,
  _getInvoicableResourceBill,
  _getInvoicableMonthBill,
  _preInvoice,
} from '@/apis/cost-center/expense-bill'
import {
  maoYunDayJs,
  ManipulateType,
  FORMAT_TIME,
  FORMAT_MONTH_NO_UTC,
  FORMAT_DAY_NO_UTC,
} from '@/utils/mao-yun-day-js'
import * as ExpenseBillType from '@/apis/cost-center/expense-bill/type'
import t from '@/utils/i18n'
import { useBaseStore } from '@/store'

import { IPagination } from '@/views/account-system/type'
import { COST_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'

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
    width: '150px',
  },
}

const btnStyle = useI18nStyle(btnStyleMap)
const baseStore = useBaseStore()

const bodyStyle = { height: '100%' }
// 获取时间
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
const viewportHeight = ref<number>(0) // 视口高度
const appHeight = ref<number>(0) // app高度

// 当前开票类型
const invoice = reactive<{
  active: number
}>({
  active: 1,
})

// 消费明细
const consumptionShortcuts = [
  {
    text: t('order.oneWeek'), // 最近一周
    value: () => {
      return getDateTime(1, 'week', FORMAT_DAY_NO_UTC)
    },
  },
  {
    text: t('order.oneMonth'), // 最近一个月
    value: () => {
      return getDateTime(1, 'month', FORMAT_DAY_NO_UTC)
    },
  },
  {
    text: t('order.threeMonth'), // 最近三个月
    value: () => {
      return getDateTime(3, 'month', FORMAT_DAY_NO_UTC)
    },
  },
]
// 月账单 => 不支持半年以上
const monthShortcuts = [
  {
    text: t('invoice.oneMonth'), // 最近一个月
    value: () => {
      return getDateTime(1, 'month', FORMAT_MONTH_NO_UTC)
    },
  },
  {
    text: t('invoice.threeMonth'), // 最近三个月
    value: () => {
      return getDateTime(3, 'month', FORMAT_MONTH_NO_UTC)
    },
  },
]
// 消费明细日期选择范围
const defaultTimeConsumption = consumptionShortcuts[1].value()
const consumptionTime = ref<any>(defaultTimeConsumption)
// 月账单日期选择范围
const defaultTimeMonth = monthShortcuts[1].value()
const monthTime = ref<any>(defaultTimeMonth)
const condition = ref<string>('') // 查询条件 暂时子订单号
// 可开票金额
const invoiceSummary = ref<any>({})
const consumptionTableRef = ref() // 消费账单table
const monthTableRef = ref() // 按月账单table
// 消费账单
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
// 按月账单
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

const tips = computed(() => [
  {
    main: t('invoice.invoiceTip1'),
    sub: [t('invoice.invoiceTip2')],
  },
  {
    main: t('invoice.invoiceTip3'),
    sub: [t('invoice.invoiceTip4')],
  },
])

// listWrapStyle
const listWrapStyle = computed(() => {
  return appHeight.value - viewportHeight.value > 0 ? {} : { paddingBottom: '80px' }
})

// invoiceWrapStyle
const invoiceWrapStyle = computed<CSSProperties>(() => {
  // 超出屏幕高度
  if (appHeight.value - viewportHeight.value > 0) {
    // 判断侧边栏未折叠
    const paddingLeft = baseStore.collapsed ? 'calc(var(--menu-w-collapsed) + 50px)' : 'calc(var(--menu-w) + 50px)'

    return {
      position: 'fixed',
      bottom: 0,
      left: 0,
      paddingLeft,
      paddingRight: '50px',
    }
  } else {
    // 未超出屏幕高度
    return {
      position: 'absolute',
      bottom: 0,
      left: 0,
      paddingLeft: '20px',
      paddingRight: '20px',
    }
  }
})

const formatTimeMonthBill = (str: string) => {
  const arr = str.split('-')
  const year = arr[0]
  const month = arr[1]
  return t('invoice.formatTimeMonthBill', [year, month])
}

// 分页
const changePagination = async () => {
  if (invoice.active === 1) {
    // 消费账单
    consumption.selectList = []
    consumption.curPageAll = consumption.all
    await getInvoicableResourceBill()
    preInvoice()
  } else {
    // 按月账单
    month.selectList = []
    month.curPageAll = month.all
    await getInvoicableMonthBill()
    preInvoice()
  }
}

// 申请开票
const next = () => {
  // 注意: 跨分页全选被勾选优先级最高
  const query: any = {
    invoiceType: invoice.active,
  }

  // 消费明细必须
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
  console.log(`query===>`, query)

  // 待开票金额必须大于0
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

// 点击tab
const handleTabActive = async (active: number) => {
  invoice.active = active
  condition.value = ''
  resizeCb()
}

// 当前行勾选
const changeCheckStatus = (ischeck, row) => {
  console.log(`changeCurPageAll===>`, ischeck)

  if (invoice.active === 1) {
    // 消费账单
    // 跨页全选勾选时，不能取消当前页勾选
    if (consumption.all) return
    row.checkStatus = ischeck

    // 勾选的row
    consumption.selectList = consumption.list.filter(el => el.checkStatus && !el.disabled)
    // curPageAll
    consumption.curPageAll = consumption.selectList.length === consumption.list.length
  } else {
    // 按月账单
    // 跨页全选勾选时，不能取消当前页勾选
    if (month.all) return
    row.checkStatus = ischeck

    // 勾选的row
    month.selectList = month.list.filter(el => el.checkStatus && !el.disabled)
    // curPageAll
    month.curPageAll = month.selectList.length === month.list.length
  }

  preInvoice()
}

// 当前页勾选
const changeCurPageAll = isCheck => {
  console.log(`changeCurPageAll===>`, isCheck)

  if (invoice.active === 1) {
    // 消费账单
    // 跨页全选勾选时，不能取消当前页勾选
    if (consumption.all) return
    consumption.curPageAll = isCheck
    consumption.list = consumption.list.map(el => ({
      ...el,
      checkStatus: isCheck,
    }))

    // 勾选的row
    consumption.selectList = consumption.list.filter(el => el.checkStatus && !el.disabled)
    consumption.indeterminate = false
  } else {
    // 按月账单
    // 跨页全选勾选时，不能取消当前页勾选
    if (month.all) return
    month.curPageAll = isCheck
    month.list = month.list.map(el => ({
      ...el,
      checkStatus: isCheck,
    }))

    // 勾选的row
    month.selectList = month.list.filter(el => el.checkStatus && !el.disabled)
    month.indeterminate = false
  }

  preInvoice()
}

// 跨分页全选
const handleAll = (ins: any, isCheck) => {
  console.log(`handleAll===>`, ins)

  if (invoice.active === 1) {
    // 消费账单
    consumption.list = consumption.list.map(el => ({
      ...el,
      checkStatus: isCheck,
    }))

    consumption.selectList = []
    consumption.curPageAll = isCheck
    consumption.indeterminate = false
  } else {
    // 按月账单
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

// 待开票金额
const invoiceAmountTotal = computed(() => {
  if (invoice.active === 1) {
    return consumption.totalAmount
  } else {
    return month.totalAmount
  }
})

// 获取待开票金额及发票信息
const preInvoice = () => {
  // 注意:全选被勾选优先级最高
  let params: ExpenseBillType.GetPreInvoiceReq = {
    invoiceType: invoice.active,
  }

  if (invoice.active === 1) {
    // 消费账单
    const billIds: any[] = consumption.all ? [] : consumption.selectList.map(el => el.billId)
    params.billIds = billIds
  } else {
    // 按月账单
    const months: any[] = month.all ? [] : month.selectList.map(el => el.billPeriod)
    params.months = months
  }

  // 跨分页全选,当前行, 当前页有被勾选
  const cb = async () => {
    const res = await _preInvoice(params)
    console.log(`_getInvoicableSummary===>`, res)
    if (res.success) {
      if (invoice.active === 1) {
        consumption.totalAmount = res.data.totalAmount
      } else {
        month.totalAmount = res.data.totalAmount
      }
    }
  }

  if (invoice.active === 1) {
    // 消费账单
    if (!params.billIds?.length && !consumption.all) {
      // 跨分页全选,当前行, 当前页勾选都未勾选
      consumption.totalAmount = 0
    } else {
      cb()
    }
  } else {
    // 按月账单
    if (!params.months?.length && !month.all) {
      // 跨分页全选,当前行, 当前页勾选都未勾选
      month.totalAmount = 0
    } else {
      cb()
    }
  }
}

// 可开票金额
const getInvoicableSummary = async () => {
  const res = await _getInvoicableSummary()
  console.log(`_getInvoicableSummary===>`, res)
  if (res.success) {
    invoiceSummary.value = res.data || {}
  }
}

// 消费账单
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
    console.log(`_getInvoicableResourceBill===>`, res)
    if (res.success) {
      consumption.list = res.data.list || []
      consumption.paginationConfig.total = res.data.recordCnt

      // 组装数据
      consumption.list = consumption.list.map(el => {
        const checkStatus = consumption.all // 跟随跨分页
        const disabled = el.invoicableAmount - 0 <= 0 ? true : false // 可开票余额大于0可以勾选

        return {
          ...el,
          checkStatus,
          disabled,
        }
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    consumption.loading = false
  }
}

// 按月账单
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
    console.log(`_getInvoicableMonthBill===>`, res)
    if (res.success) {
      month.list = res.data.list || []
      month.paginationConfig.total = res.data.recordCnt

      // 组装数据
      month.list = month.list.map(el => {
        const checkStatus = month.all // 跟随跨分页
        const disabled = el.invoicableAmount - 0 <= 0 ? true : false // 可开票余额大于0可以勾选

        return {
          ...el,
          checkStatus,
          disabled,
        }
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    month.loading = false
  }
}

// 视口高度变化
const resizeCb = () => {
  const billDom = document.getElementById('cost-center-expense-bill') as any
  viewportHeight.value = window.innerHeight
  appHeight.value = billDom?.offsetHeight + 60 + 60

  // console.log(`视口高度====>`, viewportHeight.value)
  // console.log(`app高度====>`, appHeight.value)
}

// 条件
watch(condition, () => {
  invoice.active === 1 ? getInvoicableResourceBill() : getInvoicableMonthBill()
})

// consumptionTime
watch(consumptionTime, () => {
  getInvoicableResourceBill()
})

// monthTime
watch(monthTime, () => {
  getInvoicableMonthBill()
})

watch(monthTime, (newValue, oldValue) => {
  if (newValue && newValue.length === 2) {
    const monthsBetween = newValue[1].getMonth() - newValue[0].getMonth() + 1
    if (monthsBetween > 5) {
      message.warning(t('invoice.monthsBetweenWarn'))
      // 重置为初始值
      monthTime.value = oldValue
    }
  }
})

onMounted(async () => {
  getInvoicableSummary()
  await getInvoicableResourceBill()
  await getInvoicableMonthBill()
  resizeCb()

  window.addEventListener('resize', resizeCb)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCb)
})
</script>

<style lang="scss" scoped>
.wrap {
  .cost-wrap {
    height: 100px;
    background-image: url('../../../../../assets/images/cost-center/invoice/bg.png');
    background-repeat: no-repeat;

    /* 背景图片不重复 */
    background-position: right center;

    .title {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;

      // font-weight: 500;
      color: var(--primary-text);
    }

    .invoicableAmount {
      font-size: 24px;
    }
  }

  .list-wrap {
    position: relative;

    /* padding-bottom: 80px; */

    .step-wrap {
      height: 100px;
      background: #f9fafc;
    }

    .btn-wrap {
      border-radius: 4px;

      .btn {
        width: 150px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        border: 1px solid var(--border-c);
      }

      .left {
        border-radius: 4px 0 0 4px;
      }

      .right {
        border-radius: 0 4px 4px 0;
      }

      .actived {
        color: var(--primary-color);
        background: var(--selected-bgc);
        border: 1px solid var(--primary-color);
      }
    }

    .select-all {
      height: 50px;
      line-height: 50px;
      border-top: 1px solid var(--border-c);
      border-bottom: 1px solid var(--border-c);

      .pl20 {
        padding-left: 20px;
      }
    }

    .invoice-wrap {
      z-index: 99;
      width: 100%;
      height: 80px;
      background-color: #fff;

      /* transition: 0.3s; */

      .invoice {
        /* padding-left: 30px;
        padding-right: 23px; */
      }

      .text-24 {
        font-size: 24px;
      }

      .text-14 {
        font-size: 14px;
      }
    }

    .expand-wrap {
      padding-right: 40px;
      padding-left: 40px;
      margin-top: 20px;
      margin-bottom: 20px;

      .pdl20 {
        padding-left: 20px;
      }

      .subTable {
        border-top: 1px solid #ebeef5;
        border-right: 1px solid #ebeef5;
        border-left: 1px solid #ebeef5;
        border-bottom-right-radius: 4px;
        border-bottom-left-radius: 4px;
      }
    }
  }

  .text-14 {
    font-size: 14px;
  }

  .price-text {
    font-family: PingFangSC, 'PingFang SC';
    font-weight: 400;
    color: var(--warning-color);
  }
}
</style>
