<template>
  <div id="dataChinaChart" style="width: 100%; height: 360px" />
</template>

<script setup lang="ts">
import echart, { ECOption } from '@/utils/echarts'
import * as echarts from 'echarts/core'
import china from '@/assets/json/china.json'
import type { MapChartData } from './type'
import { chinaNames, getMapMaxValue } from './config'
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
    text: t('dataStatistics.chinaTitle'),
    padding: 0,
    textStyle: {
      fontFamily: 'PingFang SC-Regular',
      fontSize: 14,
      color: '#000000',
      fontWeight: 500,
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      return `${t('dataStatistics.local')}：${params.name} <br/> ${t(
        'dataStatistics.parseCount',
      )}：${(params.data && params.data.value) || 0} `
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
  },
  series: [
    {
      name: t('dataStatistics.chinaMap'),
      type: 'map' as any,
      // @ts-ignore
      map: 'datachina', // 这个是上面注册时的名字哦，registerMap（'这个名字保持一致'）
      zoom: 1.2,
      data: props.data,
      // 自定义地区的名称映射
      nameMap: {},
      emphasis: {
        itemStyle: {
          areaColor: '#0063FF',
        } as any,
      },
      itemStyle: {
        areaColor: '#fff',
      } as any,
      // left: "15%",
      top: '15%',
      bottom: '10%',
      // right: "10%",
    },
  ],
})
const findName = (name): string => {
  return chinaNames.find(item => item.includes(name)) || ''
}
// 更新option
const updateOption = () => {
  props.data.forEach(item => {
    if (item.name) {
      item.name = findName(item.name)
    }
  })
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
echarts.registerMap('datachina', china as any)
// 初始化图表dom
const initChart = () => {
  // 基于准备好的dom，初始化echarts实例
  chart = myEcharts.init(document.getElementById('dataChinaChart'))
  chart.setOption(option.value)
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

<style lang="scss" scoped></style>
