<template>
  <div class="flow">
    <InfoBoxCompare
      v-if="props.filter.start_time_next"
      v-loading="props.loading"
      :start-data="info"
      :end-data="compareInfo"
      :compare-time="compareTime"
    />
    <InfoBox v-else v-loading="props.loading" :info-arr="info" :compare-time="compareTime" />
    <div class="select-chart page-box pd20">
      <div class="select df fdc">
        <el-link type="primary" @click="handleExport">
          {{ t('exportFluxTitle') }}
          <SvgIcon name="cat-cdn-download" style="margin-left: 6px" />
        </el-link>
      </div>
      <div class="big-chart">
        <MultipleLineChart v-loading="props.loading" :unit="chartUnit" :x-data="xData" :x-list="xList" name="allFlux" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bindwidth, _flux, _fluxAll, _fluxExport, _fluxAllExport } from '@/apis/cdn/monitor'
import InfoBox, { InfoBoxInterface } from '../info-box.vue'
import InfoBoxCompare from '../info-box-compare.vue'
import { formatInfoBox, formatMonitorTime } from '../config'
import { getFlux, fluxFormat, getFluxDetail } from '@/utils/unit'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const props = defineProps<{
  filter: Bindwidth
  loading: boolean
}>()
const info = ref<InfoBoxInterface[]>([
  { title: 'allFluxTopValue', value: 0, unit: 'B', time: 0, type: 'flux' },
  { title: 'allFluxLowValue', value: 0, unit: 'B', time: 0, type: 'flux' },
  { title: 'allFlux', value: 0, unit: '', time: 0, type: 'flux', doubleTime: true },
])
const compareInfo = ref<InfoBoxInterface[]>([
  { title: 'allFluxTopValue', value: 0, unit: 'B', time: 0, type: 'flux' },
  { title: 'allFluxLowValue', value: 0, unit: 'B', time: 0, type: 'flux' },
  { title: 'allFlux', value: 0, unit: 'B', time: 0, type: 'flux', doubleTime: true },
])
const compareTime = reactive<any>({
  startTime: '',
  endTime: '',
})

const xList = ref<string[]>([])
const xData = ref<any[]>([
  {
    title: 'allFlux',
    color: '#65db79',
    data: [],
  },
])
const maxValue = ref<number>(0)
const chartUnit = computed(() => {
  return getFluxDetail(maxValue.value).unit
})
const handleQuery = (v: Bindwidth) => {
  // 重置时间轴
  xList.value = []
  if (v.start_time_next && v.end_time_next) {
    // 需要对比数据的处理
    handleCompare(v)
  } else {
    // 正常数据的处理
    handleSplit(v)
  }
}
const getData = async (query: Bindwidth & { isCompare?: boolean }): Promise<any> => {
  const fn = query.pageType === '3' ? _fluxAll : _flux
  return fn(query).then(({ data }) => data)
}

// 需要对比数据的处理
const handleCompare = async (v: Bindwidth) => {
  const keys = ['top_flux', 'low_flux', 'total_flux']
  let obj: any = {
    area: v.area,
    domain_ids: v.domain_ids,
    interval: v.interval,
    pageType: v.pageType,
    start_time: v.start_time,
    end_time: v.end_time,
  }
  // 原始数据
  const data = await getData(obj)
  compareTime.startTime =
    getDateDayjs(v.start_time * 1000, 'string', true) + ' ~ ' + getDateDayjs(v.end_time * 1000, 'string', true)
  formatInfoBox(keys, data, info.value)
  maxValue.value = Math.max(maxValue.value, Math.max(...data.details.map(v => v.value)))
  xData.value = [
    {
      title: t('allFlux'),
      color: '#65db79',
      unit: chartUnit.value,
      data: data.details.map(item => {
        xList.value.push(formatMonitorTime(item.time))
        return fluxFormat(item.value, chartUnit.value, false)
      }),
      time: data.details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
    },
  ]

  // 对比数据
  const compareData = await getData({
    ...obj,
    start_time: v.start_time_next,
    end_time: v.end_time_next,
    isCompare: true,
  }) // 对比数据
  formatInfoBox(keys, compareData, compareInfo.value)
  compareTime.endTime =
    getDateDayjs(v.start_time_next! * 1000, 'string', true) +
    ' ~ ' +
    getDateDayjs(v.end_time_next! * 1000, 'string', true)
  maxValue.value = Math.max(maxValue.value, Math.max(...data.details.map(v => v.value)))
  xData.value.push({
    title: t('allFluxContrast'),
    color: '#3c4af5',
    unit: chartUnit.value,
    data: compareData.details.map(item => fluxFormat(item.value, chartUnit.value, false)),
    time: compareData.details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
  })
}
// 需要拆分数据的处理
const handleSplit = async (v: Bindwidth) => {
  const keys = ['top_flux', 'low_flux', 'total_flux']
  let obj: any = {
    area: v.area,
    domain_ids: v.domain_ids,
    interval: v.interval,
    pageType: v.pageType,
    start_time: v.start_time,
    end_time: v.end_time,
  }
  const data = await getData(obj)
  compareTime.startTime =
    getDateDayjs(v.start_time * 1000, 'string', true) + ' ~ ' + getDateDayjs(v.end_time * 1000, 'string', true)
  formatInfoBox(keys, data, info.value)

  // 是否按域名拆分数据
  if (!v.is_split) {
    maxValue.value = Math.max(maxValue.value, Math.max(...data.details.map(v => v.value)))
    xData.value = [
      {
        title: t('allFlux'),
        color: '#65db79',
        unit: chartUnit.value,
        data: data.details.map(item => {
          xList.value.push(formatMonitorTime(item.time))
          return fluxFormat(item.value, chartUnit.value, false)
        }),
        time: data.details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
      },
    ]
  } else {
    const splitDatas = await Promise.all(v.domain_ids.map(async id => getData({ ...obj, domain_ids: [id] })))

    xData.value = splitDatas.map((splitData, index) => {
      maxValue.value = Math.max(maxValue.value, Math.max(...splitData.details.map(v => v.value)))
      return {
        title: `${t('allFlux')} (${v.domain_names?.[index]})`,
        // color: index === 0 ? "#65db79" : "#3c4af5",
        unit: chartUnit.value,
        data: splitData.details.map(item => {
          // 只生成一次时间轴既可
          if (index === 0) xList.value.push(formatMonitorTime(item.time))
          return fluxFormat(item.value, chartUnit.value, false)
        }),
        time: splitData.details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
      }
    })
  }
}

const handleExport = async () => {
  const params: any = { ...props.filter }
  if (props.filter.start_time_next) {
    params.constrast = { ...props.filter }
    params.constrast.start_time = props.filter.start_time_next
    params.constrast.end_time = props.filter.end_time_next
  }
  const downloadFunc = props.filter.pageType === '3' ? _fluxAllExport : _fluxExport
  const blob = await downloadFunc(params)
  const f_name = `${props.filter.pageType === '3' ? 'ecdn' : 'cdn'}_${t('flux')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`
  downloadExportFiles(blob, f_name)
}

defineExpose({ handleQuery })
</script>

<style lang="scss" scoped>
@import '../common';
</style>
