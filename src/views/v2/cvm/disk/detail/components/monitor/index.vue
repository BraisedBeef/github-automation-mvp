<template>
  <section class="cvm-disk-monitor-v2">
    <div class="cvm-disk-monitor-v2__toolbar">
      <div class="cvm-disk-monitor-v2__filters">
        <BtnsGroup v-model="btnValue" :style="{ padding: '0 14px' }" :list="btnsGroupList" @change-value="changeDate" />

        <el-date-picker
          v-model="dateTime"
          class="cvm-disk-monitor-v2__picker"
          type="daterange"
          start-placeholder=""
          end-placeholder=""
          :shortcuts="shortcuts"
          :range-separator="t('export.to')"
          :clearable="false"
          value-format="YYYY-MM-DD HH:mm:ss"
        />

        <div class="cvm-disk-monitor-v2__period">
          <span class="cvm-disk-monitor-v2__period-label">{{ t('disk.monitor.time') }}</span>
          <el-select v-model="monitorMetric.periodCur" class="cvm-disk-monitor-v2__period-select" :placeholder="''">
            <el-option v-for="item in periodList" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>
      </div>

      <div class="cvm-disk-monitor-v2__actions">
        <CdnIconButton @click="refresh">
          <SvgIcon name="refresh" />
        </CdnIconButton>
        <CdnIconButton>
          <SvgIcon name="cat-cdn-download" />
        </CdnIconButton>
      </div>
    </div>

    <p class="cvm-disk-monitor-v2__desc">
      {{ t('disk.monitor.desc') }}
    </p>

    <div class="cvm-disk-monitor-v2__list">
      <template v-for="(item, index) in chartList" :key="index">
        <Chart
          v-if="monitorMetric.metrics.includes(item.params?.metricName)"
          :params="item.params"
          :config="item.config"
          :refresh-num="refreshNum"
        />
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import Chart from '@/views/v2/cvm/disk/detail/components/monitor/chart.vue'
import { MONITER_PERIOD_MAP, HARDDISK_MONITER_METRIC_MAP } from '@/views/cvm/disk/config'
import { maoYunDayJs, ManipulateType, FORMAT_TIME_NO_UTC } from '@/utils/mao-yun-day-js'
import { _getMonitorMetric } from '@/apis/cvm/monitor'
import { useCvmStore } from '@/store'

export interface ChartType {
  params: {
    monitorType: number
    id: number
    metricName: string
    startTime: string
    endTime: string
    period: 60 | 300 | 3600 | 86400
  }
  config: {
    mainTit: string
    subTit: string
    unit: string
    id: string
  }
}

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {
  detail: () => ({}),
})

const getDateTime = (value: number, unit: ManipulateType) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(FORMAT_TIME_NO_UTC), end.format(FORMAT_TIME_NO_UTC)]
}

const btnsGroupList = [
  { label: t('disk.monitor.realtime'), value: '5m' },
  { label: t('disk.monitor.24h'), value: '24h' },
  { label: t('disk.monitor.7d'), value: '7d' },
]

const shortcuts = [
  { text: t('disk.monitor.last2days'), value: () => getDateTime(2, 'day') },
  { text: t('order.oneMonth'), value: () => getDateTime(1, 'month') },
  { text: t('order.threeMonth'), value: () => getDateTime(3, 'month') },
]

const cvmStore = useCvmStore()

const defaultTime = getDateTime(5, 'minute')
const dateTime = ref<any>(defaultTime)
const btnValue = ref<any>({
  label: t('disk.monitor.5m'),
  value: '5m',
})
const refreshNum = ref(0)

const monitorMetric = reactive<{
  list: any[]
  metrics: any[]
  periods: any[]
  periodCur: string | number
}>({
  list: [],
  metrics: [],
  periods: [],
  periodCur: '',
})

const readFlow = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP.readFlow,
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    mainTit: t('disk.monitor.readFlowMainTit'),
    subTit: t('disk.monitor.readFlowSubTit'),
    unit: 'KiB/s',
    id: 'readFlow-chart',
  },
})
const writeFlow = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP.writeFlow,
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    mainTit: t('disk.monitor.writeFlowMainTit'),
    subTit: t('disk.monitor.writeFlowSubTit'),
    unit: 'KiB/s',
    id: 'writeFlow-chart',
  },
})
const readIOPS = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP.readIOPS,
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    mainTit: t('disk.monitor.readIOPSMainTit'),
    subTit: t('disk.monitor.readIOPSSubTit'),
    unit: t('disk.monitor.unit'),
    id: 'readIOPS-chart',
  },
})
const writeIOPS = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP.writeIOPS,
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    mainTit: t('disk.monitor.writeIOPSMainTit'),
    subTit: t('disk.monitor.writeIOPSSubTit'),
    unit: t('disk.monitor.unit'),
    id: 'writeIOPS-chart',
  },
})
const IOAwait = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP.IOAwait,
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: { mainTit: 'IO Await', subTit: t('disk.monitor.IOAwaitSubTit'), unit: 'ms', id: 'IOAwait-chart' },
})
const IOSvctm = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP.IOSvctm,
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: { mainTit: 'IO Svctm', subTit: t('disk.monitor.IOSvctmSubTit'), unit: 'ms', id: 'IOSvctm-chart' },
})
const IOUtil = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP.IOUtil,
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: { mainTit: 'IO %util', subTit: t('disk.monitor.IOUtilSubTit'), unit: '%', id: 'IOUtil-chart' },
})

const periodList = computed(() => {
  const allPeriods = MONITER_PERIOD_MAP.filter(el => monitorMetric.periods.includes(el.value))
  if (btnValue.value.value === '7d') return allPeriods.filter(el => [60, 300, 3600, 86400].includes(el.value))
  if (btnValue.value.value === '24h') return allPeriods.filter(el => [60, 300, 3600].includes(el.value))
  if (btnValue.value.value === '5m') return allPeriods.filter(el => [60].includes(el.value))
  return allPeriods.filter(el => [3600, 86400].includes(el.value))
})

const chartList = computed(() => [readFlow, writeFlow, readIOPS, writeIOPS, IOAwait, IOSvctm, IOUtil])

const refresh = async () => {
  await getMonitorMetric()
  refreshNum.value++
}

const changeDate = (v: any) => {
  if (v.value === '7d') dateTime.value = getDateTime(7, 'day')
  else if (v.value === '24h') dateTime.value = getDateTime(1, 'day')
  else if (v.value === '5m') dateTime.value = getDateTime(5, 'minute')
}

const updateChartParams = (key: string, v: any) => {
  readFlow.params[key] = v
  writeFlow.params[key] = v
  readIOPS.params[key] = v
  writeIOPS.params[key] = v
  IOAwait.params[key] = v
  IOSvctm.params[key] = v
  IOUtil.params[key] = v
}

const getMonitorMetric = async () => {
  try {
    const res = await _getMonitorMetric({
      monitorType: 2,
      regionId: cvmStore.areaSelect.id,
    })
    if (res.success) {
      monitorMetric.list = res.data || []
      monitorMetric.metrics = monitorMetric.list.map(el => el.metricName)
      monitorMetric.periods = [60, 300, 3600, 86400]
    }
  } catch (error) {
    console.log(error)
  }
}

watch(
  dateTime,
  () => {
    const startTime = dateTime.value[0]
    const endTime = dateTime.value[1]
    const timeTimestampRange = maoYunDayJs(endTime).valueOf() - maoYunDayJs(startTime).valueOf()

    if (timeTimestampRange === 3600 * 1000 * 24 * 7) btnValue.value = btnsGroupList[2]
    else if (timeTimestampRange === 3600 * 1000 * 24) btnValue.value = btnsGroupList[1]
    else if (timeTimestampRange === 300 * 1000) btnValue.value = btnsGroupList[0]
    else btnValue.value = {}

    updateChartParams('startTime', startTime)
    updateChartParams('endTime', endTime)
  },
  { immediate: true },
)

watch(periodList, v => {
  monitorMetric.periodCur = v.length ? v[0].value : ''
})

watch(
  () => monitorMetric.periodCur,
  v => {
    if (v) updateChartParams('period', v)
  },
)

watch(
  () => props.detail.id,
  () => {
    updateChartParams('id', props.detail.id)
  },
  { immediate: true },
)

onMounted(() => {
  getMonitorMetric()
})
</script>

<style scoped lang="scss">
.cvm-disk-monitor-v2 {
  padding: 24px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-disk-monitor-v2__toolbar {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
}

.cvm-disk-monitor-v2__filters,
.cvm-disk-monitor-v2__period,
.cvm-disk-monitor-v2__actions {
  display: flex;
  align-items: center;
}

.cvm-disk-monitor-v2__filters {
  flex-wrap: wrap;
  gap: 16px;
}

.cvm-disk-monitor-v2__picker {
  width: 320px;
}

.cvm-disk-monitor-v2__period {
  gap: 12px;
}

.cvm-disk-monitor-v2__period-label,
.cvm-disk-monitor-v2__desc {
  font-size: 14px;
  line-height: 22px;
  color: #8b95a7;
}

.cvm-disk-monitor-v2__period-select {
  width: 190px;
}

.cvm-disk-monitor-v2__actions {
  flex-shrink: 0;
  gap: 12px;
}

.cvm-disk-monitor-v2__desc {
  margin: 16px 0 0;
}

.cvm-disk-monitor-v2__list {
  margin-top: 18px;
}

@media (width <= 1200px) {
  .cvm-disk-monitor-v2__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (width <= 768px) {
  .cvm-disk-monitor-v2 {
    padding: 16px;
  }

  .cvm-disk-monitor-v2__filters {
    gap: 12px;
  }

  .cvm-disk-monitor-v2__picker,
  .cvm-disk-monitor-v2__period-select {
    width: 100%;
  }

  .cvm-disk-monitor-v2__period {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .cvm-disk-monitor-v2__actions {
    justify-content: flex-end;
    width: 100%;
  }
}

:deep(.btn-wrap .btn:first-child, .btn-wrap .btn:last-child) {
  border-radius: 0 !important;
}
</style>
