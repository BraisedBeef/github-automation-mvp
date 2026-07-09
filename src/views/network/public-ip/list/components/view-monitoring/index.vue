<template>
  <el-drawer v-model="props!.show" title="" :with-header="false" :size="1200" @opened="openFn" @closed="closeFn">
    <div class="mb20 df ac js monitor-box">
      <div class="df ac">
        <BtnsGroup v-model="state.btnValue" style="width: 80px" :list="btnsGroupList" @change-value="changeDate" />

        <div>
          <span class="mr10">{{ t('common.select_time') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" />
          </el-tooltip>
          <!-- 日期选择范围 -->
          <el-date-picker
            v-model="dateTime"
            class="ml10"
            style="width: 280px"
            type="daterange"
            start-placeholder=""
            end-placeholder=""
            :shortcuts="shortcuts"
            :range-separator="t('publicIp.to')"
            :clearable="false"
            :disabled-date="disabledDate"
            @change="changeDateTime"
          />
        </div>
        <!-- 时间粒度 -->
        <div>
          <span class="ml10 name-text">{{ t('publicIp.timeGranularity') }}</span>
          <el-select ref="moreOptsRef" v-model="monitorMetric.period" class="ml10 select-opts" :placeholder="''">
            <el-option v-for="item in periodList" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>
        <!-- 刷新按钮 -->
        <CdnIconButton class="ml10" @click="refresh">
          <SvgIcon name="refresh" />
        </CdnIconButton>
      </div>
      <!-- 退出按钮 -->
      <CdnIconButton class="close-btn" @click="closeFn">
        <SvgIcon name="close" />
      </CdnIconButton>
    </div>
    <ul>
      <li v-if="monitorMetric.metrics.includes(eipInPacket.params.metricName)" class="echart-item df">
        <div class="echart-item_left">
          <div class="echart-title">
            {{ t('publicIp.outerNetIncomingBandwidth') }}
          </div>
          <div class="echart-tip">count/s</div>
        </div>
        <div class="echart-box">
          <Chart
            ref="eipInPacketRef"
            :refresh-num="state.refreshNum"
            :params="eipInPacket.params"
            :config="eipInPacket.config"
            unit="count/s"
            time-zone="(UTC+8)"
          />
        </div>
      </li>
      <li v-if="monitorMetric.metrics.includes(eipOutPacket.params.metricName)" class="echart-item df">
        <div class="echart-item_left">
          <div class="echart-title">
            {{ t('publicIp.outerNetOutputBandwidth') }}
          </div>
          <div class="echart-tip">count/s</div>
        </div>
        <div class="echart-box">
          <Chart
            ref="eipOutPacketRef"
            :refresh-num="state.refreshNum"
            :params="eipOutPacket.params"
            :config="eipOutPacket.config"
            unit="count/s"
            time-zone="(UTC+8)"
          />
        </div>
      </li>
      <li v-if="monitorMetric.metrics.includes(eipInBandwidth.params.metricName)" class="echart-item df">
        <div class="echart-item_left">
          <div class="echart-title">
            {{ t('publicIp.outerNetPackageIn') }}
          </div>
          <div class="echart-tip">Mbps</div>
        </div>
        <div class="echart-box">
          <Chart
            ref="eipInBandwidthRef"
            :refresh-num="state.refreshNum"
            :params="eipInBandwidth.params"
            :config="eipInBandwidth.config"
            unit="Mbps"
            time-zone="(UTC+8)"
          />
        </div>
      </li>
      <li v-if="monitorMetric.metrics.includes(eipOutBandwidth.params.metricName)" class="echart-item df">
        <div class="echart-item_left">
          <div class="echart-title">
            {{ t('publicIp.outerNetPackOut') }}
          </div>
          <div class="echart-tip">Mbps</div>
        </div>
        <div class="echart-box">
          <Chart
            ref="eipOutBandwidthRef"
            :refresh-num="state.refreshNum"
            :params="eipOutBandwidth.params"
            :config="eipOutBandwidth.config"
            unit="Mbps"
            time-zone="(UTC+8)"
          />
        </div>
      </li>
      <li v-if="monitorMetric.metrics.includes(eipOutFlow.params.metricName)" class="echart-item df">
        <div class="echart-item_left">
          <div class="echart-title">
            {{ t('publicIp.outerNetOutboundTraffic') }}
          </div>
          <div class="echart-tip">MB</div>
        </div>
        <div class="echart-box">
          <Chart
            ref="eipOutFlowRef"
            :refresh-num="state.refreshNum"
            :params="eipOutFlow.params"
            :config="eipOutFlow.config"
            unit="MB"
            time-zone="(UTC+8)"
          />
        </div>
      </li>
    </ul>
  </el-drawer>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import { btnsGroupList, shortcuts } from './config'
import { MONITER_PERIOD_MAP } from '@/views/cvm/disk/config'
import { INS_MONITER_METRIC_MAP, getDateTime } from './config'
import Chart from '../chart/index.vue'
import { ChartType } from './type'
import { _getMonitorMetric } from '@/apis/cvm/monitor'
import { maoYunDayJs, FORMAT_TIME_NO_UTC } from '@/utils/mao-yun-day-js'

const cvmStore = useCvmStore()

const state = reactive<{
  btnValue: { label?: string; value?: string }
  refreshNum: number
  isFirst: boolean
}>({
  btnValue: { label: t('publicIp.tenSeconds'), value: '10s' },
  refreshNum: 0,
  isFirst: true,
})

const props = withDefaults(
  defineProps<{
    show: boolean // 是否隐藏按钮 默认不隐藏
    detailId: number
  }>(),
  {
    show: false,
    detailId: NaN,
  },
)

const openFn = () => {
  getMonitorMetric()
}

const emit = defineEmits<{
  (event: 'update:show', query: boolean): void
}>()

const closeFn = () => {
  emit('update:show', false)
}

const dateTime = ref<any>(getDateTime(5, 'minute'))

// 监控
const monitorMetric = reactive<{
  list: any[]
  metrics: any[] // 指标集合
  periods: any[] // 粒度集合
  period: string | number //粒度
}>({
  list: [],
  metrics: [],
  periods: [],
  period: '',
})

// 禁用大于当前时间的日期
const disabledDate = time => {
  return maoYunDayJs(time).isAfter(maoYunDayJs()) // 禁用大于当前日期时间的日期
}
// 选择日期时间
const changeDateTime = time => {
  dateTime.value = [maoYunDayJs(time[0]), maoYunDayJs(time[1])]
}

// 外网入包量
const eipInBandwidth = reactive<ChartType>({
  params: {
    monitorType: 3,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['eipInBandwidth'],
    startTime: '',
    endTime: '',
    period: 0,
  },
  config: {
    id: 'eipInBandwidth-chart',
  },
})
// 外网出包量
const eipOutBandwidth = reactive<ChartType>({
  params: {
    monitorType: 3,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['eipOutBandwidth'],
    startTime: '',
    endTime: '',
    period: 0,
  },
  config: {
    id: 'eipOutBandwidth-chart',
  },
})
// 外网入带宽
const eipInPacket = reactive<ChartType>({
  params: {
    monitorType: 3,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['eipInPacket'],
    startTime: '',
    endTime: '',
    period: 0,
  },
  config: {
    id: 'eipInPacket-chart',
  },
})
// 外网出带宽
const eipOutPacket = reactive<ChartType>({
  params: {
    monitorType: 3,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['eipOutPacket'],
    startTime: '',
    endTime: '',
    period: 0,
  },
  config: {
    id: 'eipOutPacket-chart',
  },
})
// 外网出流量
const eipOutFlow = reactive<ChartType>({
  params: {
    monitorType: 3,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['eipOutFlow'],
    startTime: '',
    endTime: '',
    period: 0,
  },
  config: {
    id: 'eipOutFlow-chart',
  },
})

// 粒度下拉
const periodList = computed(() => {
  // 能支持的时间粒度
  const allPeriods = MONITER_PERIOD_MAP.filter(el => monitorMetric.periods.includes(el.value))

  if (state.btnValue.value === '2d') {
    // 最近2天
    return allPeriods.filter(el => [60, 300, 3600, 86400].includes(el.value))
  } else if (state.btnValue.value === '12h') {
    // 最近12小时
    return allPeriods.filter(el => [60, 300, 3600].includes(el.value))
  } else if (state.btnValue.value === '1h') {
    // 最近1小时
    return allPeriods.filter(el => [60, 300].includes(el.value))
  } else if (state.btnValue.value === '5m') {
    // 最近5分钟
    return allPeriods.filter(el => [60].includes(el.value))
  } else {
    // 大于两天
    return allPeriods.filter(el => [3600, 86400].includes(el.value))
  }
})

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

// 查询支持的指标
const getMonitorMetric = async () => {
  try {
    const res = await _getMonitorMetric({
      monitorType: 3, //监控类型 1 实例 2 硬盘 3 弹性公网ip
      regionId: cvmStore.areaSelect.id,
    })
    if (res.success) {
      monitorMetric.list = res.data || []
      monitorMetric.metrics = monitorMetric.list.map(el => el.metricName)
      // monitorMetric.periods = monitorMetric.list[0]?.periods || []
      // 这里先设置成全部粒度都可以选择
      monitorMetric.periods = [60, 300, 3600, 86400]
      updateChartParams('id', props.detailId)
    }
  } catch (error) {
    console.log(error)
  }
}

const eipInBandwidthRef = ref<InstanceType<typeof Chart>>()
const eipOutBandwidthRef = ref<InstanceType<typeof Chart>>()
const eipInPacketRef = ref<InstanceType<typeof Chart>>()
const eipOutPacketRef = ref<InstanceType<typeof Chart>>()
const eipOutFlowRef = ref<InstanceType<typeof Chart>>()

// 刷新
const refresh = async () => {
  await getMonitorMetric()
  state.refreshNum++
  monitorMetric.metrics.includes(eipInBandwidth.params.metricName) &&
    (eipInBandwidthRef.value as InstanceType<typeof Chart>)?.refreshChart()

  monitorMetric.metrics.includes(eipOutBandwidth.params.metricName) &&
    (eipOutBandwidthRef.value as InstanceType<typeof Chart>)?.refreshChart()

  monitorMetric.metrics.includes(eipInPacket.params.metricName) &&
    (eipInPacketRef.value as InstanceType<typeof Chart>)?.refreshChart()

  monitorMetric.metrics.includes(eipOutPacket.params.metricName) &&
    (eipOutPacketRef.value as InstanceType<typeof Chart>)?.refreshChart()

  monitorMetric.metrics.includes(eipOutFlow.params.metricName) &&
    (eipOutFlowRef.value as InstanceType<typeof Chart>)?.refreshChart()
}

// 更新chart params
const updateChartParams = (key: string, v: any) => {
  eipInBandwidth.params[key] = v
  eipOutBandwidth.params[key] = v
  eipInPacket.params[key] = v
  eipOutPacket.params[key] = v
  eipOutFlow.params[key] = v
  if (state.isFirst) return (state.isFirst = false)
  if (key !== 'startTime' && !!props.detailId) {
    nextTick(() => {
      monitorMetric.metrics.includes(eipInBandwidth.params.metricName) &&
        (eipInBandwidthRef.value as InstanceType<typeof Chart>)?.getMonitor()

      monitorMetric.metrics.includes(eipOutBandwidth.params.metricName) &&
        (eipOutBandwidthRef.value as InstanceType<typeof Chart>)?.getMonitor()

      monitorMetric.metrics.includes(eipInPacket.params.metricName) &&
        (eipInPacketRef.value as InstanceType<typeof Chart>)?.getMonitor()

      monitorMetric.metrics.includes(eipOutPacket.params.metricName) &&
        (eipOutPacketRef.value as InstanceType<typeof Chart>)?.getMonitor()

      monitorMetric.metrics.includes(eipOutFlow.params.metricName) &&
        (eipOutFlowRef.value as InstanceType<typeof Chart>)?.getMonitor()
    })
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

    if ([172799997, 172799998, 172799999, 172800000, 172800001, 172800002, 172800003].includes(timeTimestampRange)) {
      // 最近2天
      state.btnValue = btnsGroupList[3]
    } else if ([43199997, 43199998, 43199999, 43200000, 43200001, 43200002, 43200003].includes(timeTimestampRange)) {
      // 最近12小时
      state.btnValue = btnsGroupList[2]
    } else if ([3599997, 3599998, 3599999, 3600000, 3600001, 3600002, 3600003].includes(timeTimestampRange)) {
      // 最近1小时
      state.btnValue = btnsGroupList[1]
    } else if ([299997, 299998, 299999, 300000, 300001, 300002, 300003].includes(timeTimestampRange)) {
      // 最近5分钟
      state.btnValue = btnsGroupList[0]
    } else {
      // 大于两天
      state.btnValue = {}
    }
    updateChartParams('startTime', maoYunDayJs(startTime).format(FORMAT_TIME_NO_UTC))
    updateChartParams('endTime', maoYunDayJs(endTime).format(FORMAT_TIME_NO_UTC))
  },
  {
    immediate: true,
  },
)

// 监听periodList
watch(periodList, v => {
  // 默认取第一个
  monitorMetric.period = v.length ? v[0].value : ''
})

// 监听period
watch(
  () => monitorMetric.period,
  v => {
    updateChartParams('period', v)
  },
)

onMounted(() => {
  state.isFirst = true
})
</script>
<style lang="scss" scoped>
.monitor-box {
  position: relative;
}

.echart-item {
  padding: 20px 0;
  border-bottom: 1px solid #ccc;

  .echart-title {
    font-weight: bold;
  }

  .echart-tip {
    color: #999;
  }

  .echart-item_left {
    width: 150px;
  }

  .echart-box {
    flex: 1;
    height: 120px;
  }

  .no-data {
    height: 120px;
    line-height: 120px;
    color: #999;
    text-align: center;
  }
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
