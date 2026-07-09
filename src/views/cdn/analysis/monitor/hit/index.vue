<template>
  <div class="hit">
    <div class="data-list page-box df mt20 mb20">
      <div v-loading="props.loading" class="data-item">
        <div class="title">
          {{ t('fluxAverageHit') }}
        </div>
        <div v-show="info.flux_avg">
          <span class="count">{{ info.flux_avg }}</span>
          <span class="unit">%</span>
        </div>
        <div v-show="!info.flux_avg" class="null">-</div>
      </div>
      <div v-loading="props.loading" class="data-item">
        <div class="title">
          {{ t('requestAverageHit') }}
        </div>
        <div v-show="info.request_avg">
          <span class="count">{{ info.request_avg }}</span>
          <span class="unit">%</span>
        </div>
        <div v-show="!info.request_avg" class="null">-</div>
      </div>
    </div>

    <div class="select-chart page-box pd20">
      <div class="select df fdc">
        <el-link type="primary" @click="handleExport">
          {{ t('exportHitTitle') }}
          <SvgIcon name="cat-cdn-download" style="margin-left: 6px" />
        </el-link>
      </div>
      <div class="big-chart">
        <MultipleLineChart v-loading="props.loading" unit="%" :x-data="xData" :x-list="xList" time-type="norepeat" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bindwidth, _hitrate, _hitrateAll, _hitrateExport, _hitrateAllExport } from '@/apis/cdn/monitor'
import { formatMonitorTime } from '../config'
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
const info = ref<{
  flux_avg: any
  request_avg: any
}>({
  flux_avg: 0,
  request_avg: 0,
})

const xList = ref<string[]>([])
const xData = ref<any[]>([])
const getData = async (query: Bindwidth) => {
  const fn = query.pageType === '3' ? _hitrateAll : _hitrate
  await fn(query).then(({ data }) => {
    if (data) {
      info.value.flux_avg = +(data.flux_avg * 100).toFixed(2) || 0
      info.value.request_avg = +(data.request_avg * 100).toFixed(2) || 0
      // 图表
      let { flux_details, reqeust_details } = data
      const xD = flux_details.length > reqeust_details.length ? flux_details : reqeust_details // 判断使用哪个数组的时间值
      xList.value = xD && xD.map(item => formatMonitorTime(item.time))
      xData.value = [
        {
          title: t('resHitRate'),
          color: '#4176FD',
          unit: '%',
          data: reqeust_details.map(item => +(item.value * 100).toFixed(2)) || [],
          time: reqeust_details.map(v => getDateDayjs(v.time * 1000, 'string', true)) || [],
        },
        {
          title: t('fluxHitRate'),
          color: '#BF41FD',
          unit: '%',
          data: flux_details.map(item => +(item.value * 100).toFixed(2)) || [],
          time: flux_details.map(v => getDateDayjs(v.time * 1000, 'string', true)) || [],
        },
      ]
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
  const downloadFunc = props.filter.pageType === '3' ? _hitrateAllExport : _hitrateExport
  const blob = await downloadFunc(params)
  const f_name = `${props.filter.pageType === '3' ? 'ecdn' : 'cdn'}_${t('hitRateTitle')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`
  downloadExportFiles(blob, f_name)
}

defineExpose({
  handleQuery: getData,
})
</script>

<style lang="scss" scoped>
@import '../common';

.hit {
  .data-list {
    .data-item {
      flex: 1;
      width: 0;
      margin: 20px;
      margin-right: 0;
      font-weight: 700;
      border-right: 1px solid var(--border-c);

      &:last-child {
        border-right: none;
      }

      .title {
        color: var(--primary-text);
        white-space: nowrap;
      }

      .count {
        margin-right: 10px;
        font-size: 36px;
        color: var(--primary-color);
      }

      .unit {
        color: var(--primary-text);
      }

      .null {
        font-size: 36px;
        color: var(--primary-text);
      }
    }
  }
}
</style>
