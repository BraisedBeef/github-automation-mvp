<template>
  <div id="analysisChart" style="width: 100%; height: 100%" />
</template>

<script setup lang="ts">
import type { TrendChartData } from './type'
import echarts, { ECOption } from '@/utils/echarts'
import t from '@/utils/i18n'
import { maoYunDayJs, FORMAT_TO_MINUTE } from '@/utils/mao-yun-day-js'
const props = withDefaults(
  defineProps<{
    data: TrendChartData[]
    timeRange: string[]
  }>(),
  {
    data: () => [],
  },
)
let myEcharts = echarts
let chart: any
let valueArr = ref<number[]>([]) // 值
let xArr = ref<string[]>([]) // x轴数据
let total: number = 0 // 总请求次数
// option
const option = ref<ECOption>({
  // 设置图表的标题
  title: {
    text: t('dataStatistics.trendTitle'),
    subtext: t('dataStatistics.requestCount') + ': ' + total,
    padding: 20,
    textStyle: {
      fontFamily: 'PingFang SC-Regular',
      fontSize: 14,
      color: '#191c23',
      fontWeight: 500,
      lineHeight: 20,
    },
    subtextStyle: {
      fontFamily: 'PingFang SC-Regular',
      fontSize: 14,
      color: '#828b9c',
      fontWeight: 400,
    },
  },
  grid: {
    top: '116px',
    left: '64px',
    right: '32px',
    bottom: '56px',
  },
  // 设置图表的 X 轴
  xAxis: {
    // 数据类型为离散的类目数据
    type: 'category',
    boundaryGap: false,
    // 设置 X 轴数据
    data: xArr.value,
  },
  // 设置提示框组件
  tooltip: {
    // 设置提示框的触发条件
    trigger: 'axis',
    formatter: (a: any) => {
      if (a[0]) {
        return (
          `${t('dataStatistics.time')}: ` +
          maoYunDayJs(a[0].axisValue).format(FORMAT_TO_MINUTE) +
          `<br/> ${t('dataStatistics.requestCount')}: ` +
          a[0].data
        )
      } else {
        return ''
      }
    },
  },
  // 设置图表的 Y 轴
  yAxis: {
    // 数据类型为连续的数值数据
    type: 'value',
    min: 0,
  },
  // 设置图表的图例
  series: [
    {
      // 图例中要展示的数据
      data: valueArr.value,
      // 设置图表的类型为折线图
      type: 'line',
      // 平滑曲线
      smooth: true,
      showSymbol: false, // 显示小圆点
      lineStyle: {
        color: '#0063FF',
        width: 2,
      },
      areaStyle: {
        color: 'rgba(0, 99, 255, 0.06)',
      },
      tooltip: {},
      // emphasis: {
      //   label: {
      //     show: true,
      //     position: "top",
      //     color: "#000000",
      //     fontWeight: 400,
      //     fontFamily: "PingFang SC-Regular",
      //     fontSize: 12,
      //     align: "left",
      //     backgroundColor: "#ffffff",
      //     padding: 8,
      //     distance: 10,
      //     borderRadius: 4,
      //     borderColor: "#dddddd",
      //     borderWidth: 1,
      //     formatter: (params: any) => {
      //       return `${t("dataStatistics.time")}: ${params.name} \n\n${t(
      //         "dataStatistics.requestCount"
      //       )}: ${params.data}`;
      //     },
      //   },
      // },
    },
  ],
})
// 更新option
const updateOption = () => {
  if (option.value.series) {
    option.value.series[0].data = valueArr.value
  }
  if (option.value.title) {
    ;(option.value.title as any).subtext = t('dataStatistics.requestCount') + ': ' + total
  }
  ;(option.value.xAxis as any).data = xArr.value
}
// 初始化
const initChart = () => {
  try {
    // 基于准备好的dom，初始化echarts实例
    chart = myEcharts.init(document.getElementById('analysisChart'), 'purple-passion')

    chart.setOption(option.value)
  } catch (error) {
    console.log('catch', error)
  }
}
// 数据更新
watch(
  () => props.data,
  (data: TrendChartData[]) => {
    valueArr.value = []
    xArr.value = []
    total = 0
    if (!data[0]) {
    } else {
      data.forEach(item => {
        valueArr.value.push(item.count)
        xArr.value.push(item.dateTime)
        total += item.count
      })
    }
    updateOption()
    nextTick(() => {
      chart.setOption(option.value)
    })
  },
)
// 初始化dom
onMounted(() => {
  initChart()
})
// 卸载时销毁图表
onUnmounted(() => {
  // 销毁图表
  myEcharts.dispose(chart)
})

// window.onresize = function () {
//   // 重置容器高宽
//   chart.resize();
// };

const getChart = () => {
  return chart
}
defineExpose({
  getChart,
})
</script>

<style scoped lang="scss"></style>
