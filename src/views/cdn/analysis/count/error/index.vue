<template>
  <div class="count-flow">
    <div class="df">
      <div class="chart mr20">
        <PieChart :data="pieChartData.error" title="errorCode" />
      </div>
      <div style="flex: 1; width: 0">
        <el-table :data="state.tableData">
          <el-table-column prop="code" :label="t('errorCode')" />
          <el-table-column prop="value" :label="t('quantity')" />
          <el-table-column prop="rate" :label="t('proportion')" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _getStaticError, _getAllError, _exportStaticError, _exportAllError } from '@/apis/cdn/count'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'

import type { PieChartItem } from '@/components/cdn/pie-chart/index.vue'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

interface TableDataItem {
  code: number
  value: number
  rate: number
}

const state = reactive<{
  tableData: TableDataItem[]
  pagination: {
    page: number
    page_size: number
  }
}>({
  tableData: [],
  pagination: {
    page: 1,
    page_size: 10,
  },
})

const pieChartData = reactive<{
  error: PieChartItem[]
}>({
  error: [],
})

const colorList = ['#5b8ff9', '#62d9aa', '#fa921f']

const getData = async (pageType, form) => {
  searchForm.value = form
  type.value = pageType
  let rawData
  if (pageType === '0,1,2') {
    await _getStaticError(form).then(res => {
      rawData = res.data?.data || []
    })
  } else {
    await _getAllError(form).then(res => {
      rawData = res.data?.data || []
    })
  }
  state.tableData = rawData.map(v => ({
    ...v,
    value: v.value + t('countUnit', { num: v.value }),
    rate: +(v.rate * 100).toFixed(2) + '%',
  }))
  pieChartData.error = rawData.map((v, i) => ({
    name: v.code,
    value: v.value,
    rate: +(v.rate * 100).toFixed(2),
    v_unit: 'countUnit',
    r_unit: '%',
    label: t('errorCodeCount'),
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
    f = await _exportStaticError(params)
  } else {
    f = await _exportAllError(params)
  }
  const f_name = decodeURIComponent(
    `${type.value === '3' ? 'ecdn' : 'cdn'}_${t('errorCode')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`,
  )
  downloadExportFiles(f, f_name)
}

defineExpose({ getData, download })
</script>

<style lang="scss" scoped>
.chart {
  height: 300px;
  aspect-ratio: 1.5/1;
}
</style>
