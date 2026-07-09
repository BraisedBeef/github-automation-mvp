<template>
  <section class="cdn-count-v2">
    <header class="cdn-count-v2__hero">
      <PageBreadcrumbToolbar :items="[t('analysis')]" @doc="openHelpDoc" />

      <div class="cdn-count-v2__page-tabs">
        <button
          v-for="item in pageTabItems"
          :key="item.value"
          class="cdn-count-v2__page-tab"
          :class="{ 'is-active': page === item.value }"
          type="button"
          @click="changePage(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </header>

    <section class="cdn-count-v2__metric-tabs">
      <button
        v-for="item in childTabItems"
        :key="item.value"
        class="cdn-count-v2__metric-tab"
        :class="{ 'is-active': childTab === item.value }"
        type="button"
        @click="changeTab(item.value)"
      >
        {{ item.label }}
      </button>
    </section>

    <section class="cdn-count-v2__panel cdn-count-v2__filter-panel">
      <div class="cdn-count-v2__filter-grid">
        <div class="cdn-count-v2__filter-row">
          <div v-if="tabComponent?.form.includes(0)" class="cdn-count-v2__group">
            <div class="cdn-count-v2__label-wrap">
              <span class="cdn-count-v2__field-label">{{ t('region') }}</span>
              <el-tooltip placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
                <template #content>
                  <div class="cdn-count-v2__help-tip">
                    {{ t('regionTip') }}
                  </div>
                </template>
              </el-tooltip>
            </div>
            <SegmentedTabs :model-value="form.area" :items="areaSelectList" @update:model-value="changeArea" />
          </div>

          <div class="cdn-count-v2__group">
            <span class="cdn-count-v2__field-label">{{ t('range') }}</span>
            <SegmentedTabs
              :model-value="form.time_range"
              :items="timeRangeList"
              @update:model-value="clickDateTimeRange"
            />
          </div>
        </div>

        <div class="cdn-count-v2__filter-row">
          <div v-if="tabComponent?.form.includes(2)" class="cdn-count-v2__group cdn-count-v2__group--wide">
            <span class="cdn-count-v2__field-label">{{ t('time') }}</span>
            <div class="cdn-count-v2__date-wrap">
              <DateTimePicker
                v-model:start_time="form.start_time"
                :disabled-date="disabledDate"
                :loading="loading"
                :compare="false"
              />
            </div>
          </div>

          <div v-if="tabComponent?.form.includes(1)" class="cdn-count-v2__group cdn-count-v2__group--grow">
            <span class="cdn-count-v2__field-label">{{ t('domain') }}</span>
            <div class="cdn-count-v2__domain-select">
              <CatTransfer v-model="form.domain_ids" :list="domainList" :loading="domainLoading" />
            </div>
            <div class="cdn-count-v2__actions">
              <el-button type="primary" :loading="loading" @click="search">
                {{ t('query') }}
              </el-button>
              <button class="cdn-count-v2__icon-btn" type="button" :disabled="loading" @click="download">
                <SvgIcon name="cat-cdn-download" />
              </button>
            </div>
          </div>

          <div v-else class="cdn-count-v2__actions">
            <el-button type="primary" :loading="loading" @click="search">
              {{ t('query') }}
            </el-button>
            <button class="cdn-count-v2__icon-btn" type="button" :disabled="loading" @click="download">
              <SvgIcon name="cat-cdn-download" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="cdn-count-v2__panel cdn-count-v2__result-panel">
      <component :is="tabComponent?.component" ref="childPage" v-loading="loading" @search="search" />
    </section>
  </section>
</template>

<script setup lang="ts">
import User from '@/views/v2/cdn/analysis/count/user/index.vue'
import Operator from '@/views/v2/cdn/analysis/count/operator/index.vue'
import Flow from '@/views/v2/cdn/analysis/count/flow/index.vue'
import Broadband from '@/views/v2/cdn/analysis/count/broadband/index.vue'
import Request from '@/views/v2/cdn/analysis/count/request/index.vue'
import Error from '@/views/v2/cdn/analysis/count/error/index.vue'
import HotUrl from '@/views/v2/cdn/analysis/count/hot-url/index.vue'
import HotDomain from '@/views/v2/cdn/analysis/count/hot-domain/index.vue'

import { _domainList } from '@/apis/cdn/monitor'
import { documentUrl } from '@/config/base-config'
import { areaList1, tabMenuList, timeRangeList } from '@/assets/data/common.js'
import DateTimePicker from '@/components/cdn/date-time-picker/index.vue'
import { setDateTimeRangeDayjs } from '@/utils/format-time'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import SegmentedTabs from '@/views/v2/account-system/components/segmented-tabs.vue'

interface TabItem {
  label: string
  value: string
  form: number[]
  component: Component
}

const page = ref<string>('0,1,2')
const childTab = ref<string>('user')
const loading = ref(false)
const domainLoading = ref(false)
const childPage = ref<any>(null)
const domainList = ref<any[]>([])

const pageTabItems = computed(() => tabMenuList)

const tabList = reactive<TabItem[]>([
  { label: t('userAccDis'), value: 'user', form: [0, 1, 2], component: shallowRef(User) },
  { label: t('operatorDis'), value: 'operator', form: [0, 1, 2], component: shallowRef(Operator) },
  { label: t('fluxAnalysis'), value: 'flow', form: [0, 1, 2], component: shallowRef(Flow) },
  { label: t('bandwidthAnalysis'), value: 'broadband', form: [0, 1, 2], component: shallowRef(Broadband) },
  { label: t('resAnalysis'), value: 'request', form: [0, 1, 2], component: shallowRef(Request) },
  { label: t('errorCodeAnalysis'), value: 'error', form: [0, 1, 2], component: shallowRef(Error) },
  { label: t('hotTop100Analysis'), value: 'hotUrl', form: [0, 1, 2], component: shallowRef(HotUrl) },
  { label: t('domainRank'), value: 'hotDomain', form: [0, 2], component: shallowRef(HotDomain) },
])

const childTabItems = computed(() => tabList.map(({ label, value }) => ({ label, value })))
const tabComponent = computed(() => tabList.find(item => item.value === childTab.value))

const areaSelectList = computed(() =>
  areaList1.map(item => ({
    ...item,
    disabled: childTab.value === 'operator' && item.value === 1,
  })),
)

const form = reactive<{
  area: number
  time_range: 'today' | 'yesterday' | 'week' | 'month'
  domain_ids: number[]
  start_time: string[]
}>({
  area: 0,
  time_range: 'today',
  domain_ids: [],
  start_time: setDateTimeRangeDayjs('today').current,
})

const disabledDate = time => {
  const currentDate = new Date()
  const startDate = new Date(currentDate)
  startDate.setMonth(currentDate.getMonth() - 3)
  return time.getTime() > Date.now() || time < startDate
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const getDomainList = async () => {
  domainLoading.value = true
  await _domainList({
    scene: page.value === '3' ? 'analysis-ecdn' : 'analysis',
    areaCode: form.area,
  })
    .then(res => {
      domainList.value = res.data.data || []
    })
    .finally(() => {
      domainLoading.value = false
    })
}

const changePage = async (value: string | number) => {
  page.value = `${value}`
  sessionStorage.cdn_domain_page_type = page.value
  form.domain_ids = []
  await getDomainList()
  search()
}

const changeTab = async (value: string | number) => {
  childTab.value = `${value}`
  sessionStorage.cdn_count_tab_type = childTab.value
  if (childTab.value === 'operator') {
    form.area = 0
    await getDomainList()
  }
  nextTick(() => {
    search()
  })
}

const changeArea = async value => {
  form.area = value
  form.domain_ids = []
  await getDomainList()
}

const clickDateTimeRange = (value: 'today' | 'yesterday' | 'week' | 'month') => {
  form.time_range = value
  form.start_time = setDateTimeRangeDayjs(form.time_range).current
}

const search = async () => {
  if (!childPage.value?.getData) {
    return
  }
  if (childPage.value?.resetPage) {
    await childPage.value.resetPage()
  }
  const { type, order_by } = childPage.value
  const params: any = {
    ...form,
    domain_ids: childTab.value === 'hotDomain' ? domainList.value.map(item => item.id) : form.domain_ids,
    start_time: maoYunDayJs(form.start_time[0]).valueOf() / 1000,
    end_time: maoYunDayJs(form.start_time[1]).valueOf() / 1000,
    type,
    order_by,
  }
  loading.value = true
  childPage.value.getData(page.value, params).finally(() => {
    loading.value = false
  })
}

const download = () => {
  if (!childPage.value?.download) {
    return
  }
  const { type, order_by } = childPage.value
  childPage.value.download({
    ...form,
    domain_ids: childTab.value === 'hotDomain' ? domainList.value.map(item => item.id) : form.domain_ids,
    start_time: maoYunDayJs(form.start_time[0]).valueOf() / 1000,
    end_time: maoYunDayJs(form.start_time[1]).valueOf() / 1000,
    type,
    order_by,
  })
}

onMounted(async () => {
  page.value = sessionStorage.cdn_domain_page_type || '0,1,2'
  childTab.value = sessionStorage.cdn_count_tab_type || 'user'
  if (childTab.value === 'operator') {
    form.area = 0
  }
  await getDomainList()
  search()
})

onBeforeUnmount(() => {
  sessionStorage.cdn_domain_page_type = page.value
  sessionStorage.cdn_count_tab_type = childTab.value
})
</script>

<style scoped lang="scss">
.cdn-count-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-count-v2__hero,
.cdn-count-v2__panel {
  background: #fff;
}

.cdn-count-v2__hero {
  overflow: hidden;
}

.cdn-count-v2__page-tabs,
.cdn-count-v2__metric-tabs {
  display: flex;
  flex-wrap: wrap;
}

.cdn-count-v2__page-tabs {
  padding: 0 16px;
  border-top: 1px solid #eef1f5;
}

.cdn-count-v2__page-tab,
.cdn-count-v2__metric-tab {
  position: relative;
  padding: 10px 4px;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  color: #50596a;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-count-v2__page-tab + .cdn-count-v2__page-tab,
.cdn-count-v2__metric-tab + .cdn-count-v2__metric-tab {
  margin-left: 28px;
}

.cdn-count-v2__page-tab.is-active,
.cdn-count-v2__metric-tab.is-active {
  color: #06f;

  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    content: '';
    background: #06f;
  }
}

.cdn-count-v2__metric-tabs {
  padding: 0 16px;
  background: #fff;
}

.cdn-count-v2__filter-panel,
.cdn-count-v2__result-panel {
  padding: 20px;
}

.cdn-count-v2__filter-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cdn-count-v2__filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 32px;
  align-items: flex-start;
}

.cdn-count-v2__group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.cdn-count-v2__group--wide {
  min-width: min(100%, 430px);
}

.cdn-count-v2__group--grow {
  // flex: 1 1 360px;
  min-width: 320px;
}

.cdn-count-v2__group--grow .cdn-count-v2__domain-select {
  flex: 1 1 auto;
}

.cdn-count-v2__label-wrap {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.cdn-count-v2__field-label {
  flex: none;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.cdn-count-v2__help-tip {
  max-width: 365px;
}

.cdn-count-v2__date-wrap,
.cdn-count-v2__domain-select {
  min-width: 0;
}

.cdn-count-v2__actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-left: auto;
}

.cdn-count-v2__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: #50596a;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;

  &:disabled {
    color: #b7c0cd;
    cursor: not-allowed;
    background: #f7f8fa;
  }
}

.cdn-count-v2__result-panel {
  overflow: hidden;
}

.cdn-count-v2__result-panel :deep(.chart-content),
.cdn-count-v2__result-panel :deep(.df) {
  gap: 20px;
  align-items: stretch;
}

.cdn-count-v2__result-panel :deep(.mr20) {
  margin-right: 0 !important;
}

.cdn-count-v2__result-panel :deep(.chart),
.cdn-count-v2__result-panel :deep(.big-chart) {
  overflow: hidden;
  background: #fff;
}

.cdn-count-v2__result-panel :deep(.account-table-v2) {
  margin-top: 20px;
}

.cdn-count-v2__result-panel :deep(.el-table) {
  margin-top: 0;

  --el-table-border-color: #e8ecf3;
  --el-table-header-bg-color: #f9fafc;
  --el-table-header-text-color: #191c23;
  --el-table-row-hover-bg-color: #f6f9ff;
}

.cdn-count-v2__result-panel :deep(.el-table th.el-table__cell) {
  font-weight: 500;
}

.cdn-count-v2__result-panel :deep(.el-table td.el-table__cell),
.cdn-count-v2__result-panel :deep(.el-table th.el-table__cell) {
  padding: 12px 0;
}

.cdn-count-v2__result-panel :deep(.el-pagination) {
  justify-content: flex-end;
  margin-top: 20px;
}

.cdn-count-v2__result-panel :deep(.v2-segmented-tabs) {
  flex-wrap: wrap;
}

.cdn-count-v2__result-panel :deep(.cat-tabs-box) {
  margin-bottom: 20px;
}

@media (width <= 960px) {
  .cdn-count-v2__actions {
    margin-left: 0;
  }

  .cdn-count-v2__group,
  .cdn-count-v2__group--grow {
    width: 100%;
    min-width: 0;
  }

  .cdn-count-v2__filter-row {
    gap: 16px;
  }
}
</style>
