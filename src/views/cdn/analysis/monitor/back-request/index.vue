<template>
  <div class="back-request">
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
          {{ t('exportPullRequests') }}
          <SvgIcon name="cat-cdn-download" style="margin-left: 6px" />
        </el-link>
      </div>
      <div class="big-chart">
        <MultipleLineChart v-loading="props.loading" unit="numUnit" :x-data="xData" :x-list="xList" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Bindwidth,
  _backsource_request,
  _backsource_requestAll,
  _backRequestExport,
  _backRequestAllExport,
} from '@/apis/cdn/monitor'
import InfoBox, { InfoBoxInterface } from '../info-box.vue'
import InfoBoxCompare from '../info-box-compare.vue'
import { formatInfoBox, formatMonitorTime } from '../config'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const props = defineProps<{
  filter: Bindwidth
  loading: boolean
}>()
const info = ref<InfoBoxInterface[]>([
  { title: 'allRequestTopValue', value: 0, unit: 'numUnit', time: 0, type: 'request' },
  { title: 'allRequestLowValue', value: 0, unit: 'numUnit', time: 0, type: 'request' },
  { title: 'allRequestTitle', value: 0, unit: 'numUnit', time: 0, type: 'request', doubleTime: true },
  { title: 'pullFailRate', value: 0, unit: '%', time: 0, type: 'rate', doubleTime: true },
])
const compareInfo = ref<InfoBoxInterface[]>([
  { title: 'allRequestTopValue', value: 0, unit: 'numUnit', time: 0, type: 'request' },
  { title: 'allRequestLowValue', value: 0, unit: 'numUnit', time: 0, type: 'request' },
  { title: 'allRequestTitle', value: 0, unit: 'numUnit', time: 0, type: 'request', doubleTime: true },
  { title: 'pullFailRate', value: 0, unit: '%', time: 0, type: 'rate', doubleTime: true },
])
const compareTime = reactive<any>({
  startTime: '',
  endTime: '',
})

const xList = ref<string[]>([])
const xData = ref<any[]>([
  {
    title: 'pullRequestTitle',
    color: '#65db79',
    data: [],
  },
])
const handleQuery = (v: Bindwidth) => {
  if (v.start_time_next && v.end_time_next) {
    let obj: any = {
      area: v.area,
      domain_ids: v.domain_ids,
      interval: v.interval,
      pageType: v.pageType,
    }
    getData({ ...obj, start_time: v.start_time, end_time: v.end_time })
    getData({ ...obj, start_time: v.start_time_next, end_time: v.end_time_next, isCompare: true })
  } else {
    getData(v)
  }
}
const getData = async (query: Bindwidth & { isCompare?: boolean }) => {
  const fn = query.pageType === '3' ? _backsource_requestAll : _backsource_request
  await fn(query).then(({ data }) => {
    if (data) {
      let { details } = data
      const keys = ['top_request', 'low_request', 'total_request', 'failed_rate']
      if (query.isCompare) {
        //对比
        formatInfoBox(keys, data, compareInfo.value)
        compareTime.endTime =
          getDateDayjs(query.start_time * 1000, 'string', true) +
          ' ~ ' +
          getDateDayjs(query.end_time * 1000, 'string', true)
      } else {
        formatInfoBox(keys, data, info.value)
        compareTime.startTime =
          getDateDayjs(query.start_time * 1000, 'string', true) +
          ' ~ ' +
          getDateDayjs(query.end_time * 1000, 'string', true)
      }
      if (query.isCompare) {
        xData.value[1] = {
          title: t('pullResContrast'),
          color: '#3c4af5',
          unit: 'numUnit',
          data: details.map(item => {
            return item.value
          }),
          time: details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
        }
      } else {
        xList.value = []
        xData.value = [
          {
            title: t('pullRequestTitle'),
            color: '#65db79',
            unit: 'numUnit',
            data: details.map(item => {
              xList.value.push(formatMonitorTime(item.time))
              return item.value
            }),
            time: details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
          },
        ]
      }
    }
  })
}

const handleExport = async () => {
  const params: any = { ...props.filter }
  if (props.filter.start_time_next) {
    params.constrast = { ...props.filter }
    params.constrast.start_time = props.filter.start_time_next
    params.constrast.end_time = props.filter.end_time_next
  }
  const downloadFunc = props.filter.pageType === '3' ? _backRequestAllExport : _backRequestExport
  const blob = await downloadFunc(params)
  const f_name = `${props.filter.pageType === '3' ? 'ecdn' : 'cdn'}_${t('pullRequestTitle')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`
  downloadExportFiles(blob, f_name)
}

defineExpose({ handleQuery })
</script>

<style lang="scss" scoped>
@import '../common';
</style>
