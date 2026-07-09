<template>
  <div class="status">
    <div class="select-chart page-box mt20 pd20">
      <div class="select df fdc">
        <el-link type="primary" @click="handleExport">
          {{ t('exportStatusCodeTitle') }}
          <SvgIcon name="cat-cdn-download" style="margin-left: 6px" />
        </el-link>
      </div>
      <div class="big-chart mt20">
        <MultipleLineChart
          v-loading="props.loading"
          unit="countUnit"
          :x-data="statusData"
          :x-list="xList"
          title="statusCode"
          time-type="norepeat"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bindwidth, _httpstatus, _httpstatusAll, _httpstatusExport, _httpstatusAllExport } from '@/apis/cdn/monitor'
import { formatMonitorTime } from '../config'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const props = defineProps<{
  filter: Bindwidth
  loading: boolean
}>()

const xList = ref<string[]>([])
const statusData = ref<any[]>([
  {
    title: '2xx',
    color: '#4176FD',
    data: [],
  },
  {
    title: '3xx',
    color: '#FAAD14',
    data: [],
  },
  {
    title: '4xx',
    color: '#FF4D4F',
    data: [],
  },
  {
    title: '5xx',
    color: '#1CC879',
    data: [],
  },
])
const getData = async (query: Bindwidth) => {
  const fn = query.pageType === '3' ? _httpstatusAll : _httpstatus
  await fn(query).then(res => {
    const { data } = res.data
    xList.value = []
    const sData: any = {
      code_2xx: [],
      code_3xx: [],
      code_4xx: [],
      code_5xx: [],
    } // 临时记录
    if (data) {
      data &&
        data.forEach(item => {
          xList.value.push(formatMonitorTime(item.time))
          sData.code_2xx.push(item.code_2xx)
          sData.code_3xx.push(item.code_3xx)
          sData.code_4xx.push(item.code_4xx)
          sData.code_5xx.push(item.code_5xx)
        })

      const values = Object.values(sData) as any
      statusData.value = statusData.value.map((item, index) => ({
        title: item.title,
        color: item.color,
        unit: 'countUnit',
        data: values[index].map(v => v.total),
        rate: values[index].map(v => +(v.rate * 100).toFixed(2) + '%'),
        time: xList.value,
      }))
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
  const downloadFunc = props.filter.pageType === '3' ? _httpstatusAllExport : _httpstatusExport
  const blob = await downloadFunc(params)
  const f_name = `${props.filter.pageType === '3' ? 'ecdn' : 'cdn'}_${t('statusCode')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`
  downloadExportFiles(blob, f_name)
}

defineExpose({ handleQuery: getData })
</script>

<style lang="scss" scoped>
@import '../common';
</style>
