<template>
  <div class="dns-monitor-log">
    <!-- 最近的报警 -->
    <div class="alarm-wrap">
      <div class="alarm">
        <div class="alarm-filter cat-flex">
          {{ t('monitorLogs.latestAlarm') }}
          <el-input
            v-model.trim="state.searchValue"
            style="width: 360px; margin-left: 20px"
            type="text"
            :placeholder="t('monitorLogs.alarmPlaceholder')"
            @keydown.enter="handleSearch"
          >
            <template #suffix>
              <SvgIcon name="dns-search" pointer @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <div class="cat-flex alarm-handle">
          <el-radio-group v-model="state.radio">
            <el-radio :label="1" @click.prevent="handleRadio">
              {{ t('monitorLogs.radioLabel') }}
            </el-radio>
          </el-radio-group>
          <el-link type="primary" :disabled="!state.tableData || !state.tableData[0]" @click="clear">
            {{ t('monitorLogs.clearAll') }}
          </el-link>
        </div>
      </div>
    </div>
    <CollapseTable
      v-loading="state.loading"
      :columns="columns"
      :table-data="state.tableData"
      all-width
      auto
      :arrow="false"
      :show-records="false"
    >
      <template #header="{ row }">
        <div class="custom-table-header">
          {{ row.label }}
          <template v-if="row.utcTip">
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml5" />
            </el-tooltip>
          </template>
        </div>
      </template>
      <template #default="{ item, row }">
        <template v-if="item.prop === 'startTime'">
          {{
            // row.startTime > 0
            // ? _formateTime(row.startTime * 1000, "YYYY-MM-DD HH:mm:ss")
            // : "-"
            row.startTime > 0 ? maoYunDayJs(row.startTime * 1000).format(FORMAT_TIME) : '-'
          }}
        </template>
        <template v-else-if="item.prop === 'endTime'">
          {{
            // row.endTime && row.endTime > row.startTime
            // ? _formateTime(row.endTime * 1000, "YYYY-MM-DD HH:mm:ss")
            // : "-"
            row.endTime && row.endTime > row.startTime ? maoYunDayJs(row.endTime * 1000).format(FORMAT_TIME) : '-'
          }}
        </template>
        <div v-else-if="item.prop === 'duration'">
          <el-tooltip
            placement="top"
            popper-class="cat-tooltip-popper"
            :content="_duration(row.duration)"
            class="text-over"
          >
            {{ _duration(row.duration) }}
          </el-tooltip>
        </div>
      </template>
      <template #open="{ row }">
        <div class="monitor-log-reason">
          <div class="reason">{{ t('monitorLogs.failReason') }} {{ row.reason }}</div>
          <div class="info">
            <div>{{ t('monitorLogs.switchInfo') }}</div>
            <div v-for="(item, index) in row.change" v-if="row.change" :key="index">
              {{ item }}
            </div>
            <div v-if="!row.change">
              {{ t('monitorLogs.noSwitchInfo') }}
            </div>
          </div>
        </div>
      </template>
    </CollapseTable>
    <CatPagination v-model:pagination="state.pagination" :total="state.total" @change="getData" />
    <CatDialog v-model:dialog="state.clearDialog" :loading="state.loading" @confirm="clearConfirm">
      <div class="delete-cont">
        <SvgIcon name="dialog-warning" />
        <div>
          <div class="t">
            {{ t('monitorLogs.clearAll') }}
          </div>
          <div class="c">
            {{ t('monitorLogs.clearTip') }}
          </div>
        </div>
      </div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { _duration } from '@/utils/format-time'
import { columns } from './config'
import { _debounce, _throttle } from '@/utils/timing-utils'

import { _clearMonitor, _getMonitorLog } from '@/apis/dns/monitor'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'
const props = withDefaults(
  defineProps<{
    keyword?: string
  }>(),
  {},
)
const route = useRoute()
const state = reactive<{
  current: any
  radio: number
  searchValue: string
  tableData: any[]
  pagination: Pager
  total: number
  loading: boolean
  clearDialog: boolean
}>({
  current: void 0,
  radio: 0,
  searchValue: '',
  tableData: [],
  pagination: {
    page: 1,
    pageSize: 10,
  },
  total: 0,
  loading: false,
  clearDialog: false,
})

// 去批量操作
const toBatchOperation = () => {
  pushRoute({
    name: 'BatchOperation',
    query: {
      name: 'MonitorTask',
    },
  })
}

const clear = async () => {
  if (!state.tableData || !state.tableData[0]) return
  state.clearDialog = true
}

const clearConfirm = async () => {
  try {
    state.loading = true
    const { code } = await _clearMonitor({ id: 'ALL' })
    state.loading = false
    if (code === 200) {
      message.success(t('batchOperation.resultTitle'))
      getData()
      state.clearDialog = false
    }
  } catch (error) {
    state.loading = false
  }
}

const handleSearch = _debounce(() => {
  getData()
}, 300)

const getData = async () => {
  try {
    state.loading = true
    const { code, data } = await _getMonitorLog({
      keyword: state.searchValue,
      ...state.pagination,
      status: state.radio === 1 ? 1 : 0,
    })
    state.loading = false
    if (code === 200) {
      state.total = data.total
      state.tableData = data.list || []
    }
  } catch (error) {
    state.loading = false
  }
}

const handleRadio = _throttle(() => {
  state.radio = Number(!state.radio)
  getData()
}, 300)

onMounted(() => {
  if (props.keyword) {
    state.searchValue = props.keyword
  }
  getData()
})
</script>

<style scoped lang="scss">
.dns-monitor-log {
  padding: 0 20px;
  background-color: #fff;

  .alarm-wrap {
    /* margin-top: 20px; */
    padding-top: 20px;
    margin-bottom: 20px;

    .alarm {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 60px;
      padding: 0 20px;
      background-color: var(--table-head-bgc);

      & > div {
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #555;
        white-space: nowrap;
      }

      .alarm-handle {
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--primary-text);

        .el-link {
          margin-left: 40px;
        }
      }
    }
  }
}

.custom-row {
  width: 20%;

  &.dns {
    color: var(--primary-color);
  }
}

/* record styles */

.record {
  flex-wrap: wrap;

  & > div {
    flex-shrink: 0;
    width: 100%;

    div {
      display: inline-block;
      max-width: 100%;
      overflow-wrap: break-word;
    }
  }
}

.monitor-log-reason {
  padding: 12px 20px;
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: #555;
  background-color: var(--table-head-bgc);

  .reason {
    margin-bottom: 5px;
    line-height: 17px;
  }

  .info {
    display: flex;
    line-height: 17px;
  }
}

.delete-cont {
  display: flex;

  svg {
    width: 32px !important;
    height: 32px !important;
    margin-right: 12px;
    cursor: initial;
  }

  .t {
    margin-bottom: 8px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    color: #000;
  }

  .c {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

.cat-collaspe-table {
  :deep(.el-collapse) {
    .el-collapse-item {
      .el-collapse-item__header {
        .collasped-row-item {
          span {
            max-width: 100%;
          }
        }
      }
    }
  }
}

.ml5 {
  margin-left: 5px;
}
</style>
