<template>
  <div class="service">
    <CatTabsBox v-model="dataTab" :list="dataTabList as any" @change="changeDataTab" />
    <div class="df mt20">
      <div class="service-left mr20">
        <div class="page-box use-data">
          <div class="pd20">
            <div class="df jsb">
              <div class="title">
                {{ t('useOverview') }}
              </div>
              <el-link type="primary" @click="pushRoute('/cdn/buyFlow')">
                {{ t('buyPkg') }}
              </el-link>
            </div>
          </div>
          <div v-loading="loading" class="data-list">
            <div v-for="(datav, datai) in overviewData" :key="'datav' + datai" class="data-list-bg">
              <div class="data-item">
                <div class="item-title line1">{{ datav.cdnType === 'cdn' ? 'CDN' : 'ECDN' }} {{ t(datav.title) }}</div>
                <div class="df jsb mt20">
                  <div class="data-item-left">
                    <div>
                      <CatTooltip :content="t('inChina') + '&nbsp;' + datav.inland.value">
                        {{ t('inChina') }}&nbsp;{{ datav.inland.value }}
                      </CatTooltip>
                    </div>
                    <div class="mt10">
                      <CatTooltip :content="t('outChina') + '&nbsp;' + datav.overseas.value">
                        {{ t('outChina') }}&nbsp;{{ datav.overseas.value }}
                      </CatTooltip>
                    </div>
                  </div>
                  <div class="data-item-right">
                    <div class="nowrap contrast">
                      <span>{{ t(dataTabList.find(v => v.value === dataTab)!.rate) }}</span
                      >&nbsp;
                      <span v-show="datav.inland.ratio">{{ datav.inland.ratio }}</span>
                      <span>{{ datav.inland.ratio ? '%' : '-' }}</span>
                    </div>
                    <div class="nowrap contrast mt10">
                      <span>{{ t(dataTabList.find(v => v.value === dataTab)!.rate) }}</span
                      >&nbsp;
                      <span v-show="datav.overseas.ratio">{{ datav.overseas.ratio }}</span>
                      <span>{{ datav.overseas.ratio ? '%' : '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="page-box use-chart pd20 mt20">
          <div class="df ac">
            <CatTabsBox v-model="chartTab" :list="chartTabList as any" @change="changeChartTab" />
            <div class="time">
              （ {{ timeRange[0].slice(0, 10) }} {{ t('to') }} {{ timeRange[1].slice(0, 10) }} ）
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
            <el-link style="margin-left: auto" ype="primary" @click="toPage">
              {{ t('seeDetails') }}
            </el-link>
          </div>
          <div ref="chartDom" v-loading="chartLoading" class="chart mt20" />
          <el-table :data="tableData" class="mt20" table-layout="auto">
            <el-table-column prop="domain" :label="t('top10domain')">
              <template #header>
                <div class="df ac">
                  {{ t('top10domain') }}&nbsp;
                  <SvgIcon name="cat-cdn-top10" />
                </div>
              </template>
            </el-table-column>
            <el-table-column v-if="chartTab === 0" prop="total_flux" :label="t('flux')" />
            <el-table-column v-if="chartTab === 1" prop="top_bindwidth" :label="t('bandwidth')" />
            <el-table-column v-if="chartTab === 3" prop="total_requests" :label="t('requestCount')" />
          </el-table>
        </div>
      </div>

      <div class="service-right">
        <div class="speed-domain page-box pd20">
          <div class="df jsb ac">
            <div class="title">
              {{ t('acceleratedDomain') }}
            </div>
            <el-link type="primary" @click="pushRoute('/cdn/domain')">
              {{ t('domainManage') }}
            </el-link>
          </div>
          <div class="domain-data mt20">
            <div class="item df jsb ac pd20">
              <div class="df fdc">
                <span>{{ t('enabledDomain') }}</span>
                <span class="num">{{ domainList.filter(v => v.status >= 0 && v.status < 3).length }}</span>
              </div>
              <SvgIcon name="cat-cdn-lock" />
            </div>
            <div class="item df jsb ac pd20 mt20">
              <div class="df fdc">
                <span>{{ t('allDomains') }}</span>
                <span class="num">{{ domainList.length }}</span>
              </div>
              <SvgIcon name="cat-cdn-layers" />
            </div>
            <div class="df mt20" style="justify-content: flex-end">
              <el-link type="primary" @click="pushRoute('/cdn/content')">
                <SvgIcon name="cat-cdn-refresh" class="mr4" />{{ t('refreshWarm') }}
              </el-link>
            </div>
          </div>
        </div>
        <div class="cdn-resource page-box pd20 mt20">
          <div class="title df link-title">
            <div>{{ t('canUseResourcePkg') }}</div>
            <el-link type="primary" @click="pushRoute('/cdn/fluxPkg')">
              {{ t('manage') }}
            </el-link>
          </div>
          <div class="cdn-data mt20">
            <div class="df">
              <div class="left">
                {{ t('CDNwithinRemainFlux') }}
              </div>
              <div class="right">
                {{ t('remainingTraffiPacket') }}
              </div>
            </div>
            <div class="df">
              <div class="left pt10">
                <span v-show="getFluxDetail(usePakeage.CDN.chinese_remain).count" class="num">
                  {{ getFluxDetail(usePakeage.CDN.chinese_remain).count }}</span
                >
                <span class="unit ml4">
                  {{
                    getFluxDetail(usePakeage.CDN.chinese_remain).count
                      ? getFluxDetail(usePakeage.CDN.chinese_remain).unit
                      : '—'
                  }}
                </span>
              </div>
              <div class="right pt10">
                <span v-show="usePakeage.CDN.inland_pkgs_total" class="num">{{
                  usePakeage.CDN.inland_pkgs_total
                }}</span>
                <span class="unit ml4">{{
                  usePakeage.CDN.inland_pkgs_total ? t('numUnit', { show: false }) : '—'
                }}</span>
              </div>
            </div>
          </div>
          <div class="cdn-data mt20">
            <div class="df">
              <div class="left">
                {{ t('CDNwithoutRemainFlux') }}
              </div>
              <div class="right">
                {{ t('remainingTraffiPacket') }}
              </div>
            </div>
            <div class="df">
              <div class="left pt10">
                <span v-show="getFluxDetail(usePakeage.CDN.overseas_remain).count" class="num">
                  {{ getFluxDetail(usePakeage.CDN.overseas_remain).count }}
                </span>
                <span class="unit ml4">
                  {{
                    getFluxDetail(usePakeage.CDN.overseas_remain).count
                      ? getFluxDetail(usePakeage.CDN.overseas_remain).unit
                      : '—'
                  }}
                </span>
              </div>
              <div class="right pt10">
                <span v-show="usePakeage.CDN.overseas_pkgs_total" class="num">{{
                  usePakeage.CDN.overseas_pkgs_total
                }}</span>
                <span class="unit ml4">{{
                  usePakeage.CDN.overseas_pkgs_total ? t('numUnit', { show: false }) : '—'
                }}</span>
              </div>
            </div>
          </div>
          <div class="cdn-data mt20">
            <div class="df">
              <div class="left">
                {{ t('ECDNwithinRemainFlux') }}
              </div>
              <div class="right">
                {{ t('remainingTraffiPacket') }}
              </div>
            </div>
            <div class="df">
              <div class="left pt10">
                <span v-show="getFluxDetail(usePakeage.ECDN.chinese_remain).count" class="num">
                  {{ getFluxDetail(usePakeage.ECDN.chinese_remain).count }}
                </span>
                <span class="unit ml4">
                  {{
                    getFluxDetail(usePakeage.ECDN.chinese_remain).count
                      ? getFluxDetail(usePakeage.ECDN.chinese_remain).unit
                      : '—'
                  }}
                </span>
              </div>
              <div class="right pt10">
                <span v-show="usePakeage.ECDN.inland_pkgs_total" class="num">{{
                  usePakeage.ECDN.inland_pkgs_total
                }}</span>
                <span class="unit ml4">{{
                  usePakeage.ECDN.inland_pkgs_total ? t('numUnit', { show: false }) : '—'
                }}</span>
              </div>
            </div>
          </div>
          <div class="cdn-data mt20">
            <div class="df">
              <div class="left">
                {{ t('ECDNwithoutRemainFlux') }}
              </div>
              <div class="right">
                {{ t('remainingTraffiPacket') }}
              </div>
            </div>
            <div class="df">
              <div class="left pt10">
                <span v-show="getFluxDetail(usePakeage.ECDN.overseas_remain).count" class="num">
                  {{ getFluxDetail(usePakeage.ECDN.overseas_remain).count }}
                </span>
                <span class="unit ml4">
                  {{
                    getFluxDetail(usePakeage.ECDN.overseas_remain).count
                      ? getFluxDetail(usePakeage.ECDN.overseas_remain).unit
                      : '—'
                  }}
                </span>
              </div>
              <div class="right pt10">
                <span v-show="usePakeage.ECDN.overseas_pkgs_total" class="num">{{
                  usePakeage.ECDN.overseas_pkgs_total
                }}</span>
                <span class="unit ml4">{{
                  usePakeage.ECDN.overseas_pkgs_total ? t('numUnit', { show: false }) : '—'
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="recommend page-box pd20">
          <div class="title df link-title">
            <div>{{ t('recommendBuy') }}</div>
            <el-link type="primary" @click="pushRoute('/cdn/buyFlow')">
              {{ t('buyMorePkg') }}
            </el-link>
          </div>
          <div
            v-for="(rec, ri) in recommendedList"
            :key="'r' + ri"
            class="buy-item df ac jsb mt20"
            @click="pushRoute({ path: '/cdn/buyFlow', query: { id: rec.id } })"
          >
            <div class="left">
              <div class="buy-title">
                <span>{{ rec.accelerationType ? 'ECDN' : 'CDN' }}</span>
                <span>{{ getValueMap(area, rec.accelerationRegion) }}</span>
                <span>&nbsp;</span>
                <span>{{ rec.class ? getRequestDetail(rec.flux).count : getFluxDetail(rec.flux).count }}</span>
                <span>{{ rec.class ? getRequestDetail(rec.flux).unit : getFluxDetail(rec.flux).unit }}</span>
              </div>
              <div class="buy-content mt10">
                {{ t('numMonth', { num: rec.fluxPeriod }) }}&nbsp;|&nbsp;{{ getValueMap(area, rec.accelerationRegion) }}
              </div>
            </div>
            <div class="right">{{ formatPrice(rec.price) }} USD</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
import { _getDurationTime2Dayjs } from '@/utils/format-time'
import { bpsToMbps, bytesToMB, getFlux, getRequest, getFluxDetail, getRequestDetail } from '@/utils/unit'
import { getLastMonthDayjs, getDateDayjs } from '@/utils/format-time'
import { getValueMap } from '@/utils/collection-utils'
import { formatPrice } from '@/utils/number-utils'
import { area } from '@/assets/data/common'
import t from '@/utils/i18n'

import { use, init, ECharts } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
use([TooltipComponent, GridComponent, CanvasRenderer, LegendComponent, UniversalTransition, LineChart])

import type { Item } from '@/views/cdn/common'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { setSessionItemRaw } from '@/utils/storage'
import { pushRoute } from '@/utils/router-jump'
type ItemPlus = Item & { time: any; unit: '日' | '周' | '月'; rate: string }

const router = useRouter()
const loading = ref<boolean>(false)

const dataTab = ref<number>(1)
const timeRange = ref<string[]>(['', ''])
const dataTabList = ref<ItemPlus[]>([
  {
    label: t('today'),
    value: 1,
    unit: '日',
    rate: 'dRate',
    time: () => _getDurationTime2Dayjs('today'),
  },
  {
    label: t('yesterday'),
    value: 2,
    unit: '日',
    rate: 'dRate',
    time: () => _getDurationTime2Dayjs('yesterday'),
  },
  {
    label: t('oneWeek'),
    value: 3,
    unit: '周',
    rate: 'wRate',
    time: () => _getDurationTime2Dayjs('lastweek'),
  },
  {
    label: t('oneMonth'),
    value: 4,
    unit: '月',
    rate: 'mRate',
    time: () => _getDurationTime2Dayjs('month'),
  },
  {
    label: t('lastMonth'),
    value: 5,
    unit: '月',
    rate: 'mRate',
    time: () => getLastMonthDayjs(),
  },
])
const overviewData = reactive<
  {
    title: string
    cdnType: string
    dataType: number
    inland: { value: any; ratio: any }
    overseas: { value: any; ratio: any }
  }[]
>([
  {
    title: 'allFlux',
    cdnType: 'cdn',
    dataType: 2,
    inland: {
      value: '0B',
      ratio: 0,
    },
    overseas: {
      value: '0B',
      ratio: 0,
    },
  },
  {
    title: 'allBandwidthTopValue',
    cdnType: 'cdn',
    dataType: 1,
    inland: {
      value: '0Mbps',
      ratio: 0,
    },
    overseas: {
      value: '0Mbps',
      ratio: 0,
    },
  },
  {
    title: 'allRequestTitle',
    cdnType: 'cdn',
    dataType: 3,
    inland: {
      value: 0 + t('countUnit', { num: 0 }),
      ratio: 0,
    },
    overseas: {
      value: 0 + t('countUnit', { num: 0 }),
      ratio: 0,
    },
  },
  {
    title: 'allFlux',
    cdnType: 'ecdn',
    dataType: 2,
    inland: {
      value: '0B',
      ratio: 0,
    },
    overseas: {
      value: '0B',
      ratio: 0,
    },
  },
  {
    title: 'allBandwidthTopValue',
    cdnType: 'ecdn',
    dataType: 1,
    inland: {
      value: '0Mbps',
      ratio: 0,
    },
    overseas: {
      value: '0Mbps',
      ratio: 0,
    },
  },
  {
    title: 'allRequestTitle',
    cdnType: 'ecdn',
    dataType: 3,
    inland: {
      value: getRequest(0),
      ratio: 0,
    },
    overseas: {
      value: getRequest(0),
      ratio: 0,
    },
  },
])
const notShowRatio = (v: number) => {
  let notShow = Math.abs(v) < 0.0001
  return notShow ? 0 : +(v * 100).toFixed(2)
}
const getOverviewData = () => {
  loading.value = true
  _getOverviewData({ duration: dataTab.value })
    .then(res => {
      res.data.list.forEach(v => {
        for (let i = 0; i < overviewData.length; i++) {
          if (v.dataType === overviewData[i].dataType && v.cdnType === overviewData[i].cdnType) {
            if (v.dataType === 1) {
              overviewData[i].inland = {
                value: bpsToMbps(v.inland.value) + 'Mbps',
                ratio: notShowRatio(v.inland.ratio),
              }
              overviewData[i].overseas = {
                value: bpsToMbps(v.overseas.value) + 'Mbps',
                ratio: notShowRatio(v.overseas.ratio),
              }
              break
            } else if (v.dataType === 2) {
              overviewData[i].inland = { value: getFlux(v.inland.value), ratio: notShowRatio(v.inland.ratio) }
              overviewData[i].overseas = { value: getFlux(v.overseas.value), ratio: notShowRatio(v.overseas.ratio) }
              break
            } else if (v.dataType === 3) {
              overviewData[i].inland = { value: getRequest(v.inland.value), ratio: notShowRatio(v.inland.ratio) }
              overviewData[i].overseas = { value: getRequest(v.overseas.value), ratio: notShowRatio(v.overseas.ratio) }
              break
            }
          }
        }
      })
    })
    .finally(() => {
      loading.value = false
    })
}
const changeDataTab = async v => {
  dataTab.value = v.value
  timeRange.value = v.time()
  getRemainFlux()
  getPkgRecommended()
  getOverviewData()
  getOverviewRank()
  await getData()
  initChart()
}

const chartTab = ref<number | any>(0)
const chartTabList = ref<Item[]>([
  {
    label: t('flux'),
    value: 0,
  },
  {
    label: t('bandwidth'),
    value: 1,
  },
  {
    label: t('requestCount'),
    value: 3,
  },
])
const changeChartTab = async (v: Item) => {
  chartTab.value = v.value
  await getData()
  initChart()
  getOverviewRank()
}

interface DataItem {
  title: string
  unit: string
  data: any[]
  time: any[]
  color: string
}
const state = reactive<DataItem[]>([
  {
    title: 'CDNinchina',
    unit: '',
    data: [],
    time: [],
    color: 'rgb(90, 216, 166)',
  },
  {
    title: 'CDNoutchina',
    unit: '',
    data: [],
    time: [],
    color: 'rgb(91, 143, 249)',
  },
  {
    title: 'ECDNinchina',
    unit: '',
    data: [],
    time: [],
    color: 'rgb(250, 140, 21)',
  },
  {
    title: 'ECDNoutchina',
    unit: '',
    data: [],
    time: [],
    color: 'rgb(254, 77, 79)',
  },
])
const xList = ref<string[]>([])
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
  const form: {
    start_time: number
    end_time: number
    domain_ids: number[]
    area: number
    interval: 1 | 2
  } = {
    start_time: maoYunDayJs(timeRange.value[0]).valueOf() / 1000,
    end_time: maoYunDayJs(timeRange.value[1]).valueOf() / 1000,
    domain_ids: domainListHasDelete.value.map(v => v.id),
    area: 0,
    interval: 1,
  }
  const get_cdn_data = chartTab.value === 0 ? _flux : chartTab.value === 1 ? _bandwidth : _request
  const get_ecdn_data = chartTab.value === 0 ? _fluxAll : chartTab.value === 1 ? _bindwidthAll : _requestAll
  //数据查询粒度,1为1小时，2为1天
  const interval = dataTab.value < 3 ? 1 : 2
  //chartTab  0流量  1带宽   3请求数
  const initData = (arr: { value: number; time: number }[], index: number) => ({
    title: state[index].title,
    unit: chartTab.value === 0 ? 'MB' : chartTab.value === 1 ? 'Mbps' : 'countUnit',
    data:
      chartTab.value === 1
        ? arr.map(v => bpsToMbps(v.value))
        : chartTab.value === 0
          ? arr.map(v => bytesToMB(v.value))
          : arr.map(v => v.value),
    time: arr.map(v => getDateDayjs(v.time * 1000, 'string')),
    color: state[index].color,
  })
  await Promise.all([
    get_cdn_data({ ...form, area: 0, interval }).then(res => {
      state[0] = initData(res.data.details, 0)
      xList.value = res.data.details.map(v => getDateDayjs(v.time * 1000, 'string'))
    }),
    get_cdn_data({ ...form, area: 1, interval }).then(res => {
      state[1] = initData(res.data.details, 1)
    }),
    get_ecdn_data({ ...form, area: 0, interval }).then(res => {
      state[2] = initData(res.data.details, 2)
    }),
    get_ecdn_data({ ...form, area: 1, interval }).then(res => {
      state[3] = initData(res.data.details, 3)
    }),
  ])
  chartLoading.value = false
}

const toPage = () => {
  let cdn_monitor_tab_type
  if (chartTab.value === 0) {
    cdn_monitor_tab_type = 'flow'
  } else if (chartTab.value === 1) {
    cdn_monitor_tab_type = 'broadband'
  } else if (chartTab.value === 3) {
    cdn_monitor_tab_type = 'request'
  }
  setSessionItemRaw('cdn_monitor_tab_type', cdn_monitor_tab_type)
  pushRoute({
    path: '/cdn/analysis/monitor',
  })
}

const chartDom = ref<HTMLElement | null>(null)
const chartInstance = ref<ECharts | null>(null)
const chartLoading = ref<boolean>(false)
const initChart = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  chartInstance.value = markRaw(init(chartDom.value))
  const option = {
    grid: {
      left: '5%',
      right: '2%',
      top: '12%',
      bottom: '80',
    },
    tooltip: {
      trigger: 'axis',
      formatter: v => {
        return `<div>
          <div>${getDateDayjs(v[0].axisValueLabel, 'string', true)}</div>
          ${v
            .map(vv => {
              // 显示kb单位
              let v = vv.data,
                n = state[vv.seriesIndex]?.unit
              if (vv.data <= 0.01) {
                v = (vv.data * 1000).toFixed(2)
                if (chartTab.value === 0) n = 'kb'
                if (chartTab.value === 1) n = 'kbps'
              }
              return `
              <div>
                <div style="display:flex;align-items:center;margin-top:10px">
                  <div style="width:6px;height:6px;border-radius:50%;background-color:${vv.color};margin-right:6px"></div>
                  <div style="padding-right:10px">${vv.seriesName}</div>
                  <div style="margin-left:auto;color:var(--primary-color)">${v}${t(n, { num: v })}</div>
                </div>
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
      textStyle: {
        fontSize: 14,
        height: 10,
        rich: {
          a: {
            verticalAlign: 'middle',
          },
        },
      },
    },
    xAxis: {
      type: 'category',
      data: xList.value,
      axisTick: {
        length: 0,
      },
      axisLabel: {
        margin: 20,
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: `${t('unit')}(${t(state[0].unit)})`,
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: state.map((v: DataItem) => ({
      name: t(v.title),
      type: 'line',
      // stack: "Total",
      data: v.data,
      symbol: 'emptyCircle',
      itemStyle: {
        color: v.color,
      },
      areaStyle: {
        opacity: '0.25',
        color: v.color,
      },
    })),
  }
  option && chartInstance.value.setOption(option)
  resizeObserver.observe(chartDom.value!)
}

const resize = () => {
  chartInstance.value?.resize()
}
const resizeObserver = new ResizeObserver(params => {
  resize()
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
    tableData.value = res.data.data.map(v => ({
      domain: v.domain,
      total_flux: getFlux(v.total_flux),
      top_bindwidth: bpsToMbps(v.top_bindwidth) + 'Mbps',
      total_requests: getRequest(v.total_requests),
    }))
  })
}

interface FluxDataItem {
  chinese_remain: number
  inland_pkgs_total: number
  overseas_remain: number
  overseas_pkgs_total: number
}
const usePakeage = reactive<{
  CDN: FluxDataItem
  ECDN: FluxDataItem
}>({
  CDN: {
    chinese_remain: 0,
    inland_pkgs_total: 0,
    overseas_remain: 0,
    overseas_pkgs_total: 0,
  },
  ECDN: {
    chinese_remain: 0,
    inland_pkgs_total: 0,
    overseas_remain: 0,
    overseas_pkgs_total: 0,
  },
})
const getRemainFlux = async () => {
  _remainFlux({ cdnType: 'cdn' }).then(res => {
    usePakeage.CDN = res.data
  })
  _remainFlux({ cdnType: 'ecdn' }).then(res => {
    usePakeage.ECDN = res.data
  })
}

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
  resizeObserver.unobserve(chartDom.value!)
})
</script>

<style lang="scss" scoped>
.service {
  .pt10 {
    padding-top: 10px;
  }

  .pd10 {
    padding: 10px;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #000;
  }

  .service-left {
    flex: 1;
    width: 0;

    .use-data {
      .data-list {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        row-gap: 20px;
        padding: 0 20px 20px;

        .data-list-bg {
          background-color: #f9fafc;

          &:nth-child(3n) .data-item {
            border: none;
          }
        }

        .data-item {
          padding-right: 20px;
          margin: 20px;
          margin-right: 0;
          color: #000;
          border-right: 1px solid #ddd;

          .item-title {
            font-weight: 700;
          }

          .data-item-left {
            display: flex;
            flex: 1;
            flex-direction: column;
            width: 0;
          }

          .contrast {
            color: #666;
          }

          .count {
            margin-left: 10px;
          }
        }
      }
    }

    .use-chart {
      .time {
        color: var(--sub-text);
      }

      .chart {
        width: 100%;
        aspect-ratio: 4/1.4;
      }
    }
  }

  .service-right {
    .num {
      font-size: 24px;
      font-weight: 700;
      color: var(--el-color-primary);
    }

    .unit {
      font-weight: 700;
      color: #000;
    }

    .link-title {
      align-items: flex-end;
      justify-content: space-between;
    }

    .speed-domain {
      .domain-data {
        .item {
          box-shadow: 0 0 6px 1px rgb(0 0 0 / 8%);

          svg {
            font-size: 56px;
          }
        }
      }
    }

    .cdn-resource {
      padding-bottom: 0;

      .cdn-data {
        padding-bottom: 20px;
        border-bottom: 1px solid var(--el-color-info-light-9);

        .left {
          flex: 1;
          padding-right: 40px;
          margin-right: 40px;
          border-right: 1px solid var(--el-color-info-light-9);
        }

        .right {
          width: 100px;
        }
      }
    }

    .recommend {
      .buy-item {
        position: relative;
        padding: 16px 12px;
        overflow: hidden;
        cursor: pointer;
        background-color: #fef1e5;
        background-image: url('@/assets/images/cdn/store-bg.png');
        background-repeat: no-repeat;
        background-position: right center;
        background-size: 34%;
        border: 1px solid #ffbc8e;
        transition: all 0.4s;

        &::before {
          position: absolute;
          top: 0;
          left: -32%;
          display: block;
          width: 20%;
          height: 100%;
          content: '';
          background-color: rgb(255 255 255 / 50%);
          transition: none;
          transform: skewX(-45deg);
        }

        &:hover::before {
          left: 112%;
          transition: all 0.4s;
          transform: skewX(-45deg);
        }

        &:hover {
          background-size: 40%;
          transform: translateY(-4px);
        }

        .left {
          .buy-title {
            font-size: 16px;
            font-weight: 700;
            color: #222;

            // .buy-tag {
            //   padding: 4px 8px;
            //   color: #ff7303;
            //   font-size: 12px;
            //   border-radius: 10px;
            //   background-color: #fff;
            // }
          }

          .buy-content {
            font-size: 12px;
            color: var(--sub-text);
          }
        }

        .right {
          font-size: 24px;
          font-weight: 700;
          color: #ff7303;
        }
      }
    }
  }
}
</style>
