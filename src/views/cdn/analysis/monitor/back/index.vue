<template>
  <div class="back">
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
          {{ t('exportPullBandwidth') }}
          <SvgIcon name="cat-cdn-download" style="margin-left: 6px" />
        </el-link>
      </div>
      <div class="big-chart">
        <MultipleLineChart v-loading="props.loading" unit="Mb/s" :x-data="xData" :x-list="xList" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Bindwidth,
  _backsource_bindwidth,
  _backsource_bindwidthAll,
  _backBindwidthExport,
  _backBindwidthAllExport,
} from '@/apis/cdn/monitor'
import InfoBox from '../info-box.vue'
import InfoBoxCompare from '../info-box-compare.vue'
import { InfoBoxInterface } from '../info-box.vue'
import { formatInfoBox, formatMonitorTime } from '../config'
import { bpsToMbps } from '@/utils/unit'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const props = withDefaults(
  defineProps<{
    filter: Bindwidth
    loading: boolean
  }>(),
  {},
)
const info = ref<InfoBoxInterface[]>([
  { title: 'pullBandwidthTop', value: 0, unit: 'Mbps', time: 0, type: 'bandwidth' },
  { title: 'pullBandwidthLowValue', value: 0, unit: 'Mbps', time: 0, type: 'bandwidth' },
])
const compareInfo = ref<InfoBoxInterface[]>([
  { title: 'pullBandwidthTop', value: 0, unit: 'Mbps', time: 0, type: 'bandwidth' },
  { title: 'pullBandwidthLowValue', value: 0, unit: 'Mbps', time: 0, type: 'bandwidth' },
])
const compareTime = reactive<any>({
  startTime: '',
  endTime: '',
})

const xList = ref<string[]>([])
const xData = ref<any[]>([
  {
    title: 'pullBandwidth',
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
  const fn = query.pageType === '3' ? _backsource_bindwidthAll : _backsource_bindwidth
  await fn(query).then(({ data }) => {
    if (data) {
      let { details } = data
      const keys = ['top_flux', 'low_flux']
      if (query.isCompare) {
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
          title: t('pullBandwidthContrast'),
          color: '#3c4af5',
          unit: 'Mbps',
          data: details.map(item => {
            return bpsToMbps(item.value)
          }),
          time: details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
        }
      } else {
        xList.value = []
        xData.value = [
          {
            title: t('pullBandwidth'),
            color: '#65db79',
            unit: 'Mbps',
            data: details.map(item => {
              xList.value.push(formatMonitorTime(item.time))
              return bpsToMbps(item.value)
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
  const downloadFunc = props.filter.pageType === '3' ? _backBindwidthAllExport : _backBindwidthExport
  const blob = await downloadFunc(params)
  const f_name = `${props.filter.pageType === '3' ? 'ecdn' : 'cdn'}_${t('pullBandwidth')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`
  downloadExportFiles(blob, f_name)
}

defineExpose({ handleQuery })
</script>

<style lang="scss" scoped>
@import '../common';
</style>
