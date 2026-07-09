<template>
  <div ref="chartBoxRef" class="chart-box">
    <div :id="config.id" class="chart" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _getMonitor } from '@/apis/cvm/monitor'
import * as echarts from 'echarts'
import { ElLoading } from 'element-plus'

export interface PropType {
  params?: {
    monitorType: number
    id: number
    metricName: string
    startTime: string
    endTime: string
    period: 0 | 60 | 300 | 3600 | 86400 // 60:1分钟粒度300:5分钟粒度3600:1小时粒度86400:1天粒度
  }
  config?: {
    id: string
  }
  unit: string
  refreshNum: number
  timeZone?: string // 日期的要显示时区
}

const props = withDefaults(defineProps<PropType>(), {
  params: () => ({
    monitorType: 3,
    id: 0,
    metricName: '',
    startTime: '',
    endTime: '',
    period: 60,
  }),
  config: () => ({
    id: 'monitor-chart',
  }),
  timeZone: '', // 日期的要显示时区
})

const periodMap = new Map([
  [60, t('publicIp.oneMin')],
  [300, t('publicIp.fiveMin')],
  [3600, t('publicIp.oneHour')],
  [86400, t('publicIp.oneDay')],
])

const chartBoxRef = ref<any>()
const loading = ref<any>()

const showLoading = () => {
  loading.value = ElLoading.service({
    target: chartBoxRef.value,
  })
}

const closeLoading = () => {
  loading.value && loading.value.close()
  loading.value = undefined
}

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
                <div style="color: #999999; font-size: 14px;">${item.name} ${props.timeZone || ''}</div>
                <div style="color: #222222; font-size: 14px;">${item.value} ${props.unit}</div>
                <div style="color: #999999; font-size: 14px;">${t('publicIp.granularity')}${periodMap.get(props.params.period)}</div>
            </div>`
      },
    },
    legend: {
      // data: ['num'], // 图例名称应与 series 中的 name 对应
      orient: 'horizontal', // 设置图例水平显示
      left: 'center', // 设置图例水平居中
      bottom: 0, // 设置图例位于底部并留出一定的间距
      icon: 'square',
    },
    grid: {
      left: '4%',
      right: '1%',
      top: '5%',
      bottom: '5%',
      // containLabel: true,
    },
    xAxis: {
      type: 'category',
      // boundaryGap: false,
      data: rawXAxisData,
      axisLabel: {
        show: false, // 隐藏X轴刻度标签
      },
    },
    yAxis: {
      type: 'value',
      splitNumber: 2, // 设置 Y 轴刻度为 2 个
      axisLabel: {
        margin: 10, // 调整标签与轴线之间的距离
        fontSize: 12, // 设置合适的字体大小
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

  chartConfig.options = options
  chartConfig.chart.setOption(options)
}

// 图表响应式
const resizeChart = () => {
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

// 查询指标监控数据
const getMonitor = async () => {
  closeLoading()
  showLoading()
  try {
    const res = await _getMonitor(props.params)
    closeLoading()
    //   console.log(`_getMonitor===>`, chartBoxRef.value)

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
    closeLoading()
    console.log(error)
  }
}

onMounted(() => {
  window.addEventListener('resize', resizeChart)
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
  getMonitor,
})
</script>

<style lang="scss" scoped>
.chart-box {
  height: 120px;
}

.chart {
  height: 120px;
}
</style>
