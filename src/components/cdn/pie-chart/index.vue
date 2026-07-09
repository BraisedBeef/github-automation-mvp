<template>
  <div ref="chartDom" class="pie-chart" />
</template>

<script setup lang="ts">
import { getFlux } from '@/utils/unit'
import t from '@/utils/i18n'

import { use, init } from 'echarts/core'
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

export interface PieChartItem {
  value: number | string
  rate: number | string
  name: number | string
  label?: string
  v_unit?: string
  r_unit?: string
  itemStyle?: { color: string }
}
use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout])
const props = withDefaults(
  defineProps<{
    title?: string
    left?: string
    data: PieChartItem[]
  }>(),
  {
    title: '',
    left: '',
    data: () => [],
  },
)
const chartDom = ref<HTMLElement | null>(null)
const chartInstance = ref<any>(null)
const initChart = () => {
  chartInstance.value = markRaw(init(chartDom.value))
  const option = {
    title: {
      text: t(props.title),
      textStyle: {
        fontSize: 16,
      },
      left: 'center',
      bottom: '16%',
    },
    legend: {
      x: 'center',
      bottom: '6%',
      itemWidth: 8,
      itemHeight: 8,
      icon: 'circle',
    },
    tooltip: {
      show: props.data.length > 0,
      borderColor: '#ffffff',
      extraCssText: 'box-shadow: 0px 4px 10px 1px rgba(0,0,0,0.2);',
      formatter: p => {
        return `<div>
          <div>${p.data.label}</div>
          <div style="display:flex;align-items:center;margin-top:10px;">
            <div style="width:10px;height:10px;border-radius:50%;background-color:${p.color};margin-right:10px"></div>
            <div style="margin-right:30px">${p.name}</div>
            <div>${p.data.rate}${t(p.data.r_unit) || ''}</div>
          </div>
        </div>`
      },
    },
    series: [
      {
        name: props.title,
        type: 'pie',
        center: ['50%', '38%'],
        radius: ['40%', '66%'],
        label: {
          show: true,
          position: 'inside',
          color: '#fff',
          formatter(param) {
            return param.data.rate * 100 > 0 ? param.data.rate + '%' : ''
          },
        },
        labelLine: { show: false },
        data:
          props.data.length > 0 ? props.data : [{ value: 0, rate: 0, name: t('noData'), itemStyle: { color: '#ccc' } }],
      },
    ],
  }
  chartInstance.value.setOption(option)
}
const resize = () => {
  chartInstance.value?.resize()
}
watch(
  () => props.data,
  () => {
    if (chartInstance.value) {
      chartInstance.value.dispose()
      chartInstance.value = null
    }
    initChart()
  },
  { deep: true },
)
const resizeObserver = new ResizeObserver(params => {
  resize()
})
onMounted(() => {
  resizeObserver.observe(chartDom.value!)
})
onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  resizeObserver.unobserve(chartDom.value!)
})
</script>

<style lang="scss" scoped>
.pie-chart {
  width: 100%;
  height: 100%;
}
</style>
