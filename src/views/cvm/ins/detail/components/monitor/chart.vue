<template>
  <div ref="chartContainerRef" class="chart-wrap mb20">
    <div class="title-wrap df ac jsb">
      <span>{{ config.title }}</span>
      <div class="icon-wrap pointer">
        <SvgIcon style="width: 17px; height: 17px" name="cs-full" @click="toggleFullscreen" />
      </div>
    </div>
    <div v-loading="loading" class="loading-wrap">
      <div :id="config.id" class="chart" />
    </div>
    <div v-if="config.legend" class="legend-wrap df ac">
      <div class="legend" />
      <span class="max">{{ config.legendName }}</span>
      <span class="max">{{ t('ins.monitor.max') }}{{ chartConfig.max }}</span>
      <span class="min">{{ t('ins.monitor.min') }}{{ chartConfig.min }}</span>
      <span class="avg">{{ t('ins.monitor.average') }}{{ chartConfig.average }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _getMonitor } from '@/apis/cvm/monitor'
import * as echarts from 'echarts'
import screenfull from 'screenfull'
import { ChartType } from './type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { PERIOD_MAP } from '@/views/cvm/disk/config'

const props = withDefaults(defineProps<ChartType>(), {
  params: () => ({
    monitorType: 1,
    id: 0,
    metricName: '',
    startTime: '',
    endTime: '',
    period: 60,
  }),
  config: () => ({
    title: '',
    id: 'monitor-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '',
  }),
})

// 图表
const chartConfig = reactive<{
  options: any
  chart: any
  list: any[]
  average: number
  max: number
  min: number
}>({
  options: {
    xAxis: {},
    yAxis: {},
    series: [],
  },
  chart: null,
  list: [],
  average: 0,
  max: 0,
  min: 0,
})

const loading = ref<boolean>(false)
const isFullscreen = ref<boolean>(false) // 全屏状态
const chartContainerRef = ref<any>() // 图表盒子

// 设置图表
const setChart = () => {
  if (!chartConfig.chart) {
    chartConfig.chart = markRaw(echarts.init(document.getElementById(props.config.id)))
  }

  // 设置数据源
  const rawXAxisData: any[] = [] // 日期
  const rawValueData: any[] = []
  for (const key in chartConfig.list) {
    rawXAxisData.push(key)
    rawValueData.push(chartConfig.list[key])
  }

  const options = {
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const item = params[0]
        return `<div>
                  <div style="color: #999999; font-size: 14px;">${maoYunDayJs(item.name).format(FORMAT_TIME)}</div>
                  <div style="color: #222222; font-size: 14px;">${item.value}${props.config.unit}</div>
                  <div style="color: #999999; font-size: 14px;">${t('disk.monitor.granularity', [PERIOD_MAP[props.params.period] || '-'])}</div>
               </div>`
      },
      appendToBody: true,
    },
    legend: {
      orient: 'horizontal', // 设置图例水平显示
      left: 'center', // 设置图例水平居中
      bottom: 0, // 设置图例位于底部并留出一定的间距
      icon: 'square',
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      // boundaryGap: false,
      data: rawXAxisData,
      axisLabel: {
        // show: false, // 隐藏X轴刻度标签
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      splitNumber: 2, // 设置 Y 轴刻度为 2 个
      axisLabel: {
        margin: 10, // 调整标签与轴线之间的距离
        fontSize: 12,
      },
    },
    series: [
      {
        // name: 'num',
        type: 'line',
        data: rawValueData,
        color: '#0063ff',
      },
    ],
  }

  console.log(`options===>`, options)
  chartConfig.options = options
  chartConfig.chart.setOption(options)
}

// 图表响应式
const resizeChart = () => {
  console.log(`resizeChart===>`)
  if (chartConfig.chart) {
    chartConfig.chart.resize()
  }
}

// 图表刷新
const refreshChart = () => {
  if (chartConfig.chart) {
    chartConfig.chart.clear()
    chartConfig.chart.setOption(chartConfig.options)
  }
}

// 切换全屏功能
const toggleFullscreen = () => {
  if (screenfull.isEnabled) {
    screenfull.toggle(chartContainerRef.value)
  }
}

// 查询指标监控数据
const getMonitor = async () => {
  loading.value = true
  try {
    const res = await _getMonitor(props.params)

    console.log(`_getMonitor===>`, res)

    if (res.success) {
      chartConfig.list = res.data?.data || {}
      chartConfig.average = res.data?.average || 0
      chartConfig.max = res.data?.max || 0
      chartConfig.min = res.data?.min || 0
      nextTick(() => {
        setChart()
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 监听params
watch(
  () => props.params,
  () => {
    if (props.params.id) getMonitor()
  },
  {
    deep: true,
    immediate: true,
  },
)

// 监听refreshNum
watch(
  () => props.config.refreshNum,
  () => {
    refreshChart()
  },
)

onMounted(() => {
  window.addEventListener('resize', resizeChart)

  // 在进入或退出全屏时调整图表大小
  if (screenfull.isEnabled) {
    screenfull.on('change', () => {
      isFullscreen.value = screenfull.isFullscreen
      chartConfig.chart?.resize()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)

  // 销毁图表
  if (chartConfig.chart) {
    echarts.dispose(chartConfig.chart)
  }
})

defineExpose({
  refreshChart,
})
</script>

<style lang="scss" scoped>
.chart-wrap {
  position: relative;
  box-sizing: border-box;
  height: 250px;
  padding: 20px 15px;
  border: 1px solid #eee;

  .title-wrap {
    height: 30px;
    margin-bottom: 10px;

    span {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 12px;
      color: #000;
    }

    .icon-wrap {
      // placeholder
    }
  }

  .loading-wrap {
    height: calc(100% - 30px - 30px);
  }

  .legend-wrap {
    height: 30px;

    .legend {
      width: 10px;
      height: 10px;
      background: #0063ff;
    }

    span {
      margin-left: 10px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 12px;
      font-weight: 400;
      color: #000;
    }
  }

  .chart {
    height: 100%;
  }

  &:fullscreen {
    width: 100vw;
    height: 100vh;
    background-color: white;
  }
}
</style>
