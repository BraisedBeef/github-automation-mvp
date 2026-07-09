<template>
  <div ref="mapDom" class="map-chart" />
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import { ECharts } from 'echarts'
import { VisualMapComponent, VisualMapComponentOption, GeoComponent, GeoComponentOption } from 'echarts/components'
import { MapChart, MapSeriesOption } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([VisualMapComponent, GeoComponent, MapChart, CanvasRenderer])

type EChartsOption = echarts.ComposeOption<VisualMapComponentOption | GeoComponentOption | MapSeriesOption>

const props = withDefaults(
  defineProps<{
    type: number
  }>(),
  {
    type: 0,
  },
)

const mapDom = ref<HTMLElement | null>(null)
const mapInstance = ref<ECharts | null | any>(null)

const initMap = async (type: string) => {
  if (mapInstance.value) {
    mapInstance.value.dispose()
    mapInstance.value = null
  }

  mapInstance.value = echarts.init(mapDom.value)

  mapInstance.value.showLoading()

  let map = await import(`../../../assets/data/${type}.json`).then(res => res)

  echarts.registerMap(type, map)

  mapInstance.value.hideLoading()

  const option: EChartsOption = {
    visualMap: {
      min: 0,
      max: 1,
      text: ['高', '低'],
      realtime: false,
      calculable: true,
      inRange: {
        color: ['#FFFFFF', '#6193F9'],
      },
      left: '5%',
      bottom: '5%',
    },
    series: [
      {
        type: 'map',
        map: type,
        left: props.type ? '4%' : '10%',
        top: props.type ? '10%' : '1%',
        right: props.type ? '4%' : '10%',
      },
    ],
  }

  option && mapInstance.value.setOption(option)
}

let timer = ref<any>(null)
const resize = () => {
  mapInstance.value.resize()
}

watch(
  () => props.type,
  n => {
    timer.value = setTimeout(() => {
      initMap(n === 0 ? 'china' : 'world')

      clearTimeout(timer.value)
    }, 300)
  },
)

onMounted(() => {
  timer.value = setTimeout(async () => {
    await initMap(props.type === 0 ? 'china' : 'world')
    window.addEventListener('resize', resize)
    clearTimeout(timer.value)
  }, 300)
})

onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.dispose()
    mapInstance.value = null
  }
  window.removeEventListener('resize', resize)
})
</script>

<style lang="scss" scoped>
.map-chart {
  width: 100%;
  height: 100%;
}
</style>
