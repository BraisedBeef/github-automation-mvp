<template>
  <el-card shadow="never" class="page-box mb20" :body-style="bodyStyle">
    <div class="df ac jsb mb20">
      <div class="df ac">
        <BtnsGroup v-model="btnValue" style="width: 80px" :list="btnsGroupList" @change-value="changeDate" />

        <div class="df ac">
          <span class="mr10">{{ t('common.select_time') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" />
          </el-tooltip>
        </div>
        <!-- 日期选择范围 -->
        <el-date-picker
          v-model="dateTime"
          class="ml10"
          style="width: 260px"
          type="daterange"
          start-placeholder=""
          end-placeholder=""
          :shortcuts="shortcuts"
          :range-separator="t('export.to')"
          :clearable="false"
          value-format="YYYY-MM-DD HH:mm:ss"
        />

        <div>
          <span class="ml10 name-text">{{ t('disk.monitor.time') }}</span>

          <el-select ref="moreOptsRef" v-model="monitorMetric.periodCur" class="ml10 select-opts" :placeholder="''">
            <el-option v-for="item in periodList" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>
      </div>

      <div>
        <CdnIconButton class="ml10" @click="refresh">
          <SvgIcon name="refresh" />
        </CdnIconButton>
        <!-- <el-button class="" @click="() => {}">
          <SvgIcon name="cat-cdn-download" />
        </el-button> -->
      </div>
    </div>

    <p class="desc mb10">
      {{ t('disk.monitor.desc') }}
    </p>

    <div class="list-wrap">
      <template v-for="(item, index) in chartList">
        <Chart
          v-if="monitorMetric.metrics.includes(item.params?.metricName)"
          :key="index"
          :params="item.params"
          :config="item.config"
          :refresh-num="refreshNum"
          class="mb10"
        />
      </template>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import Chart from './chart.vue'
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
    period: 60 | 300 | 3600 | 86400 // 60:1分钟粒度300:5分钟粒度3600:1小时粒度86400:1天粒度
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

// 获取时间
const getDateTime = (value: number, unit: ManipulateType) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(FORMAT_TIME_NO_UTC), end.format(FORMAT_TIME_NO_UTC)]
}

const btnsGroupList = [
  {
    label: t('disk.monitor.5m'),
    value: '5m',
  },
  {
    label: t('disk.monitor.1h'),
    value: '1h',
  },
  {
    label: t('disk.monitor.12h'),
    value: '12h',
  },
  {
    label: t('disk.monitor.2d'),
    value: '2d',
  },
]

const bodyStyle = { height: '100%' }

const shortcuts = [
  {
    text: t('disk.monitor.last2days'), // 最近2天
    value: () => {
      return getDateTime(2, 'day')
    },
  },
  {
    text: t('order.oneMonth'), // 最近一个月
    value: () => {
      return getDateTime(1, 'month')
    },
  },
  {
    text: t('order.threeMonth'), // 最近三个月
    value: () => {
      return getDateTime(3, 'month')
    },
  },
]

const cvmStore = useCvmStore()

// 日期选择范围 默认5分钟
const defaultTime = getDateTime(5, 'minute')
const dateTime = ref<any>(defaultTime)
const btnValue = ref<any>({
  label: t('disk.monitor.5m'),
  value: '5m',
})
const refreshNum = ref<number>(0)

// 监控
const monitorMetric = reactive<{
  list: any[]
  metrics: any[] // 指标集合
  periods: any[] // 粒度集合
  periodCur: string | number //粒度
}>({
  list: [],
  metrics: [],
  periods: [],
  periodCur: '',
})

// 硬盘读流量
const readFlow = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP['readFlow'],
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

// 硬盘写流量
const writeFlow = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP['writeFlow'],
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

// 硬盘读IOPS
const readIOPS = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP['readIOPS'],
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

// 硬盘写IOPS
const writeIOPS = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP['writeIOPS'],
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

// IO Await
const IOAwait = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP['IOAwait'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    mainTit: 'IO Await',
    subTit: t('disk.monitor.IOAwaitSubTit'),
    unit: 'ms',
    id: 'IOAwait-chart',
  },
})

// IO Svctm
const IOSvctm = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP['IOSvctm'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    mainTit: 'IO Svctm',
    subTit: t('disk.monitor.IOSvctmSubTit'),
    unit: 'ms',
    id: 'IOSvctm-chart',
  },
})

// IO %util
const IOUtil = reactive<ChartType>({
  params: {
    monitorType: 2,
    id: 0,
    metricName: HARDDISK_MONITER_METRIC_MAP['IOUtil'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    mainTit: 'IO %util ',
    subTit: t('disk.monitor.IOUtilSubTit'),
    unit: '%',
    id: 'IOUtil-chart',
  },
})

// 粒度下拉
const periodList = computed(() => {
  // 能支持的时间粒度
  const allPeriods = MONITER_PERIOD_MAP.filter(el => monitorMetric.periods.includes(el.value))

  if (btnValue.value.value === '2d') {
    // 最近2天
    return allPeriods.filter(el => [60, 300, 3600, 86400].includes(el.value))
  } else if (btnValue.value.value === '12h') {
    // 最近12小时
    return allPeriods.filter(el => [60, 300, 3600].includes(el.value))
  } else if (btnValue.value.value === '1h') {
    // 最近1小时
    return allPeriods.filter(el => [60, 300].includes(el.value))
  } else if (btnValue.value.value === '5m') {
    // 最近5分钟
    return allPeriods.filter(el => [60].includes(el.value))
  } else {
    // 大于两天
    return allPeriods.filter(el => [3600, 86400].includes(el.value))
  }
})

const chartList = computed(() => {
  return [readFlow, writeFlow, readIOPS, writeIOPS, IOAwait, IOSvctm, IOUtil]
})

// 刷新
const refresh = async () => {
  await getMonitorMetric()
  refreshNum.value++
}

// 日期切换
const changeDate = (v: any) => {
  console.log(`changeDate===>`, v)

  if (v.value === '2d') {
    // 最近2天
    dateTime.value = getDateTime(2, 'day')
  } else if (v.value === '12h') {
    // 最近12小时
    dateTime.value = getDateTime(12, 'hour')
  } else if (v.value === '1h') {
    // 最近1小时
    dateTime.value = getDateTime(1, 'hour')
  } else if (v.value === '5m') {
    // 最近5分钟
    dateTime.value = getDateTime(5, 'minute')
  }
}

// 更新chart params
const updateChartParams = (key: string, v: any) => {
  readFlow.params[key] = v
  writeFlow.params[key] = v
  readIOPS.params[key] = v
  writeIOPS.params[key] = v
  IOAwait.params[key] = v
  IOSvctm.params[key] = v
  IOUtil.params[key] = v
}

// 查询支持的指标
const getMonitorMetric = async () => {
  try {
    const res = await _getMonitorMetric({
      monitorType: 2, //监控类型 1 实例 2 硬盘
      regionId: cvmStore.areaSelect.id,
    })

    console.log(`_getMonitorMetric===>`, res)

    if (res.success) {
      monitorMetric.list = res.data || []
      monitorMetric.metrics = monitorMetric.list.map(el => el.metricName)
      // monitorMetric.periods = monitorMetric.list[0]?.periods || []
      // 这里先设置成所有粒度都可以选择
      monitorMetric.periods = [60, 300, 3600, 86400]
    }
  } catch (error) {
    console.log(error)
  }
}

// 监听datetime
watch(
  dateTime,
  () => {
    const startTime = dateTime.value[0]
    const endTime = dateTime.value[1]

    // 时间戳差值
    const timeTimestampRange = maoYunDayJs(endTime).valueOf() - maoYunDayJs(startTime).valueOf()

    if (timeTimestampRange === 3600 * 1000 * 24 * 2) {
      // 最近2天
      btnValue.value = btnsGroupList[3]
    } else if (timeTimestampRange === 3600 * 1000 * 12) {
      // 最近12小时
      btnValue.value = btnsGroupList[2]
    } else if (timeTimestampRange === 3600 * 1000) {
      // 最近1小时
      btnValue.value = btnsGroupList[1]
    } else if (timeTimestampRange === 300 * 1000) {
      // 最近5分钟
      btnValue.value = btnsGroupList[0]
    } else {
      // 大于两天
      btnValue.value = {}
    }
    console.log(`startTime endTime===>`, startTime, endTime)

    updateChartParams('startTime', startTime)
    updateChartParams('endTime', endTime)
  },
  {
    immediate: true,
  },
)

// 监听periodList
watch(periodList, v => {
  // 默认取第一个
  monitorMetric.periodCur = v.length ? v[0].value : ''
})

// 监听period
watch(
  () => monitorMetric.periodCur,
  v => {
    if (v) {
      updateChartParams('period', v)
    }
  },
)

// 监听id
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

<style lang="scss" scoped>
.name-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #555;
}

.desc {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.list-wrap {
  // placeholder
}
</style>
