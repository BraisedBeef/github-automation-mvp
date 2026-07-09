<template>
  <div class="log-list">
    <CatTabs v-model="tabType" :tabs="tabMenuList" full-container @change="setTabType" />
    <CatTip class="mt20">
      <p>
        {{ t('cdn.log.539685-0') }}
      </p>
      <p>{{ t('cdn.log.539685-1') }}</p>
    </CatTip>
    <div class="log-form page-box mt20">
      <el-form :model="form" inline>
        <el-form-item :label="t('cdn.log.539685-2')">
          <DateTimeRange v-model="form.time" :picker-options="pickerOptions" @change="handleTimeChange" />
        </el-form-item>
        <el-form-item :label="t('cdn.log.539685-3')">
          <el-select
            v-model="form.domain_id"
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
        </el-form-item>
        <!-- <el-form-item label="地域">
          <el-select
            v-model="form.region"
            :disabled="state.loading"
            :placeholder="t('cdn.log.539685-4')"
            @change="getTableData"
          >
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item> -->
        <el-form-item :label="''" style="margin-bottom: 20px !important">
          <ElButton type="primary" :loading="state.loading" @click="getTableData">
            {{ t('cdn.log.539685-5') }}
          </ElButton>
        </el-form-item>
      </el-form>
    </div>
    <CatTip v-if="targetDomainDownTips" type="danger" class="mt20">
      <p>{{ t('cdn.log.539685-6') }}</p>
    </CatTip>
    <div class="log-content pd20 page-box mt20">
      <div class="df ac mb20">
        <ElButton type="primary" :disabled="multipleSelection.length === 0" @click="batchDownload">
          {{ t('cdn.log.539685-7') }}
        </ElButton>
      </div>
      <el-table
        v-loading="state.loading"
        :data="state.tableData"
        show-overflow-tooltip
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" :selectable="row => row.can_download" />
        <el-table-column prop="time" :label="t('cdn.log.539685-2')">
          <template #header>
            <div class="df ac">
              <span class="mr5">{{ t('cdn.log.539685-2') }}</span>
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
        <el-table-column prop="domain" :label="t('cdn.log.539685-3')" />
        <el-table-column prop="name" :label="t('cdn.log.539685-8')" />
        <el-table-column prop="size" :label="t('cdn.log.539685-9')">
          <template #default="{ row }">
            {{ getFlux(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="download" :label="t('cdn.log.539685-10')">
          <template #default="{ row }">
            <el-tooltip effect="light" :content="t('cdn.log.539685-11')" placement="top" :disabled="row.can_download">
              <el-link type="primary" :disabled="!row.can_download" @click="download(row)">
                {{ t('cdn.log.539685-12') }}
              </el-link>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <CatPagination
        v-model:pagination="state.pagination"
        :custom-keys="['page', 'page_size']"
        :total="state.total"
        @change="getTableData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { usePermissionStore } from '@/store'
import { tabMenuList } from '@/assets/data/common'
import { getDateDayjs } from '@/utils/format-time'
import { download as downloadFile } from '@/utils/download'
import { getFlux } from '@/utils/unit'
import { message } from '@/utils/message'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { filterArray } from '@/utils/filter'
import { _getOfflineLog, _getOfflineLogDomain, _getOfflineLogDownloadUrl } from '@/apis/cdn/log'
import DateTimeRange from './date-time-range.vue'

// 开通日志服务时间
const permissionStore = usePermissionStore()
const activationTime = filterArray(permissionStore.cdn.menus, 'id', 'cdn_offline_log').activationTime ?? 0
const activeDays = maoYunDayJs(activationTime * 1000)

// tab
const tabType = ref<string>('0,1,2')
const setTabType = async item => {
  tabType.value = item.value
  form.value.channel_type = {
    '0,1,2': '1',
    '3': '2',
  }[item.value]
  form.value.domain_id = undefined
  await getDomainList()
  getTableData()
}

// form
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
    } else if (type === 'end') {
      return time > endTime
    }
    return false
  },
  disabledTime(type) {
    if (type === 'start') {
      return {
        disabledHours: () => {
          // @ts-ignore
          if (maoYunDayJs(form.value.time[0]).isSameOrBefore(activeDays, 'day')) {
            return makeRange(0, activeDays.hour())
          } else {
            return []
          }
        },
        disabledMinutes: () => {
          // @ts-ignore
          if (maoYunDayJs(form.value.time[0]).isSameOrBefore(activeDays, 'day')) {
            return makeRange(0, activeDays.minute())
          } else {
            return []
          }
        },
        disabledSeconds: () => {
          // @ts-ignore
          if (maoYunDayJs(form.value.time[0]).isSameOrBefore(activeDays, 'day')) {
            return makeRange(0, activeDays.second())
          } else {
            return []
          }
        },
      }
    } else if (type === 'end') {
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

// 域名列表
const domainOptions = ref<any[]>([])
const domainStatesLoading = ref(false)
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

const handleTimeChange = async () => {
  // 无需重置域名和表格数据
  // await getDomainList()
  // getTableData()
}

const state = reactive({
  loading: false,
  tableData: [] as any[],
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
  refreshDialog: false,
  isRefresh: false,
})
const getTableData = async () => {
  state.loading = true
  if (!form.value.domain_id) {
    state.tableData = []
    state.total = 0
    setTimeout(() => {
      state.loading = false
    }, 100)
    return
  }
  try {
    // 获取域名列表
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
    } else {
      message.error(msg || t('cdn.log.539685-13'))
    }
  } finally {
    state.loading = false
  }
}
const targetDomainDownTips = computed(() => {
  return state.tableData.some(item => !item.can_download)
})

onMounted(async () => {
  await getDomainList()
  getTableData()
})

const multipleSelection = ref<any[]>([])
const handleSelectionChange = row => {
  multipleSelection.value = row
}

const getOfflineLogDownloadUrl = async (ids: string[]) => {
  try {
    const { code, data, msg } = await _getOfflineLogDownloadUrl({
      channel_type: form.value.channel_type,
      domain_id: form.value.domain_id,
      ids: JSON.stringify(ids),
    })
    if (code === 200 && data) {
      data.items.forEach((item, i) => {
        setTimeout(() => {
          if (item.url) {
            downloadFile(item.url, `${item.name}.gz`)
          } else {
            message.error(t('cdn.log.539685-14', [item.name]))
          }
        }, i * 800) // 延时下载，避免同时下载过多文件
      })
      return data.items
    } else {
      message.error(msg || t('cdn.log.539685-15'))
      return null
    }
  } catch (error) {
    message.error(t('cdn.log.539685-15'))
    return null
  }
}
const batchDownload = async () => {
  if (multipleSelection.value?.length === 0) return

  const downloadList = multipleSelection.value!.map(item => item.id)
  getOfflineLogDownloadUrl(downloadList)
}
const download = async row => {
  getOfflineLogDownloadUrl([row.id])
}
</script>

<style lang="scss" scoped>
.log-form {
  padding: 20px 20px 0;
}
</style>
