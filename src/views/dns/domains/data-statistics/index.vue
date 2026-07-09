<template>
  <div class="data-statistics">
    <!-- 搜索条件 -->
    <div class="handle">
      <!-- 主机记录 -->
      <div>
        <span>{{ t('dataStatistics.host') }}</span>
        <el-select
          v-model="state.hostRecord"
          :disabled="state.loading"
          :placeholder="t('dataStatistics.host')"
          :clearable="true"
          style="width: 120px; margin-right: 20px"
          @change="getData"
        >
          <el-option v-for="item in state.hostOptions" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div>
        <span class="df ac">
          {{ t('dataStatistics.dateRange') }}
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <div class="ml5 top-1">
              <SvgIcon name="cat-cdn-help" />
            </div>
          </el-tooltip>
        </span>
        <el-date-picker
          v-model="state.dateTime"
          class="statistics-dater"
          type="daterange"
          unlink-panels
          :disabled="state.loading"
          :range-separator="t('dataStatistics.to')"
          :start-placeholder="t('dataStatistics.startTime')"
          :end-placeholder="t('dataStatistics.endTime')"
          :shortcuts="shortcuts"
          style="width: 274px"
          :clearable="false"
          :value-format="FORMAT_DAY_NO_UTC"
          @change="getData"
        />
      </div>
      <!-- 日期范围 -->
    </div>
    <!-- 图表 -->
    <div class="charts">
      <div class="chart-box">
        <!-- v-if="chartDatas.trend[0]"  -->
        <TrendChart ref="trend_chart" :data="chartDatas.trend" :time-range="state.dateTime" />
        <!-- <div class="chart-empty">
          {{ t("common.noData") }}
        </div> -->
      </div>
      <div class="chart-box">
        <DataWorldChart ref="world_chart" :data="chartDatas.world" />
      </div>
      <div class="chart-box">
        <DataChinaChart ref="china_chart" :data="chartDatas.china" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaseStore } from '@/store'
import { shortcuts } from './config'
// 总体趋势图表
import TrendChart from './trend-chart.vue'
// 全球
import DataWorldChart from './data-world-chart.vue'
// 中国
import DataChinaChart from './data-china-chart.vue'
import { _getTrendChart, _getWorldChart, _getChinaChart } from '@/apis/dns/domain'
import { _getAnalysisList } from '@/apis/dns/analysis'
import type { MapChartData, TrendChartData } from './type'
import { _debounce } from '@/utils/timing-utils'
import t from '@/utils/i18n'
import { _formateTimeDayjs } from '@/utils/format-time'
import { maoYunDayJs, FORMAT_DAY, FORMAT_DAY_NO_UTC } from '@/utils/mao-yun-day-js'
// import { events } from '@/utils/mitt'
const route = useRoute()
const baseStore = useBaseStore()
const state = reactive<{
  loading: boolean
  domainId: any
  domainName: string
  hostOptions: any[]
  hostRecord: string
  dateTime: any
}>({
  loading: false,
  domainId: void 0,
  domainName: '',
  hostOptions: [],
  hostRecord: '',
  dateTime: [],
})

const chartDatas = ref<{
  trend: TrendChartData[]
  world: MapChartData[]
  china: MapChartData[]
}>({
  trend: [],
  world: [],
  china: [],
})

const trend_chart = ref(),
  world_chart = ref(),
  china_chart = ref()

// 获取解析列表
const getAsyDate = async () => {
  try {
    state.loading = true
    const { code, data } = await _getAnalysisList({
      domainId: state.domainId,
      page: 1,
      pageSize: 999,
    })
    state.loading = false
    if (code === 200) {
      const { list } = data
      // list.push({ ...list[0], hostRecord: '@' })
      if (list && list[0]) {
        // state.hostOptions = Array.from(new Set(list.map(item => item.hostRecord))).map(a =>
        //   list.find(i => i.hostRecord === a),
        // )
        state.hostOptions = [
          { label: t('common.all'), value: '' },
          ...list.map((item: { hostRecord: any }) => {
            return {
              label: item.hostRecord,
              value: item.hostRecord,
            }
          }),
        ]
      } else {
        state.hostOptions = []
      }
    }
  } catch (error) {
    state.loading = false
  }
}

const getData = async () => {
  try {
    const { domainName, hostRecord, dateTime } = state
    let s = _formateTimeDayjs(dateTime[0], 'YYYY-MM-DD') + ' 00:00:00'
    let e = _formateTimeDayjs(dateTime[1], 'YYYY-MM-DD') + ' 00:00:00'

    let sTime: number = dateTime[0] ? maoYunDayJs(s).valueOf() / 1000 : maoYunDayJs().valueOf() / 1000
    let eTime: number = dateTime[0] ? maoYunDayJs(e).valueOf() / 1000 : maoYunDayJs().valueOf() / 1000
    // if (dateTime[0]) {
    //   sTime = parseInt(new Date(s).getTime() / 1000 + '')
    //   eTime = parseInt(new Date(e).getTime() / 1000 + '')
    // }
    let time = [sTime, eTime]
    state.loading = true
    const [trend, world, china] = await Promise.all([
      _getTrendChart({
        domainName,
        hostRecord,
        dateTime: JSON.stringify(time),
      }),
      _getWorldChart({
        domainName,
        hostRecord,
        dateTime: JSON.stringify(time),
      }),
      _getChinaChart({
        domainName,
        hostRecord,
        dateTime: JSON.stringify(time),
        country: '中国',
      }),
    ])
    state.loading = false
    if (trend.code === 200) {
      chartDatas.value.trend = trend.data || []
    }
    if (world.code === 200) {
      chartDatas.value.world = fn(world.data)
    }
    if (china.code === 200) {
      chartDatas.value.china = fn(china.data)
    }
    console.log('图表数据', chartDatas.value)
  } catch (error) {
    state.loading = false
  }
}
// 格式化world和china的data数据
const fn = (arr: any[]) => {
  if (!arr) {
    return []
  } else {
    return arr.map(item => ({ name: item.areaName, value: item.count }))
  }
}

// 自适应图表大小
const resizeChart = _debounce(() => {
  ;[trend_chart, world_chart, china_chart].forEach(r => {
    r?.value?.getChart()?.resize()
  })
}, 300)

onMounted(async () => {
  state.domainId = route.query.id
  state.domainName = (route.query.name as string) || ''
  await getAsyDate()
  // 默认显示今天
  const d = maoYunDayJs().format(FORMAT_DAY_NO_UTC)
  state.dateTime = [d, d]
  getData()
  window.addEventListener('resize', resizeChart)
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped lang="scss">
.data-statistics {
  padding: 0 20px;
}

.handle {
  display: flex;
  width: 100%;
  padding: 20px 0;

  & > div {
    display: flex;
    align-items: center;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);

    span {
      margin-right: 12px;
    }
  }
}

.charts {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  .chart-box {
    width: calc(50% - 10px);
    height: 400px;
    padding: 20px 20px 0;
    margin-bottom: 20px;
    border: 1px solid #dddcfc;
    border-radius: 4px;

    &:first-child {
      width: 100%;
      height: 415px;
      padding: 0;
    }

    &:nth-child(2) {
      margin-right: 20px;
    }

    .chart-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: 'PingFang SC', 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--common-text);
    }
  }
}

.ml5 {
  margin-left: 5px;
}

.top-1 {
  position: relative;
  top: -1px;
}
</style>
<style lang="scss">
.statistics-dater {
  padding: 0 12px !important;

  .el-range__icon {
    width: 16px;
    height: 16px;
  }

  .el-range-input {
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }

  .el-range-separator {
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 12px;
    font-weight: 400;
    color: var(--primary-text);
  }
}
</style>
