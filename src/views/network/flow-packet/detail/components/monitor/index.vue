<template>
  <div style="padding: 20px">
    <el-card shadow="never" class="page-box" :body-style="bodyStyle">
      <div class="df ac js monitor-box flex-wrap">
        <div class="df ac mb10 mr20">
          <span class="label-text">{{ t('flowPacket.resourceIns') }}</span>
          <el-select
            ref="eipOptsRef"
            v-model="state.eipId"
            class="ml20 select-opts"
            :placeholder="''"
            :loading="state.eipLoading"
          >
            <el-option
              v-for="item in state.eipList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
              @change="changeEip"
            />
          </el-select>
        </div>
        <div class="df ac w-920 mb10">
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
      </div>
      <div v-if="!state.eipList.length" class="no-data_box df ac">
        <p>{{ t('flowPacket.noData') }}</p>
      </div>
      <ul v-else>
        <!-- 弹性公网ip 入带宽 -->
        <li v-if="monitorMetric.metrics.includes(eipInBandwidth.params.metricName)" class="echart-item df">
          <div class="echart-item_left df ac" :class="echartLeftClass">
            <div class="echart-title mr5">
              {{ t('flowPacket.eipInBandwidth') }}
            </div>
            <el-tooltip
              :content="t('flowPacket.eipInBandwidthTooltip')"
              placement="top"
              effect="light"
              popper-class="m-w-282"
            >
              <SvgIcon name="question" class="title-icon" />
            </el-tooltip>
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
        <!-- 弹性公网ip 出带宽 -->
        <li v-if="monitorMetric.metrics.includes(eipOutBandwidth.params.metricName)" class="echart-item df">
          <div class="echart-item_left df ac" :class="echartLeftClass">
            <div class="echart-title mr5">
              {{ t('flowPacket.eipOutBandwidth') }}
            </div>
            <el-tooltip
              :content="t('flowPacket.eipOutBandwidthTip')"
              placement="top"
              effect="light"
              popper-class="m-w-282"
            >
              <SvgIcon name="question" class="title-icon" />
            </el-tooltip>
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
        <!-- 弹性公网ip 入流量 -->
        <li v-if="monitorMetric.metrics.includes(eipInFlow.params.metricName)" class="echart-item df">
          <div class="echart-item_left df ac" :class="echartLeftClass">
            <div class="echart-title mr5">
              {{ t('flowPacket.eipInFlow') }}
            </div>
            <el-tooltip :content="t('flowPacket.eipInFlowTip')" placement="top" effect="light" popper-class="m-w-282">
              <SvgIcon name="question" class="title-icon" />
            </el-tooltip>
          </div>
          <div class="echart-box">
            <Chart
              ref="eipInFlowRef"
              :refresh-num="state.refreshNum"
              :params="eipInFlow.params"
              :config="eipInFlow.config"
              unit="KB"
              time-zone="(UTC+8)"
            />
          </div>
        </li>
        <!-- 弹性公网ip 出流量 -->
        <li v-if="monitorMetric.metrics.includes(eipOutFlow.params.metricName)" class="echart-item df">
          <div class="echart-item_left df ac" :class="echartLeftClass">
            <div class="echart-title mr5">
              {{ t('flowPacket.eipOutFlow') }}
            </div>
            <el-tooltip :content="t('flowPacket.eipOutFlowTip')" placement="top" effect="light" popper-class="m-w-282">
              <SvgIcon name="question" class="title-icon" />
            </el-tooltip>
          </div>
          <div class="echart-box">
            <Chart
              ref="eipOutFlowRef"
              :refresh-num="state.refreshNum"
              :params="eipOutFlow.params"
              :config="eipOutFlow.config"
              unit="KB"
              time-zone="(UTC+8)"
            />
          </div>
        </li>
        <!-- 弹性公网ip 出带宽使用率 -->
        <li v-if="monitorMetric.metrics.includes(eipOutBandwidthUsage.params.metricName)" class="echart-item df">
          <div class="echart-item_left df ac" :class="echartLeftClass">
            <div class="echart-title mr5">
              {{ t('flowPacket.eipOutBandwidthUsage') }}
            </div>
            <el-tooltip
              :content="t('flowPacket.eipOutBandwidthUsageTip')"
              placement="top"
              effect="light"
              popper-class="m-w-282"
            >
              <SvgIcon name="question" class="title-icon" />
            </el-tooltip>
          </div>
          <div class="echart-box">
            <Chart
              ref="eipOutBandwidthUsageRef"
              :refresh-num="state.refreshNum"
              :params="eipOutBandwidthUsage.params"
              :config="eipOutBandwidthUsage.config"
              unit="%"
              time-zone="(UTC+8)"
            />
          </div>
        </li>
        <!-- 弹性公网ip 入带宽使用率 -->
        <li v-if="monitorMetric.metrics.includes(eipInBandwidthUsage.params.metricName)" class="echart-item df">
          <div class="echart-item_left df ac" :class="echartLeftClass">
            <div class="echart-title mr5">
              {{ t('flowPacket.eipInBandwidthUsage') }}
            </div>
            <el-tooltip
              :content="t('flowPacket.eipInBandwidthUsageTip')"
              placement="top"
              effect="light"
              popper-class="m-w-282"
            >
              <SvgIcon name="question" class="title-icon" />
            </el-tooltip>
          </div>
          <div class="echart-box">
            <Chart
              ref="eipInBandwidthUsageRef"
              :refresh-num="state.refreshNum"
              :params="eipInBandwidthUsage.params"
              :config="eipInBandwidthUsage.config"
              unit="%"
              time-zone="(UTC+8)"
            />
          </div>
        </li>
      </ul>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import { btnsGroupList, shortcuts, getDateTime } from '@/views/network/public-ip/list/components/view-monitoring/config'
import { INS_MONITER_METRIC_MAP } from './config'
import { MONITER_PERIOD_MAP } from '@/views/cvm/disk/config'
import { ChartType } from '@/views/network/public-ip/list/components/view-monitoring/type'
import Chart from '@/views/network/public-ip/list/components/chart/index.vue'
import { _getMonitorMetric } from '@/apis/cvm/monitor'
import { shareTrafficPackageEipList } from '@/apis/network/flow-packet'
import { message } from '@/utils/message'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { maoYunDayJs, FORMAT_TIME_NO_UTC } from '@/utils/mao-yun-day-js'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const echartLefthMap = {
  [ja]: '',
  [en]: 'echart-item_left_en',
  [zh]: '',
}

const echartLeftClass = useI18nStyle(echartLefthMap)

const bodyStyle = { height: '100%' }

const route = useRoute()

const cvmStore = useCvmStore()

const state = reactive<{
  detailId: number | string
  eipId: string | number // eip
  eipLoading: boolean
  eipList: any[]
  btnValue: { label?: string; value?: string }
  refreshNum: number
  isFirst: boolean
}>({
  detailId: '',
  eipLoading: false,
  eipList: [],
  eipId: '',
  btnValue: { label: t('publicIp.tenSeconds'), value: '10s' },
  refreshNum: 0,
  isFirst: true,
})

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

// 获取流量包中的eip列表 暂时不做分页处理
const geEiptList = async () => {
  const params = {
    pageIndex: 1,
    pageSize: 999,
    pkgId: state.detailId,
  }
  state.eipLoading = true
  try {
    const res = await shareTrafficPackageEipList(params)
    if (res.success) {
      state.eipList = (res.data?.list || []).map(item => ({
        ...item,
        label: item.name ? `${item.eip}(${item.name})` : `${item.eip}`,
        value: item.eipId,
      }))
      if (state.eipList.length) {
        const initEip = state.eipList[0].eipId
        state.eipId = initEip
        await getMonitorMetric()
        updateChartParams('id', state.eipId)
      }
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.eipLoading = false
  }
}

const changeEip = () => {
  updateChartParams('id', state.eipId)
}

// 弹性公网ip 入带宽
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
// 弹性公网ip 出带宽
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
// 弹性公网ip 入流量
const eipInFlow = reactive<ChartType>({
  params: {
    monitorType: 3,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['eipInFlow'],
    startTime: '',
    endTime: '',
    period: 0,
  },
  config: {
    id: 'eipInFlow-chart',
  },
})
// 弹性公网ip 出流量
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
// 弹性公网ip 出带宽使用率
const eipOutBandwidthUsage = reactive<ChartType>({
  params: {
    monitorType: 3,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['eipOutBandwidthUsage'],
    startTime: '',
    endTime: '',
    period: 0,
  },
  config: {
    id: 'eipOutBandwidthUsage-chart',
  },
})
// 弹性公网ip 入带宽使用率
const eipInBandwidthUsage = reactive<ChartType>({
  params: {
    monitorType: 3,
    id: 0,
    metricName: INS_MONITER_METRIC_MAP['eipInBandwidthUsage'],
    startTime: '',
    endTime: '',
    period: 0,
  },
  config: {
    id: 'eipInBandwidthUsage-chart',
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
      monitorMetric.periods = [60, 300, 3600, 86400]
    }
  } catch (error) {
    console.log(error)
  }
}

const eipInBandwidthRef = ref<InstanceType<typeof Chart>>()
const eipOutBandwidthRef = ref<InstanceType<typeof Chart>>()
const eipInFlowRef = ref<InstanceType<typeof Chart>>()
const eipOutFlowRef = ref<InstanceType<typeof Chart>>()
const eipOutBandwidthUsageRef = ref<InstanceType<typeof Chart>>()
const eipInBandwidthUsageRef = ref<InstanceType<typeof Chart>>()

// 刷新
const refresh = async () => {
  await getMonitorMetric()
  state.refreshNum++
  monitorMetric.metrics.includes(eipInBandwidth.params.metricName) &&
    (eipInBandwidthRef.value as InstanceType<typeof Chart>)?.refreshChart()

  monitorMetric.metrics.includes(eipOutBandwidth.params.metricName) &&
    (eipOutBandwidthRef.value as InstanceType<typeof Chart>)?.refreshChart()

  monitorMetric.metrics.includes(eipInFlow.params.metricName) &&
    (eipInFlowRef.value as InstanceType<typeof Chart>)?.refreshChart()

  monitorMetric.metrics.includes(eipOutFlow.params.metricName) &&
    (eipOutFlowRef.value as InstanceType<typeof Chart>)?.refreshChart()

  monitorMetric.metrics.includes(eipOutBandwidthUsage.params.metricName) &&
    (eipOutBandwidthUsageRef.value as InstanceType<typeof Chart>)?.refreshChart()

  monitorMetric.metrics.includes(eipInBandwidthUsage.params.metricName) &&
    (eipInBandwidthUsageRef.value as InstanceType<typeof Chart>)?.refreshChart()
}

// 更新chart params
const updateChartParams = (key: string, v: any) => {
  eipInBandwidth.params[key] = v
  eipOutBandwidth.params[key] = v
  eipInFlow.params[key] = v
  eipOutFlow.params[key] = v
  eipOutBandwidthUsage.params[key] = v
  eipInBandwidthUsage.params[key] = v
  if (state.isFirst) return (state.isFirst = false)
  if (key !== 'startTime') {
    nextTick(() => {
      monitorMetric.metrics.includes(eipInBandwidth.params.metricName) &&
        (eipInBandwidthRef.value as InstanceType<typeof Chart>)?.getMonitor()

      monitorMetric.metrics.includes(eipOutBandwidth.params.metricName) &&
        (eipOutBandwidthRef.value as InstanceType<typeof Chart>)?.getMonitor()

      monitorMetric.metrics.includes(eipInFlow.params.metricName) &&
        (eipInFlowRef.value as InstanceType<typeof Chart>)?.getMonitor()

      monitorMetric.metrics.includes(eipOutFlow.params.metricName) &&
        (eipOutFlowRef.value as InstanceType<typeof Chart>)?.getMonitor()

      monitorMetric.metrics.includes(eipOutBandwidthUsage.params.metricName) &&
        (eipOutBandwidthUsageRef.value as InstanceType<typeof Chart>)?.getMonitor()

      monitorMetric.metrics.includes(eipInBandwidthUsage.params.metricName) &&
        (eipInBandwidthUsageRef.value as InstanceType<typeof Chart>)?.getMonitor()
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
  if (route.query?.id) {
    state.detailId = route.query.id as string
    geEiptList()
  }
})
</script>
<style lang="scss" scoped>
.monitor-box {
  position: relative;
}

.label-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  line-height: 20px;
  color: #000;
  text-wrap: nowrap;
}

.ml20 {
  margin-left: 20px;
}

.mr5 {
  margin-right: 5px;
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

  .echart-item_left_en {
    width: 220px;
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

.no-data_box {
  justify-content: center;
  height: 100px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.title-icon {
  position: relative;
  top: 1px;
}

.w-920 {
  min-width: 920px;
}

.js {
  justify-content: space-between;
}
</style>
