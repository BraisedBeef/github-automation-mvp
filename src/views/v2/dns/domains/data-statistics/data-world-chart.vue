<template>
  <div id="dateWorldChart" style="width: 100%; height: 100%" />
</template>

<script setup lang="ts">
import echart, { ECOption } from '@/utils/echarts'
import * as echarts from 'echarts/core'
import world from '@/assets/json/world.json'
import type { MapChartData } from './type'
import { getMapMaxValue, nameMap } from './config'
import t from '@/utils/i18n'
const props = withDefaults(
  defineProps<{
    data: MapChartData[]
  }>(),
  {
    data: () => [],
  },
)
let myEcharts = echart // echarts
let chart: any // 当前chart实例
let maxValue = ref<number>(100) // 最大value

// option
const option = ref<ECOption>({
  // 设置图表的标题
  title: {
    text: t('dataStatistics.worldTitle'),
    padding: 0,
    textStyle: {
      fontFamily: 'PingFang SC-Regular',
      fontSize: 14,
      color: '#191c23',
      fontWeight: 500,
    },
  },
  grid: {
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
  },
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      return `${t('dataStatistics.country')}：${params.name} <br/> ${t(
        'dataStatistics.parseCount',
      )}：${params.value || 0}`
    },
  },
  visualMap: {
    min: 0,
    max: maxValue.value,
    realtime: false,
    calculable: true,
    text: [t('dataStatistics.high'), t('dataStatistics.low')],
    inRange: {
      color: ['#ffffff', '#0063FF'],
    },
    left: '0',
    bottom: '4%',
  },
  series: [
    {
      name: t('dataStatistics.worldMap'),
      type: 'map' as any,
      // @ts-ignore
      map: 'date-world' as any, // 这个是上面注册时的名字哦，registerMap（'这个名字保持一致'）
      zoom: 1.1,
      data: props.data,
      aspectScale: 1,
      // 自定义地区的名称映射
      nameMap,
      emphasis: {
        itemStyle: {
          areaColor: '#0063FF',
        } as any,
      },
      itemStyle: {
        areaColor: '#fff',
      } as any,
      select: {},
      left: '14%',
      top: '18%',
      bottom: '8%',
      right: '5%',
    },
  ],
})
// 更新option
const updateOption = () => {
  ;(option.value.visualMap as { max: number }).max = maxValue.value
  if (option.value.series) {
    option.value.series[0].data = props.data
  }
}

watch(
  () => props.data,
  () => {
    maxValue.value = getMapMaxValue(props.data)
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
// 注册地图
echarts.registerMap('date-world', world as any)
// 初始化图表dom
const initChart = () => {
  chart = myEcharts.init(document.getElementById('dateWorldChart'))
  chart.setOption(option)
}
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
