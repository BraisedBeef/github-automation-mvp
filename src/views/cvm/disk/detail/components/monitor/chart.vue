<template>
  <el-row class="item df ac">
    <el-col :span="5">
      <div class="info">
        <p>
          <span class="info-text">{{ config.mainTit }}</span> <span class="info-company">{{ config.unit }}</span>
        </p>
        <p class="info-desc">
          {{ config.subTit }}
        </p>
      </div>
    </el-col>
    <el-col :span="19">
      <el-row class="item df ac border-b-1">
        <el-col :span="12">
          <div v-loading="loading">
            <div :id="config.id" style="height: 100px" />
          </div>
        </el-col>
        <el-col :span="4">
          <div class="max">
            <p class="key">Max:</p>
            <p class="value">{{ chartConfig.max }}{{ config.unit }}</p>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="min">
            <p class="key">Min:</p>
            <p class="value">{{ chartConfig.min }}{{ config.unit }}</p>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="avg">
            <p class="key">Avg:</p>
            <p class="value">{{ chartConfig.average }}{{ config.unit }}</p>
          </div>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
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
    period: 60 | 300 | 3600 | 86400 // 60:1分钟粒度300:5分钟粒度3600:1小时粒度86400:1天粒度
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
                  <div style="color: #999999; font-size: 14px;">${maoYunDayJs(item.name).format(FORMAT_TIME)}</div>
                  <div style="color: #222222; font-size: 14px;">${item.value}${props.config.unit}</div>
                  <div style="color: #999999; font-size: 14px;">${t('disk.monitor.countMethod')}</div>
                  <div style="color: #999999; font-size: 14px;">${t('disk.monitor.granularity', [PERIOD_MAP[props.params.period] || '-'])}</div>
               </div>`
      },
    },
    grid: {
      left: '10%',
      right: '5%',
      top: '10%',
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
      splitLine: {
        show: false, // 隐藏与X轴平行的网格线
      },
      splitNumber: 2, // 设置 Y 轴刻度为 2 个
      axisLabel: {
        formatter: function (value) {
          return value + ' -' // 在刻度前加上 '-'
        },
        margin: 10, // 调整标签与轴线之间的距离
        fontSize: 12, // 设置合适的字体大小
      },
    },
    series: [
      {
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

const loading = ref<boolean>(false)

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
.item {
  height: 100px;

  .info {
    .info-text {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
    }

    .info-company {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #999;
    }

    .info-desc {
      margin-top: 8px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 12px;
      font-weight: 400;
      color: #999;
    }
  }

  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 12px;
    font-weight: 400;
    color: #999;
  }

  .value {
    margin-top: 8px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 14px;
    color: #000;
  }
}

.border-b-1 {
  border-bottom: 1px solid #ddd;
}
</style>
