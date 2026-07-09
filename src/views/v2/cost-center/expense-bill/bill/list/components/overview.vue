<template>
  <div class="overview-v2">
    <InfoNotice class="overview-v2__notice">
      <div>
        <div>
          {{
            t('bill.overviewTip1', [
              maoYunDayJs(date).format(FORMAT_YEAR_NO_UTC),
              maoYunDayJs(date).format(FORMAT_ONLY_MONTH_NO_UTC),
            ])
          }}
        </div>
        <div>{{ t('bill.overviewTip2') }}</div>
      </div>
    </InfoNotice>
    <!-- top-charts -->
    <el-card shadow="never" class="top-charts page-box mb20" :body-style="bodyStyle">
      <div class="df w-full">
        <div class="info-wrap border-r-1" :style="infoWrapClass">
          <div class="top df ac">
            <div class="month mr14 df ac jc">
              {{ t('bill.overviewMonth', [maoYunDayJs(date).format(FORMAT_ONLY_MONTH_SINGLE_NO_UTC)]) }}
            </div>
            <div>
              <p class="desc1">
                {{
                  t('bill.formatTime', [
                    maoYunDayJs(date).format(FORMAT_YEAR_NO_UTC),
                    maoYunDayJs(date).format(FORMAT_ONLY_MONTH_NO_UTC),
                  ])
                }}
                {{ billCostStatus }}
              </p>
              <p class="desc2 df ac">
                <span class="mr4">{{ t('bill.statisticsPeriod') }}</span>
                <el-tooltip placement="bottom" effect="light">
                  <template #content>
                    <div class="tooltip">
                      <p class="main">
                        {{ t('bill.statisticsPeriodTooltipDesc1') }}
                      </p>
                      <p class="sub">
                        {{ t('bill.statisticsPeriodTooltipDesc2') }}
                      </p>
                    </div>
                  </template>
                  <SvgIcon name="cat-cdn-warning" style="width: 17px; height: 17px" />
                </el-tooltip>
              </p>
            </div>
          </div>
          <div class="center">
            <p class="total-cost-key">
              {{ t('bill.totalMoney') }}
            </p>
            <p class="total-cost-value">
              <!-- 总费用 -->
              <span class="num1" /><span class="num2">{{ billCost.totalMoney || 0 }} USD</span>
            </p>
          </div>
          <div class="bottom" :style="infoWrapBottomClass">
            <!-- 三角形 -->
            <div class="triangle-down" />
            <div class="df ac mb20">
              <!-- 现金支付 -->
              <div class="payment border-r-1">
                <div class="payment-key">
                  {{ t('bill.money') }}
                </div>
                <div class="payment-value">{{ billCost.money || 0 }} USD</div>
              </div>
              <!-- 代金券支付 -->
              <div class="payment pl20">
                <div class="payment-key">
                  {{ t('bill.voucherMoney') }}
                </div>
                <div class="payment-value">{{ billCost.voucherMoney || 0 }} USD</div>
              </div>
            </div>
            <!--赠送金支付 -->
            <div class="df ac">
              <div class="payment border-r-1">
                <div class="payment-key">
                  {{ t('bill.giftGoldMoney') }}
                </div>
                <div class="payment-value">{{ billCost.giftGoldMoney || 0 }} USD</div>
              </div>
              <!-- 平台垫付 -->
              <div class="payment pl20">
                <div class="payment-key">
                  {{ t('bill.platformAdvancePaymentMoney') }}
                </div>
                <div class="payment-value">{{ billCost.platformAdvancePaymentMoney || 0 }} USD</div>
              </div>
            </div>
          </div>
        </div>
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
                <el-select
                  v-model="transMonthBillOverview.type"
                  :teleported="true"
                  @change="setTransMonthBillOverviewChart"
                >
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
          </div>
          <!-- 费用柱形图 -->
          <div id="cost-chart" style="width: 100%; height: 280px" />
        </div>
      </div>
    </el-card>
    <!-- center-charts -->
    <div class="center-charts mb20">
      <el-row class="mb20" justify="space-between" :gutter="20">
        <el-col :span="12">
          <el-card shadow="never" class="charts-box page-box mb20" :body-style="bodyStyle">
            <!-- 按产品汇总 -->
            <div class="chart-wrap" style="flex-grow: 1">
              <div class="title-wrap">
                <span class="title">{{ t('bill.productSummary') }}</span>
              </div>
              <!-- 产品汇总饼状图 -->
              <div class="df ac jc charts" style="width: 100%; height: 290px">
                <div id="product-chart" ref="productChartRef" class="w-full h-full" />
                <div v-if="!productOverview.list.length" class="noData-wrap w-full h-full df ac jc">
                  <NoData :text="t('bill.noData')" svg-name="bill-no-data" />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never" class="charts-box page-box mb20" :body-style="bodyStyle">
            <!-- 按项目汇总 -->
            <div class="chart-wrap" style="flex-grow: 1">
              <div class="title-wrap">
                <span class="title">{{ t('bill.projectSummary') }}</span>
              </div>
              <!-- 项目汇总饼状图 -->
              <div class="df ac jc charts" style="width: 100%; height: 290px">
                <div id="project-chart" class="w-full h-full" />
                <div v-if="!projectOverview.list.length" class="noData-wrap w-full h-full df ac jc">
                  <NoData :text="t('bill.noData')" svg-name="bill-no-data" />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <!-- bottom-charts -->
    <div class="bottom-charts mb20">
      <el-row class="mb20" justify="space-between" :gutter="20">
        <el-col :span="12">
          <el-card shadow="never" class="charts-box page-box mb20" :body-style="bodyStyle">
            <!-- 按计费模式汇总 -->
            <div class="chart-wrap" style="flex-grow: 1">
              <div class="title-wrap">
                <span class="title">{{ t('bill.billingModeSummary') }}</span>
              </div>
              <!-- 计费汇总饼状图 -->
              <div class="df ac jc charts" style="width: 100%; height: 290px">
                <div id="bill-chart" class="w-full h-full" />
                <div v-if="!billingModeOverview.list.length" class="noData-wrap w-full h-full df ac jc">
                  <NoData :text="t('bill.noData')" svg-name="bill-no-data" />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never" class="charts-box page-box mb20" :body-style="bodyStyle">
            <!-- 按地域汇总 -->
            <div class="chart-wrap" style="flex-grow: 1">
              <div class="title-wrap">
                <span class="title">{{ t('bill.regionSummary') }}</span>
              </div>
              <!-- 地域汇总饼状图 -->
              <div v-if="regionOverview.list.length" class="map-wrap df jsb">
                <!-- <div class="map-chart" id="map-chart">
                  <el-image class="map-img" fit="cover" :src="map" />
                </div> -->
                <!-- <el-row>
                  <el-col span=""></el-col>
                  <el-col></el-col>
                </el-row> -->
                <div id="region-chart" style="width: 100%; height: 290px" />

                <div class="data-wrap df jfe">
                  <div class="w-full">
                    <div v-for="(item, index) in regionOverview.list" :key="index" class="df mb10">
                      <div class="key-wrap">
                        <span class="key">{{ item.type === '0' ? t('bill.other') : item.description }}</span>
                      </div>
                      <div class="value df jsb w-full">
                        <p>${{ item.money }} USD</p>
                        <p>（{{ (item.proportion * 100).toFixed(2) }}%）</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else style="width: 100%; height: 290px" class="df ac jc">
                <NoData :text="t('bill.noData')" svg-name="bill-no-data" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
// import map from '@/assets/images/cost-center/expense-bill/map.png'
import { _getTransBillOverview, _getTransMonthBillOverview } from '@/apis/cost-center/expense-bill'
import t from '@/utils/i18n'
import * as echarts from 'echarts'
import {
  maoYunDayJs,
  FORMAT_YEAR_NO_UTC,
  FORMAT_MONTH_NO_UTC,
  FORMAT_ONLY_MONTH_NO_UTC,
  FORMAT_ONLY_MONTH_SINGLE_NO_UTC,
} from '@/utils/mao-yun-day-js'
import NoData from '@/views/cost-center/account/info/components/no-data.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import { useBaseStore } from '@/store'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import {
  PRIMARY_COLOR,
  GREEN_COLOR,
  RED_COLOR,
  YELLOW_COLOR,
  BLUE_COLOR,
  GREY_COLOR,
} from '@/views/cost-center/expense-bill/config'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { COST_TYPE_MAP, _toFixed } from '@/views/cost-center/expense-bill/config'
import world from '@/views/cost-center/expense-bill/bill/world.json'
import NP from 'number-precision'

NP.enableBoundaryChecking(false)

const props = withDefaults(
  defineProps<{
    date: string
  }>(),
  { date: '' },
)

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

const infoWrapMap = {
  [ja]: { width: '340px' },
  [en]: { width: '360px' },
  [zh]: { width: '340px' },
}

const infoWrapBottomMap = {
  [ja]: { width: '320px' },
  [en]: { width: '340px' },
  [zh]: { width: '320px' },
}

const btnStyle = useI18nStyle(btnStyleMap)
const infoWrapClass = useI18nStyle(infoWrapMap)
const infoWrapBottomClass = useI18nStyle(infoWrapBottomMap)
const baseStore = useBaseStore()
echarts.registerMap('world', world as any)

const bodyStyle = { height: '100%' }
const billCost = ref<any>({}) // 账单费用
const productChartRef = ref<any>()

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

// 产品图表
const productOverview = reactive<{
  options: any
  chart: any
  list: any[]
}>({
  options: {
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        // center: [130, '50%'],
        type: 'pie',
        radius: [70, 95],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
    ],
    legend: {
      orient: 'vertical',
      top: 'middle',
      icon: 'circle',
      textStyle: {
        rich: {
          a: {
            fontSize: 14,
            width: 60,
            color: '#555555',
          },
          b: {
            fontSize: 14,
            width: 70,
            color: '#000000',
            textAlign: 'right',
          },
        },
      },
    },
  },
  chart: null,
  list: [],
})

// 项目图表
const projectOverview = reactive<{
  options: any
  chart: any
  list: any[]
}>({
  options: {
    tooltip: {
      trigger: 'item',
    },
    xAxis: {
      type: 'value',
      show: false,
    },
    yAxis: {
      type: 'category',
      data: [],
      axisLine: {
        show: false, // 隐藏轴线
      },
      axisTick: {
        show: false, // 隐藏刻度线
      },
    },

    series: [
      {
        data: [],
        type: 'bar',
        barWidth: 20,
        label: {
          show: true, // 显示标签
          position: 'right', // 标签位置：顶部
          formatter: function (params) {
            return '$' + params.value + ' USD' // 动态设置标签文字为柱子对应的数据
          },
        },
      },
    ],
  },
  chart: null,
  list: [],
})

// 计费图表
const billingModeOverview = reactive<{
  options: any
  chart: any
  list: any[]
}>({
  options: {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'horizontal', // 设置图例水平显示
      left: 'center', // 设置图例水平居中
      bottom: 5, // 设置图例位于底部并留出一定的间距
      icon: 'circle',
    },
    series: [
      {
        center: ['50%', '45%'],
        type: 'pie',
        radius: 95,
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b|{b}}\n{c|${c} USD}',
          rich: {
            a: {
              fontSize: 14,
              color: '#555',
            },
            c: {
              fontSize: 14,
              color: '#000',
            },
          },
        },
      },
    ],
  },
  chart: null,
  list: [],
})

// 地域图表
const regionOverview = reactive<{
  options: any
  chart: any
  list: any[]
}>({
  options: {
    backgroundColor: 'rgba(255,255,255,0)',
    tooltip: {
      trigger: 'item',
      formatter: params => {
        // 展示弹窗字段
        if (params.componentType === 'series' && params.seriesType === 'scatter') {
          const { name, cost, percentage } = params.data || {}

          return `
                <div style="font-size: 14px; line-height: 1.5;">
                  <div><strong>${name}</strong></div>
                  <div>${t('bill.cost')}${cost}</div>
                  <div>${t('bill.proportion')}${percentage}</div>
                </div>
                `
        }
        // 展示国家
        return params.name
      },
    },
    geo: {
      map: 'world',
      roam: false, // 禁用拖动和缩放
      label: {
        show: false,
      },
      itemStyle: {
        areaColor: '#ADD8E6', // 浅蓝色
        borderColor: '#ADD8E6', // 边界线颜色
      },
      emphasis: {
        itemStyle: {
          areaColor: '#87CEEB', // 鼠标悬浮时的颜色（更深的浅蓝色）
        },
      },
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        data: [],
        symbolSize: 10,
        itemStyle: {
          color: PRIMARY_COLOR,
        },
      },
    ],
  },
  chart: null,
  list: [],
})

// 账单费用状态
const billCostStatus = computed(() => {
  const currentDate = maoYunDayJs()
  const selectedDate = maoYunDayJs(props.date).add(1, 'month')

  return currentDate.valueOf() < selectedDate.valueOf() ? '' : t('bill.notBilledYet')
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

// 账单概览
const getTransBillOverview = async () => {
  const res = await _getTransBillOverview({
    queryDate: props.date,
  })

  console.log(`getTransBillOverview===>`, res)

  if (res.success) {
    productOverview.list = res.data.productOverview || []
    projectOverview.list = res.data.projectOverview || []
    billingModeOverview.list = res.data.billingModeOverview || []
    regionOverview.list = res.data.regionOverview || []
    billCost.value.money = res.data.money
    billCost.value.totalMoney = res.data.totalMoney
    billCost.value.voucherMoney = res.data.voucherMoney
    billCost.value.giftGoldMoney = res.data.giftGoldMoney
    billCost.value.platformAdvancePaymentMoney = res.data.platformAdvancePaymentMoney

    nextTick(() => {
      setProductOverviewChart()
      setProjectOverviewChart()
      setBillingModeOverviewChart()
      setRegionOverviewChart()
    })
  }
}

// 获取费用趋势
const getTransMonthBillOverview = async () => {
  const res = await _getTransMonthBillOverview({
    transMonth: props.date,
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

// 产品汇总饼图
const setProductOverviewChart = () => {
  console.log(`setProductOverviewChart===>`, productChartRef.value?.offsetWidth)
  const res = (productChartRef.value?.offsetWidth as any) > 750
  // 无数据
  if (!productOverview.list.length) {
    // transMonthBillOverview.chart.clear()
    return
  }
  if (!productOverview.chart) {
    // 标记不能成为响应式对象
    productOverview.chart = markRaw(echarts.init(document.getElementById('product-chart')))
  }

  // 设置数据源
  const rawData: any[] = []
  let total = 0
  for (const el of productOverview.list) {
    total = NP.plus(total, el.money)
    rawData.push({
      value: el.money,
      name: el.type,
    })
  }
  productOverview.options.series[0].data = rawData

  // 设置圆心
  productOverview.options.series[0].center = res ? ['50%', '50%'] : ['22%', '50%']

  // 设置圆心处的文案
  productOverview.options.series[0].label = {
    normal: {
      show: true,
      position: 'center', // 展示在中间位置
      formatter: () => {
        return `{a|${t('bill.totalMoney')}}\n\n{b|$${total} USD}`
      },
      rich: {
        a: {
          color: '#555',
          fontSize: 14,
          fontWeight: 500,
        },
        b: {
          fontSize: 16,
          fontWeight: 700,
          color: '#222',
        },
      },
    },
  }
  // 图例颜色
  productOverview.options.color = [PRIMARY_COLOR, GREEN_COLOR, RED_COLOR, YELLOW_COLOR, BLUE_COLOR, GREY_COLOR] // 图例颜色
  // 设置legend
  productOverview.options.legend.formatter = name => {
    console.log(`formatter===>`, name, rawData)
    const item = rawData.find(el => el.name === name)
    const p = ((item.value / total) * 100).toFixed(2)
    var arr = ['{a|' + name + '}', '{b|' + '$' + item.value + ' USD' + ` (${p}%)}`]
    return arr.join('')
  }
  dynamicsRenderProductOverviewChart()
}

// 调整产品汇总饼图圆心和图例位置动态渲染
const dynamicsRenderProductOverviewChart = () => {
  const res = productChartRef.value?.offsetWidth > 750
  // 设置圆心
  productOverview.options.series[0].center = res ? ['50%', '50%'] : ['22%', '50%']
  // 设置legend
  productOverview.options.legend.left = res ? '65%' : '42%'

  productOverview.chart.setOption(productOverview.options, true)
}

// 项目汇总柱形图
const setProjectOverviewChart = () => {
  // 无数据
  if (!projectOverview.list.length) {
    return
  }
  if (!projectOverview.chart) {
    // 标记不能成为响应式对象
    projectOverview.chart = markRaw(echarts.init(document.getElementById('project-chart')))
  }

  // 设置数据源
  const rawYAxisData: any[] = []
  const rawSeriesData: any[] = []
  for (const el of projectOverview.list) {
    rawYAxisData.push(el.type == '0' ? t('bill.defaultProject') : el.description)
    rawSeriesData.push(el.money)
  }
  projectOverview.options.color = [PRIMARY_COLOR] // 图例颜色
  projectOverview.options.yAxis.data = rawYAxisData
  projectOverview.options.series[0].data = rawSeriesData

  const lang = baseStore.lang
  const en = LANGUAGE_MAP.en.i18nParam
  const ja = LANGUAGE_MAP.ja.i18nParam
  const zh = LANGUAGE_MAP.zh.i18nParam

  const gridLeft = {
    [ja]: '150px',
    [en]: '100px',
    [zh]: '100px',
  }
  projectOverview.options.grid = {
    left: gridLeft[lang], // 增加左侧留白
  }
  console.log(`projectOverview.options===>`, projectOverview.options, lang)

  projectOverview.chart.setOption(projectOverview.options)
}

// 计费汇总饼图
const setBillingModeOverviewChart = () => {
  // 无数据
  if (!billingModeOverview.list.length) {
    return
  }
  if (!billingModeOverview.chart) {
    // 标记不能成为响应式对象
    billingModeOverview.chart = markRaw(echarts.init(document.getElementById('bill-chart')))
  }

  // 设置数据源
  const rawData: any[] = []
  for (const el of billingModeOverview.list) {
    rawData.push({
      value: el.money,
      name: COST_TYPE_MAP[el.type],
    })
  }
  billingModeOverview.options.series[0].data = rawData
  // 图例颜色
  billingModeOverview.options.color = [PRIMARY_COLOR, GREEN_COLOR, RED_COLOR, YELLOW_COLOR, BLUE_COLOR, GREY_COLOR]
  billingModeOverview.chart.setOption(billingModeOverview.options)
}

// 地域汇总饼图
const setRegionOverviewChart = () => {
  if (!regionOverview.list.length) {
    return
  }

  if (!regionOverview.chart) {
    regionOverview.chart = markRaw(echarts.init(document.getElementById('region-chart')))
  }

  const rawSeriesData: any[] = []

  for (const el of regionOverview.list) {
    rawSeriesData.push({
      name: el.description,
      value: [el.longitude, el.latitude], // 经纬度
      cost: `$${el.money} USD`,
      percentage: `${(el.proportion * 100).toFixed(2)}%`,
    })
  }

  regionOverview.options.series[0].data = rawSeriesData

  regionOverview.chart.setOption(regionOverview.options)
}

// 图表响应式
const resizeChart = e => {
  console.log(`resizeChart===>`)
  if (productOverview.chart) {
    dynamicsRenderProductOverviewChart()
    productOverview.chart.resize()
  }
  if (projectOverview.chart) {
    projectOverview.chart.resize()
  }
  if (billingModeOverview.chart) {
    billingModeOverview.chart.resize()
  }
  if (transMonthBillOverview.chart) {
    transMonthBillOverview.chart.resize()
  }
  if (regionOverview.chart) {
    regionOverview.chart.resize()
  }
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

// 监听date
watch(
  () => props.date,
  () => {
    getTransBillOverview()
    getTransMonthBillOverview()
  },
)

onMounted(() => {
  getTransMonthBillOverview()
  getTransBillOverview()

  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)

  // 销毁图表
  if (transMonthBillOverview.chart) {
    echarts.dispose(transMonthBillOverview.chart)
  }
  if (productOverview.chart) {
    echarts.dispose(productOverview.chart)
  }
  if (projectOverview.chart) {
    echarts.dispose(projectOverview.chart)
  }
  if (billingModeOverview.chart) {
    echarts.dispose(billingModeOverview.chart)
  }
  if (regionOverview.chart) {
    echarts.dispose(regionOverview.chart)
  }
})
</script>

<style lang="scss" scoped>
.overview-v2 {
  &__notice {
    margin-bottom: 20px;
  }

  /* background-color: #fff; */

  .top-charts {
    /* height: 338px; */

    .info-wrap {
      width: 320px;

      /* padding-bottom: 20px; */

      .top {
        margin-bottom: 30px;

        .month {
          width: 60px;
          height: 60px;
          color: #fff;

          /* line-height: 60px; */
          text-align: center;
          background: #fa8d15;
          border-radius: 50%;
        }

        .desc1 {
          margin-bottom: 6px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 16px;

          // font-weight: 500;
          color: var(--primary-text);
        }

        .desc2 {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 12px;
          font-weight: 400;
          color: var(--common-text);
        }
      }

      .center {
        margin-bottom: 15px;

        .total-cost-key {
          margin-bottom: 6px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: var(--primary-text);
        }

        .total-cost-value {
          font-family: PingFangSC, 'PingFang SC';

          // font-weight: 500;
          color: var(--primary-text);

          .num1 {
            font-size: 14px;
          }

          .num2 {
            font-size: 32px;
          }
        }
      }

      .bottom {
        position: relative;
        box-sizing: border-box;
        width: 300px;
        padding: 20px;

        /* height: 101px; */

        /* background: url('../../../../../../assets/images/cost-center/expense-bill/payment.png'); */
        background: #f9fafc;
        border: 1px solid #eee;
        border-radius: 6px;

        .triangle-down {
          position: absolute;
          top: -14px;
          left: 24px;
          width: 22px;
          height: 14px;
          clip-path: polygon(50% 0, 100% 100%, 0 100%);
          background: #e8ecf3;
          transform: translateX(-50%);

          &::after {
            position: absolute;
            top: 1px;
            left: 1px;
            width: 20px;
            height: 13px;
            clip-path: polygon(50% 0, 100% 100%, 0 100%);
            content: '';
            background: #f9fafc;
          }
        }

        .payment {
          box-sizing: border-box;

          // padding-left: 20px;
          width: 50%;

          .payment-key {
            margin-bottom: 6px;
            font-family: PingFangSC, 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            color: var(--common-text);
          }

          .payment-value {
            font-family: PingFangSC, 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            color: var(--primary-text);
          }
        }

        .pl20 {
          padding-left: 20px;
        }
      }
    }
  }

  .center-charts {
    height: 338px;
  }

  .bottom-charts {
    height: 338px;
  }

  .charts-box {
    height: 338px;
  }

  /* 公共样式 */
  .chart-wrap {
    /* padding: 0 20px; */

    .title-wrap {
      .title {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 16px;
        line-height: 22px;

        // font-weight: 500;
        color: var(--table-text);
      }
    }

    .charts {
      position: relative;

      .noData-wrap {
        position: absolute;
        top: 0;
        left: 0;
        background-color: #fff;
      }
    }

    // 费用趋势样式
    .btn-wrap {
      margin-right: 10px;
      border-radius: 4px;

      .btn {
        width: 80px;
        height: 32px;
        line-height: 32px;

        /* flex-grow: 1; 按钮宽度根据内容自适应 */
        text-align: center;
        border: 1px solid var(--border-c);
      }

      .left {
        // border-radius: 4px 0 0 4px;
      }

      .right {
        // border-radius: 0 4px 4px 0;
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

    // 地域汇总样式
    .map-wrap {
      /* margin-top: 50px; */

      /* padding-top: 50px; */

      .map-chart {
        position: relative;
        width: 50%;

        .map-img {
          height: 100%;
          max-height: 200px;
        }

        .dot {
          position: absolute;
          top: 55px;
          left: 260px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 3px;

          /* background: #394aff; */
          border-radius: 50%;
        }
      }

      .data-wrap {
        width: 50%;

        .key-wrap {
          width: 80px;

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
        }
      }
    }
  }
}

.tooltip {
  .main {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-text);
  }

  .sub {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 12px;
    font-weight: 400;
    color: var(--common-text);
  }
}

.border-r-1 {
  border-right: 1px solid var(--border-c);
}
</style>
