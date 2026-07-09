<template>
  <section class="cdn-monitor-v2">
    <header class="cdn-monitor-v2__hero">
      <PageBreadcrumbToolbar :items="[t('monitor')]" />

      <div class="cdn-monitor-v2__page-tabs">
        <button
          v-for="item in tabMenuList"
          :key="item.value"
          class="cdn-monitor-v2__page-tab"
          :class="{ 'is-active': pageType === item.value }"
          type="button"
          @click="pageTypeChange(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </header>

    <section class="cdn-monitor-v2__panel">
      <div class="cdn-monitor-v2__section-head">
        <h2 class="cdn-monitor-v2__section-title">
          {{ t('useOverview') }}
        </h2>
        <div class="cdn-monitor-v2__overview-actions">
          <el-button type="primary" @click="pushRoute('/cdn/buyFlow')">
            {{ t('purchaseTraffic') }}
          </el-button>
          <el-button plain @click="pushRoute('/cdn/fluxPkg')">
            {{ t('fluxPkgDetail') }}
          </el-button>
        </div>
      </div>

      <div class="cdn-monitor-v2__overview-grid">
        <article class="cdn-monitor-v2__overview-card">
          <div class="cdn-monitor-v2__overview-label">
            {{ pageType === '3' ? t('allSiteWithinRemainFlux') : t('staticWithinRemainFlux') }}
          </div>
          <div class="cdn-monitor-v2__overview-value">
            <span>{{ getFluxDetail(remainFlux.chinese_remain).count }}</span>
            <small>{{ getFluxDetail(remainFlux.chinese_remain).unit }}</small>
          </div>
          <div class="cdn-monitor-v2__overview-progress">
            <div class="cdn-monitor-v2__overview-track">
              <div
                class="cdn-monitor-v2__overview-fill"
                :style="{ width: `${getRate(remainFlux.chinese_remain, remainFlux.chinese_total)}%` }"
              />
            </div>
            <span>{{ getRate(remainFlux.chinese_remain, remainFlux.chinese_total) }}%</span>
          </div>
        </article>

        <article class="cdn-monitor-v2__overview-card">
          <div class="cdn-monitor-v2__overview-label">
            {{ pageType === '3' ? t('allSiteWithoutRemainFlux') : t('withoutRemainFlux') }}
          </div>
          <div class="cdn-monitor-v2__overview-value">
            <span>{{ getFluxDetail(remainFlux.overseas_remain).count }}</span>
            <small>{{ getFluxDetail(remainFlux.overseas_remain).unit }}</small>
          </div>
          <div class="cdn-monitor-v2__overview-progress">
            <div class="cdn-monitor-v2__overview-track">
              <div
                class="cdn-monitor-v2__overview-fill"
                :style="{ width: `${getRate(remainFlux.overseas_remain, remainFlux.overseas_total)}%` }"
              />
            </div>
            <span>{{ getRate(remainFlux.overseas_remain, remainFlux.overseas_total) }}%</span>
          </div>
        </article>
      </div>
    </section>

    <section class="cdn-monitor-v2__metric-tabs">
      <button
        v-for="item in monitorRoutes"
        :key="item.value"
        class="cdn-monitor-v2__metric-tab"
        :class="{ 'is-active': tab === item.value }"
        type="button"
        @click="changeTab(item.value)"
      >
        {{ item.label }}
      </button>
    </section>

    <section class="cdn-monitor-v2__panel cdn-monitor-v2__filter-panel">
      <div class="cdn-monitor-v2__filter-grid">
        <div class="cdn-monitor-v2__filter-row">
          <div class="cdn-monitor-v2__label-wrap">
            <span class="cdn-monitor-v2__field-label">{{ t('region') }}</span>
            <el-tooltip placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
              <template #content>
                <div class="cdn-monitor-v2__help-tip">
                  {{ t('regionTip') }}
                </div>
              </template>
            </el-tooltip>
          </div>
          <div class="cdn-monitor-v2__inline-tabs">
            <button
              v-for="item in areaList1"
              :key="item.value"
              class="cdn-monitor-v2__small-tab"
              :class="{ 'is-active': form.area === item.value }"
              type="button"
              @click="changeArea(item.value)"
            >
              {{ item.label }}
            </button>
          </div>

          <span class="cdn-monitor-v2__field-label cdn-monitor-v2__field-label--range">{{ t('range') }}</span>
          <div class="cdn-monitor-v2__inline-tabs">
            <button
              v-for="item in timeRangeList"
              :key="item.value"
              class="cdn-monitor-v2__small-tab"
              :class="{ 'is-active': form.time_range === item.value }"
              type="button"
              @click="clickDateTimeRange(item.value)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="cdn-monitor-v2__filter-row cdn-monitor-v2__filter-row--time">
          <span class="cdn-monitor-v2__field-label">{{ t('time') }}</span>
          <div class="cdn-monitor-v2__time-controls">
            <div class="cdn-monitor-v2__date-wrap">
              <DateTimePicker
                ref="DateTimePickerRef"
                v-model:start_time="form.start_time"
                v-model:end_time="form.end_time"
                :disabled-date="disabledDate"
                :loading="loading"
                :compare="showConfig[tab].compare"
                @change="changeDatePicker"
              />
            </div>
            <button
              v-if="showMoreFilter"
              class="cdn-monitor-v2__advanced-btn"
              :class="{ 'is-active': expand }"
              type="button"
              @click="expand = !expand"
            >
              <span>{{ t('advancedFiltering') }}</span>
              <SvgIcon name="down-arrow" :style="{ transform: `rotate(${expand ? -180 : 0}deg)` }" />
            </button>
          </div>
        </div>

        <div v-if="expand || !showMoreFilter" class="cdn-monitor-v2__filter-row">
          <span class="cdn-monitor-v2__field-label">{{ t('granularity') }}</span>
          <div class="cdn-monitor-v2__inline-tabs">
            <button
              v-for="item in intervalList"
              :key="item.value"
              class="cdn-monitor-v2__small-tab"
              :class="{ 'is-active': form.interval === item.value, 'is-disabled': item.disabled }"
              type="button"
              :disabled="item.disabled"
              @click="form.interval = item.value"
            >
              {{ item.label }}
            </button>
          </div>

          <span class="cdn-monitor-v2__field-label cdn-monitor-v2__field-label--domain">{{ t('domain') }}</span>
          <div class="cdn-monitor-v2__domain-select">
            <CatTransfer v-model="form.domain_ids" :list="domainList" :loading="domainLoading" />
          </div>

          <div v-if="showConfig[tab].spilt" class="cdn-monitor-v2__split-switch">
            <span>{{ t('splitByDomain') }}</span>
            <el-switch
              v-model="form.is_split"
              :disabled="DateTimePickerRef?.showCompareButton"
              :before-change="splitBeforeChange"
            />
          </div>
        </div>

        <div v-if="expand" class="cdn-monitor-v2__filter-row cdn-monitor-v2__filter-row--advanced">
          <div v-if="showConfig[tab].operator" class="cdn-monitor-v2__select-block">
            <span class="cdn-monitor-v2__field-label">{{ t('operator') }}</span>
            <el-select
              v-model="form.operator"
              class="cdn-monitor-v2__select"
              :disabled="disabledOperator"
              :loading="loading"
              @change="value => changeHighLevel('operator', value)"
            >
              <el-option
                v-for="(item, index) in operatorList"
                :key="`${item.value}-${index}`"
                :label="item.label"
                :value="item.value"
                :disabled="form.ip_protocol! > 0 && index !== 0"
              />
            </el-select>
          </div>

          <div v-if="showConfig[tab].http_protocol" class="cdn-monitor-v2__select-block">
            <span class="cdn-monitor-v2__field-label">{{ t('httpProtocol') }}</span>
            <el-select
              v-model="form.http_protocol"
              class="cdn-monitor-v2__select"
              :disabled="disabledHttp"
              :loading="loading"
              @change="value => changeHighLevel('httpProtocol', value)"
            >
              <el-option v-for="item in httpList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>

          <div v-if="showConfig[tab].ip_protocol" class="cdn-monitor-v2__select-block">
            <span class="cdn-monitor-v2__field-label">{{ t('ipProtocol') }}</span>
            <el-select
              v-model="form.ip_protocol"
              class="cdn-monitor-v2__select"
              :disabled="disabledIp"
              :loading="loading"
              @change="value => changeHighLevel('ipProtocol', value)"
            >
              <el-option
                v-for="(item, index) in ipList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="form.operator! > 0 && index !== 0"
              />
            </el-select>
          </div>
        </div>
      </div>

      <div class="cdn-monitor-v2__filter-footer">
        <div class="cdn-monitor-v2__filter-actions">
          <el-button :loading="loading" type="primary" @click="queryHandle">
            {{ t('query') }}
          </el-button>
        </div>
      </div>
    </section>

    <section class="cdn-monitor-v2__result-panel">
      <Component :is="currentComponent" ref="childComponent" :filter="childParams!" :loading="loading" />
    </section>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ElMessage } from 'element-plus'
import { Bindwidth, _domainList, _getOperator, _remainFlux } from '@/apis/cdn/monitor'
import { areaList1, httpList, ipList, tabMenuList, timeRangeList } from '@/assets/data/common.js'
import DateTimePicker from '@/components/cdn/date-time-picker/index.vue'
import CatTransfer from '@/components/cdn/cat-transfer/index.vue'
import { monitorRoutes, MAX_SPLIT_DOMAIN, showConfig } from '@/views/cdn/analysis/monitor/config'
import type { RemainFlux } from '@/views/cdn/analysis/monitor/type'
import { getFluxDetail } from '@/utils/unit'
import { getRate } from '@/utils/number-utils'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { setDateTimeRangeDayjs } from '@/utils/format-time'
import { pushRoute } from '@/utils/router-jump'
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'

const pageType = ref<string>('0,1,2')
const tab = ref<string>('broadband')
const childParams = ref<Bindwidth | null>(null)
const childComponent = ref<{ handleQuery: (query: Bindwidth) => Promise<void> | void } | null>(null)
const DateTimePickerRef = ref<{ showCompareButton?: boolean } | null>(null)

const currentComponent = computed<Component | null>(() => {
  return (monitorRoutes.find(item => item.value === tab.value)?.c as Component | undefined) ?? null
})

const form = ref<Bindwidth>({
  time_range: 'today',
  area: 0,
  domain_names: [],
  domain_ids: [],
  interval: 0,
  operator: 0,
  http_protocol: 0,
  ip_protocol: 0,
  is_split: false,
  start_time: setDateTimeRangeDayjs('today').current,
  end_time: setDateTimeRangeDayjs('today').compare,
})

const loading = ref(false)
const remainFlux = ref<RemainFlux>({
  chinese_remain: 0,
  overseas_remain: 0,
  chinese_total: 0,
  overseas_total: 0,
})
const remainLoading = ref(false)
const domainList = ref<any[]>([])
const domainLoading = ref(false)
const operatorList = ref<any[]>([])
const expand = ref(false)
const intervalList = ref([
  { label: t('min5'), value: 0, disabled: false },
  { label: t('hour1'), value: 1, disabled: false },
  { label: t('day1'), value: 2, disabled: true },
])

const showMoreFilter = computed(() => {
  const config = showConfig[tab.value]
  return config.operator || config.http_protocol || config.ip_protocol
})

const disabledDate = (time: Date) => {
  const currentDate = new Date()
  const startDate = new Date(currentDate)
  startDate.setMonth(currentDate.getMonth() - 3)
  return time.getTime() > Date.now() || time < startDate
}

const disabledOperator = computed(() => {
  return !!((form.value.http_protocol || form.value.ip_protocol) && form.value.area === 0) || !!form.value.area
})

const disabledHttp = computed(() => {
  return !!((form.value.operator || form.value.ip_protocol) && form.value.area === 0)
})

const disabledIp = computed(() => {
  return !!((form.value.operator || form.value.http_protocol) && form.value.area === 0) || !!form.value.area
})

const getRemainflux = () => {
  remainLoading.value = true
  _remainFlux({ cdnType: pageType.value === '3' ? 'ecdn' : 'cdn' })
    .then(res => {
      remainFlux.value = res.data
    })
    .finally(() => {
      remainLoading.value = false
    })
}

const getDomainList = async () => {
  domainLoading.value = true
  await _domainList({
    scene: pageType.value === '3' ? 'monitoring-ecdn' : 'monitoring',
    areaCode: form.value.area,
  })
    .then(res => {
      domainList.value = res.data.data || []
    })
    .finally(() => {
      domainLoading.value = false
    })
}

const getOperator = async () => {
  await _getOperator()
    .then(res => {
      const list = res.data.data.map(item => ({ label: t(item.Name), value: item.Code }))
      operatorList.value = [{ label: t('allOperators'), value: 0 }, ...list]
    })
    .catch(() => {
      operatorList.value = [{ label: t('allOperators'), value: 0 }]
    })
}

const initIntervalList = (value: string) => {
  intervalList.value.forEach(item => {
    item.disabled = false
  })
  if (value === 'today' || value === 'yesterday') {
    intervalList.value[2].disabled = true
  } else if (value === 'month') {
    intervalList.value[0].disabled = true
    intervalList.value[1].disabled = true
  } else {
    intervalList.value[0].disabled = true
  }
  form.value.interval = intervalList.value.find(item => !item.disabled)?.value ?? 0
}

const clickDateTimeRange = (value: string) => {
  form.value.time_range = value
  const range = setDateTimeRangeDayjs(value as 'today' | 'yesterday' | 'week' | 'month' | 'custom')
  form.value.start_time = range.current
  form.value.end_time = range.compare
  initIntervalList(value)
}

const changeDatePicker = () => {
  form.value.time_range = ''
  if (
    maoYunDayJs(form.value.start_time[1]).valueOf() - maoYunDayJs(form.value.start_time[0]).valueOf() >
    1000 * 60 * 60 * 24
  ) {
    initIntervalList('')
  } else {
    initIntervalList('today')
  }
}

const splitBeforeChange = (value = form.value.is_split) => {
  if (!value && form.value.domain_ids.length > MAX_SPLIT_DOMAIN) {
    ElMessage.warning(t('domainSplitLimit', { limit: MAX_SPLIT_DOMAIN }))
    return false
  }
  return true
}

const initParams = (): Bindwidth => {
  const domainNames = form.value.domain_ids
    .map(id => domainList.value.find(item => item.id === id)?.cname)
    .filter(Boolean) as string[]
  const query: Bindwidth = {
    pageType: pageType.value,
    ...form.value,
    domain_names: domainNames,
    start_time: maoYunDayJs(form.value.start_time[0]).valueOf() / 1000,
    end_time: maoYunDayJs(form.value.start_time[1]).valueOf() / 1000,
    start_time_next: maoYunDayJs(form.value.end_time[0]).valueOf() / 1000,
    end_time_next: maoYunDayJs(form.value.end_time[1]).valueOf() / 1000,
  }

  if (!showMoreFilter.value) {
    delete query.operator
    delete query.http_protocol
    delete query.ip_protocol
  }

  if (!DateTimePickerRef.value?.showCompareButton) {
    delete query.start_time_next
    delete query.end_time_next
  }

  childParams.value = query
  return query
}

const queryHandle = () => {
  const query = initParams()
  nextTick(async () => {
    loading.value = true
    await childComponent.value?.handleQuery(query)
    window.setTimeout(() => {
      loading.value = false
    }, 500)
  })
}

const pageTypeChange = async (value: string) => {
  if (pageType.value === value) return
  pageType.value = value
  sessionStorage.cdn_domain_page_type = value
  getRemainflux()
  await getDomainList()
  queryHandle()
}

const changeTab = (value: string) => {
  if (tab.value === value) return
  tab.value = value
  sessionStorage.cdn_monitor_tab_type = value
  if (!showConfig[tab.value].spilt) {
    form.value.is_split = false
  }
  if (!showMoreFilter.value) {
    expand.value = false
  }
  queryHandle()
}

const changeArea = (value: number) => {
  form.value.area = value
  form.value.operator = 0
  form.value.ip_protocol = 0
  nextTick(() => {
    getDomainList()
  })
}

const changeHighLevel = (type: 'operator' | 'httpProtocol' | 'ipProtocol', value: number) => {
  if (type === 'operator' && value === 0) {
    form.value.http_protocol = 0
    form.value.ip_protocol = 0
  } else if (type === 'httpProtocol' && value === 0) {
    form.value.operator = 0
    form.value.ip_protocol = 0
  } else if (type === 'ipProtocol' && value === 0) {
    form.value.operator = 0
    form.value.http_protocol = 0
  }
}

watch(
  () => form.value,
  () => {
    childParams.value = initParams()
  },
  { deep: true },
)

watch(
  () => form.value.domain_ids,
  () => {
    const allowed = splitBeforeChange(!form.value.is_split)
    if (!allowed) {
      form.value.domain_ids.shift()
    }
  },
)

watch(
  () => childComponent.value,
  () => {
    childParams.value = initParams()
  },
)

watch(
  () => DateTimePickerRef.value?.showCompareButton,
  value => {
    if (value) {
      form.value.is_split = false
    }
  },
)

onBeforeMount(async () => {
  pageType.value = sessionStorage.cdn_domain_page_type || '0,1,2'
  tab.value = sessionStorage.cdn_monitor_tab_type || 'broadband'
  childParams.value = form.value
  getRemainflux()
  await getOperator()
  await getDomainList()
  queryHandle()
})

onBeforeUnmount(() => {
  sessionStorage.cdn_domain_page_type = pageType.value
  sessionStorage.cdn_monitor_tab_type = tab.value
})
</script>

<style scoped lang="scss">
.cdn-monitor-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.cdn-monitor-v2__hero,
.cdn-monitor-v2__panel {
  background: #fff;
}

.cdn-monitor-v2__hero {
  display: flex;
  flex-direction: column;
}

.cdn-monitor-v2__page-tabs,
.cdn-monitor-v2__metric-tabs {
  display: flex;
  flex-wrap: wrap;

  // padding: 0 22px;
}

.cdn-monitor-v2__page-tabs {
  // padding-bottom: 14px;
}

.cdn-monitor-v2__page-tab,
.cdn-monitor-v2__metric-tab {
  position: relative;
  height: 48px;
  padding: 0 20px;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;

  &.is-active {
    font-weight: 600;
    color: #06f;
  }

  &.is-active::after {
    position: absolute;
    right: 20px;
    bottom: 0;
    left: 20px;
    height: 2px;
    content: '';
    background: #06f;
  }
}

.cdn-monitor-v2__metric-tabs {
  gap: 0;
  padding: 0;
  overflow-x: auto;
}

.cdn-monitor-v2__metric-tab {
  min-width: 88px;
  height: 38px;
  padding: 0 18px;
  background: #fff;
  border: 1px solid #d9dde5;

  & + & {
    margin-left: -1px;
  }

  &.is-active {
    z-index: 1;
    font-weight: 500;
    border-color: #06f;
  }

  &.is-active::after {
    display: none;
  }
}

.cdn-monitor-v2__panel {
  padding: 22px;
  border: 1px solid #edf1f7;
}

.cdn-monitor-v2__section-head,
.cdn-monitor-v2__filter-footer {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.cdn-monitor-v2__section-head {
  margin-bottom: 20px;
}

.cdn-monitor-v2__section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.cdn-monitor-v2__overview-actions {
  display: flex;
  gap: 12px;
}

.cdn-monitor-v2__overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.cdn-monitor-v2__overview-card {
  padding: 18px 18px 14px;
  border: 1px solid #e5ebf3;
}

.cdn-monitor-v2__overview-label {
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-monitor-v2__overview-value {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 16px;

  span {
    font-size: 34px;
    font-weight: 700;
    line-height: 1;
    color: #191c23;
  }

  small {
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
  }
}

.cdn-monitor-v2__overview-progress {
  display: flex;
  gap: 14px;
  align-items: center;

  span {
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
  }
}

.cdn-monitor-v2__overview-track {
  flex: 1;
  height: 10px;
  overflow: hidden;
  background: #eef2f8;
}

.cdn-monitor-v2__overview-fill {
  height: 100%;
  background: #06f;
}

.cdn-monitor-v2__filter-panel {
  padding-bottom: 0;
}

.cdn-monitor-v2__filter-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cdn-monitor-v2__filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 24px;
  align-items: center;
}

.cdn-monitor-v2__filter-row--time {
  align-items: center;
}

.cdn-monitor-v2__time-controls {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.cdn-monitor-v2__filter-row--advanced {
  padding-top: 4px;
}

.cdn-monitor-v2__label-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cdn-monitor-v2__field-label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-monitor-v2__field-label--range,
.cdn-monitor-v2__field-label--domain {
  margin-left: 6px;
}

.cdn-monitor-v2__inline-tabs {
  display: flex;
  flex-wrap: wrap;
}

.cdn-monitor-v2__small-tab {
  min-width: 86px;
  height: 36px;
  padding: 0 18px;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9dde5;

  & + & {
    margin-left: -1px;
  }

  &.is-active {
    position: relative;
    z-index: 1;
    color: #06f;
    border-color: #06f;
  }

  &.is-disabled {
    color: #b7c0cd;
    cursor: not-allowed;
    background: #f7f9fc;
  }
}

.cdn-monitor-v2__date-wrap {
  display: flex;
  align-items: center;
  overflow-x: auto;
}

.cdn-monitor-v2__help-tip {
  max-width: 365px;
}

.cdn-monitor-v2__domain-select {
  min-width: 280px;
  max-width: 360px;
}

.cdn-monitor-v2__split-switch {
  display: flex;
  gap: 12px;
  align-items: center;
  color: #6b7280;
}

.cdn-monitor-v2__select-block {
  display: flex;
  gap: 14px;
  align-items: center;
}

.cdn-monitor-v2__select {
  width: 272px;
}

.cdn-monitor-v2__filter-footer {
  padding: 22px 0;
  margin-top: 20px;
  border-top: 1px solid #edf1f7;
}

.cdn-monitor-v2__filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.cdn-monitor-v2__advanced-btn {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  height: 34px;
  padding: 0 14px;
  font: inherit;
  font-size: 14px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9dde5;

  :deep(svg) {
    width: 12px;
    height: 12px;
    transition: transform 0.2s ease;
  }

  &.is-active {
    color: #06f;
    border-color: #06f;
  }
}

.cdn-monitor-v2__result-panel {
  padding: 0;
  background: transparent;

  :deep(.page-box) {
    padding: 22px;
    margin: 0;
    background: #fff;
    border: 0;
    box-shadow: none;
  }

  :deep(.monitor-info-box) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0;
    margin-bottom: 16px;
    background: #fff;
    border: 1px solid #edf1f7;

    .monitor-info-box-item {
      flex: none;
      width: auto;
      min-height: 164px;
      padding: 26px 28px;
      margin: 0;
      border-right: 1px solid #edf1f7;
    }

    .monitor-info-box-item:last-child {
      border-right: 0;
    }

    .title {
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 500;
      color: #191c23;
    }

    .value {
      margin-bottom: 12px;
    }

    .value-v,
    .null {
      font-size: 42px;
      font-weight: 700;
      line-height: 1.1;
      color: #191c23;
    }

    .value-unit {
      font-size: 14px;
      color: #191c23;
    }

    .time {
      font-size: 14px;
      color: #97a0b5;
    }
  }

  :deep(.contrast-data) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    padding: 22px;
    margin-bottom: 16px;
    background: #fff;
    border: 1px solid #edf1f7;

    .data-start,
    .data-end {
      flex: none;
      width: auto;
      min-width: 0;
      padding-right: 28px;
    }

    .data-start {
      margin-right: 28px;
      border-right: 1px solid #edf1f7;
    }

    .data-title {
      font-size: 14px;
      color: #191c23;
    }

    .data-item {
      padding: 22px 0;
      border-bottom: 1px dashed #e4e9f2;
    }

    .data-item:last-of-type {
      padding-bottom: 0;
      border-bottom: 0;
    }

    .data-count,
    .null {
      font-size: 42px;
      line-height: 1.1;
      color: #191c23;
    }

    .data-unit {
      font-size: 14px;
      color: #191c23;
    }

    .data-time {
      font-size: 14px;
      color: #97a0b5;
    }
  }

  :deep(.select-chart) {
    background: #fff;
    border: 1px solid #edf1f7;
  }

  :deep(.select-chart .select) {
    align-items: flex-end;
    margin-bottom: 10px;
  }

  :deep(.select-chart .el-link) {
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.select-chart .big-chart) {
    min-height: 460px;
  }

  :deep(.hit .data-list) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: 0 0 16px;
    background: #fff;
    border: 1px solid #edf1f7;

    .data-item {
      flex: none;
      width: auto;
      min-height: 164px;
      padding: 26px 28px;
      margin: 0;
      border-right: 1px solid #edf1f7;
    }

    .data-item:last-child {
      border-right: 0;
    }

    .title {
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 500;
      color: #191c23;
    }

    .count,
    .null {
      font-size: 42px;
      color: #191c23;
    }

    .unit {
      font-size: 14px;
      color: #191c23;
    }
  }
}

@media (width <= 1200px) {
  .cdn-monitor-v2__overview-grid {
    grid-template-columns: 1fr;
  }

  .cdn-monitor-v2__result-panel {
    :deep(.contrast-data) {
      grid-template-columns: 1fr;

      .data-start {
        padding-right: 0;
        margin-right: 0;
        margin-bottom: 20px;
        border-right: 0;
        border-bottom: 1px solid #edf1f7;
      }

      .data-end {
        padding-right: 0;
      }
    }
  }
}

@media (width <= 768px) {
  .cdn-monitor-v2__panel {
    padding: 16px;
  }

  .cdn-monitor-v2__section-head,
  .cdn-monitor-v2__filter-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .cdn-monitor-v2__overview-actions {
    flex-wrap: wrap;
    width: 100%;
  }

  .cdn-monitor-v2__domain-select,
  .cdn-monitor-v2__select {
    width: 100%;
    min-width: 0;
  }

  .cdn-monitor-v2__result-panel {
    :deep(.monitor-info-box),
    :deep(.hit .data-list) {
      grid-template-columns: 1fr;

      .monitor-info-box-item,
      .data-item {
        border-right: 0;
        border-bottom: 1px solid #edf1f7;
      }

      .monitor-info-box-item:last-child,
      .data-item:last-child {
        border-bottom: 0;
      }
    }
  }
}
</style>
