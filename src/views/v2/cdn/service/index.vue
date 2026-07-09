<template>
  <div class="cdn-service-v2">
    <section class="cdn-service-v2__hero">
      <div class="cdn-service-v2__hero-content">
        <h1 class="cdn-service-v2__hero-title">
          {{ t('serviceOverviewWelcome', { name: t('model.cdn') }) }}
        </h1>
        <p class="cdn-service-v2__hero-desc">
          {{ t('cdnIllustrate') }}
        </p>
        <div class="cdn-service-v2__hero-actions">
          <button class="cdn-service-v2__primary-btn" type="button" @click="startTrial">
            {{ t('home.v2StartTrial') }}
          </button>
          <button class="cdn-service-v2__ghost-btn" type="button" @click="openHelpDoc">
            <span>{{ t('common.docHelper') }}</span>
            <SvgIcon name="v2-right-arrow" />
          </button>
        </div>
      </div>
      <img class="cdn-service-v2__hero-art" :src="WelcomeHero" alt="" />
    </section>

    <section v-if="showNotice" class="cdn-service-v2__notice-wrap">
      <InfoNotice>
        <div class="cdn-service-v2__notice-slot">
          <span>{{ t('serviceOverviewNotice') }}</span>
          <button class="cdn-service-v2__notice-close" type="button" @click="showNotice = false">
            <SvgIcon name="close" />
          </button>
        </div>
      </InfoNotice>
    </section>

    <section class="cdn-service-v2__filter-bar">
      <SegmentedTabs :model-value="dataTab" :items="dataTabList" @update:model-value="handleDataTabValueChange" />
    </section>

    <div class="cdn-service-v2__layout">
      <div class="cdn-service-v2__main">
        <section class="cdn-service-v2__panel">
          <div class="cdn-service-v2__panel-head">
            <h2 class="cdn-service-v2__panel-title">
              {{ t('useOverview') }}
            </h2>
            <button class="cdn-service-v2__link-btn" type="button" @click="pushRoute('/cdn/buyFlow')">
              {{ t('buyPkg') }}
              <SvgIcon name="v2-right-arrow" />
            </button>
          </div>

          <div v-loading="loading" class="cdn-service-v2__overview-grid">
            <article v-for="card in groupedOverviewCards" :key="card.key" class="cdn-service-v2__metric-card">
              <div class="cdn-service-v2__metric-title">
                {{ card.cdnType === 'cdn' ? 'CDN' : 'ECDN' }} {{ t(card.title) }}
              </div>
              <div class="cdn-service-v2__metric-row">
                <div class="cdn-service-v2__metric-value">{{ t('inChina') }} {{ card.inland.value }}</div>
                <div class="cdn-service-v2__metric-rate">
                  {{ currentRateLabel }} {{ card.inland.ratio ? `${card.inland.ratio}%` : '—' }}
                </div>
              </div>
              <div class="cdn-service-v2__metric-row">
                <div class="cdn-service-v2__metric-value">{{ t('outChina') }} {{ card.overseas.value }}</div>
                <div class="cdn-service-v2__metric-rate">
                  {{ currentRateLabel }} {{ card.overseas.ratio ? `${card.overseas.ratio}%` : '—' }}
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="cdn-service-v2__panel">
          <div class="cdn-service-v2__panel-head cdn-service-v2__panel-head--chart">
            <SegmentedTabs
              :model-value="chartTab"
              :items="chartTabList"
              @update:model-value="handleChartTabValueChange"
            />
            <div class="cdn-service-v2__chart-meta">
              <span>（{{ timeRange[0].slice(0, 10) }} {{ t('to') }} {{ timeRange[1].slice(0, 10) }}）</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
            <button class="cdn-service-v2__link-btn" type="button" @click="toPage">
              {{ t('seeDetails') }}
              <SvgIcon name="v2-right-arrow" />
            </button>
          </div>

          <div ref="chartDom" v-loading="chartLoading" class="cdn-service-v2__chart" />
          <section class="cdn-service-v2__table">
            <TableV2 :data="tableData">
              <el-table-column prop="domain" :label="t('top10domain')">
                <template #header>
                  <div class="cdn-service-v2__table-title">
                    <span>{{ t('top10domain') }}</span>
                    <SvgIcon name="cat-cdn-top10" />
                  </div>
                </template>
              </el-table-column>
              <el-table-column v-if="chartTab === 0" prop="total_flux" :label="t('flux')" />
              <el-table-column v-if="chartTab === 1" prop="top_bindwidth" :label="t('bandwidth')" />
              <el-table-column v-if="chartTab === 3" prop="total_requests" :label="t('requestCount')" />
            </TableV2>
          </section>
        </section>
      </div>

      <aside class="cdn-service-v2__side">
        <section class="cdn-service-v2__panel">
          <div class="cdn-service-v2__panel-head">
            <h2 class="cdn-service-v2__panel-title">
              {{ t('acceleratedDomain') }}
            </h2>
            <button class="cdn-service-v2__link-btn" type="button" @click="pushRoute('/cdn/domain')">
              {{ t('domainManage') }}
              <SvgIcon name="v2-right-arrow" />
            </button>
          </div>

          <div class="cdn-service-v2__domain-grid">
            <div class="cdn-service-v2__domain-card">
              <div class="cdn-service-v2__domain-label">
                {{ t('enabledDomain') }}
              </div>
              <div class="cdn-service-v2__domain-num">
                {{ domainList.filter(v => v.status >= 0 && v.status < 3).length }}
              </div>
            </div>
            <div class="cdn-service-v2__domain-card">
              <div class="cdn-service-v2__domain-label">
                {{ t('allDomains') }}
              </div>
              <div class="cdn-service-v2__domain-num">
                {{ domainList.length }}
              </div>
            </div>
          </div>

          <button class="cdn-service-v2__outline-btn" type="button" @click="pushRoute('/cdn/content')">
            <SvgIcon name="cat-cdn-refresh" />
            <span>{{ t('refreshWarm') }}</span>
          </button>
        </section>

        <section class="cdn-service-v2__panel">
          <div class="cdn-service-v2__panel-head">
            <h2 class="cdn-service-v2__panel-title">
              {{ t('canUseResourcePkg') }}
            </h2>
            <button class="cdn-service-v2__link-btn" type="button" @click="pushRoute('/cdn/fluxPkg')">
              {{ t('resourcePkgManage') }}
              <SvgIcon name="v2-right-arrow" />
            </button>
          </div>

          <div v-for="item in resourcePackageCards" :key="item.key" class="cdn-service-v2__resource-row">
            <div class="cdn-service-v2__resource-col">
              <div class="cdn-service-v2__resource-label">
                {{ item.label }}
              </div>
              <div class="cdn-service-v2__resource-value" :class="{ 'is-empty': !item.remain.count }">
                <template v-if="item.remain.count">
                  <span class="cdn-service-v2__resource-num">{{ item.remain.count }}</span>
                  <span class="cdn-service-v2__resource-unit">{{ item.remain.unit }}</span>
                </template>
                <span v-else class="cdn-service-v2__resource-empty">--</span>
              </div>
            </div>
            <div class="cdn-service-v2__resource-divider" />
            <div class="cdn-service-v2__resource-col">
              <div class="cdn-service-v2__resource-label">
                {{ t('remainingTraffiPacket') }}
              </div>
              <div class="cdn-service-v2__resource-value" :class="{ 'is-empty': !item.pkgTotal }">
                <template v-if="item.pkgTotal">
                  <span class="cdn-service-v2__resource-num">{{ item.pkgTotal }}</span>
                  <span class="cdn-service-v2__resource-unit">{{ t('numUnit', { show: false }) }}</span>
                </template>
                <span v-else class="cdn-service-v2__resource-empty">--</span>
              </div>
            </div>
          </div>
        </section>

        <section class="cdn-service-v2__panel">
          <div class="cdn-service-v2__panel-head">
            <h2 class="cdn-service-v2__panel-title">
              {{ t('recommendBuy') }}
            </h2>
            <button class="cdn-service-v2__link-btn" type="button" @click="pushRoute('/cdn/buyFlow')">
              {{ t('buyMorePkgShort') }}
              <SvgIcon name="v2-right-arrow" />
            </button>
          </div>

          <div
            v-for="(rec, index) in recommendedList"
            :key="rec.id"
            class="cdn-service-v2__recommend-card"
            @click="pushRoute({ path: '/cdn/buyFlow', query: { id: rec.id } })"
          >
            <div class="cdn-service-v2__recommend-content">
              <div>
                <div class="cdn-service-v2__recommend-head">
                  <div class="cdn-service-v2__recommend-title">
                    {{ getRecommendTitle(rec) }}
                  </div>
                  <span v-if="index === 0" class="cdn-service-v2__recommend-tag">{{ t('lastBuy') }}</span>
                </div>
                <div class="cdn-service-v2__recommend-meta">
                  <span>{{ t('validityPeriod') }} {{ t('numMonth', { num: rec.fluxPeriod }) }}</span>
                  <span>|</span>
                  <span>{{ getValueMap(area, rec.accelerationRegion) }}</span>
                </div>
                <div class="cdn-service-v2__recommend-price">${{ formatPrice(rec.price) }} USD</div>
              </div>
              <img class="cdn-service-v2__recommend-figure" :src="RecommendPkgImage" alt="" />
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import RecommendPkgImage from '@/assets/v2/home-figma/images/traffic.png'
import WelcomeHero from '@/assets/v2/home-figma/images/cdn-banner.png'
import { documentUrl } from '@/config/base-config'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import SegmentedTabs from '@/views/v2/account-system/components/segmented-tabs.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import {
  _flux,
  _fluxAll,
  _bandwidth,
  _bindwidthAll,
  _request,
  _requestAll,
  _domainList,
  _remainFlux,
} from '@/apis/cdn/monitor'
import { _getOverviewData, _getOverviewRank, _getPkgRecommended } from '@/apis/cdn/service'
import { _getDurationTime2Dayjs, getLastMonthDayjs, getDateDayjs } from '@/utils/format-time'
import { bpsToMbps, bytesToMB, getFlux, getRequest, getFluxDetail, getRequestDetail } from '@/utils/unit'
import { getValueMap } from '@/utils/collection-utils'
import { formatPrice } from '@/utils/number-utils'
import { area } from '@/assets/data/common'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { setSessionItemRaw } from '@/utils/storage'
import { pushRoute } from '@/utils/router-jump'

import { use, init, ECharts } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

use([TooltipComponent, GridComponent, CanvasRenderer, LegendComponent, UniversalTransition, LineChart])

type ChartTabValue = 0 | 1 | 3

type Item<T extends string | number = number> = {
  label: string
  value: T
}

type ItemPlus = Item & {
  time: () => string[]
  unit: '日' | '周' | '月'
  rate: string
}

interface OverviewItem {
  title: string
  cdnType: string
  dataType: number
  inland: { value: string | number; ratio: number }
  overseas: { value: string | number; ratio: number }
}

interface DataItem {
  title: string
  unit: string
  data: number[]
  time: string[]
  color: string
}

interface Domain {
  id: number
  domain: string
  channel_type: number
  status: number
  cname: string
  area_code: number
  https_status: number
  origin_servers: any[]
  create_time: string
  support_ipv6: number
  remark: string
  update_time: number
  more: boolean
  tip: string
}

interface FluxDataItem {
  chinese_remain: number
  inland_pkgs_total: number
  overseas_remain: number
  overseas_pkgs_total: number
}

const showNotice = ref(true)
const loading = ref(false)
const chartLoading = ref(false)

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const startTrial = () => {
  pushRoute('/cdn/domain/add')
}

const dataTab = ref(1)
const timeRange = ref<string[]>(['', ''])
const dataTabList = ref<ItemPlus[]>([
  { label: t('today'), value: 1, unit: '日', rate: 'dRate', time: () => _getDurationTime2Dayjs('today') },
  { label: t('yesterday'), value: 2, unit: '日', rate: 'dRate', time: () => _getDurationTime2Dayjs('yesterday') },
  { label: t('oneWeek'), value: 3, unit: '周', rate: 'wRate', time: () => _getDurationTime2Dayjs('lastweek') },
  { label: t('oneMonth'), value: 4, unit: '月', rate: 'mRate', time: () => _getDurationTime2Dayjs('month') },
  { label: t('lastMonth'), value: 5, unit: '月', rate: 'mRate', time: () => getLastMonthDayjs() },
])

const currentRateLabel = computed(() => {
  const current = dataTabList.value.find(item => item.value === dataTab.value)
  return current ? t(current.rate) : ''
})

const overviewData = reactive<OverviewItem[]>([
  {
    title: 'allFlux',
    cdnType: 'cdn',
    dataType: 2,
    inland: { value: '0B', ratio: 0 },
    overseas: { value: '0B', ratio: 0 },
  },
  {
    title: 'allFlux',
    cdnType: 'ecdn',
    dataType: 2,
    inland: { value: '0B', ratio: 0 },
    overseas: { value: '0B', ratio: 0 },
  },
  {
    title: 'allBandwidthTopValue',
    cdnType: 'cdn',
    dataType: 1,
    inland: { value: '0Mbps', ratio: 0 },
    overseas: { value: '0Mbps', ratio: 0 },
  },
  {
    title: 'allBandwidthTopValue',
    cdnType: 'ecdn',
    dataType: 1,
    inland: { value: '0Mbps', ratio: 0 },
    overseas: { value: '0Mbps', ratio: 0 },
  },
  {
    title: 'allRequestTitle',
    cdnType: 'cdn',
    dataType: 3,
    inland: { value: getRequest(0), ratio: 0 },
    overseas: { value: getRequest(0), ratio: 0 },
  },
  {
    title: 'allRequestTitle',
    cdnType: 'ecdn',
    dataType: 3,
    inland: { value: getRequest(0), ratio: 0 },
    overseas: { value: getRequest(0), ratio: 0 },
  },
])

const groupedOverviewCards = computed(() =>
  overviewData.map(item => ({
    ...item,
    key: `${item.cdnType}-${item.dataType}`,
  })),
)

const notShowRatio = (value: number) => {
  const hidden = Math.abs(value) < 0.0001
  return hidden ? 0 : +(value * 100).toFixed(2)
}

const getOverviewData = () => {
  loading.value = true
  _getOverviewData({ duration: dataTab.value })
    .then(res => {
      res.data.list.forEach(item => {
        const target = overviewData.find(v => v.dataType === item.dataType && v.cdnType === item.cdnType)
        if (!target) return

        if (item.dataType === 1) {
          target.inland = { value: `${bpsToMbps(item.inland.value)}Mbps`, ratio: notShowRatio(item.inland.ratio) }
          target.overseas = { value: `${bpsToMbps(item.overseas.value)}Mbps`, ratio: notShowRatio(item.overseas.ratio) }
          return
        }

        if (item.dataType === 2) {
          target.inland = { value: getFlux(item.inland.value), ratio: notShowRatio(item.inland.ratio) }
          target.overseas = { value: getFlux(item.overseas.value), ratio: notShowRatio(item.overseas.ratio) }
          return
        }

        target.inland = { value: getRequest(item.inland.value), ratio: notShowRatio(item.inland.ratio) }
        target.overseas = { value: getRequest(item.overseas.value), ratio: notShowRatio(item.overseas.ratio) }
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const chartTab = ref<ChartTabValue>(0)
const chartTabList = ref<Item<ChartTabValue>[]>([
  { label: t('flux'), value: 0 },
  { label: t('bandwidth'), value: 1 },
  { label: t('requestCount'), value: 3 },
])

const changeDataTab = async (item: ItemPlus) => {
  dataTab.value = item.value
  timeRange.value = item.time()
  getRemainFlux()
  getPkgRecommended()
  getOverviewData()
  getOverviewRank()
  await getData()
  initChart()
}

const handleDataTabValueChange = (value: string | number) => {
  const item = dataTabList.value.find(current => current.value === Number(value))
  if (item) {
    changeDataTab(item)
  }
}

const changeChartTab = async (item: Item<ChartTabValue>) => {
  chartTab.value = item.value
  await getData()
  initChart()
  getOverviewRank()
}

const handleChartTabValueChange = (value: string | number) => {
  const item = chartTabList.value.find(current => current.value === Number(value))
  if (item) {
    changeChartTab(item)
  }
}

const state = reactive<DataItem[]>([
  { title: 'CDNinchina', unit: '', data: [], time: [], color: 'rgb(0, 102, 255)' },
  { title: 'CDNoutchina', unit: '', data: [], time: [], color: 'rgb(22, 180, 119)' },
  { title: 'ECDNinchina', unit: '', data: [], time: [], color: 'rgb(245, 69, 58)' },
  { title: 'ECDNoutchina', unit: '', data: [], time: [], color: 'rgb(255, 142, 43)' },
])

const xList = ref<string[]>([])
const domainList = ref<Domain[]>([])
const domainListHasDelete = ref<Domain[]>([])

const getDomainList = async () => {
  await Promise.all([
    _domainList({ scene: 'monitoring', areaCode: 0 }).then(res => res.data.data),
    _domainList({ scene: 'monitoring', areaCode: 1 }).then(res => res.data.data),
    _domainList({ scene: 'monitoring-ecdn', areaCode: 0 }).then(res => res.data.data),
    _domainList({ scene: 'monitoring-ecdn', areaCode: 1 }).then(res => res.data.data),
  ]).then(res => {
    domainListHasDelete.value = res.flat()
  })

  await _domainList({ scene: 'overview' }).then(res => {
    domainList.value = res.data.data
  })
}

const getData = async () => {
  chartLoading.value = true
  const form = {
    start_time: maoYunDayJs(timeRange.value[0]).valueOf() / 1000,
    end_time: maoYunDayJs(timeRange.value[1]).valueOf() / 1000,
    domain_ids: domainListHasDelete.value.map(v => v.id),
    area: 0,
    interval: 1 as 1 | 2,
  }
  const getCdnData = chartTab.value === 0 ? _flux : chartTab.value === 1 ? _bandwidth : _request
  const getEcdnData = chartTab.value === 0 ? _fluxAll : chartTab.value === 1 ? _bindwidthAll : _requestAll
  const interval = dataTab.value < 3 ? 1 : 2

  const initData = (arr: { value: number; time: number }[], index: number): DataItem => ({
    title: state[index].title,
    unit: chartTab.value === 0 ? 'MB' : chartTab.value === 1 ? 'Mbps' : 'countUnit',
    data:
      chartTab.value === 1
        ? arr.map(v => Number(bpsToMbps(v.value)))
        : chartTab.value === 0
          ? arr.map(v => Number(bytesToMB(v.value)))
          : arr.map(v => v.value),
    time: arr.map(v => String(getDateDayjs(v.time * 1000, 'string'))),
    color: state[index].color,
  })

  await Promise.all([
    getCdnData({ ...form, area: 0, interval }).then(res => {
      state[0] = initData(res.data.details, 0)
      xList.value = res.data.details.map(v => getDateDayjs(v.time * 1000, 'string'))
    }),
    getCdnData({ ...form, area: 1, interval }).then(res => {
      state[1] = initData(res.data.details, 1)
    }),
    getEcdnData({ ...form, area: 0, interval }).then(res => {
      state[2] = initData(res.data.details, 2)
    }),
    getEcdnData({ ...form, area: 1, interval }).then(res => {
      state[3] = initData(res.data.details, 3)
    }),
  ])

  chartLoading.value = false
}

const toPage = () => {
  let cdnMonitorTabType
  if (chartTab.value === 0) {
    cdnMonitorTabType = 'flow'
  } else if (chartTab.value === 1) {
    cdnMonitorTabType = 'broadband'
  } else {
    cdnMonitorTabType = 'request'
  }
  setSessionItemRaw('cdn_monitor_tab_type', cdnMonitorTabType)
  pushRoute({ path: '/cdn/analysis/monitor' })
}

const chartDom = ref<HTMLElement | null>(null)
const chartInstance = ref<ECharts | null>(null)

const initChart = () => {
  if (!chartDom.value) return

  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }

  chartInstance.value = markRaw(init(chartDom.value))
  chartInstance.value.setOption({
    grid: { left: '5%', right: '2%', top: '12%', bottom: 80 },
    tooltip: {
      trigger: 'axis',
      formatter: values => {
        return `<div>
          <div>${getDateDayjs(values[0].axisValueLabel, 'string', true)}</div>
          ${values
            .map(item => {
              let value = item.data
              let unit = state[item.seriesIndex]?.unit
              if (item.data <= 0.01) {
                value = (item.data * 1000).toFixed(2)
                if (chartTab.value === 0) unit = 'kb'
                if (chartTab.value === 1) unit = 'kbps'
              }
              return `
                <div style="display:flex;align-items:center;margin-top:10px">
                  <div style="width:6px;height:6px;border-radius:999px;background-color:${item.color};margin-right:6px"></div>
                  <div style="padding-right:10px">${item.seriesName}</div>
                  <div style="margin-left:auto;color:#06f">${value}${t(unit, { num: value })}</div>
                </div>`
            })
            .join('')}
        </div>`
      },
    },
    legend: {
      selectedMode: true,
      x: 'center',
      y: 'bottom',
      data: state.map(v => t(v.title)),
      icon: 'rect',
      itemWidth: 14,
      itemHeight: 4,
      itemGap: 20,
      textStyle: { fontSize: 14 },
    },
    xAxis: {
      type: 'category',
      data: xList.value,
      axisTick: { length: 0 },
      axisLabel: { margin: 20, fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: `${t('unit')}(${t(state[0].unit)})`,
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: state.map(item => ({
      name: t(item.title),
      type: 'line',
      data: item.data,
      symbol: 'emptyCircle',
      itemStyle: { color: item.color },
      lineStyle: { width: 2 },
    })),
  })
  resizeObserver.observe(chartDom.value)
}

const resizeObserver = new ResizeObserver(() => {
  chartInstance.value?.resize()
})

const tableData = ref<
  {
    domain: string
    total_flux: string
    top_bindwidth: string
    total_requests: string
  }[]
>([])

const getOverviewRank = async () => {
  await _getOverviewRank({
    domain_ids: domainListHasDelete.value.map(v => v.id),
    start_time: maoYunDayJs(timeRange.value[0]).valueOf() / 1000,
    end_time: maoYunDayJs(timeRange.value[1]).valueOf() / 1000,
    order_by: chartTab.value,
  }).then(res => {
    tableData.value = res.data.data.map(item => ({
      domain: item.domain,
      total_flux: getFlux(item.total_flux),
      top_bindwidth: `${bpsToMbps(item.top_bindwidth)}Mbps`,
      total_requests: getRequest(item.total_requests),
    }))
  })
}

const usePakeage = reactive<{
  CDN: FluxDataItem
  ECDN: FluxDataItem
}>({
  CDN: { chinese_remain: 0, inland_pkgs_total: 0, overseas_remain: 0, overseas_pkgs_total: 0 },
  ECDN: { chinese_remain: 0, inland_pkgs_total: 0, overseas_remain: 0, overseas_pkgs_total: 0 },
})

const getRemainFlux = async () => {
  _remainFlux({ cdnType: 'cdn' }).then(res => {
    usePakeage.CDN = res.data
  })
  _remainFlux({ cdnType: 'ecdn' }).then(res => {
    usePakeage.ECDN = res.data
  })
}

const resourcePackageCards = computed(() => [
  {
    key: 'cdn-inland',
    label: t('CDNwithinRemainFlux'),
    remain: getFluxDetail(usePakeage.CDN.chinese_remain),
    pkgTotal: usePakeage.CDN.inland_pkgs_total,
  },
  {
    key: 'cdn-overseas',
    label: t('CDNwithoutRemainFlux'),
    remain: getFluxDetail(usePakeage.CDN.overseas_remain),
    pkgTotal: usePakeage.CDN.overseas_pkgs_total,
  },
  {
    key: 'ecdn-inland',
    label: t('ECDNwithinRemainFlux'),
    remain: getFluxDetail(usePakeage.ECDN.chinese_remain),
    pkgTotal: usePakeage.ECDN.inland_pkgs_total,
  },
  {
    key: 'ecdn-overseas',
    label: t('ECDNwithoutRemainFlux'),
    remain: getFluxDetail(usePakeage.ECDN.overseas_remain),
    pkgTotal: usePakeage.ECDN.overseas_pkgs_total,
  },
])

const recommendedList = ref<
  {
    accelerationRegion: 0 | 1
    accelerationType: 0 | 1
    flux: number
    fluxPeriod: number
    price: number
    id: number
    class: any
  }[]
>([])

const getPkgRecommended = () => {
  _getPkgRecommended().then(res => {
    recommendedList.value = res.data.list || []
  })
}

const getRecommendTitle = (rec: { accelerationRegion: 0 | 1; flux: number; class: any }) => {
  const detail = rec.class ? getRequestDetail(rec.flux) : getFluxDetail(rec.flux)
  return `${getValueMap(area, rec.accelerationRegion)} ${detail.count}${detail.unit}`
}

onMounted(async () => {
  getRemainFlux()
  getPkgRecommended()
  timeRange.value = dataTabList.value[0].time()
  await getDomainList()
  await changeDataTab(dataTabList.value[0])
})

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  if (chartDom.value) {
    resizeObserver.unobserve(chartDom.value)
  }
})
</script>

<style scoped lang="scss">
.cdn-service-v2 {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
}

.cdn-service-v2__hero,
.cdn-service-v2__panel {
  background: #fff;
}

.cdn-service-v2__hero {
  position: relative;
  display: flex;
  justify-content: space-between;
  min-height: 200px;
  padding: 30px;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 98%) 0%, rgb(255 255 255 / 92%) 44%, rgb(232 240 255 / 78%) 100%),
    linear-gradient(135deg, #edf4ff 0%, #fff 42%, #edf5ff 100%);
}

.cdn-service-v2__hero::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background:
    radial-gradient(circle at 76% 34%, rgb(0 102 255 / 12%), transparent 18%),
    radial-gradient(circle at 88% 62%, rgb(0 166 255 / 16%), transparent 16%);
}

.cdn-service-v2__hero-content {
  position: relative;
  z-index: 1;
  max-width: 560px;
}

.cdn-service-v2__hero-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 32px;
  color: #191c23;
}

.cdn-service-v2__hero-desc {
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 28px;
  color: #5b6475;
}

.cdn-service-v2__hero-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 26px;
}

.cdn-service-v2__primary-btn,
.cdn-service-v2__ghost-btn,
.cdn-service-v2__outline-btn,
.cdn-service-v2__recommend-card,
.cdn-service-v2__link-btn {
  padding: 0;
  font: inherit;
  appearance: none;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-service-v2__primary-btn,
.cdn-service-v2__ghost-btn {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 18px;
  font-size: 14px;
  line-height: 22px;
  transition: transform 0.2s ease;
}

.cdn-service-v2__primary-btn {
  color: #fff;
  background: #06f;
}

.cdn-service-v2__ghost-btn {
  color: #06f;
  border: 1px solid #06f;
}

.cdn-service-v2__primary-btn:hover,
.cdn-service-v2__ghost-btn:hover {
  transform: translateY(-1px);
}

.cdn-service-v2__ghost-btn :deep(svg),
.cdn-service-v2__link-btn :deep(svg) {
  width: 5px;
  height: 8px;
}

.cdn-service-v2__hero-art {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 0;

  // width: min(52%, 640px);
  height: 100%;
  object-fit: cover;
}

.cdn-service-v2__notice-slot {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.cdn-service-v2__notice-close {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-service-v2__notice-close :deep(svg) {
  width: 14px;
  height: 14px;
}

.cdn-service-v2__filter-bar {
  display: flex;
}

.cdn-service-v2__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;
}

.cdn-service-v2__main,
.cdn-service-v2__side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cdn-service-v2__panel {
  padding: 24px;
}

.cdn-service-v2__panel-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cdn-service-v2__panel-head--chart {
  align-items: center;
}

.cdn-service-v2__panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.cdn-service-v2__link-btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
}

.cdn-service-v2__overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
  margin-top: 20px;
}

.cdn-service-v2__metric-card {
  padding: 18px 16px;
  border: 1px solid #e6ebf2;
}

.cdn-service-v2__metric-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.cdn-service-v2__metric-row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.cdn-service-v2__metric-row + .cdn-service-v2__metric-row {
  margin-top: 6px;
}

.cdn-service-v2__metric-value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-service-v2__metric-rate {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  text-align: right;
}

.cdn-service-v2__chart-meta {
  display: inline-flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #8c96a8;
}

.cdn-service-v2__chart-meta :deep(svg) {
  width: 16px;
  height: 16px;
}

.cdn-service-v2__chart {
  width: 100%;
  height: 420px;
  margin-top: 36px;
}

.cdn-service-v2__table {
  margin-top: 36px;
}

.cdn-service-v2__table-title {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.cdn-service-v2__table-title :deep(svg) {
  width: 14px;
  height: 14px;
}

.cdn-service-v2__domain-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.cdn-service-v2__domain-card {
  padding: 16px 20px;
  background: #f7f9fc;
}

.cdn-service-v2__domain-label {
  font-size: 12px;
  line-height: 22px;
  color: #5b6475;
}

.cdn-service-v2__domain-num {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
  color: #191c23;
}

.cdn-service-v2__outline-btn {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 36px;
  margin-top: 18px;
  color: #191c23;
  border: 1px solid #d9dde5;
}

.cdn-service-v2__outline-btn :deep(svg) {
  width: 16px;
  height: 16px;
}

.cdn-service-v2__resource-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) 1px minmax(92px, 1fr);
  gap: 16px;
  align-items: center;
  padding: 0 0 20px;
  border-top: 1px solid #eef2f7;
}

.cdn-service-v2__resource-row:nth-child(2) {
  margin-top: 4px;
  border-top: 0;
}

.cdn-service-v2__resource-row + .cdn-service-v2__resource-row {
  padding-top: 20px;
}

.cdn-service-v2__resource-col {
  min-width: 0;
}

.cdn-service-v2__resource-label {
  font-size: 12px;
  line-height: 20px;
  color: #191c23;
}

.cdn-service-v2__resource-divider {
  width: 1px;
  height: 64px;
  background: #eef2f7;
}

.cdn-service-v2__resource-value {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin-top: 12px;
  color: #191c23;
}

.cdn-service-v2__resource-value.is-empty {
  margin-top: 12px;
}

.cdn-service-v2__resource-num {
  font-family: MiSans, 'Noto Sans CJK', sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: #191c23;
}

.cdn-service-v2__resource-unit {
  font-size: 14px;
  line-height: 32px;
  color: #191c23;
}

.cdn-service-v2__resource-empty {
  font-family: MiSans, 'Noto Sans CJK', sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: #828b9c;
}

.cdn-service-v2__recommend-card {
  width: 100%;
  text-align: left;
  border-top: 1px solid #eef2f7;
  transition: background-color 0.2s ease;
}

.cdn-service-v2__recommend-card:nth-child(2) {
  margin-top: 4px;
  border-top: 0;
}

// .cdn-service-v2__recommend-card:hover {
//   background:
//     linear-gradient(133.49deg, rgb(255 255 255 / 15%) 24.13%, rgb(0 119 255 / 15%) 82.53%, rgb(255 255 255 / 15%) 91.66%, rgb(0 119 255 / 15%) 98.8%),
//     #fff;
// }

.cdn-service-v2__recommend-content {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  min-height: 121px;
  padding: 0 0 20px;
}

.cdn-service-v2__recommend-card + .cdn-service-v2__recommend-card .cdn-service-v2__recommend-content {
  padding-top: 20px;
}

.cdn-service-v2__recommend-head {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 24px;
}

.cdn-service-v2__recommend-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cdn-service-v2__recommend-tag {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  height: 24px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 20px;
  color: #ff720d;
  border: 1px solid #ff720d;
}

.cdn-service-v2__recommend-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  line-height: 20px;
  color: #8c96a8;
}

.cdn-service-v2__recommend-price {
  margin-top: 6px;
  font-family: MiSans, 'Noto Sans CJK', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 32px;
  color: #ff7a00;
}

.cdn-service-v2__recommend-figure {
  // position: absolute;
  // right: 0;
  // bottom: 0;
  width: 72px;
  height: 60px;

  // object-fit: cover;
  // opacity: 0.9;
}

@media (width <= 1360px) {
  .cdn-service-v2__layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .cdn-service-v2__side {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
}

@media (width <= 900px) {
  .cdn-service-v2__hero {
    min-height: 240px;
    padding: 24px 20px;
  }

  .cdn-service-v2__hero-art {
    width: 100%;
    opacity: 0.2;
  }

  .cdn-service-v2__overview-grid,
  .cdn-service-v2__domain-grid,
  .cdn-service-v2__resource-row,
  .cdn-service-v2__side {
    grid-template-columns: 1fr;
  }

  .cdn-service-v2__panel-head--chart {
    flex-wrap: wrap;
  }

  .cdn-service-v2__chart-meta {
    flex: none;
    width: 100%;
    margin-left: 0;
  }
}
</style>
