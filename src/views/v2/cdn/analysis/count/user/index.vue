<template>
  <div class="count-user">
    <div class="chart-content df">
      <div class="chart mr20">
        <PieChart :data="pieChartData.flow" title="flux" />
      </div>
      <div class="chart mr20">
        <PieChart :data="pieChartData.count" title="visitCount" />
      </div>
    </div>
    <TableV2 :data="tableData">
      <el-table-column :label="t('accessArea')" prop="area">
        <template #default="{ row }">
          {{ getValueMap(areaList1, row.area) }}
        </template>
      </el-table-column>
      <!-- <el-table-column :label="t('flux')" prop="flux" /> -->
      <el-table-column :label="t('fluxRateTitle')" prop="flux_rate" />
      <!-- <el-table-column :label="t('requestCount')" prop="req" /> -->
      <el-table-column :label="t('requestRateTitle')" prop="req_rate" />
    </TableV2>
    <!-- <CatPagination v-model:pagination="state.pagination" @change="changePage" :total="state.total"
      :custom-keys="['page', 'page_size']" /> -->
  </div>
</template>

<script setup lang="ts">
import { _getStaticUser, _getAllUser, _exportStaticUser, _exportAllUser } from '@/apis/cdn/count'
import { areaList1 } from '@/assets/data/common.js'
import { getFlux } from '@/utils/unit'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import { getValueMap } from '@/utils/collection-utils'
import t from '@/utils/i18n'

import type { PieChartItem } from '@/components/cdn/pie-chart/index.vue'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { values } from 'lodash-es'

interface TableDataItem {
  area: string
  flux: number
  flux_rate: number
  req: number
  req_rate: number
}

const tableData = ref<TableDataItem[]>([])

const pieChartData = reactive<{
  flow: PieChartItem[]
  count: PieChartItem[]
}>({
  flow: [],
  count: [],
})

const colorList = ['#5b8ff9', '#62d9aa']
const getData = async (pageType, form) => {
  searchForm.value = form
  type.value = pageType
  let rawData

  if (pageType === '0,1,2') {
    await _getStaticUser(form).then(res => {
      rawData = res.data?.data || []
    })
  } else {
    await _getAllUser(form).then(res => {
      rawData = res.data?.data || []
    })
  }
  tableData.value = rawData.map(v => ({
    ...v,
    // flux: getFlux(v.flux),
    flux_rate: +(v.flux_rate * 100).toFixed(2) + '%',
    req: v.req + t('countUnit', { values: { num: v.req } }),
    req_rate: +(v.req_rate * 100).toFixed(2) + '%',
  }))
  pieChartData.flow = rawData.map((v, i) => ({
    name: getValueMap(areaList1, v.area),
    value: v.flux_rate,
    rate: +(v.flux_rate * 100).toFixed(2),
    r_unit: '%',
    label: t('flux'),
    itemStyle: {
      color: colorList[i],
    },
  }))
  pieChartData.count = rawData.map((v, i) => ({
    name: getValueMap(areaList1, v.area),
    value: v.req_rate,
    rate: +(v.req_rate * 100).toFixed(2),
    v_unit: 'countUnit',
    r_unit: '%',
    label: t('visitCount'),
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
    f = await _exportStaticUser(params)
  } else {
    f = await _exportAllUser(params)
  }
  const f_name = decodeURIComponent(
    `${type.value === '3' ? 'ecdn' : 'cdn'}_${t('userAccDis')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`,
  )
  downloadExportFiles(f, f_name)
}

defineExpose({ getData, download })
</script>

<style lang="scss" scoped>
.chart-content {
  .chart {
    width: 500px;
    aspect-ratio: 5/4;
  }
}
</style>
