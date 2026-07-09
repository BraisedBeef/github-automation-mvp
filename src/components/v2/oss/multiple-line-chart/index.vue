<template>
  <div ref="chartDom" class="select-line-chart" />
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

import { use, init } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent, GraphicComponent } from 'echarts/components'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { getDateDayjs } from '@/utils/format-time'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
use([
  TooltipComponent,
  GridComponent,
  CanvasRenderer,
  LegendComponent,
  GraphicComponent,
  UniversalTransition,
  LineChart,
])

const props = withDefaults(
  defineProps<{
    title?: string
    unit?: string
    xList?: string[]
    xData?: any[]
    deleteSecond?: boolean
    timeType?: 'repeat' | 'norepeat'
  }>(),
  {
    title: '默认标题',
    unit: '默认单位',
    xList: () => [
      // "08-07 16:00",
    ],
    xData: () => [
      // {
      //   title: 'resHitRate',
      //   color: "#4176FD",
      //   data: ["0.1", "0.3", "0.5"],
      // },
    ],
    timeType: 'repeat',
  },
)
const chartDom = ref<HTMLElement | null>(null)
const chartInstance = ref<any>(null)

const getTooltipMarker = (color: string) => {
  return `<span style="display:inline-block;width:24px;height:0;border-top:3px solid ${color};margin-right:12px;border-radius:999px;flex-shrink:0;"></span>`
}

const getUnitLabel = () => `${t('unit')}(${t(props.unit)})`

const getLegendLeft = () => {
  return getUnitLabel().length * 12
}

const formatTooltipValue = (seriesItem: any, dataItem: any) => {
  if (props.title.includes('statusCode')) {
    return `${dataItem.data}${t(seriesItem?.unit, { num: dataItem.data })} ${seriesItem?.rate?.[dataItem.dataIndex] || ''}`.trim()
  }

  return `${dataItem.data}${t(seriesItem?.unit)}`
}

const getTooltipDate = (items: any[]) => {
  if (!items.length) return ''

  if (props.timeType === 'repeat') {
    return props.xData[items[0].seriesIndex]?.time?.[items[0].dataIndex] || ''
  }

  return getDateDayjs(maoYunDayJs(items[0].axisValue), 'string', true)
}

const renderTooltipRows = (items: any[]) => {
  return items
    .map(item => {
      const seriesItem = props.xData[item.seriesIndex]

      return `
        <div style="display:flex;align-items:center;gap:0;margin-top:16px;">
          ${getTooltipMarker(item.color)}
          <div style="padding-right:12px;color:#5b657a;white-space:nowrap;">${item.seriesName}</div>
          <div style="margin-left:auto;color:var(--primary-color);white-space:nowrap;">${formatTooltipValue(seriesItem, item)}</div>
        </div>`
    })
    .join('')
}

const initChart = () => {
  chartInstance.value = markRaw(init(chartDom.value))
  let option = {
    grid: {
      left: '2%',
      right: '2%',
      top: 64,
      bottom: 32,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      formatter: v => {
        return `<div style="min-width:240px;">
          <div style="color:#232833;font-weight:500;">${getTooltipDate(v)}</div>
          ${renderTooltipRows(v)}
        </div>`
      },
    },
    graphic: [
      {
        type: 'text',
        left: 0,
        top: 8,
        style: {
          text: getUnitLabel(),
          fontSize: 14,
          fontWeight: 400,
          fill: '#7b88a1',
        },
      },
    ],
    legend: {
      type: 'scroll',
      selectedMode: true,
      left: getLegendLeft(),
      top: 2,
      data: props.xData.map((v: any) => v.title),
      itemWidth: 18,
      itemHeight: 4,
      itemGap: 28,
      textStyle: {
        fontSize: 14,
        color: '#333333',
        rich: {
          a: {
            verticalAlign: 'middle',
          },
        },
      },
      icon: 'roundRect',
    },
    xAxis: {
      type: 'category',
      data: props.xList,
      axisTick: {
        length: 20,
        alignWithLabel: true,
      },
      itemWidth: 40,
      itemHeight: 40,
      axisLabel: {
        margin: 28,
        fontSize: 10,
        color: '#000',
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
      minInterval: ['countUnit', 'numUnit'].includes(props.unit) ? 1 : '',
    },
    series: props.xData.map((v: any) => {
      return {
        name: v.title,
        type: 'line',
        backgroundColor: '#12cf96',
        // stack: "Total",
        data: v.data.map(vv => vv),
        symbol: 'circle',
        showSymbol: false,
        symbolSize: 8,
        itemStyle: {
          color: v.color,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        emphasis: {
          scale: false,
        },
        areaStyle: v.areaStyle ?? {},
      }
    }),
  }
  chartInstance.value.setOption(option)
}

const resize = () => {
  chartInstance.value?.resize()
}

watch(
  () => props.xData,
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
.select-line-chart {
  width: 100%;
  height: 100%;
}
</style>
