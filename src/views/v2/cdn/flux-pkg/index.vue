<template>
  <div class="cdn-flux-pkg-v2">
    <section class="cdn-flux-pkg-v2__header">
      <PageBreadcrumbToolbar :items="[t('resourcePkgManage')]" @doc="openHelpDoc" />

      <div class="cdn-flux-pkg-v2__tabs">
        <button
          v-for="item in tabMenuList"
          :key="item.value"
          class="cdn-flux-pkg-v2__tab"
          :class="{ 'is-active': tabType === item.value }"
          type="button"
          @click="changeTabType(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <!-- <InfoNotice v-if="showNotice">
      <div class="cdn-flux-pkg-v2__notice">
        <span>{{ infoNoticeText }}</span>
        <button
          class="cdn-flux-pkg-v2__notice-close"
          type="button"
          @click="showNotice = false"
        >
          <SvgIcon name="close" />
        </button>
      </div>
    </InfoNotice> -->

    <section class="cdn-flux-pkg-v2__panel">
      <div class="cdn-flux-pkg-v2__toolbar">
        <el-button type="primary" @click="pushRoute('/cdn/buyFlow')">
          {{ t('buyPkg') }}
        </el-button>
        <SegmentedTabs :model-value="pkgType" :items="pkgTypeList" @update:model-value="handlePkgTypeChange" />
      </div>

      <TableV2
        v-loading="state.loading"
        :data="state.tableData"
        :total="state.total"
        :pagination="pagination"
        show-pagination
        @update:pagination="handlePaginationChange"
      >
        <el-table-column prop="orderNo" :label="t('oderno')" min-width="260">
          <template #default="{ row }">
            {{ row.orderNo || '--' }}
          </template>
        </el-table-column>

        <el-table-column prop="payType" :label="t('region')" min-width="160">
          <template #header>
            <CatTableHeadFilter
              v-model="tableSort.accelerationRegion"
              label="region"
              show-all
              :all-value="''"
              :list="fluxAreaList"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(fluxAreaList, row.accelerationRegion) }}
          </template>
        </el-table-column>

        <el-table-column prop="payType" :label="t('type')" min-width="160">
          <template #header>
            <CatTableHeadFilter
              v-model="tableSort.purchaseType"
              label="type"
              show-all
              :all-value="''"
              :list="purchaseTypeList"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(purchaseTypeList, row.payType) }}
          </template>
        </el-table-column>

        <el-table-column v-if="tabType === 2" prop="class" :label="t('classBillingItem')" min-width="180">
          <template #header>
            <CatTableHeadFilter
              v-model="tableSort.class"
              label="classBillingItem"
              show-all
              :all-value="-1"
              :list="resourcePkgType"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(resourcePkgType, row.class) }}
          </template>
        </el-table-column>

        <el-table-column prop="flux" :label="t('fluxPkguse')" min-width="260">
          <template #default="{ row }">
            <div class="cdn-flux-pkg-v2__usage">
              <div class="cdn-flux-pkg-v2__usage-text">
                已用{{ getRate(row.flux - row.remainFlux, row.flux) }}%
                <span>
                  ({{ row.class ? getRequest(row.flux - row.remainFlux) : getFlux(row.flux - row.remainFlux) }}/{{
                    row.class ? getRequest(row.flux) : getFlux(row.flux)
                  }})
                </span>
              </div>
              <div class="cdn-flux-pkg-v2__progress">
                <div
                  class="cdn-flux-pkg-v2__progress-fill"
                  :class="{ 'is-expired': row.status > 2 }"
                  :style="{ width: `${getRate(row.flux - row.remainFlux, row.flux)}%` }"
                />
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" :label="t('status')" min-width="150">
          <template #header>
            <CatTableHeadFilter
              v-model="tableSort.status"
              label="status"
              show-all
              :all-value="pkgType ? '3,4,5' : '1,2'"
              :list="fluxList"
            />
          </template>
          <template #default="{ row }">
            <div class="cdn-flux-pkg-v2__status" :class="`is-${statusTone(row.status)}`">
              <span class="cdn-flux-pkg-v2__status-dot" />
              <span>{{ getValueMap(fluxStatusList, row.status) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="purchaseTime" min-width="220">
          <template #header>
            <button class="cdn-flux-pkg-v2__sort-btn" type="button" @click="sortChange('purchaseTime')">
              <span>{{ t('buyTime') }}</span>
              <SvgIcon :name="sortIcon.purchaseTime" />
            </button>
          </template>
          <template #default="{ row }">
            {{ getDateDayjs(row.purchaseTime * 1000, 'string', true) }}
          </template>
        </el-table-column>

        <el-table-column prop="expireTime" min-width="220">
          <template #header>
            <button class="cdn-flux-pkg-v2__sort-btn" type="button" @click="sortChange('expireTime')">
              <span>{{ t('expireTime1') }}</span>
              <SvgIcon :name="sortIcon.expireTime" />
            </button>
          </template>
          <template #default="{ row }">
            {{ getDateDayjs(row.expireTime * 1000, 'string', true) }}
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { _getFluxDetail } from '@/apis/cdn/monitor'
import { fluxAreaList, fluxStatusList, purchaseTypeList, resourcePkgType } from '@/assets/data/common'
import { documentUrl } from '@/config/base-config'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import SegmentedTabs from '@/views/v2/account-system/components/segmented-tabs.vue'
import { getValueMap } from '@/utils/collection-utils'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { getRate } from '@/utils/number-utils'
import { pushRoute } from '@/utils/router-jump'
import { getFlux, getRequest } from '@/utils/unit'
import type { Fluxform } from '@/apis/cdn/monitor'

const infoNoticeText = '用于表示普通操作信息提示，可关闭，通常信息较长'
const showNotice = ref(true)

const tabMenuList = [
  { label: t('staticAcceleration'), value: 1 },
  { label: t('wholeAcceleration'), value: 2 },
]

const pkgTypeList = [
  { label: t('validResourcePkg'), value: 0 },
  { label: t('noValidResourcePkg'), value: 1 },
]

const tabType = ref(1)
const pkgType = ref(0)

const tableSort = ref<Fluxform>({
  accelerationRegion: '',
  purchaseType: '',
  class: -1,
  orderBy: '',
  order: 'asc',
  status: '1,2',
})

const state = reactive({
  loading: false,
  tableData: [] as any[],
  total: 0,
  pagination: {
    page: 1,
    page_size: 10,
  },
})

const pagination = computed(() => ({
  page: state.pagination.page,
  pageSize: state.pagination.page_size,
}))

const fluxList = computed(() => fluxStatusList.filter(item => (pkgType.value ? item.value > 2 : item.value < 3)))

const sortIcon = reactive<{
  purchaseTime: 'sort' | 'sort-up' | 'sort-down'
  expireTime: 'sort' | 'sort-up' | 'sort-down'
}>({
  purchaseTime: 'sort',
  expireTime: 'sort',
})

const statusTone = (status: number) => {
  if (status === 1) return 'primary'
  if (status === 2) return 'success'
  return 'muted'
}

const syncSortIcon = (key: 'purchaseTime' | 'expireTime') => {
  sortIcon.purchaseTime = 'sort'
  sortIcon.expireTime = 'sort'
  if (tableSort.value.orderBy !== key) return
  sortIcon[key] = tableSort.value.order === 'asc' ? 'sort-up' : 'sort-down'
}

const getFluxData = () => {
  state.loading = true
  _getFluxDetail({
    ...tableSort.value,
    accelerationType: tabType.value as 1 | 2,
    page: state.pagination.page,
    page_size: state.pagination.page_size,
  })
    .then(res => {
      state.tableData = res.data.list || []
      state.total = res.data.total || 0
    })
    .finally(() => {
      state.loading = false
    })
}

const resetSort = () => {
  tableSort.value.order = ''
  tableSort.value.orderBy = ''
  sortIcon.purchaseTime = 'sort'
  sortIcon.expireTime = 'sort'
}

const changeTabType = (value: number) => {
  tabType.value = value
  resetSort()
  getFluxData()
}

const handlePkgTypeChange = (value: string | number) => {
  pkgType.value = Number(value)
  tableSort.value.status = pkgType.value ? '3,4,5' : '1,2'
  resetSort()
  getFluxData()
}

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  state.pagination.page = page
  state.pagination.page_size = pageSize
  getFluxData()
}

const sortChange = (orderBy: 'purchaseTime' | 'expireTime') => {
  if (tableSort.value.orderBy !== orderBy) {
    tableSort.value.orderBy = orderBy
    tableSort.value.order = 'asc'
  } else if (tableSort.value.order === 'asc') {
    tableSort.value.order = 'desc'
  } else if (tableSort.value.order === 'desc') {
    tableSort.value.orderBy = ''
    tableSort.value.order = ''
  } else {
    tableSort.value.order = 'asc'
  }
  syncSortIcon(orderBy)
  getFluxData()
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

watch(
  tableSort,
  () => {
    state.pagination.page = 1
    getFluxData()
  },
  { deep: true },
)

onMounted(() => {
  getFluxData()
})
</script>

<style scoped lang="scss">
.cdn-flux-pkg-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-flux-pkg-v2__header,
.cdn-flux-pkg-v2__panel {
  background: #fff;
}

.cdn-flux-pkg-v2__tabs {
  display: flex;
  gap: 28px;
  padding: 0 28px;
}

.cdn-flux-pkg-v2__tab {
  position: relative;
  padding: 16px 0;
  font-size: 16px;
  color: #4d5663;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-flux-pkg-v2__tab.is-active {
  font-weight: 600;
  color: #06f;
}

.cdn-flux-pkg-v2__tab.is-active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  content: '';
  background: #06f;
}

.cdn-flux-pkg-v2__notice,
.cdn-flux-pkg-v2__toolbar,
.cdn-flux-pkg-v2__usage,
.cdn-flux-pkg-v2__status {
  display: flex;
}

.cdn-flux-pkg-v2__notice {
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.cdn-flux-pkg-v2__notice-close,
.cdn-flux-pkg-v2__sort-btn {
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-flux-pkg-v2__panel {
  padding: 20px 28px 28px;
}

.cdn-flux-pkg-v2__toolbar {
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cdn-flux-pkg-v2__usage {
  flex-direction: column;
  gap: 8px;
}

.cdn-flux-pkg-v2__usage-text {
  color: #191c23;
}

.cdn-flux-pkg-v2__usage-text span {
  margin-left: 6px;
  color: #4d5663;
}

.cdn-flux-pkg-v2__progress {
  width: 100%;
  height: 8px;
  overflow: hidden;
  background: #edf1f7;
}

.cdn-flux-pkg-v2__progress-fill {
  height: 100%;
  background: #06f;
}

.cdn-flux-pkg-v2__progress-fill.is-expired {
  background: #b7c0cd;
}

.cdn-flux-pkg-v2__status {
  gap: 8px;
  align-items: center;
}

.cdn-flux-pkg-v2__status-dot {
  width: 8px;
  height: 8px;
  border: 2px solid currentcolor;
  border-radius: 999px;
}

.cdn-flux-pkg-v2__status.is-primary {
  color: #06f;
}

.cdn-flux-pkg-v2__status.is-success {
  color: #01a66f;
}

.cdn-flux-pkg-v2__status.is-muted {
  color: #828b9c;
}

.cdn-flux-pkg-v2__sort-btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #191c23;
}

@media (width <= 1024px) {
  .cdn-flux-pkg-v2__header,
  .cdn-flux-pkg-v2__panel {
    padding-right: 16px;
    padding-left: 16px;
  }

  .cdn-flux-pkg-v2__tabs {
    padding-right: 0;
    padding-left: 0;
  }

  .cdn-flux-pkg-v2__toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
