<template>
  <div class="count-flow">
    <div class="df">
      <div class="chart mr20">
        <PieChart :data="pieChartData.request" title="requestCount" />
      </div>
      <div style="flex: 1; width: 0">
        <el-table :data="state.tableData">
          <el-table-column prop="type" :label="t('type')" />
          <el-table-column prop="requests" :label="t('requestCount')" />
          <el-table-column prop="rate" :label="t('proportion')" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _getStaticRequest, _getAllRequest, _exportStaticRequest, _exportAllRequest } from '@/apis/cdn/count'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'

import type { PieChartItem } from '@/components/cdn/pie-chart/index.vue'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

interface TableDataItem {
  type: string
  requests: number
  rate: number
}

const state = reactive<{
  tableData: TableDataItem[]
  pagination: {
    page: number
    page_size: number
  }
  total: number
}>({
  tableData: [],
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})

const pieChartData = reactive<{
  request: PieChartItem[]
}>({
  request: [],
})

const colorList = ['#5b8ff9', '#62d9aa', '#fa921f']

const getData = async (pageType, form) => {
  searchForm.value = form
  type.value = pageType
  let rawData
  if (pageType === '0,1,2') {
    await _getStaticRequest(form).then(res => {
      rawData = res.data?.data || []
    })
  } else {
    await _getAllRequest(form).then(res => {
      rawData = res.data?.data || []
    })
  }
  state.tableData = rawData.map(v => ({
    type: t(v.type.toLocaleUpperCase()),
    requests: v.requests + t('countUnit', { num: v.requests }),
    rate: +(v.rate * 100).toFixed(2) + '%',
  }))
  pieChartData.request = rawData.map((v, i) => ({
    name: t(v.type.toLocaleUpperCase()),
    value: v.requests,
    rate: +(v.rate * 100).toFixed(2),
    v_unit: 'countUnit',
    r_unit: '%',
    label: t('requestCount'),
    itemStyle: {
      color: colorList[i],
    },
  }))
}

const searchForm = ref<any>(null)
const type = ref<any>(null)
const download = async params => {
  let f
  if (type.value === '0,1,2') {
    f = await _exportStaticRequest(params)
  } else {
    f = await _exportAllRequest(params)
  }
  const f_name = decodeURIComponent(
    `${type.value === '3' ? 'ecdn' : 'cdn'}_${t('requestCount')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`,
  )
  downloadExportFiles(f, f_name)
}
defineExpose({ getData, download })
</script>

<style lang="scss" scoped>
.chart {
  width: 500px;
  aspect-ratio: 1.5/1;
}
</style>
