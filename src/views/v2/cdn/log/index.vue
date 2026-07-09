<template>
  <div class="cdn-log-v2">
    <PageBreadcrumbToolbar :items="[t('offlineLog')]" @doc="openHelpDoc" />

    <section class="cdn-log-v2__panel">
      <div class="cdn-log-v2__tabs">
        <SegmentedTabs v-model="tabType" :items="tabItems" @update:model-value="handleTabTypeChange" />
      </div>

      <div class="cdn-log-v2__notices">
        <InfoNotice class="cdn-log-v2__notice">
          <div class="cdn-log-v2__notice-lines">
            <p>{{ t('cdn.log.539685-0') }}</p>
            <p>{{ t('cdn.log.539685-1') }}</p>
          </div>
        </InfoNotice>

        <InfoNotice v-if="targetDomainDownTips" class="cdn-log-v2__notice" variant="danger" icon-name="warning-red">
          {{ t('cdn.log.539685-6') }}
        </InfoNotice>
      </div>
    </section>

    <section class="cdn-log-v2__panel">
      <div class="cdn-log-v2__filters">
        <div class="cdn-log-v2__filter-item cdn-log-v2__filter-item--range">
          <span class="cdn-log-v2__label">{{ t('cdn.log.539685-2') }}</span>
          <DateTimeRange v-model="form.time" :picker-options="pickerOptions" @change="handleTimeChange" />
        </div>

        <div class="cdn-log-v2__filter-item">
          <span class="cdn-log-v2__label">{{ t('cdn.log.539685-3') }}</span>
          <el-select
            v-model="form.domain_id"
            class="cdn-log-v2__select"
            filterable
            remote
            :loading="domainStatesLoading"
            :disabled="state.loading"
            :placeholder="t('cdn.log.539685-4')"
          >
            <el-option
              v-for="item in domainOptions"
              :key="item.id"
              :label="`${item.domain}${item.delete_status ? '（已删除）' : ''}`"
              :value="item.id"
            />
          </el-select>
        </div>

        <div class="cdn-log-v2__filter-actions">
          <el-button type="primary" :loading="state.loading" @click="handleSearch">
            {{ t('cdn.log.539685-5') }}
          </el-button>
        </div>
      </div>
    </section>

    <section class="cdn-log-v2__panel">
      <div class="cdn-log-v2__toolbar">
        <div class="cdn-log-v2__actions">
          <el-button type="primary" :disabled="multipleSelection.length === 0" @click="batchDownload">
            {{ t('cdn.log.539685-7') }}
          </el-button>
        </div>
      </div>

      <TableV2
        ref="tableRef"
        v-loading="state.loading"
        :data="state.tableData"
        :total="state.total"
        :pagination="pagination"
        show-pagination
        @selection-change="handleSelectionChange"
        @update:pagination="handlePaginationChange"
      >
        <el-table-column type="selection" width="58" :selectable="row => row.can_download" />

        <el-table-column min-width="240">
          <template #header>
            <div class="cdn-log-v2__th-with-tip">
              <span>{{ t('cdn.log.539685-2') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ getDateDayjs(row.start_time * 1000, 'string', true) }}
            -
            {{ getDateDayjs(row.end_time * 1000, 'string', true) }}
          </template>
        </el-table-column>

        <el-table-column prop="domain" :label="t('cdn.log.539685-3')" min-width="220" show-overflow-tooltip />

        <el-table-column prop="name" :label="t('cdn.log.539685-8')" min-width="320" show-overflow-tooltip />

        <el-table-column prop="size" :label="t('cdn.log.539685-9')" min-width="120">
          <template #default="{ row }">
            {{ getFlux(row.size) }}
          </template>
        </el-table-column>

        <el-table-column :label="t('cdn.log.539685-10')" min-width="140" fixed="right">
          <template #default="{ row }">
            <el-tooltip effect="light" :content="t('cdn.log.539685-11')" placement="top" :disabled="row.can_download">
              <span>
                <el-button link type="primary" :disabled="!row.can_download" @click="download(row)">
                  {{ t('cdn.log.539685-12') }}
                </el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { tabMenuList } from '@/assets/data/common'
import { usePermissionStore } from '@/store'
import { _getOfflineLog, _getOfflineLogDomain, _getOfflineLogDownloadUrl } from '@/apis/cdn/log'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import SegmentedTabs from '@/views/v2/account-system/components/segmented-tabs.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import DateTimeRange from '@/views/cdn/log/date-time-range.vue'
import { filterArray } from '@/utils/filter'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { download as downloadFile } from '@/utils/download'
import { getFlux } from '@/utils/unit'

const permissionStore = usePermissionStore()
const activationTime = filterArray(permissionStore.cdn.menus, 'id', 'cdn_offline_log').activationTime ?? 0
const activeDays = maoYunDayJs(activationTime * 1000)

const tabItems = tabMenuList.map(item => ({
  label: item.label,
  value: item.value,
}))

const tabType = ref<string>('0,1,2')

const makeRange = (start: number, end: number) => {
  const result: number[] = []
  for (let i = start; i <= end - 1; i++) {
    result.push(i)
  }
  return result
}

const startTime = maoYunDayJs().subtract(7, 'day').startOf('day').valueOf()
const endTime = maoYunDayJs().endOf('day')

const pickerOptions = {
  disabledDate(time, type) {
    if (type === 'start') {
      return time < Math.max(activeDays.startOf('day').valueOf(), startTime) || time > endTime
    }
    if (type === 'end') {
      return time > endTime
    }
    return false
  },
  disabledTime(type) {
    if (type === 'start') {
      return {
        disabledHours: () => {
          if (maoYunDayJs(form.value.time[0]).isSameOrBefore(activeDays, 'day')) {
            return makeRange(0, activeDays.hour())
          }
          return []
        },
        disabledMinutes: () => {
          if (maoYunDayJs(form.value.time[0]).isSameOrBefore(activeDays, 'day')) {
            return makeRange(0, activeDays.minute())
          }
          return []
        },
        disabledSeconds: () => {
          if (maoYunDayJs(form.value.time[0]).isSameOrBefore(activeDays, 'day')) {
            return makeRange(0, activeDays.second())
          }
          return []
        },
      }
    }
    if (type === 'end') {
      return {}
    }
    return {}
  },
}

const form = ref<{
  time: any[]
  domain_id?: string
  channel_type?: string
}>({
  time: [
    getDateDayjs(
      Math.max(maoYunDayJs(activationTime * 1000).valueOf(), maoYunDayJs().subtract(7, 'day').startOf('day').valueOf()),
      'string',
    ),
    getDateDayjs(maoYunDayJs().endOf('day').valueOf(), 'string'),
  ],
  channel_type: '1',
})

const domainOptions = ref<any[]>([])
const domainStatesLoading = ref(false)
const multipleSelection = ref<any[]>([])
const tableRef = ref<InstanceType<typeof TableV2>>()

const state = reactive({
  loading: false,
  tableData: [] as any[],
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})

const pagination = computed(() => ({
  page: state.pagination.page,
  pageSize: state.pagination.page_size,
}))

const targetDomainDownTips = computed(() => state.tableData.some(item => !item.can_download))

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const getDomainList = async () => {
  domainStatesLoading.value = true
  try {
    const { code, data, msg } = await _getOfflineLogDomain({
      channel_type: form.value.channel_type,
    })
    if (code === 200 && data) {
      domainOptions.value = data.items
      if (!data.items.some(item => item.id === form.value.domain_id)) {
        form.value.domain_id = data.items.length > 0 ? data.items[0].id : ''
      }
    } else {
      message.error(msg || t('cdn.log.539685-13'))
    }
  } finally {
    domainStatesLoading.value = false
  }
}

const getTableData = async () => {
  state.loading = true

  if (!form.value.domain_id) {
    state.tableData = []
    state.total = 0
    multipleSelection.value = []
    tableRef.value?.clearSelection()
    state.loading = false
    return
  }

  try {
    const { code, data, msg } = await _getOfflineLog({
      ...state.pagination,
      channel_type: form.value.channel_type,
      start_time: form.value.time?.[0] ? maoYunDayJs(form.value.time[0]).unix() : undefined,
      end_time: form.value.time?.[1] ? maoYunDayJs(form.value.time[1]).unix() : undefined,
      domain_id: form.value.domain_id,
    })

    if (code === 200 && data) {
      state.tableData = data.items || []
      state.total = data.total || 0
      multipleSelection.value = []
      tableRef.value?.clearSelection()
    } else {
      message.error(msg || t('cdn.log.539685-13'))
    }
  } finally {
    state.loading = false
  }
}

const handleTabTypeChange = async (value: string | number) => {
  tabType.value = String(value)
  form.value.channel_type = String(value) === '3' ? '2' : '1'
  form.value.domain_id = undefined
  state.pagination.page = 1
  await getDomainList()
  getTableData()
}

const handleTimeChange = () => {}

const handleSearch = () => {
  state.pagination.page = 1
  getTableData()
}

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  state.pagination.page = page
  state.pagination.page_size = pageSize
  getTableData()
}

const handleSelectionChange = (rows: any[]) => {
  multipleSelection.value = rows
}

const getOfflineLogDownloadUrl = async (ids: string[]) => {
  try {
    const { code, data, msg } = await _getOfflineLogDownloadUrl({
      channel_type: form.value.channel_type,
      domain_id: form.value.domain_id,
      ids: JSON.stringify(ids),
    })

    if (code === 200 && data) {
      data.items.forEach((item, index) => {
        setTimeout(() => {
          if (item.url) {
            downloadFile(item.url, `${item.name}.gz`)
          } else {
            message.error(t('cdn.log.539685-14', [item.name]))
          }
        }, index * 800)
      })
      return data.items
    }

    message.error(msg || t('cdn.log.539685-15'))
    return null
  } catch (error) {
    message.error(t('cdn.log.539685-15'))
    return null
  }
}

const batchDownload = async () => {
  if (!multipleSelection.value.length) {
    return
  }

  getOfflineLogDownloadUrl(multipleSelection.value.map(item => item.id))
}

const download = async (row: any) => {
  getOfflineLogDownloadUrl([row.id])
}

onMounted(async () => {
  await getDomainList()
  getTableData()
})
</script>

<style scoped lang="scss">
.cdn-log-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-log-v2__panel {
  padding: 20px;
  background: #fff;
}

.cdn-log-v2__tabs {
  margin-bottom: 20px;
}

.cdn-log-v2__notices {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cdn-log-v2__notice-lines {
  display: grid;
  gap: 4px;
}

.cdn-log-v2__notice-lines p {
  margin: 0;
}

.cdn-log-v2__filters,
.cdn-log-v2__toolbar,
.cdn-log-v2__actions,
.cdn-log-v2__th-with-tip {
  display: flex;
  align-items: center;
}

.cdn-log-v2__filters {
  flex-wrap: wrap;
  gap: 20px 32px;
}

.cdn-log-v2__filter-item {
  display: grid;
  grid-template-columns: auto 220px;
  gap: 12px;
  align-items: center;
}

.cdn-log-v2__filter-item--range {
  grid-template-columns: auto minmax(420px, 1fr);
  min-width: 580px;
}

.cdn-log-v2__label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-log-v2__select {
  width: 100%;
}

.cdn-log-v2__filter-actions {
  align-self: end;
}

.cdn-log-v2__toolbar {
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cdn-log-v2__th-with-tip {
  gap: 8px;
}

.cdn-log-v2 :deep(.custom-datetimerange) {
  min-width: 420px;
}

.cdn-log-v2 :deep(.custom-datetimerange .el-date-editor) {
  width: 180px;
}

.cdn-log-v2 :deep(.v2-info-notice__text) {
  width: 100%;
}

.cdn-log-v2 :deep(.account-table-v2__table .el-button.is-link.is-disabled) {
  color: #b7c0cd;
}

@media (width <= 1024px) {
  .cdn-log-v2__panel {
    padding: 16px;
  }

  .cdn-log-v2__filter-item,
  .cdn-log-v2__filter-item--range {
    grid-template-columns: 1fr;
    width: 100%;
    min-width: 0;
  }

  .cdn-log-v2__filter-actions {
    width: 100%;
  }

  .cdn-log-v2__filter-actions .el-button {
    width: 100%;
  }

  .cdn-log-v2 :deep(.custom-datetimerange) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    min-width: 0;
  }

  .cdn-log-v2 :deep(.custom-datetimerange .el-date-editor) {
    width: calc(50% - 18px);
  }
}
</style>
