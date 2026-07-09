<template>
  <div class="broadband">
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
          {{ t('exportBandwidthTitle') }}
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
import { Bindwidth, _bandwidth, _bindwidthAll, _bindWidthExport, _bindWidthAllExport } from '@/apis/cdn/monitor'
import InfoBox from '../info-box.vue'
import InfoBoxCompare from '../info-box-compare.vue'
import { InfoBoxInterface } from '../info-box.vue'
import { formatInfoBox, formatMonitorTime } from '../config'
import { bpsToMbps } from '@/utils/unit'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const props = defineProps<{
  filter: Bindwidth
  loading: boolean
}>()

const info = ref<InfoBoxInterface[]>([
  { title: 'bandwidthTopTitle', value: 0, unit: 'Mbps', time: 0, type: 'bandwidth' },
  { title: 'bandwidthLowValue', value: 0, unit: 'Mbps', time: 0, type: 'bandwidth' },
])
const compareInfo = ref<InfoBoxInterface[]>([
  { title: 'bandwidthTopTitle', value: 0, unit: 'Mbps', time: 0, type: 'bandwidth' },
  { title: 'bandwidthLowValue', value: 0, unit: 'Mbps', time: 0, type: 'bandwidth' },
])
const compareTime = reactive<{ startTime: string; endTime: string }>({
  startTime: '',
  endTime: '',
})

const xList = ref<string[]>([])
const xData = ref<any[]>([
  {
    title: 'bandwidth',
    color: '#65db79',
    data: [],
    unit: 'Mbps',
    time: [],
  },
])

// 查询数据
const handleQuery = async (v: Bindwidth) => {
  // 重置时间轴
  xList.value = []
  if (v.start_time_next && v.end_time_next) {
    // 对比数据处理
    handleCompare(v)
  } else {
    handleSplit(v)
  }
}

// 需要对比数据的处理
const handleCompare = async (v: Bindwidth) => {
  const keys = ['top_flux', 'low_flux']
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
  xData.value = [
    {
      title: t('bandwidth'),
      color: '#65db79',
      unit: 'Mbps',
      data: data.details.map(item => {
        xList.value.push(formatMonitorTime(item.time))
        return bpsToMbps(item.value)
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
  compareTime.endTime =
    getDateDayjs(v.start_time_next! * 1000, 'string', true) +
    ' ~ ' +
    getDateDayjs(v.end_time_next! * 1000, 'string', true)
  formatInfoBox(keys, compareData, compareInfo.value)
  xData.value.push({
    title: t('bandwidthContrast'),
    color: '#3c4af5',
    unit: 'Mbps',
    data: compareData.details.map(item => {
      return bpsToMbps(item.value)
    }),
    time: compareData.details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
  })
}
// 需要拆分数据的处理
const handleSplit = async (v: Bindwidth) => {
  const keys = ['top_flux', 'low_flux']
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
    xData.value = [
      {
        title: t('bandwidth'),
        color: '#65db79',
        unit: 'Mbps',
        data: data.details.map(item => {
          xList.value.push(formatMonitorTime(item.time))
          return bpsToMbps(item.value)
        }),
        time: data.details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
      },
    ]
  } else {
    const splitDatas = await Promise.all(v.domain_ids.map(async id => getData({ ...obj, domain_ids: [id] })))

    xData.value = splitDatas.map((splitData, index) => {
      return {
        title: `${t('bandwidth')} (${v.domain_names?.[index]})`,
        // color: index === 0 ? "#65db79" : "#3c4af5",
        unit: 'Mbps',
        data: splitData.details.map(item => {
          // 只生成一次时间轴既可
          if (index === 0) xList.value.push(formatMonitorTime(item.time))
          return bpsToMbps(item.value)
        }),
        time: splitData.details.map(v => getDateDayjs(v.time * 1000, 'string', true)),
      }
    })
  }
}

// 根据tab类型 使用不同的接口 获取数据
const getData = async (query: Bindwidth & { isCompare?: boolean }): Promise<any> => {
  const fn = query.pageType === '3' ? _bindwidthAll : _bandwidth
  return fn(query).then(res => res.data)
}

// 导出数据
const handleExport = async () => {
  const params: any = { ...props.filter }
  if (props.filter.start_time_next) {
    params.constrast = { ...props.filter }
    params.constrast.start_time = props.filter.start_time_next
    params.constrast.end_time = props.filter.end_time_next
  }
  const downloadFunc = props.filter.pageType === '3' ? _bindWidthAllExport : _bindWidthExport
  const blob = await downloadFunc(params)
  const f_name = `${props.filter.pageType === '3' ? 'ecdn' : 'cdn'}_${t('bandwidth')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`
  downloadExportFiles(blob, f_name)
}

defineExpose({ handleQuery })
</script>

<style lang="scss" scoped>
@import '../common';
</style>
