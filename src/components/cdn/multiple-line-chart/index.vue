<template>
  <div ref="chartDom" class="select-line-chart" />
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

import { use, init } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { getDateDayjs } from '@/utils/format-time'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
use([TooltipComponent, GridComponent, CanvasRenderer, LegendComponent, UniversalTransition, LineChart])

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

const initChart = () => {
  chartInstance.value = markRaw(init(chartDom.value))
  let option = {
    grid: {
      left: '2%',
      right: '2%',
      top: '12%',
      bottom: '80',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      formatter: v => {
        if (props.timeType === 'repeat') {
          return `<div>
        ${v
          .map(
            vv => `
        <div style="margin-top:${vv.seriesIndex === 0 || v.length === 1 ? '0' : '20'}px;">
          <div>${props.xData[vv.seriesIndex]?.time[vv.dataIndex]}</div>
          <div style="display:flex;align-items:center;margin-top:8px">
            <div style="width:6px;height:6px;border-radius:50%;background-color:${vv.color};margin-right:6px"></div>
            <div style="padding-right:10px">${vv.seriesName}</div>
            <div style="margin-left:auto;color:var(--primary-color)">${vv.data}${t(props.xData[vv.seriesIndex]?.unit)}</div>
          </div>
        </div>`,
          )
          .join('')}
      </div>`
        } else {
          return `<div>
        <div>${getDateDayjs(maoYunDayJs(v[0].axisValue), 'string', true)}</div>
        ${v
          .map(
            vv => `
        <div style="margin-top:${vv.seriesIndex === 0 || v.length === 1 ? '0' : '10'}px;">
          <div style="display:flex;align-items:center;margin-top:8px">
            <div style="width:6px;height:6px;border-radius:50%;background-color:${vv.color};margin-right:6px"></div>
            <div style="padding-right:10px">${vv.seriesName}</div>
            <div style="display:flex;align-items:center;margin-left:10px;color:var(--primary-color)">
              ${
                props.title.includes('statusCode')
                  ? `<div style="margin-right:10px">${vv.data}${t(props.xData[vv.seriesIndex]?.unit, { num: vv.data })}</div>
                <div>${props.xData[vv.seriesIndex]?.rate[vv.dataIndex]}</div>`
                  : `<div>${vv.data}${t(props.xData[vv.seriesIndex]?.unit)}</div>`
              }
            </div>
          </div>
        </div>`,
          )
          .join('')}
      </div>`
        }
      },
    },
    legend: {
      type: 'scroll',
      selectedMode: true,
      x: 'center',
      y: 'bottom',
      data: props.xData.map((v: any) => v.title),
      textStyle: {
        fontSize: 14,
        color: '#333333',
        rich: {
          a: {
            verticalAlign: 'middle',
          },
        },
      },
      icon: 'path://M38,40H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0H38a2,2,0,0,1,2,2V38A2,2,0,0,1,38,40ZM10.54,18.416h0L7.97,20.524,17.991,30.963c1.64-4.28,7.031-13.2,13.874-19.634l-.61-1.449A64.956,64.956,0,0,0,16.334,23.071L10.54,18.416ZM106,24H64V16h42v8Z',
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
      name: `${t('unit')}(${t(props.unit)})`,
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
        symbol: 'none',
        itemStyle: {
          color: v.color,
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
