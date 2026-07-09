<template>
  <div class="count-flow">
    <div class="big-chart">
      <MultipleLineChart unit="Mbps" :x-list="lineChartData.xList" :x-data="lineChartData.xData" />
    </div>
    <TableV2 :data="state.tableData" table-layout="auto" class="mt20">
      <el-table-column prop="date">
        <template #header>
          <div>
            {{ t('date') }}
            <SvgIcon
              :name="!state.order ? 'sort' : state.order === 'asc' ? 'sort-up' : 'sort-down'"
              @click="changeSort"
            />
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon class="ml10" name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="hit_top" :label="t('bandwidthTopTitle')" />
      <el-table-column prop="hit_top_time" :label="t('topTimePoint')">
        <template #header>
          <div>
            {{ t('pullTopTimePoint') }}
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon class="ml10" name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="back_source_top" :label="t('pullBandwidthTop')" />
      <el-table-column prop="back_source_top_time" :label="t('pullTopTimePoint')">
        <template #header>
          <div>
            {{ t('pullTopTimePoint') }}
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon class="ml10" name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </TableV2>
    <CatPagination
      v-model:pagination="state.pagination"
      :custom-keys="['page', 'page_size']"
      :total="state.total"
      @change="changePage"
    />
  </div>
</template>

<script setup lang="ts">
import { _getStaticBroadband, _getAllBroadband, _exportStaticBroadband, _exportAllBroadband } from '@/apis/cdn/count'
import { getDateDayjs } from '@/utils/format-time'
import { bpsToMbps } from '@/utils/unit'
import { downloadExportFiles } from '@/utils/download'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

interface TableDataItem {
  date: 0
  hit_top: 0
  hit_top_time: 0
  back_source_top: 0
  back_source_top_time: 0
}

const state = reactive<{
  order: 'asc' | 'desc' | ''
  rawData: TableDataItem[]
  tableData: TableDataItem[]
  pagination: {
    page: number
    page_size: number
  }
  total: number
}>({
  order: '',
  rawData: [],
  tableData: [],
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})

const lineChartData = reactive<{
  xList: any[]
  xData: any[]
}>({
  xList: [1, 2, 3],
  xData: [],
})

const getData = async (pageType, form) => {
  searchForm.value = form
  type.value = pageType
  let rawData
  if (pageType === '0,1,2') {
    await _getStaticBroadband(form).then(res => {
      rawData = res.data?.data || []
      state.total = rawData.length
    })
  } else {
    await _getAllBroadband(form).then(res => {
      rawData = res.data?.data || []
      state.total = rawData.length
    })
  }
  state.rawData = rawData
  changePage({ page: state.pagination.page, page_size: state.pagination.page_size })
  lineChartData.xData[0] = {
    title: t('topBandwidth'),
    color: '#0FBE5B',
    data: rawData.map(v => bpsToMbps(v.hit_top)),
    time: rawData.map(v => getDateDayjs(v.hit_top_time * 1000, 'string', true)),
    unit: 'Mbps',
  }
  lineChartData.xData[1] = {
    title: t('pullBandwidth'),
    color: '#394AFF',
    data: rawData.map(v => bpsToMbps(v.back_source_top)),
    time: rawData.map(v => getDateDayjs(v.back_source_top_time * 1000, 'string', true)),
    unit: 'Mbps',
  }
  lineChartData.xList = rawData.map(v => getDateDayjs(v.date * 1000, 'string'))
}

const changeSort = () => {
  if (state.order === 'desc') {
    state.order = 'asc'
    state.rawData = state.rawData.sort((a, b) => maoYunDayJs(b.date).valueOf() - maoYunDayJs(a.date).valueOf())
  } else {
    state.order = 'desc'
    state.rawData = state.rawData.sort((a, b) => maoYunDayJs(a.date).valueOf() - maoYunDayJs(b.date).valueOf())
  }
  changePage({ page: state.pagination.page, page_size: state.pagination.page_size })
}

const changePage = (v?) => {
  state.tableData = state.rawData
    .slice((v.page - 1) * v.page_size, v.page_size + (v.page - 1) * v.page_size)
    .map(vv => ({
      date: getDateDayjs(vv.date * 1000, 'string', true),
      hit_top: bpsToMbps(vv.hit_top) + 'Mbps',
      hit_top_time: getDateDayjs(vv.hit_top_time * 1000, 'string', true),
      back_source_top: bpsToMbps(vv.back_source_top) + 'Mbps',
      back_source_top_time: getDateDayjs(vv.back_source_top_time * 1000, 'string', true),
    })) as any
}

const searchForm = ref<any>(null)
const type = ref<any>(null)
//导出数据
const download = async params => {
  let f
  if (type.value === '0,1,2') {
    f = await _exportStaticBroadband(params)
  } else {
    f = await _exportAllBroadband(params)
  }
  const f_name = decodeURIComponent(
    `${type.value === '3' ? 'ecdn' : 'cdn'}_${t('bandwidth')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`,
  )
  downloadExportFiles(f, f_name)
}

defineExpose({ getData, download })
</script>

<style lang="scss" scoped>
.big-chart {
  width: 100%;
  aspect-ratio: 1/0.3;
}
</style>
