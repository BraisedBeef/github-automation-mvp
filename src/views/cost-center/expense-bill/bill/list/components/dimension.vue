<template>
  <div class="wrap">
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <el-card shadow="never" class="cost-wrap page-box mb20" :body-style="bodyStyle">
      <div class="btn-wrap df cursor-pointer mb20">
        <div class="btn one" :style="btnStyle" :class="active === 1 ? 'actived' : ''" @click="active = 1">
          {{ t('bill.product') }}
        </div>
        <div class="btn two" :style="btnStyle" :class="active === 2 ? 'actived' : ''" @click="active = 2">
          {{ t('bill.project') }}
        </div>
        <div class="btn three" :style="btnStyle" :class="active === 3 ? 'actived' : ''" @click="active = 3">
          {{ t('bill.region') }}
        </div>
        <div class="btn four" :style="btnStyle" :class="active === 4 ? 'actived' : ''" @click="active = 4">
          {{ t('bill.billingMode') }}
        </div>
      </div>
      <!-- 按产品名称  -->
      <template v-if="active === 1">
        <el-table v-loading="loading" :data="list.product" class="mt20 table" show-overflow-tooltip>
          <el-table-column prop="type" :label="t('bill.productType')" min-width="200">
            <template #default="{ row }">
              <span>{{ row.type }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="money" :label="t('bill.money')" min-width="200" />
          <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="200" />
          <!-- 赠送金支付 -->
          <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="200" />
          <!-- 平台垫付 -->
          <el-table-column
            prop="platformAdvancePaymentMoney"
            :label="t('bill.platformAdvancePaymentMoney')"
            min-width="250"
          />
          <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="200" />
          <el-table-column prop="qoq" :label="t('bill.qoq')" min-width="300">
            <template #default="{ row }">
              <div v-if="qoqRes(row.qoq) === 1" class="df ac" style="display: inline-flex">
                <SvgIcon name="trend-red" /><span class="text-error">{{ row.qoq + '%' }}</span>
              </div>
              <div v-if="qoqRes(row.qoq) === -1" class="df ac" style="display: inline-flex">
                <SvgIcon name="trend-green" /><span class="text-success">{{ row.qoq + '%' }}</span>
              </div>
              <span v-if="qoqRes(row.qoq) === 0">{{ row.qoq || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('bill.costTrends')" min-width="200">
            <template #default="{ row }">
              <SvgIcon name="trend" class="mr4" /><span
                class="text-primary cursor-pointer"
                @click="openTransMonthBill('product', row)"
                >{{ t('bill.showTrends') }}</span
              >
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 按项目 -->
      <template v-if="active === 2">
        <el-table
          ref="tableProjectRef"
          v-loading="loading"
          :data="list.project"
          class="mt20 table"
          show-overflow-tooltip
          @row-click="row => handleRowClick(tableProjectRef, row)"
        >
          <!-- 展开行 -->
          <el-table-column type="expand" width="40">
            <template #default="{ row: pRow }">
              <el-table
                v-loading="loading"
                :data="pRow.items"
                style="margin-left: -10px"
                show-overflow-tooltip
                :show-header="false"
              >
                <el-table-column width="40" />
                <el-table-column prop="type" :label="t('bill.projectType')" min-width="200">
                  <template #default="{ row }">
                    <span>{{ row.type }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="money" :label="t('bill.money')" min-width="200" />
                <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="200" />
                <!-- 赠送金支付 -->
                <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="200" />
                <!-- 平台垫付 -->
                <el-table-column
                  prop="platformAdvancePaymentMoney"
                  :label="t('bill.platformAdvancePaymentMoney')"
                  min-width="250"
                />
                <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="200" />
                <!-- 对比上月 -->
                <el-table-column :label="t('bill.qoq')" min-width="300">
                  <template #default="{ row }">
                    <div v-if="qoqRes(row.qoq) === 1" class="df ac" style="display: inline-flex">
                      <SvgIcon name="trend-red" /><span class="text-error">{{ row.qoq + '%' }}</span>
                    </div>
                    <div v-if="qoqRes(row.qoq) === -1" class="df ac" style="display: inline-flex">
                      <SvgIcon name="trend-green" /><span class="text-success">{{ row.qoq + '%' }}</span>
                    </div>
                    <span v-if="qoqRes(row.qoq) === 0">{{ row.qoq || 0 }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="t('bill.costTrends')" min-width="200">
                  <template #default="{ row: sRow }">
                    <SvgIcon name="trend" class="mr4" /><span
                      class="text-primary cursor-pointer"
                      @click="openTransMonthBill('project', sRow, pRow)"
                      >{{ t('bill.showTrends') }}</span
                    >
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="type" :label="t('bill.projectType')" min-width="200">
            <template #default="{ row }">
              <span>{{ row.type == '0' ? t('bill.defaultProject') : row.type }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="money" :label="t('bill.money')" min-width="200" />
          <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="200" />
          <!-- 赠送金支付 -->
          <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="200" />
          <!-- 平台垫付 -->
          <el-table-column
            prop="platformAdvancePaymentMoney"
            :label="t('bill.platformAdvancePaymentMoney')"
            min-width="250"
          />
          <!-- 总费用 -->
          <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="200" />
          <!-- 对比上月 -->
          <el-table-column :label="t('bill.qoq')" min-width="300">
            <template #default="{ row }">
              <div v-if="qoqRes(row.qoq) === 1" class="df ac" style="display: inline-flex">
                <SvgIcon name="trend-red" /><span class="text-error">{{ row.qoq + '%' }}</span>
              </div>
              <div v-if="qoqRes(row.qoq) === -1" class="df ac" style="display: inline-flex">
                <SvgIcon name="trend-green" /><span class="text-success">{{ row.qoq + '%' }}</span>
              </div>
              <span v-if="qoqRes(row.qoq) === 0">{{ row.qoq || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('bill.costTrends')" min-width="200">
            <template #default="{ row }">
              <SvgIcon name="trend" class="mr4" /><span
                class="text-primary cursor-pointer"
                @click.stop="openTransMonthBill('project', {}, row)"
                >{{ t('bill.showTrends') }}</span
              >
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 按地域 -->
      <template v-if="active === 3">
        <el-table
          ref="tableRegionRef"
          v-loading="loading"
          :data="list.region"
          class="mt20 table"
          show-overflow-tooltip
          @row-click="row => handleRowClick(tableRegionRef, row)"
        >
          <!-- 展开行 -->
          <el-table-column type="expand" width="40">
            <template #default="{ row: pRow }">
              <el-table
                v-loading="loading"
                :data="pRow.items"
                style="margin-left: -10px"
                show-overflow-tooltip
                :show-header="false"
              >
                <el-table-column width="40" />
                <el-table-column prop="type" min-width="200">
                  <template #default="{ row }">
                    <span>{{ row.type }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="money" :label="t('bill.money')" min-width="200" />
                <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="200" />
                <!-- 赠送金支付 -->
                <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="200" />
                <!-- 平台垫付 -->
                <el-table-column
                  prop="platformAdvancePaymentMoney"
                  :label="t('bill.platformAdvancePaymentMoney')"
                  min-width="250"
                />
                <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="200" />
                <el-table-column :label="t('bill.qoq')" min-width="300">
                  <template #default="{ row }">
                    <div v-if="qoqRes(row.qoq) === 1" class="df ac" style="display: inline-flex">
                      <SvgIcon name="trend-red" /><span class="text-error">{{ row.qoq + '%' }}</span>
                    </div>
                    <div v-if="qoqRes(row.qoq) === -1" class="df ac" style="display: inline-flex">
                      <SvgIcon name="trend-green" /><span class="text-success">{{ row.qoq + '%' }}</span>
                    </div>
                    <span v-if="qoqRes(row.qoq) === 0">{{ row.qoq || 0 }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="t('bill.costTrends')" min-width="200">
                  <template #default="{ row: sRow }">
                    <SvgIcon name="trend" class="mr4" /><span
                      class="text-primary cursor-pointer"
                      @click="openTransMonthBill('region', sRow, pRow)"
                      >{{ t('bill.showTrends') }}</span
                    >
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="type" :label="t('bill.regionType')" min-width="200">
            <template #default="{ row }">
              <span>{{ row.description || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="money" :label="t('bill.money')" min-width="200" />
          <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="200" />
          <!-- 赠送金支付 -->
          <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="200" />
          <!-- 平台垫付 -->
          <el-table-column
            prop="platformAdvancePaymentMoney"
            :label="t('bill.platformAdvancePaymentMoney')"
            min-width="250"
          />
          <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="200" />
          <el-table-column prop="voucherMoney" :label="t('bill.qoq')" min-width="300">
            <template #default="{ row }">
              <div v-if="qoqRes(row.qoq) === 1" class="df ac" style="display: inline-flex">
                <SvgIcon name="trend-red" /><span class="text-error">{{ row.qoq + '%' }}</span>
              </div>
              <div v-if="qoqRes(row.qoq) === -1" class="df ac" style="display: inline-flex">
                <SvgIcon name="trend-green" /><span class="text-success">{{ row.qoq + '%' }}</span>
              </div>
              <span v-if="qoqRes(row.qoq) === 0">{{ row.qoq || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('bill.costTrends')" min-width="200">
            <template #default="{ row }">
              <SvgIcon name="trend" class="mr4" /><span
                class="text-primary cursor-pointer"
                @click="openTransMonthBill('region', {}, row)"
                >{{ t('bill.showTrends') }}</span
              >
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 按计费模式 -->
      <template v-if="active === 4">
        <el-table
          ref="tableBillRef"
          v-loading="loading"
          :data="list.cost"
          class="mt20 table"
          show-overflow-tooltip
          @row-click="row => handleRowClick(tableBillRef, row)"
        >
          <!-- 展开行 -->
          <el-table-column type="expand" width="40">
            <template #default="{ row: pRow }">
              <el-table
                v-loading="loading"
                :data="pRow.items"
                style="margin-left: -10px"
                show-overflow-tooltip
                :show-header="false"
              >
                <el-table-column width="40" />
                <el-table-column prop="type" min-width="200">
                  <template #default="{ row }">
                    <span>{{ row.type }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="money" :label="t('bill.money')" min-width="200" />
                <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="200" />
                <!-- 赠送金支付 -->
                <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="200" />
                <!-- 平台垫付 -->
                <el-table-column
                  prop="platformAdvancePaymentMoney"
                  :label="t('bill.platformAdvancePaymentMoney')"
                  min-width="250"
                />
                <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="200" />
                <el-table-column :label="t('bill.qoq')" min-width="300">
                  <template #default="{ row }">
                    <div v-if="qoqRes(row.qoq) === 1" class="df ac" style="display: inline-flex">
                      <SvgIcon name="trend-red" /><span class="text-error">{{ row.qoq + '%' }}</span>
                    </div>
                    <div v-if="qoqRes(row.qoq) === -1" class="df ac" style="display: inline-flex">
                      <SvgIcon name="trend-green" /><span class="text-success">{{ row.qoq + '%' }}</span>
                    </div>
                    <span v-if="qoqRes(row.qoq) === 0">{{ row.qoq || 0 }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="t('bill.costTrends')" min-width="200">
                  <template #default="{ row: sRow }">
                    <SvgIcon name="trend" class="mr4" /><span
                      class="text-primary cursor-pointer"
                      @click="openTransMonthBill('cost', sRow, pRow)"
                      >{{ t('bill.showTrends') }}</span
                    >
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="type" :label="t('bill.costType')" min-width="200">
            <template #default="{ row }">
              <span>{{ COST_TYPE_MAP[row.type] }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="money" :label="t('bill.money')" min-width="200" />
          <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="200" />
          <!-- 赠送金支付 -->
          <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="200" />
          <!-- 平台垫付 -->
          <el-table-column
            prop="platformAdvancePaymentMoney"
            :label="t('bill.platformAdvancePaymentMoney')"
            min-width="250"
          />
          <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="200" />
          <el-table-column prop="voucherMoney" :label="t('bill.qoq')" min-width="300">
            <template #default="{ row }">
              <div v-if="qoqRes(row.qoq) === 1" class="df ac" style="display: inline-flex">
                <SvgIcon name="trend-red" /><span class="text-error">{{ row.qoq + '%' }}</span>
              </div>
              <div v-if="qoqRes(row.qoq) === -1" class="df ac" style="display: inline-flex">
                <SvgIcon name="trend-green" /><span class="text-success">{{ row.qoq + '%' }}</span>
              </div>
              <span v-if="qoqRes(row.qoq) === 0">{{ row.qoq || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('bill.costTrends')" min-width="200">
            <template #default="{ row }">
              <SvgIcon name="trend" class="mr4" /><span
                class="text-primary cursor-pointer"
                @click="openTransMonthBill('cost', {}, row)"
                >{{ t('bill.showTrends') }}</span
              >
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>

    <!-- 费用图表  -->
    <CatDialog
      v-model:dialog="transMonthBillOverview.show"
      :footer="false"
      :title="''"
      width="500px"
      destroy-on-close
      @update:dialog="handleClose"
    >
      <div id="dimension-chart" style="width: 100%; height: 240px" />
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { _getDimensionOverview, _getTransMonthBillOverview } from '@/apis/cost-center/expense-bill'
import t from '@/utils/i18n'
import * as echarts from 'echarts'
import { maoYunDayJs, FORMAT_YEAR_NO_UTC, FORMAT_ONLY_MONTH_NO_UTC } from '@/utils/mao-yun-day-js'
import { COST_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

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
    width: '120px',
  },
  [en]: {
    width: '140px',
  },
  [zh]: {
    width: '90px',
  },
}

const btnStyle = useI18nStyle(btnStyleMap)

const bodyStyle = { height: '100%' }
const loading = ref<boolean>(false)
const active = ref<number>(1) // tab
// 列表
const list = reactive<{
  product: any[]
  project: any[]
  region: any[]
  cost: any[]
}>({
  product: [],
  project: [],
  region: [],
  cost: [],
})

const tableProjectRef = ref<any>(null)
const tableRegionRef = ref<any>(null)
const tableBillRef = ref<any>(null)

// 费用图表
const transMonthBillOverview = reactive<{
  options: any
  chart: any
  list: any[]
  show: boolean
  type: string
}>({
  options: {
    xAxis: {},
    yAxis: {},
    series: [],
  },
  chart: null,
  list: [],
  show: false,
  type: 'product',
})

const tips = computed(() => [
  {
    main: t('bill.overviewTip1', [
      maoYunDayJs(props.date).format(FORMAT_YEAR_NO_UTC),
      maoYunDayJs(props.date).format(FORMAT_ONLY_MONTH_NO_UTC),
    ]),
    sub: [t('bill.overviewTip2')],
  },
])

// 打开图表弹窗
const openTransMonthBill = (type: string, row: any, row2?: any) => {
  transMonthBillOverview.show = true

  console.log(`openTransMonthBill===>`, type, row, row2)

  const paramsFunc = () => {
    switch (type) {
      case 'product':
        return {
          productId: row.type,
        }

      case 'project':
        return {
          productId: row.type,
          projectId: row2.type,
        }

      case 'region':
        return {
          productId: row.type,
          regionId: row2.type,
        }

      case 'cost':
        return {
          productId: row.type,
          costType: row2.type,
        }

      default:
        return {}
    }
  }

  console.log(paramsFunc())

  nextTick(() => {
    getTransMonthBillOverview(paramsFunc())
  })
}

// 弹窗关闭
const handleClose = () => {
  if (transMonthBillOverview.chart) {
    // 销毁图表
    transMonthBillOverview.chart.dispose()
    transMonthBillOverview.chart = null
    transMonthBillOverview.show = false
  }
}

// 获取费用趋势
const getTransMonthBillOverview = async (params: any) => {
  const res = await _getTransMonthBillOverview({
    transMonth: props.date,
    queryType: 1, // 1 半年 2 一年
    ...params,
  })

  console.log(`getTransMonthBillOverview===>`, res)

  if (res.success) {
    transMonthBillOverview.list = res.data || []
    setTransMonthBillOverviewChart()
  }
}

// 多维度账单汇总
const getDimensionOverview = async () => {
  try {
    loading.value = true
    const res = await _getDimensionOverview({
      queryDate: props.date,
      queryType: active.value,
    })

    console.log(`getDimensionOverview===>`, res)

    if (res.success) {
      const listMap = {
        1: 'product',
        2: 'project',
        3: 'region',
        4: 'cost',
      }

      list[listMap[active.value]] = res.data || []
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 百分比判断 -1跌 0没波动 1涨
const qoqRes = (num: number) => {
  // console.log(num, typeof num)
  num = Number(num)

  if (num > 0) {
    return 1
  } else if (num < 0) {
    return -1
  } else {
    return 0
  }
}

// 展开
const handleRowClick = (ins: any, row: any) => {
  ins?.toggleRowExpansion(row)
}

// 费用图表
const setTransMonthBillOverviewChart = () => {
  if (!transMonthBillOverview.chart) {
    transMonthBillOverview.chart = markRaw(echarts.init(document.getElementById('dimension-chart')))
  }

  // 设置数据源
  const rawXAxisData: any[] = [] // 日期
  const rawMoneyData: any[] = [] // 现金支付
  const rawVoucherData: any[] = [] // 代金券支付
  const rawOriginalPriceData: any[] = [] // 总费用
  for (const el of transMonthBillOverview.list) {
    rawXAxisData.push(el.transDate)
    rawMoneyData.push(el.money)
    rawVoucherData.push(el.voucherMoney)
    rawOriginalPriceData.push(el.discountPrice)
  }
  console.log(rawVoucherData, rawVoucherData)

  const options = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: [t('bill.totalMoney'), t('bill.money')], // 总费用 现金支付
    },
    grid: {
      left: '3%',
      right: '5.5%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: rawXAxisData,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: t('bill.totalMoney'), // 总费用
        type: 'line',
        data: rawOriginalPriceData,
      },
      {
        name: t('bill.money'), // 现金支付
        type: 'line',
        data: rawMoneyData,
      },
    ],
  }

  console.log(`options===>`, options)
  transMonthBillOverview.options = options
  transMonthBillOverview.chart.setOption(options)
}

// 监听tab
watch(active, () => {
  getDimensionOverview()
})

// 监听date
watch(
  () => props.date,
  () => {
    getDimensionOverview()
  },
)

onMounted(() => {
  getDimensionOverview()
})

onUnmounted(() => {
  if (transMonthBillOverview.chart) {
    // 销毁图表
    echarts.dispose(transMonthBillOverview.chart)
    transMonthBillOverview.show = false
  }
})
</script>

<style lang="scss" scoped>
.wrap {
  .btn-wrap {
    margin-right: 10px;
    border-radius: 4px;

    .btn {
      &:not(:first-child) {
        border-left-color: transparent;
      }

      width: 90px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      border: 1px solid var(--border-c);
    }

    .one {
      border-radius: 4px 0 0 4px;
    }

    .four {
      border-radius: 0 4px 4px 0;
    }

    .actived {
      color: var(--primary-color);
      background: var(--selected-bgc);
      border: 1px solid var(--primary-color) !important;
    }
  }
}
</style>
