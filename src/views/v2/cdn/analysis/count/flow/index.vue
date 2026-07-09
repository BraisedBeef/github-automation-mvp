<template>
  <div class="count-flow">
    <div class="df">
      <div class="chart mr20">
        <PieChart :data="pieChartData.flow" title="flux" />
      </div>
      <div style="flex: 1; width: 0">
        <TableV2 :data="state.tableData">
          <el-table-column prop="total" :label="t('allFlux')" />
          <el-table-column prop="hit" :label="t('hitFlux')" />
          <el-table-column prop="back_source" :label="t('pullFlux')" />
        </TableV2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _getStaticFlow, _getAllFlow, _exportStaticFlow, _exportAllFlow } from '@/apis/cdn/count'
import { getFlux } from '@/utils/unit'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import { getRate } from '@/utils/number-utils'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

interface TableDataItem {
  total: number
  hit: number
  back_source: number
}

const state = reactive<{
  tableData: TableDataItem[]
}>({
  tableData: [],
})

const pieChartData = reactive<{
  flow: any[]
}>({
  flow: [],
})

const colorList = ['#5b8ff9', '#62d9aa']
const getData = async (pageType, form) => {
  searchForm.value = form
  type.value = pageType
  let rawData
  if (pageType === '0,1,2') {
    await _getStaticFlow(form).then(res => {
      rawData = res.data ? [res.data] : []
    })
  } else {
    await _getAllFlow(form).then(res => {
      rawData = res.data ? [res.data] : []
    })
  }
  state.tableData = rawData.map(v => ({
    hit: getFlux(v.hit),
    back_source: getFlux(v.back_source),
    total: getFlux(v.total),
  }))
  if (rawData.length > 0) {
    pieChartData.flow = [
      {
        name: t('hitFlux'),
        value: rawData[0].hit,
        rate: rawData[0].hit === 0 ? 0 : getRate(rawData[0].hit, rawData[0].total),
        r_unit: '%',
        label: t('flux'),
        itemStyle: {
          color: colorList[0],
        },
      },
      {
        name: t('pullFlux'),
        value: rawData[0].back_source,
        rate: rawData[0].back_source === 0 ? 0 : getRate(rawData[0].back_source, rawData[0].total),
        r_unit: '%',
        label: t('flux'),
        itemStyle: {
          color: colorList[1],
        },
      },
    ]
  } else {
    pieChartData.flow = []
  }
}

const searchForm = ref<any>(null)
const type = ref<any>(null)
//导出数据
const download = async params => {
  let f
  if (type.value === '0,1,2') {
    f = await _exportStaticFlow(params)
  } else {
    f = await _exportAllFlow(params)
  }
  const f_name = decodeURIComponent(
    `${type.value === '3' ? 'ecdn' : 'cdn'}_${t('flux')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`,
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
