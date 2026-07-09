<template>
  <div class="page-box pd20">
    <div class="mb20 df ac">
      <BtnsGroup v-model="btnValue" style="width: 80px" :list="btnsGroupList" @change-value="changeDate" />

      <div class="df ac">
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
      </div>

      <div>
        <span class="ml10 name-text">{{ t('ins.monitor.time') }}</span>

        <el-select ref="moreOptsRef" v-model="monitorMetric.periodCur" class="ml10 select-opts" :placeholder="''">
          <el-option v-for="item in periodList" :key="item.value" :value="item.value" :label="item.label" />
        </el-select>
      </div>
      <el-checkbox v-model="checkedLegend" class="ml10" :label="t('ins.monitor.legend')" size="large" />
      <CdnIconButton class="ml10" @click="refresh">
        <SvgIcon name="refresh" />
      </CdnIconButton>
    </div>

    <Cpu v-if="cpuList.length" :list="cpuList" />
    <Memory v-if="memoryList.length" :list="memoryList" />
    <Disk v-if="diskList.length" :list="diskList" />
    <Network v-if="networkList.length" :list="networkList" />
    <Storage v-if="storageList.length" :list="storageList" />
    <Particulars v-if="particularsList.length" :list="particularsList" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import Disk from './disk.vue'
import Memory from './memory.vue'
import Network from './network.vue'
import Particulars from './particulars.vue'
import Storage from './storage.vue'
import Cpu from './cpu.vue'
import { MONITER_PERIOD_MAP } from '@/views/cvm/disk/config'
import { INS_MONITER_METRIC_MAP } from '@/views/cvm/ins/config'
import { useCvmStore } from '@/store'
import { _getMonitorMetric } from '@/apis/cvm/monitor'
import { maoYunDayJs, ManipulateType, FORMAT_TIME_NO_UTC } from '@/utils/mao-yun-day-js'
import { ChartType } from './type'

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {
  detail: () => ({}),
})

const btnsGroupList = [
  {
    label: t('ins.monitor.5m'),
    value: '5m',
  },
  {
    label: t('ins.monitor.1h'),
    value: '1h',
  },
  {
    label: t('ins.monitor.12h'),
    value: '12h',
  },
  {
    label: t('ins.monitor.2d'),
    value: '2d',
  },
]
// 获取时间
const getDateTime = (value: number, unit: ManipulateType) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(FORMAT_TIME_NO_UTC), end.format(FORMAT_TIME_NO_UTC)]
}
const shortcuts = [
  {
    text: t('ins.monitor.last2days'), // 最近2天
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
  label: t('ins.monitor.5m'),
  value: '5m',
})
const checkedLegend = ref<boolean>(true) // 显示图例
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
const refreshNum = ref<number>(0)

// CPU利用率
const cpuUtil = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['cpuUtil'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.cpuUtil'),
    id: 'cpuUtil-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '%',
  },
})

// CPU使用率
const cpuUsage = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['cpuUsage'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.cpuUsage'),
    id: 'cpuUsage-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '%',
  },
})

// 一分钟平均负载
const loadAvg1m = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['loadAvg1m'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.loadAvg1m'),
    id: 'loadAvg1m-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '',
  },
})

// CPU五分钟平均负载
const loadAvg5m = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['loadAvg5m'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.loadAvg5m'),
    id: 'loadAvg5m-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '',
  },
})

// CPU十五分钟平均负载
const loadAvg15m = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['loadAvg15m'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.loadAvg15m'),
    id: 'loadAvg15m-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '',
  },
})

// 内存利用率(%)
const memUsage = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['memUsage'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.memUsage'),
    id: 'memUsage-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '%',
  },
})

// 内存使用量(MB)
const memUsageValue = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['memUsageValue'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.memUsageValue'),
    id: 'memUsageValue-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: 'MB',
  },
})

// 磁盘利用率(%)
const diskUtil = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['diskUtil'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.diskUtil'),
    id: 'diskUtil-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '%',
  },
})

// 内网入包量(个/s)
const netInPacket = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netInPacket'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netInPacket'),
    id: 'netInPacket-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: t('ins.monitor.individualSecond'),
  },
})

// 内网出包量(个/s)
const netOutPacket = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netOutPacket'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netOutPacket'),
    id: 'netOutPacket-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: t('ins.monitor.individualSecond'),
  },
})

// TCP连接数(个)
const tcpConnection = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['tcpConnection'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.tcpConnection'),
    id: 'tcpConnection-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: t('ins.monitor.individual'),
  },
})

// 内网入宽带(Mbps)
const netInBandwidth = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netInBandwidth'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netInBandwidth'),
    id: 'netInBandwidth-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: 'Mbps',
  },
})

// 内网出宽带(Mbps)
const netOutBandwidth = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netOutBandwidth'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netOutBandwidth'),
    id: 'netOutBandwidth-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: 'Mbps',
  },
})

// 子机utc时间和ntp时间差值(s)
const serverUtcNtpDiff = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['serverUtcNtpDiff'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.serverUtcNtpDiff'),
    id: 'serverUtcNtpDiff-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: 's',
  },
})

// 外网入包量(个/s)
const netInPacketExternal = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netInPacketExternal'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netInPacketExternal'),
    id: 'netInPacketExternal-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: t('ins.monitor.individualSecond'),
  },
})

// 外网出包量(个/s)
const netOutPacketExternal = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netOutPacketExternal'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netOutPacketExternal'),
    id: 'netOutPacketExternal-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: t('ins.monitor.individualSecond'),
  },
})

// 外网出流量(MB)
const netOutFlow = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netOutFlow'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netOutFlow'),
    id: 'netOutFlow-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: 'MB',
  },
})

// 外网出带宽使用率(%)
const netOutBandwidthUsage = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netOutBandwidthUsage'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netOutBandwidthUsage'),
    id: 'netOutBandwidthUsage-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '%',
  },
})

// 外网入带宽(Mbps)
const netInBandwidthExternal = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netInBandwidthExternal'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netInBandwidthExternal'),
    id: 'netInBandwidthExternal-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: 'Mbps',
  },
})

// 外网出带宽(Mbps)
const netOutBandwidthExternal = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['netOutBandwidthExternal'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.netOutBandwidthExternal'),
    id: 'netOutBandwidthExternal-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: 'Mbps',
  },
})

// 硬盘读IOPS(个)
const diskReadIops = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['diskReadIops'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.diskReadIops'),
    id: 'diskReadIops-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: t('ins.monitor.individual'),
  },
})

// 硬盘写IOPS(个)
const diskWriteIops = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['diskWriteIops'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.diskWriteIops'),
    id: 'diskWriteIops-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: t('ins.monitor.individual'),
  },
})

// 硬盘IO等待时间(ms)
const diskIoWaitTime = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['diskIoWaitTime'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.diskIoWaitTime'),
    id: 'diskIoWaitTime-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: 'ms',
  },
})

// 硬盘IO服务时间(ms)
const diskIoServiceTime = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['diskIoServiceTime'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.diskIoServiceTime'),
    id: 'diskIoServiceTime-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: 'ms',
  },
})

// 硬盘IO繁忙比率(%)
const diskIoBusyRatio = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['diskIoBusyRatio'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.diskIoBusyRatio'),
    id: 'diskIoBusyRatio-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: '%',
  },
})

// 子机连接数(个)
const serverConnection = reactive<ChartType>({
  params: {
    monitorType: 1,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['serverConnection'],
    startTime: '',
    endTime: '',
    period: 60,
  },
  config: {
    title: t('ins.monitor.serverConnection'),
    id: 'serverConnection-chart',
    legend: true,
    refreshNum: 0,
    legendName: '',
    unit: t('ins.monitor.individual'),
  },
})

const cpuList = computed(() => {
  return [cpuUtil, cpuUsage, loadAvg1m, loadAvg5m, loadAvg15m].filter(el =>
    monitorMetric.metrics.includes(el.params.metricName),
  )
})

const memoryList = computed(() => {
  return [memUsage, memUsageValue].filter(el => monitorMetric.metrics.includes(el.params.metricName))
})

const diskList = computed(() => {
  return [diskUtil].filter(el => monitorMetric.metrics.includes(el.params.metricName))
})

const networkList = computed(() => {
  return [
    netInPacket,
    netOutPacket,
    tcpConnection,
    netInBandwidth,
    netOutBandwidth,
    serverUtcNtpDiff,
    netInPacketExternal,
    netOutPacketExternal,
    netOutFlow,
    netOutBandwidthUsage,
    netInBandwidthExternal,
    netOutBandwidthExternal,
  ].filter(el => monitorMetric.metrics.includes(el.params.metricName))
})

const storageList = computed(() => {
  return [diskReadIops, diskWriteIops, diskIoWaitTime, diskIoServiceTime, diskIoBusyRatio].filter(el =>
    monitorMetric.metrics.includes(el.params.metricName),
  )
})

const particularsList = computed(() => {
  return [serverConnection].filter(el => monitorMetric.metrics.includes(el.params.metricName))
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

// 刷新
const refresh = async () => {
  await getMonitorMetric()
  refreshNum.value++

  updateChartConfig('refreshNum', refreshNum.value)
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
  cpuUtil.params[key] = v
  cpuUsage.params[key] = v
  loadAvg1m.params[key] = v
  loadAvg5m.params[key] = v
  loadAvg15m.params[key] = v
  memUsage.params[key] = v
  memUsageValue.params[key] = v
  diskUtil.params[key] = v
  diskReadIops.params[key] = v
  diskWriteIops.params[key] = v
  diskIoWaitTime.params[key] = v
  diskIoServiceTime.params[key] = v
  diskIoBusyRatio.params[key] = v
  netInPacket.params[key] = v
  netOutPacket.params[key] = v
  tcpConnection.params[key] = v
  netInBandwidth.params[key] = v
  netOutBandwidth.params[key] = v
  serverUtcNtpDiff.params[key] = v
  netInPacketExternal.params[key] = v
  netOutPacketExternal.params[key] = v
  netOutFlow.params[key] = v
  netOutBandwidthUsage.params[key] = v
  netInBandwidthExternal.params[key] = v
  netOutBandwidthExternal.params[key] = v
  serverConnection.params[key] = v
}

// 更新chart config
const updateChartConfig = (key: string, v: any) => {
  cpuUtil.config[key] = v
  cpuUsage.config[key] = v
  loadAvg1m.config[key] = v
  loadAvg5m.config[key] = v
  loadAvg15m.config[key] = v
  memUsage.config[key] = v
  memUsageValue.config[key] = v
  diskUtil.config[key] = v
  diskReadIops.config[key] = v
  diskWriteIops.config[key] = v
  diskIoWaitTime.config[key] = v
  diskIoServiceTime.config[key] = v
  diskIoBusyRatio.config[key] = v
  netInPacket.config[key] = v
  netOutPacket.config[key] = v
  tcpConnection.config[key] = v
  netInBandwidth.config[key] = v
  netOutBandwidth.config[key] = v
  serverUtcNtpDiff.config[key] = v
  netInPacketExternal.config[key] = v
  netOutPacketExternal.config[key] = v
  netOutFlow.config[key] = v
  netOutBandwidthUsage.config[key] = v
  netInBandwidthExternal.config[key] = v
  netOutBandwidthExternal.config[key] = v
  serverConnection.config[key] = v
}

// 查询支持的指标
const getMonitorMetric = async () => {
  try {
    const res = await _getMonitorMetric({
      monitorType: 1, //监控类型 1 实例 2 硬盘
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

// 监听insUuid
watch(
  () => props.detail.insUuid,
  () => {
    updateChartConfig('legendName', props.detail.insUuid)
  },
  {
    immediate: true,
  },
)

// 监听id
watch(
  () => props.detail.id,
  () => {
    updateChartParams('id', props.detail.id)
  },
  {
    immediate: true,
  },
)

// 监听checkedLegend
watch(
  checkedLegend,
  v => {
    updateChartConfig('legend', v)
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  getMonitorMetric()
})
</script>

<style lang="scss" scoped></style>
