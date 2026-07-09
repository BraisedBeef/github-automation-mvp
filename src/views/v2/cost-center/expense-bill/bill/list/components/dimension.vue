<template>
  <section class="bill-dimension-v2__panel">
    <div class="bill-dimension-v2__switches">
      <button
        v-for="item in dimensionTabs"
        :key="item.value"
        class="bill-dimension-v2__switch"
        :style="btnStyle"
        :class="{ 'is-active': active === item.value }"
        type="button"
        @click="active = item.value"
      >
        {{ item.label }}
      </button>
    </div>

    <TableV2 v-if="active === 1" v-loading="loading" :data="list.product" :empty-min-height="180">
      <el-table-column prop="type" :label="t('bill.productType')" min-width="180" />
      <el-table-column prop="money" :label="t('bill.money')" min-width="140" />
      <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="140" />
      <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="140" />
      <el-table-column
        prop="platformAdvancePaymentMoney"
        :label="t('bill.platformAdvancePaymentMoney')"
        min-width="160"
      />
      <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="140" />
      <el-table-column prop="qoq" :label="t('bill.qoq')" min-width="160">
        <template #default="{ row }">
          <QoqCell :value="row.qoq" />
        </template>
      </el-table-column>
      <el-table-column :label="t('bill.costTrends')" min-width="140" fixed="right">
        <template #default="{ row }">
          <button class="bill-dimension-v2__trend-btn" type="button" @click="openTransMonthBill('product', row)">
            <SvgIcon name="trend" class="bill-dimension-v2__trend-icon" />
            <span>{{ t('bill.showTrends') }}</span>
          </button>
        </template>
      </el-table-column>
    </TableV2>

    <TableV2
      v-else-if="active === 2"
      v-loading="loading"
      :data="projectTreeData"
      :empty-min-height="180"
      tree
      row-key="__rowKey"
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="type" :label="t('bill.projectType')" min-width="180">
        <template #default="{ row }">
          <span>{{ getProjectLabel(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="money" :label="t('bill.money')" min-width="140" />
      <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="140" />
      <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="140" />
      <el-table-column
        prop="platformAdvancePaymentMoney"
        :label="t('bill.platformAdvancePaymentMoney')"
        min-width="160"
      />
      <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="140" />
      <el-table-column prop="qoq" :label="t('bill.qoq')" min-width="160">
        <template #default="{ row }">
          <QoqCell :value="row.qoq" />
        </template>
      </el-table-column>
      <el-table-column :label="t('bill.costTrends')" min-width="140" fixed="right">
        <template #default="{ row }">
          <button class="bill-dimension-v2__trend-btn" type="button" @click.stop="openTrendForRow('project', row)">
            <SvgIcon name="trend" class="bill-dimension-v2__trend-icon" />
            <span>{{ t('bill.showTrends') }}</span>
          </button>
        </template>
      </el-table-column>
    </TableV2>

    <TableV2
      v-else-if="active === 3"
      v-loading="loading"
      :data="regionTreeData"
      :empty-min-height="180"
      tree
      row-key="__rowKey"
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="type" :label="t('bill.regionType')" min-width="180">
        <template #default="{ row }">
          <span>{{ getRegionLabel(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="money" :label="t('bill.money')" min-width="140" />
      <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="140" />
      <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="140" />
      <el-table-column
        prop="platformAdvancePaymentMoney"
        :label="t('bill.platformAdvancePaymentMoney')"
        min-width="160"
      />
      <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="140" />
      <el-table-column prop="qoq" :label="t('bill.qoq')" min-width="160">
        <template #default="{ row }">
          <QoqCell :value="row.qoq" />
        </template>
      </el-table-column>
      <el-table-column :label="t('bill.costTrends')" min-width="140" fixed="right">
        <template #default="{ row }">
          <button class="bill-dimension-v2__trend-btn" type="button" @click.stop="openTrendForRow('region', row)">
            <SvgIcon name="trend" class="bill-dimension-v2__trend-icon" />
            <span>{{ t('bill.showTrends') }}</span>
          </button>
        </template>
      </el-table-column>
    </TableV2>

    <TableV2
      v-else
      v-loading="loading"
      :data="costTreeData"
      :empty-min-height="180"
      tree
      row-key="__rowKey"
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="type" :label="t('bill.costType')" min-width="180">
        <template #default="{ row }">
          <span>{{ getCostLabel(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="money" :label="t('bill.money')" min-width="140" />
      <el-table-column prop="voucherMoney" :label="t('bill.voucherMoney')" min-width="140" />
      <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="140" />
      <el-table-column
        prop="platformAdvancePaymentMoney"
        :label="t('bill.platformAdvancePaymentMoney')"
        min-width="160"
      />
      <el-table-column prop="totalMoney" :label="t('bill.totalMoney')" min-width="140" />
      <el-table-column prop="qoq" :label="t('bill.qoq')" min-width="160">
        <template #default="{ row }">
          <QoqCell :value="row.qoq" />
        </template>
      </el-table-column>
      <el-table-column :label="t('bill.costTrends')" min-width="140" fixed="right">
        <template #default="{ row }">
          <button class="bill-dimension-v2__trend-btn" type="button" @click.stop="openTrendForRow('cost', row)">
            <SvgIcon name="trend" class="bill-dimension-v2__trend-icon" />
            <span>{{ t('bill.showTrends') }}</span>
          </button>
        </template>
      </el-table-column>
    </TableV2>

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
  </section>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { _getDimensionOverview, _getTransMonthBillOverview } from '@/apis/cost-center/expense-bill'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { maoYunDayJs, FORMAT_ONLY_MONTH_NO_UTC, FORMAT_YEAR_NO_UTC } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { COST_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import QoqCell from './qoq-cell.vue'

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
    width: '132px',
  },
  [en]: {
    width: '156px',
  },
  [zh]: {
    width: '112px',
  },
}

const btnStyle = useI18nStyle(btnStyleMap)
const active = ref(1)
const loading = ref(false)
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

const dimensionTabs = computed(() => [
  { label: t('bill.product'), value: 1 },
  { label: t('bill.project'), value: 2 },
  { label: t('bill.region'), value: 3 },
  { label: t('bill.billingMode'), value: 4 },
])

const transMonthBillOverview = reactive<{
  options: any
  chart: any
  list: any[]
  show: boolean
}>({
  options: {
    xAxis: {},
    yAxis: {},
    series: [],
  },
  chart: null,
  list: [],
  show: false,
})

const buildTreeRows = (rows: any[] = []) =>
  rows.map((row, parentIndex) => {
    const children = Array.isArray(row.items)
      ? row.items.map((child: any, childIndex: number) => ({
          ...child,
          __isChild: true,
          __parentType: row.type,
          __rowKey: `${row.type || 'row'}-child-${childIndex}`,
        }))
      : []

    return {
      ...row,
      __rowKey: `${row.type || 'row'}-parent-${parentIndex}`,
      children,
    }
  })

const projectTreeData = computed(() => buildTreeRows(list.project))
const regionTreeData = computed(() => buildTreeRows(list.region))
const costTreeData = computed(() => buildTreeRows(list.cost))

const getProjectLabel = (row: any) =>
  row.__isChild ? row.type : row.type === '0' ? t('bill.defaultProject') : row.type

const getRegionLabel = (row: any) => (row.__isChild ? row.type : row.description || '-')

const getCostLabel = (row: any) => (row.__isChild ? row.type : COST_TYPE_MAP[row.type] || row.type || '-')

const openTrendForRow = (type: string, row: any) => {
  if (row.__isChild) {
    openTransMonthBill(type, row, { type: row.__parentType })
    return
  }

  openTransMonthBill(type, {}, row)
}

const openTransMonthBill = (type: string, row: any, row2?: any) => {
  transMonthBillOverview.show = true

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

  nextTick(() => {
    getTransMonthBillOverview(paramsFunc())
  })
}

const handleClose = () => {
  if (transMonthBillOverview.chart) {
    transMonthBillOverview.chart.dispose()
    transMonthBillOverview.chart = null
    transMonthBillOverview.show = false
  }
}

const getTransMonthBillOverview = async (params: any) => {
  const res = await _getTransMonthBillOverview({
    transMonth: props.date,
    queryType: 1,
    ...params,
  })

  if (res.success) {
    transMonthBillOverview.list = res.data || []
    setTransMonthBillOverviewChart()
  }
}

const getDimensionOverview = async () => {
  try {
    loading.value = true
    const res = await _getDimensionOverview({
      queryDate: props.date,
      queryType: active.value,
    })

    if (res.success) {
      const listMap = {
        1: 'product',
        2: 'project',
        3: 'region',
        4: 'cost',
      } as const

      list[listMap[active.value]] = res.data || []
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const setTransMonthBillOverviewChart = () => {
  if (!transMonthBillOverview.chart) {
    transMonthBillOverview.chart = markRaw(echarts.init(document.getElementById('dimension-chart')))
  }

  const rawXAxisData: any[] = []
  const rawMoneyData: any[] = []
  const rawOriginalPriceData: any[] = []

  for (const el of transMonthBillOverview.list) {
    rawXAxisData.push(el.transDate)
    rawMoneyData.push(el.money)
    rawOriginalPriceData.push(el.discountPrice)
  }

  const options = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: [t('bill.totalMoney'), t('bill.money')],
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
        name: t('bill.totalMoney'),
        type: 'line',
        data: rawOriginalPriceData,
      },
      {
        name: t('bill.money'),
        type: 'line',
        data: rawMoneyData,
      },
    ],
  }

  transMonthBillOverview.options = options
  transMonthBillOverview.chart.setOption(options)
}

watch(active, () => {
  getDimensionOverview()
})

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
    echarts.dispose(transMonthBillOverview.chart)
    transMonthBillOverview.show = false
  }
})
</script>

<style scoped lang="scss">
.bill-dimension-v2__panel {
  padding: 20px;
  background: #fff;
}

.bill-dimension-v2__switches {
  display: inline-flex;
  margin-bottom: 20px;
}

.bill-dimension-v2__switch {
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

.bill-dimension-v2__switch + .bill-dimension-v2__switch {
  margin-left: -1px;
}

// .bill-dimension-v2__switch:first-child {
//   border-radius: 4px 0 0 4px;
// }

// .bill-dimension-v2__switch:last-child {
//   border-radius: 0 4px 4px 0;
// }

.bill-dimension-v2__switch.is-active {
  position: relative;
  z-index: 1;
  color: #06f;
  background: #f5f8ff;
  border-color: #06f;
}

.bill-dimension-v2__trend-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.bill-dimension-v2__trend-icon {
  width: 16px;
  height: 16px;
}

@media (width <= 768px) {
  .bill-dimension-v2__panel {
    padding: 16px;
  }

  .bill-dimension-v2__switches {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .bill-dimension-v2__switch,
  .bill-dimension-v2__switch:first-child,
  .bill-dimension-v2__switch:last-child {
    width: 100% !important;
    border-radius: 0;
  }

  .bill-dimension-v2__switch + .bill-dimension-v2__switch {
    margin-left: 0;
  }
}
</style>
