<template>
  <div class="oss-usage-statistics">
    <Tip
      :text="[
        {
          main: t('oss.s6.usageOverviewTip'),
        },
      ]"
    />

    <div v-loading="loading1" class="page-box pd20">
      <p class="title">
        {{ t('oss.s6.usageOverview') }}
      </p>
      <div class="data-grid">
        <div v-for="item in metrics" :key="item.label" class="data-card">
          <div class="data-label">
            <span> {{ item.label }}</span>

            <el-tooltip :content="getMetricTip(item)" placement="top" effect="light">
              <SvgIcon name="cat-cdn-tip" class="ml10" />
            </el-tooltip>
          </div>
          <div class="data-value">
            <span class="num">{{ item.value }}</span>
            <span>{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-loading="loading2" class="page-box h-full pd20">
      <p class="title">
        {{ t('oss.s6.usageTrend') }}
      </p>
      <div class="date-time-picker">
        <CatTabsBox v-model="form.time_range" :list="timeRangeList" @change="dateTimeChange" />
        <el-date-picker
          v-model="form.dateTime"
          type="daterange"
          :range-separator="t('export.to')"
          start-placeholder=""
          end-placeholder=""
          :clearable="false"
          value-format="YYYY-MM-DD"
        />
        <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
          <SvgIcon class="ml10" name="cat-cdn-help" />
        </el-tooltip>
      </div>

      <!-- 存储用量趋势（GB） -->
      <div class="storage-chart">
        <p class="chart-title">
          {{ t('oss.s6.storageUsageTrend') }}
        </p>
        <div class="h-320">
          <MultipleLineChart unit="GB" :x-data="xData.storage" :x-list="xList" />
        </div>
      </div>

      <!-- 流量趋势（MB） -->
      <div class="traffic-chart">
        <p class="chart-title">
          {{ t('oss.s6.trafficTrend') }}
        </p>
        <div class="h-320">
          <MultipleLineChart unit="MB" :x-data="xData.traffic" :x-list="xList" />
        </div>
      </div>

      <!-- 请求数趋势（次） -->
      <div class="request-chart">
        <p class="chart-title">
          {{ t('oss.s6.requestCountTrend') }}
        </p>
        <div class="h-320">
          <MultipleLineChart :unit="t('oss.s6.times')" :x-data="xData.request" :x-list="xList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { _getOssServicesOverview, _getOssServicesUsageStats } from '@/apis/oss/storage-list'
import t from '@/utils/i18n'
import { ManipulateType, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { bytesToGB, bytesToMB } from '@/utils/unit'

// 接口统计截止时间字段暂缺，先用变量承接，后续替换为接口返回字段。
const dataStatisticsDeadline = ref('2025-11-05 11:00:00')

const metrics = ref([
  {
    label: t('oss.s6.bucketCount'),
    value: 0,
    unit: t('oss.s6.count'),
    tips: 'oss.s6.currentBucketTotal',
    key: 'bucketCount',
  },
  {
    label: t('oss.s6.totalObjectCount'),
    value: 0,
    unit: t('oss.s6.count'),
    tips: 'oss.s6.dataStatisticsDeadline',
    tipsParams: () => [dataStatisticsDeadline.value],
    key: 'objectCount',
  },
  {
    label: t('oss.s6.storageCapacity'),
    value: '0',
    unit: 'GB',
    tips: 'oss.s6.dataStatisticsDeadline',
    tipsParams: () => [dataStatisticsDeadline.value],
    key: 'storage',
  },
  {
    label: t('oss.s6.monthlyAverageStandardStorageCapacity'),
    value: '0',
    unit: 'GB',
    tips: 'oss.s6.dataStatisticsDeadline',
    tipsParams: () => [dataStatisticsDeadline.value],
    key: 'avgStorage',
  },
])
const timeRangeList = [
  {
    label: t('oss.s6.currentMonth'),
    value: 1,
  },
  { label: t('oss.s6.last7Days'), value: 7 },
  { label: t('oss.s6.last30Days'), value: 30 },
]
const getCurrentMonth = (): any => {
  // 当前日期
  const end = maoYunDayJs()
  // 当前月的第一天
  const start = end.startOf('month')
  return [start, end]
}
const form = ref({
  time_range: 1,
  dateTime: getCurrentMonth(),
})
const loading1 = ref(false)
const loading2 = ref(false)

const getMetricTip = item => {
  return item.tipsParams ? t(item.tips, item.tipsParams()) : t(item.tips)
}

// 获取时间
const getDateTime = (value: number, unit: ManipulateType) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  console.log([start, end])

  return [start, end]
}

const dateTimeChange = value => {
  console.log(value)
  // console.log(getCurrentMonth())
  if (value.value === 1) {
    form.value.dateTime = getCurrentMonth()
  } else {
    form.value.dateTime = getDateTime(value.value, 'day')
  }
}

const xList = ref<string[]>([])
const xData = ref<any>({
  storage: [
    {
      title: t('oss.s6.standardStorageCapacity'),
      color: '#5AD8A6',
      data: [],
      unit: 'GB',
      time: [],
      areaStyle: {
        opacity: 0.25,
      },
    },
  ],
  traffic: [
    {
      title: t('oss.s6.internetTrafficOut'),
      color: '#5AD8A6',
      data: [],
      unit: 'MB',
      time: [],
      areaStyle: {
        opacity: 0.25,
      },
    },
    {
      title: t('oss.s6.cdnTraffic'),
      color: '#5B8FF9',
      data: [],
      unit: 'MB',
      time: [],
      areaStyle: {
        opacity: 0.25,
      },
    },
  ],
  request: [
    {
      title: t('oss.s6.totalReadRequestCount'),
      color: '#5AD8A6',
      data: [],
      unit: t('oss.s6.times'),
      time: [],
      areaStyle: {
        opacity: 0.25,
      },
    },
    {
      title: t('oss.s6.writeRequestCount'),
      color: '#5B8FF9',
      data: [],
      unit: t('oss.s6.times'),
      time: [],
      areaStyle: {
        opacity: 0.25,
      },
    },
  ],
})

const handleQuery = async () => {
  try {
    loading2.value = true
    console.log(form.value.dateTime[0])

    const res = await _getOssServicesUsageStats({
      startDate: maoYunDayJs(form.value.dateTime[0]).format('YYYY-MM-DD'),
      endDate: maoYunDayJs(form.value.dateTime[1]).format('YYYY-MM-DD'),
    })
    const dates = Object.keys(res.data)
    xList.value = dates

    // 通用的数据处理函数
    const processData = (category, items) => {
      items.forEach((item, index) => {
        xData.value[category][index].data = dates.map(date => {
          const value = res.data[date][item]
          // 根据不同类型进行单位转换
          if (category === 'storage') {
            return bytesToGB(value)
          } else if (category === 'traffic' || category === 'cdnTraffic') {
            return bytesToMB(value)
          }
          return value
        })
        xData.value[category][index].time = dates
      })
    }

    // 处理存储数据
    processData('storage', ['storage'])

    // 处理流量数据
    processData('traffic', ['traffic', 'cdnTraffic'])

    // 处理请求数据
    processData('request', ['readCount', 'writeCount'])
  } catch (error) {
    console.log(error)
  } finally {
    loading2.value = false
  }
}

// 获取对象存储服务概览数据
const getOssServiceOverview = async () => {
  try {
    loading1.value = true
    const res = await _getOssServicesOverview()
    // 处理返回的数据
    console.log(res)
    if (res.data) {
      dataStatisticsDeadline.value = res.data.dataStatisticsDeadline || dataStatisticsDeadline.value
      metrics.value.forEach(item => {
        switch (item.key) {
          case 'bucketCount':
            item.value = res.data.bucketCount
            break
          case 'objectCount':
            item.value = res.data.objectCount
            break
          case 'storage':
            item.value = bytesToGB(res.data.storage)
            break
          case 'avgStorage':
            item.value = bytesToGB(res.data.avgStorage)
            break
        }
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading1.value = false
  }
}
watch(
  () => form.value,
  () => {
    handleQuery()
  },
  { deep: true },
)

onMounted(() => {
  getOssServiceOverview()
  handleQuery()
})
</script>

<style lang="scss" scoped>
.oss-usage-statistics {
  .page-box + .page-box {
    margin-top: 20px;
  }

  .title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
    color: #000;
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    padding: 12px 0;
    background: #f9fafc;
    border-radius: 4px;

    .data-card:last-of-type {
      border-right: none;
    }

    .data-card {
      padding-left: 20px;
      border-right: 1px solid #ddd;

      .data-label {
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 500;
        color: #000;
      }

      .data-value {
        font-size: 14px;
        font-weight: 500;
        color: #000;

        .num {
          margin-right: 5px;
          font-size: 24px;
          font-weight: 500;
          color: #0063ff;
        }
      }
    }
  }

  .date-time-picker {
    display: flex;
    align-items: center;
    width: 650px;
  }

  .h-320 {
    width: 100%;
    height: 320px;
  }

  .chart-title {
    margin: 20px 0;
    font-size: 14px;
    font-weight: 500;
    color: #000;
  }

  .traffic-chart {
    margin-top: 20px;
  }
}
</style>
