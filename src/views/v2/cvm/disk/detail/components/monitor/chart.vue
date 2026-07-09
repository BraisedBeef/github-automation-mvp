<template>
  <section class="cvm-disk-monitor-chart-v2">
    <div class="cvm-disk-monitor-chart-v2__meta">
      <div class="cvm-disk-monitor-chart-v2__title-line">
        <span class="cvm-disk-monitor-chart-v2__title">{{ config.mainTit }}</span>
        <span class="cvm-disk-monitor-chart-v2__unit">{{ config.unit }}</span>
      </div>
      <p class="cvm-disk-monitor-chart-v2__desc">
        {{ config.subTit }}
      </p>
    </div>

    <div class="cvm-disk-monitor-chart-v2__chart-wrap">
      <div :id="config.id" v-loading="loading" class="cvm-disk-monitor-chart-v2__chart" />
    </div>

    <div class="cvm-disk-monitor-chart-v2__stats">
      <div class="cvm-disk-monitor-chart-v2__stat">
        <p class="cvm-disk-monitor-chart-v2__stat-key">Max:</p>
        <p class="cvm-disk-monitor-chart-v2__stat-value">{{ chartConfig.max }}{{ config.unit }}</p>
      </div>
      <div class="cvm-disk-monitor-chart-v2__stat">
        <p class="cvm-disk-monitor-chart-v2__stat-key">Min:</p>
        <p class="cvm-disk-monitor-chart-v2__stat-value">{{ chartConfig.min }}{{ config.unit }}</p>
      </div>
      <div class="cvm-disk-monitor-chart-v2__stat">
        <p class="cvm-disk-monitor-chart-v2__stat-key">Avg:</p>
        <p class="cvm-disk-monitor-chart-v2__stat-value">{{ chartConfig.average }}{{ config.unit }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _getMonitor } from '@/apis/cvm/monitor'
import { PERIOD_MAP } from '@/views/cvm/disk/config'
import * as echarts from 'echarts'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

export interface PropType {
  params?: {
    monitorType: number
    id: number
    metricName: string
    startTime: string
    endTime: string
    period: 60 | 300 | 3600 | 86400
  }
  config?: {
    mainTit: string
    subTit: string
    unit: string
    id: string
  }
  refreshNum: number
}

const props = withDefaults(defineProps<PropType>(), {
  params: () => ({
    monitorType: 2,
    id: 0,
    metricName: '',
    startTime: '',
    endTime: '',
    period: 60,
  }),
  config: () => ({
    mainTit: '',
    subTit: '',
    unit: '',
    id: 'monitor-chart',
    refreshNum: 0,
  }),
})

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

const setChart = () => {
  if (!chartConfig.chart) {
    chartConfig.chart = markRaw(echarts.init(document.getElementById(props.config.id)))
  }

  const rawXAxisData: any[] = []
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
                  <div style="color: #999999; font-size: 14px;">${t('disk.monitor.countMethod')}</div>
                  <div style="color: #999999; font-size: 14px;">${t('disk.monitor.granularity', [PERIOD_MAP[props.params.period] || '-'])}</div>
               </div>`
      },
    },
    grid: {
      left: '6%',
      right: '4%',
      top: '14%',
      bottom: '10%',
    },
    xAxis: {
      type: 'category',
      data: rawXAxisData,
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#d9e2ef',
        },
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: false,
      },
      splitNumber: 2,
      axisLabel: {
        formatter(value) {
          return value + ' -'
        },
        margin: 10,
        fontSize: 12,
        color: '#8b95a7',
      },
    },
    series: [
      {
        type: 'line',
        data: rawValueData,
        color: '#1f6bff',
        symbol: 'none',
        lineStyle: {
          width: 2,
        },
      },
    ],
  }

  chartConfig.options = options
  chartConfig.chart.setOption(options)
}

const loading = ref(false)

const resizeChart = () => {
  if (chartConfig.chart) {
    chartConfig.chart.resize()
  }
}

const refreshChart = () => {
  if (chartConfig.chart) {
    chartConfig.chart.clear()
    chartConfig.chart.setOption(chartConfig.options)
  }
}

const getMonitor = async () => {
  loading.value = true
  try {
    const res = await _getMonitor(props.params)
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

watch(
  () => props.refreshNum,
  () => {
    refreshChart()
  },
)

onMounted(() => {
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  if (chartConfig.chart) {
    echarts.dispose(chartConfig.chart)
  }
})

defineExpose({
  refreshChart,
})
</script>

<style scoped lang="scss">
.cvm-disk-monitor-chart-v2 {
  position: relative;
  display: grid;
  grid-template-columns: 252px minmax(0, 1fr) 320px;
  gap: 28px;
  align-items: center;
}

.cvm-disk-monitor-chart-v2::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 280px;
  height: 1px;
  content: '';
  background: #e8ecf3;
}

.cvm-disk-monitor-chart-v2__title-line {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.cvm-disk-monitor-chart-v2__title {
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: #191c23;
}

.cvm-disk-monitor-chart-v2__unit {
  font-size: 14px;
  line-height: 22px;
  color: #8b95a7;
}

.cvm-disk-monitor-chart-v2__desc {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: #8b95a7;
}

.cvm-disk-monitor-chart-v2__chart {
  height: 116px;
}

.cvm-disk-monitor-chart-v2__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.cvm-disk-monitor-chart-v2__stat-key {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #8b95a7;
}

.cvm-disk-monitor-chart-v2__stat-value {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 24px;
  color: #191c23;
}

@media (width <= 1200px) {
  .cvm-disk-monitor-chart-v2 {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .cvm-disk-monitor-chart-v2::after {
    left: 0;
  }

  .cvm-disk-monitor-chart-v2__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (width <= 768px) {
  .cvm-disk-monitor-chart-v2__stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
