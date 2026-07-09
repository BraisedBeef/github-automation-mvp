<template>
  <div class="">
    <div class="header-wrap df mb20 page-box">
      <p class="mr20 main-title">
        <span>{{ detail.productName }}</span
        ><span>{{ detail.alias }}</span>
      </p>
      <span class="sub-title">{{
        t('bill.detailTipValue', [
          maoYunDayJs(detail.useStartDate).format(FORMAT_YEAR_NO_UTC),
          maoYunDayJs(detail.useStartDate).format(FORMAT_ONLY_MONTH_NO_UTC),
        ])
      }}</span>
    </div>

    <el-card shadow="never" class="info-wrap page-box mb20" :body-style="bodyStyle">
      <p class="title mb20">
        {{ t('bill.detail') }}
      </p>
      <el-row>
        <el-col :span="12">
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.resourceIds') }}</span>
            </p>
            <span class="value">{{ detail.instanceId || '-' }}</span>
          </div>
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.userUin') }}</span>
            </p>
            <span class="value">{{ detail.userUin || '-' }}</span>
          </div>
          <!-- 开始使用时间 -->
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.useStartDate') }}</span>
            </p>
            <span class="value">{{
              detail.useStartDate ? maoYunDayJs(detail.useStartDate).format(FORMAT_TIME) : '-'
            }}</span>
          </div>
          <!-- 交易类型 -->
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('incomeExpenditure.incomeType') }}</span>
            </p>
            <span class="value">{{ TRANSACTION_TYPE_MAP[detail.transactionType] }}</span>
          </div>
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.regionName') }}</span>
            </p>
            <span class="value">{{ detail.regionName || '-' }}</span>
          </div>
          <!-- 拓展字段 -->
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.expand') }}</span>
            </p>
            <span class="value">{{ detail.description || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.alias') }}</span>
            </p>
            <span class="value">{{ detail.alias || '-' }}</span>
          </div>
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.productId') }}</span>
            </p>
            <span class="value">{{ detail.productName || '-' }}</span>
          </div>
          <!-- 子产品名称 -->
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.subProductName') }}</span>
            </p>
            <span class="value">{{ detail.subProductName || '-' }}</span>
          </div>
          <!-- 结束使用时间 -->
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.useEndDate') }}</span>
            </p>
            <span class="value">{{
              detail.useEndDate ? maoYunDayJs(detail.useEndDate).format(FORMAT_TIME) : '-'
            }}</span>
          </div>
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.zoneName') }}</span>
            </p>
            <span class="value">{{ detail.zoneName || '-' }}</span>
          </div>
          <div class="df mb20">
            <p class="key-wrap" :style="keyWrapStyle">
              <span class="key">{{ t('bill.projectId') }}</span>
            </p>
            <span class="value">{{ detail.productName }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="cost-wrap page-box mb20" :body-style="bodyStyle">
      <p class="title mb20">
        {{ t('bill.costComposition') }}
      </p>
      <div class="calculate-wrap df ac mb20">
        <!-- 总费用 -->
        <div class="total-wrap">
          <div class="top">
            {{ t('bill.totalMoney') }}
          </div>
          <div class="bottom price-text">
            <span>{{ detail.discountedPrice }}</span>
            <span class="unit text-14">USD</span>
          </div>
        </div>
        <span class="symbol">=</span>
        <!-- 现金支付 -->
        <div class="cash-wrap">
          <div class="top">
            {{ t('bill.money') }}
          </div>
          <div class="bottom">
            <span>{{ detail.money }}</span>
            <span class="unit text-14">USD</span>
          </div>
        </div>
        <span class="symbol">+</span>
        <!-- 代金券支付 -->
        <div class="vouchers-wrap">
          <div class="top">
            {{ t('bill.voucherMoney') }}
          </div>
          <div class="bottom">
            <span>{{ detail.voucherMoney }}</span>
            <span class="unit text-14">USD</span>
          </div>
        </div>
        <span class="symbol">+</span>
        <!-- 赠送金支付 -->
        <div class="giftGoldMoney-wrap">
          <div class="top">
            {{ t('bill.giftGoldMoney') }}
          </div>
          <div class="bottom">
            <span>{{ detail.giftGoldMoney }}</span>
            <span class="unit text-14">USD</span>
          </div>
        </div>
        <span v-if="account.advanceStatus === 2" class="symbol">+</span>
        <!-- 平台垫付 -->
        <div v-if="account.advanceStatus === 2" class="platformAdvancePaymentMoney-wrap">
          <div class="top">
            {{ t('bill.platformAdvancePaymentMoney') }}
          </div>
          <div class="bottom">
            <span>{{ detail.platformAdvancePaymentMoney }}</span>
            <span class="unit text-14">USD</span>
          </div>
        </div>
      </div>

      <el-table v-loading="loading" :data="detail.subBill" class="mt20 table" show-overflow-tooltip>
        <!-- 子产品名称 -->
        <el-table-column prop="subProductName" :label="t('bill.subProductName')">
          <template #default="{ row }">
            {{ row.subProductName || '-' }}
          </template>
        </el-table-column>
        <!-- 组件 -->
        <el-table-column :label="t('bill.cpn')">
          <template #default="{ row }">
            {{ row.componentName || '-' }}
          </template>
        </el-table-column>
        <!-- 用量 -->
        <el-table-column prop="used" :label="t('bill.used')">
          <template #default="{ row }">
            {{ row.used || '-' }}
          </template>
        </el-table-column>
        <!-- 时长 -->
        <el-table-column prop="usedDuration" :label="t('bill.usedDurations')">
          <template #default="{ row }">
            {{ row.usedDuration || '-' }}
          </template>
        </el-table-column>
        <!-- 总费用 -->
        <el-table-column prop="discountedPrice" :label="t('bill.originalPriceUnit')" />
        <!-- 占比 -->
        <el-table-column prop="totalMoneyRatio" :label="t('bill.totalMoneyRatio')">
          <template #default="{ row }">
            {{ row.totalMoneyRatio ? `${NP.times(row.totalMoneyRatio, 100)}%` : '-' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 费用趋势 -->
      <div class="chart-wrap ml20" style="flex-grow: 1">
        <div class="title-wrap">
          <div class="df jsb">
            <span class="title">{{ t('bill.costTrends') }}</span>
            <div class="df">
              <!-- 时间段 -->
              <div class="btn-wrap df cursor-pointer">
                <div
                  :style="btnStyle"
                  class="btn left"
                  :class="transMonthBillOverview.dateActive === 1 ? 'actived' : ''"
                  @click="transMonthBillOverview.dateActive = 1"
                >
                  {{ t('bill.halfYear') }}
                </div>
                <div
                  :style="btnStyle"
                  class="btn right"
                  :class="transMonthBillOverview.dateActive === 2 ? 'actived' : ''"
                  @click="transMonthBillOverview.dateActive = 2"
                >
                  {{ t('bill.oneYear') }}
                </div>
              </div>
              <!-- 费用趋势类型 -->
              <el-select v-model="transMonthBillOverview.type" :teleported="true" @change="() => {}">
                <el-option
                  v-for="item in transMonthBillOverview.selectOptions"
                  :key="item.value"
                  :value="item"
                  :label="item.label"
                />
              </el-select>
            </div>
          </div>
          <div>
            <!-- 月均总费用 -->
            <p v-if="transMonthBillOverview.type.value === 'all'" class="desc">
              <span>{{ transMonthBillCost.time }}</span> <span>{{ t('bill.averageMonthTotal') }}</span>
              <span class="text-primary"> ${{ transMonthBillCost.average }} USD</span>
            </p>
            <!-- 月均现金 -->
            <p v-else-if="transMonthBillOverview.type.value === 'money'" class="desc">
              <span>{{ transMonthBillCost.time }}</span> <span>{{ t('bill.averageMonthMoney') }}</span>
              <span class="text-primary"> ${{ transMonthBillCost.average }} USD</span>
            </p>
            <!-- 月均代金券 -->
            <p v-else-if="transMonthBillOverview.type.value === 'voucher'" class="desc">
              <span>{{ transMonthBillCost.time }}</span> <span>{{ t('bill.averageMonthVoucher') }}</span>
              <span class="text-primary"> ${{ transMonthBillCost.average }} USD</span>
            </p>
            <!-- 月均赠送金 -->
            <p v-else-if="transMonthBillOverview.type.value === 'giftGoldMoney'" class="desc">
              <span>{{ transMonthBillCost.time }}</span> <span>{{ t('bill.averageMonthGiftGoldMoney') }}</span>
              <span class="text-primary"> ${{ transMonthBillCost.average }} USD</span>
            </p>
            <!-- 月均平台垫付 -->
            <p v-else-if="transMonthBillOverview.type.value === 'platformAdvancePaymentMoney'" class="desc">
              <span>{{ transMonthBillCost.time }}</span>
              <span>{{ t('bill.averageMonthPlatformAdvancePaymentMoney') }}</span>
              <span class="text-primary"> ${{ transMonthBillCost.average }} USD</span>
            </p>
          </div>
          <!-- 费用柱形图 -->
          <div id="cost-chart" style="width: 100%; height: 240px" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { _getBill, _getTransMonthBillOverview } from '@/apis/cost-center/expense-bill'
import * as echarts from 'echarts'
import { maoYunDayJs, FORMAT_TIME, FORMAT_YEAR_NO_UTC, FORMAT_ONLY_MONTH_NO_UTC } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { TRANSACTION_TYPE_MAP, _toFixed } from '@/views/cost-center/expense-bill/config'
import { _getAccountInfo } from '@/apis/cost-center/user'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { PRIMARY_COLOR } from '@/views/cost-center/expense-bill/config'
import { LANGUAGE_MAP } from '@/config/constant-config'
import NP from 'number-precision'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const btnStyleMap = {
  [ja]: {
    width: '80px',
  },
  [en]: {
    width: '130px',
  },
  [zh]: {
    width: '80px',
  },
}
const keyWrapStyleMap = {
  [ja]: {
    width: '130px',
  },
  [en]: {
    width: '170px',
  },
  [zh]: {
    width: '130px',
  },
}

const btnStyle = useI18nStyle(btnStyleMap)
const keyWrapStyle = useI18nStyle(keyWrapStyleMap)
const route = useRoute()

const bodyStyle = { height: '100%' }
const loading = ref<boolean>(false)
const billId = ref<string>(route.params.billId as string) // id
const transMonth = ref<string>(route.query.transMonth as string) // id
const detail = ref<any>({}) // 详情
const account = ref<any>({}) // 账户详情

// 费用趋势图表
const transMonthBillOverview = reactive<{
  options: any
  chart: any
  list: any[]
  type: any
  dateActive: number
  selectOptions: any[]
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
  }, // 类型
  dateActive: 1, // 时间段
  selectOptions: [
    {
      value: 'all',
      label: t('bill.totalMoney'),
    },
    {
      value: 'money',
      label: t('bill.money'),
    },
    {
      value: 'voucher',
      label: t('bill.voucherMoney'),
    },
    {
      value: 'giftGoldMoney',
      label: t('bill.giftGoldMoney'),
    },
    {
      value: 'platformAdvancePaymentMoney',
      label: t('bill.platformAdvancePaymentMoney'),
    },
  ],
})

// 费用趋势的时间段和月均费用
const transMonthBillCost = computed(() => {
  const map = {
    all: 'discountPrice',
    money: 'money',
    voucher: 'voucherMoney',
    giftGoldMoney: 'giftGoldMoney',
    platformAdvancePaymentMoney: 'platformAdvancePaymentMoney',
  }

  const key = map[transMonthBillOverview.type.value]

  let sum = 0
  let time = ''
  let average: string | number = 0
  if (transMonthBillOverview.list.length) {
    for (const el of transMonthBillOverview.list) {
      // sum += el.discountPrice
      sum += el[key]
    }

    time = `${transMonthBillOverview.list[0].transDate} ~ ${transMonthBillOverview.list[transMonthBillOverview.list.length - 1].transDate}`
    average = _toFixed(sum / transMonthBillOverview.list.length)
  }

  return {
    time,
    sum,
    average,
  }
})

// 查询登录用户账户
const getAccountInfo = async () => {
  const res = await _getAccountInfo()

  console.log(`_getAccountInfo===>`, res)

  if (res.success) {
    account.value = res.data || {}
  }
}

// 获取账单详情
const getBill = async () => {
  try {
    loading.value = true
    const res = await _getBill({ billId: billId.value })
    // console.log(`_getBill===>`, res)

    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 获取费用趋势
const getTransMonthBillOverview = async () => {
  const res = await _getTransMonthBillOverview({
    transMonth: transMonth.value,
    queryType: transMonthBillOverview.dateActive,
  })

  console.log(`getTransMonthBillOverview===>`, res)

  if (res.success) {
    transMonthBillOverview.list = res.data || []
    setTransMonthBillOverviewChart()
  }
}

// 费用趋势柱形图
const setTransMonthBillOverviewChart = () => {
  if (!transMonthBillOverview.chart) {
    // 标记不能成为响应式对象
    transMonthBillOverview.chart = markRaw(echarts.init(document.getElementById('cost-chart')))
  }
  console.log(transMonthBillOverview.type)

  // 设置数据源
  const rawXAxisData: any[] = [] // 日期
  const rawMoneyData: any[] = [] // 现金支付
  const rawVoucherData: any[] = [] // 代金券支付
  const rawGiftGoldMoneyData: any[] = [] // 赠送金支付
  const rawPlatformAdvancePaymentMoneyData: any[] = [] // 平台垫付
  for (const el of transMonthBillOverview.list) {
    rawXAxisData.push(el.transDate)
    rawMoneyData.push(el.money)
    rawVoucherData.push(el.voucherMoney)
    rawGiftGoldMoneyData.push(el.giftGoldMoney)
    rawPlatformAdvancePaymentMoneyData.push(el.platformAdvancePaymentMoney)
  }

  transMonthBillOverview.options.grid = {
    left: 0,
    right: 0,
    top: '10%',
    bottom: '10%',
    containLabel: true, // 根据图例和标签内容调整边界
  }

  // 总费用
  if (transMonthBillOverview.type.value === 'all') {
    console.log(`all==>`)
    transMonthBillOverview.options.color = [PRIMARY_COLOR, '#0FBE5B', '#FA8D15', '#67CDFD'] // 图例颜色
    transMonthBillOverview.options.legend = {
      top: 'bottom',
      data: [t('bill.money'), t('bill.voucherMoney'), t('bill.giftGoldMoney'), t('bill.platformAdvancePaymentMoney')],
    }
    transMonthBillOverview.options.xAxis = {
      data: rawXAxisData,
    }
    transMonthBillOverview.options.series = [
      {
        name: t('bill.money'),
        type: 'bar',
        stack: 'cost', // 设置堆叠的分组名称
        data: rawMoneyData,
        barWidth: '30', // 柱形宽度
      },
      {
        name: t('bill.voucherMoney'),
        type: 'bar',
        stack: 'cost', // 设置堆叠的分组名称
        data: rawVoucherData,
        barWidth: '30',
      },
      {
        name: t('bill.giftGoldMoney'),
        type: 'bar',
        stack: 'cost', // 设置堆叠的分组名称
        data: rawGiftGoldMoneyData,
        barWidth: '30',
      },
      {
        name: t('bill.platformAdvancePaymentMoney'),
        type: 'bar',
        stack: 'cost', // 设置堆叠的分组名称
        data: rawPlatformAdvancePaymentMoneyData,
        barWidth: '30',
      },
    ]
  }
  // 现金支付
  if (transMonthBillOverview.type.value === 'money') {
    console.log(`money===>`)
    transMonthBillOverview.options.color = [PRIMARY_COLOR] // 图例颜色
    transMonthBillOverview.options.legend = {
      top: 'bottom',
      data: [t('bill.money')],
    }
    transMonthBillOverview.options.xAxis = { data: rawXAxisData }
    transMonthBillOverview.options.series = [
      {
        name: t('bill.money'),
        type: 'bar',
        stack: 'cost', // 设置堆叠的分组名称
        data: rawMoneyData,
        barWidth: '30', // 柱形宽度
      },
    ]
  }
  // 代金券支付
  if (transMonthBillOverview.type.value === 'voucher') {
    console.log(`voucher===>`)
    transMonthBillOverview.options.color = ['#0FBE5B'] // 图例颜色
    transMonthBillOverview.options.legend = {
      top: 'bottom',
      data: [t('bill.voucherMoney')],
    }
    transMonthBillOverview.options.xAxis = { data: rawXAxisData }
    transMonthBillOverview.options.series = [
      {
        name: t('bill.voucherMoney'),
        type: 'bar',
        stack: 'cost', // 设置堆叠的分组名称
        data: rawVoucherData,
        barWidth: '30', // 柱形宽度
      },
    ]
  }
  // 赠送金支付
  if (transMonthBillOverview.type.value === 'giftGoldMoney') {
    console.log(`giftGoldMoney===>`)
    transMonthBillOverview.options.color = ['#FA8D15'] // 图例颜色
    transMonthBillOverview.options.legend = {
      top: 'bottom',
      data: [t('bill.giftGoldMoney')],
    }
    transMonthBillOverview.options.xAxis = { data: rawXAxisData }
    transMonthBillOverview.options.series = [
      {
        name: t('bill.giftGoldMoney'),
        type: 'bar',
        stack: 'cost', // 设置堆叠的分组名称
        data: rawGiftGoldMoneyData,
        barWidth: '30', // 柱形宽度
      },
    ]
  }
  // 平台垫付
  if (transMonthBillOverview.type.value === 'platformAdvancePaymentMoney') {
    console.log(`platformAdvancePaymentMoney===>`)
    transMonthBillOverview.options.color = ['#67CDFD'] // 图例颜色
    transMonthBillOverview.options.legend = {
      top: 'bottom',
      data: [t('bill.platformAdvancePaymentMoney')],
    }
    transMonthBillOverview.options.xAxis = { data: rawXAxisData }
    transMonthBillOverview.options.series = [
      {
        name: t('bill.platformAdvancePaymentMoney'),
        type: 'bar',
        stack: 'cost', // 设置堆叠的分组名称
        data: rawPlatformAdvancePaymentMoneyData,
        barWidth: '30', // 柱形宽度
      },
    ]
  }

  console.log(`transMonthBillOverview.options===>`, transMonthBillOverview.options)
  // 解决echars数据发生变化图表没变化的问题
  transMonthBillOverview.chart.clear()
  transMonthBillOverview.chart.setOption(transMonthBillOverview.options)
}

// 监听费用趋势的date
watch(
  () => transMonthBillOverview.dateActive,
  () => {
    getTransMonthBillOverview()
  },
)

// 监听费用趋势的type
watch(
  () => transMonthBillOverview.type,
  () => {
    setTransMonthBillOverviewChart()
  },
)

onMounted(() => {
  getBill()
  getTransMonthBillOverview()
  getAccountInfo()
})
</script>

<style lang="scss" scoped>
.header-wrap {
  height: 60px;
  padding: 0 20px;
  line-height: 60px;
  background: #fff;

  .main-title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 16px;
    font-weight: 400;
    color: var(--primary-text);
  }

  .sub-title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--regular-color);
  }
}

.info-wrap {
  height: 320px;

  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 16px;

    // font-weight: 500;
    color: var(--primary-text);
  }

  .key-wrap {
    width: 130px;

    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--regular-color);
    }
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-text);
  }
}

.cost-wrap {
  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 16px;

    // font-weight: 500;
    color: var(--primary-text);
  }

  .calculate-wrap {
    .top {
      margin-bottom: 6px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--regular-color);
    }

    .bottom {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 32px;

      // font-weight: 500;
      color: var(--primary-text);
    }

    .symbol {
      margin-right: 27px;
      margin-left: 35px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--regular-color);
    }

    .text-14 {
      font-size: 14px;
    }

    .price-text {
      font-family: PingFangSC, 'PingFang SC';
      font-weight: 400;
      color: var(--warning-color);
    }

    .unit {
      margin-left: 4px;
    }
  }

  .chart-wrap {
    margin-top: 60px;

    /* padding: 0 20px; */

    .title-wrap {
      .title {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 16px;
        line-height: 22px;

        // font-weight: 500;
        color: var(--table-text);
      }

      .btn-wrap {
        margin-right: 10px;
        border-radius: 4px;

        .btn {
          width: 80px;
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

      .desc {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--primary-text);
      }
    }
  }
}
</style>
