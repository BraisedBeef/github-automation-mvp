<template>
  <div class="dns-monitor-log">
    <!-- 最近的报警 -->
    <div class="alarm-wrap">
      <div class="alarm">
        <div class="alarm-filter cat-flex">
          <span class="alarm-label">{{ t('monitorLogs.latestAlarm') }}</span>
          <el-input
            v-model.trim="state.searchValue"
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
          <div class="alarm-switch">
            <el-switch :model-value="state.radio === 1" @change="handleSwitch" />
            <span>{{ t('monitorLogs.radioLabel') }}</span>
          </div>
          <el-link type="primary" :disabled="!state.tableData || !state.tableData[0]" @click="clear">
            <SvgIcon name="menu-recovery" />
            {{ t('monitorLogs.clearAll') }}
          </el-link>
        </div>
      </div>
    </div>
    <TableV2
      v-model:pagination="state.pagination"
      v-loading="state.loading"
      :data="state.tableData"
      :total="state.total"
      show-pagination
      scrollbar-always-on
      @change="getData"
    >
      <el-table-column
        v-for="item in columns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        show-overflow-tooltip
      >
        <template #header>
          <div class="custom-table-header">
            {{ item.label }}
            <template v-if="item.utcTip">
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="ml5" />
              </el-tooltip>
            </template>
          </div>
        </template>
        <template #default="{ row }">
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
          <template v-else>
            {{ row[item.prop] ?? '-' }}
          </template>
        </template>
      </el-table-column>
    </TableV2>
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
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
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

const handleSwitch = _throttle((value: boolean | string | number) => {
  state.radio = value ? 1 : 0
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
  padding: 20px;
  margin-top: 16px;
  background-color: #fff;

  .alarm-wrap {
    margin-bottom: 20px;

    .alarm {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 34px;

      & > div {
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #8a94a6;
        white-space: nowrap;
      }

      .alarm-filter {
        min-width: 0;

        .alarm-label {
          margin-right: 20px;
        }

        :deep(.el-input) {
          width: 360px;
          height: 34px;

          .el-input__wrapper {
            border-radius: 0;
            box-shadow: 0 0 0 1px #d9dee8 inset;
          }

          .el-input__inner {
            font-size: 14px;
            color: #191c23;
          }

          svg {
            width: 16px;
            height: 16px;
            color: #8a94a6;
          }
        }
      }

      .alarm-handle {
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--primary-text);

        .alarm-switch {
          display: flex;
          align-items: center;
          height: 34px;
          color: #191c23;

          :deep(.el-switch) {
            --el-switch-on-color: #06f;
            --el-switch-off-color: #c1c7d2;

            height: 24px;
            margin-right: 12px;
          }

          :deep(.el-switch__core) {
            min-width: 40px;
            height: 24px;
            border-radius: 12px;
          }

          :deep(.el-switch__action) {
            width: 20px;
            height: 20px;
          }

          :deep(.el-switch.is-checked .el-switch__action) {
            left: calc(100% - 21px);
          }
        }

        :deep(.el-link) {
          margin-left: 40px;
          font-size: 14px;

          .el-link__inner {
            display: inline-flex;
            gap: 8px;
            align-items: center;
          }

          svg {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  }

  :deep(.account-table-v2) {
    .el-table__body-wrapper td.el-table__cell {
      height: 56px;
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

.ml5 {
  margin-left: 5px;
}
</style>
