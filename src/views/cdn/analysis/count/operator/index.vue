<template>
  <div class="count-user">
    <div class="chart-content df">
      <div class="chart mr20">
        <PieChart :data="pieChartData.flow" title="flux" />
      </div>
      <div class="chart">
        <PieChart :data="pieChartData.count" title="requestCount" />
      </div>
    </div>

    <el-table :data="tableData">
      <el-table-column :label="t('operator')" prop="operator" />
      <el-table-column :label="t('fluxRateUnit')" prop="flux_rate">
        <template #default="{ row }">
          {{ row.flux_rate }}
        </template>
      </el-table-column>
      <el-table-column :label="t('bandwidthTop')" prop="top_bindwidth" />
      <el-table-column :label="t('requestCountRateTitle')" prop="request">
        <template #default="{ row }">
          {{ row.request_rate }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { _getStaticOperator, _getAllOperator, _exportStaticOperator, _exportAllOperator } from '@/apis/cdn/count'
import { bpsToMbps, getFlux } from '@/utils/unit'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'

import type { PieChartItem } from '@/components/cdn/pie-chart/index.vue'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

interface TableDataItem {
  operator: string
  flux: number
  flux_rate: number
  request: number
  request_rate: number
  top_bindwidth: number
  top_bindwidth_rate: number
}
const tableData = ref<TableDataItem[]>([])

const pieChartData = reactive<{
  flow: PieChartItem[]
  count: PieChartItem[]
}>({
  flow: [],
  count: [],
})
const colorList = ['#5b8ff9', '#62d9aa', '#667798']
const getData = async (pageType: '0,1,2' | '3', form) => {
  searchForm.value = form
  type.value = pageType
  let rawData
  if (pageType === '0,1,2') {
    await _getStaticOperator(form).then(res => {
      rawData = res.data?.data || []
    })
  } else {
    await _getAllOperator(form).then(res => {
      rawData = res.data?.data || []
    })
  }
  tableData.value = rawData.map(v => ({
    ...v,
    operator: t(v.operator),
    flux: getFlux(v.flux),
    flux_rate: +(v.flux_rate * 100).toFixed(2) + '%',
    request: v.request + t('countUnit', { num: v.requests }),
    request_rate: +(v.request_rate * 100).toFixed(2) + '%',
    top_bindwidth: bpsToMbps(v.top_bindwidth) + 'Mbps',
    top_bindwidth_rate: +(v.top_bindwidth_rate * 100).toFixed(2) + '%',
  }))
  pieChartData.flow = rawData.map((v, i) => ({
    name: t(v.operator),
    value: +(v.flux_rate * 100).toFixed(2),
    rate: +(v.flux_rate * 100).toFixed(2),
    r_unit: '%',
    label: t('flux'),
    itemStyle: {
      color: colorList[i],
    },
  }))
  pieChartData.count = rawData.map((v, i) => ({
    name: t(v.operator),
    value: +(v.request_rate * 100).toFixed(2),
    rate: +(v.request_rate * 100).toFixed(2),
    v_unit: 'countUnit',
    r_unit: '%',
    label: t('resCount'),
    itemStyle: {
      color: colorList[i],
    },
  }))
}

const searchForm = ref<any>(null)
const type = ref<any>(null)
//导出数据
const download = async params => {
  let f
  if (type.value === '0,1,2') {
    f = await _exportStaticOperator(params)
  } else {
    f = await _exportAllOperator(params)
  }
  const f_name = decodeURIComponent(
    `${type.value === '3' ? 'ecdn' : 'cdn'}_${t('operator')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`,
  )
  downloadExportFiles(f, f_name)
}

defineExpose({ getData, download })
</script>

<style lang="scss" scoped>
.chart-content {
  .chart {
    width: 500px;
    height: 380px;
  }
}
</style>
