<template>
  <div class="dns-monitor-list">
    <!-- 头部操作 -->
    <div class="content-handle">
      <div class="content-handle-wrap cat-flex">
        <el-button type="primary" :loading="state.loading" @click="toAddMonitor">
          +{{ t('monitorList.addMonitor') }}
        </el-button>
        <el-button :disabled="pauseDisabled" @click="pauseMulti">
          {{ t('common.pause') }}
        </el-button>
        <el-button :disabled="playDisabled" @click="playMulti">
          {{ t('common.start') }}
        </el-button>
        <el-button :disabled="deleteDisabled" @click="deleteMulti">
          {{ t('common.delete') }}
        </el-button>
      </div>
      <!-- 搜索框 -->
      <el-input
        v-model.trim="state.searchValue"
        :placeholder="t('monitorList.searchPlaceholder')"
        style="width: 240px; height: 34px"
        @keydown.enter="handleSearch"
      >
        <template #suffix>
          <SvgIcon name="Search" pointer @click="handleSearch" />
        </template>
      </el-input>
    </div>
    <!-- table-wrap -->
    <el-table
      ref="monitor_list_table"
      v-loading="state.loading"
      class="l-el-table"
      :data="state.tableData"
      style="width: 100%"
      :row-class-name="rowClassName"
      :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
      @selection-change="handleSelectionChange"
      @select-all="handleSelectAll"
    >
      <el-table-column type="selection" width="36" />
      <el-table-column
        v-for="item in columns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :class="item.prop"
        :show-overflow-tooltip="item.tooltip"
        :min-width="item.minWidth"
        :width="item.width"
        :fixed="item.fixed"
      >
        <template #default="{ row, $index }">
          <div v-if="item.prop === 'dns'">
            <!-- dns -->
            {{ row.dns }}
          </div>

          <div v-else-if="item.prop === 'protocol'">
            <!-- 监控方式 -->
            {{ monitorMethods.find(item => item.value === row.protocol)?.label }}
          </div>

          <div v-else-if="item.prop === 'monitorType'">
            <!-- 监控类型 -->
            {{ monitorTypes.find(item => item.value === row.monitorType)?.label }}
          </div>
          <!-- 报警规则 -->
          <div v-else-if="item.prop === 'reportTrigger'" class="text-over">
            {{
              row.monitorType === 2
                ? '-'
                : reportTriggerRules.find(item => item.value === row.reportTrigger)?.label || '-'
            }}
          </div>
          <!-- 状态 -->
          <div v-else-if="item.prop === 'status'" class="table-status h-full">
            <div class="round" :class="row.status === 1 ? 'success' : 'error'" />
            {{ monitorStatus.find(item => item.value === row.status)?.label }}
          </div>
          <!-- 通知方式 -->
          <!-- <div v-else-if="item.prop === 'notice_way'" class="text-over">
            {{ row.notifyUser }}
          </div> -->
          <!-- 操作 -->
          <div v-else-if="item.prop === 'handle'" class="table-handle">
            <el-link v-if="row.status === 1" type="primary" @click="pauseSingle($index)">
              {{ t('common.pause') }}
            </el-link>
            <el-link v-if="row.status === 0" type="primary" @click="playSingle($index)">
              {{ t('common.start') }}
            </el-link>
            <el-link type="primary" @click="deleteSingle($index)">
              {{ t('common.delete') }}
            </el-link>
            <el-link type="primary" @click="toChangeMonitor(row)">
              {{ t('monitorList.changeSet') }}
            </el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <CatPagination v-model:pagination="state.pagination" :total="state.total" @change="getData" />
    <!-- play-dialog -->
    <CatDialog
      v-model:dialog="state.playDialog"
      :title="t('monitorList.startTitle')"
      :loading="state.dialogLoading"
      @confirm="statusConfirm(true)"
    >
      <div class="status-content">
        {{ t('monitorList.startTip') }}
      </div>
    </CatDialog>
    <CatDialog
      v-model:dialog="state.pauseDialog"
      :title="t('monitorList.stopTitle')"
      :loading="state.dialogLoading"
      @confirm="statusConfirm(false)"
    >
      <div class="status-content">
        {{ t('monitorList.stopTip') }}
      </div>
    </CatDialog>
    <!-- delete-dialog -->
    <CatDialog v-model:dialog="state.deleteDialog" :loading="state.dialogLoading" @confirm="deleteConfirm">
      <div class="status-content">
        <SvgIcon name="dialog-warning" />
        <div>
          <div class="t">
            {{ t('monitorList.deleteTitle') }}
          </div>
          <div class="c">
            {{ t('monitorList.deleteTip1') }}
          </div>
        </div>
      </div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { columns } from './config'
import CatPagination from '@/components/common/cat-pagination/index.vue'
import { monitorMethods, monitorTypes, reportTriggerRules, monitorStatus } from '../config'
import CatDialog from '@/components/common/cat-dialog/index.vue'
import { _getMonitorList, _toggleMonitor, _deleteMonitor, _getMonitorDetail } from '@/apis/dns/monitor'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'

const state = reactive<{
  loading: boolean
  searchValue: any
  tableData: any[]
  pagination: Pager
  total: number
  multipleSelection: any[]
  handleType: 'single' | 'multi'
  playDialog: boolean
  pauseDialog: boolean
  deleteDialog: boolean
  dialogLoading: boolean
  current: number
}>({
  loading: false,
  searchValue: void 0,
  tableData: [],
  pagination: {
    page: 1,
    pageSize: 10,
  },
  total: 0,
  multipleSelection: [],
  handleType: 'single', // 操作类型
  playDialog: false,
  pauseDialog: false,
  deleteDialog: false,
  dialogLoading: false,
  current: 0,
})

const monitor_list_table = ref()

// 搜索
const handleSearch = () => {
  console.log(state.searchValue)
  getData()
}

// 选择
const handleSelectionChange = (val: any[]) => {
  console.log('val', val)
  state.multipleSelection = val
}
// 全选
const handleSelectAll = (val: any[]) => {
  console.log('全选', val)
}

// 删除多个
const deleteMulti = () => {
  state.handleType = 'multi'
  state.deleteDialog = true
}
// 删除单个
const deleteSingle = (i: number) => {
  clearSelection()
  state.handleType = 'single'
  state.current = i
  state.deleteDialog = true
}

const deleteConfirm = async () => {
  try {
    state.dialogLoading = true
    let data: any = {}
    if (state.handleType === 'single') {
      data = { ids: [computedCurrent.value.id] }
    } else {
      data = { ids: state.multipleSelection.map(item => item.id) }
    }
    const { code } = await _deleteMonitor(data)
    state.dialogLoading = true
    if (code === 200) {
      state.current = 0
      await getData()
      message.success(t('common.deleteSuccess'))
      state.deleteDialog = false
    }
  } catch (error) {
    state.dialogLoading = false
  }
}

const a = ref<any[]>()

// 开启单个
const playSingle = (i: number) => {
  clearSelection()
  state.handleType = 'single'
  state.current = i
  state.playDialog = true
}

// 开启多个
const playMulti = () => {
  state.handleType = 'multi'
  state.playDialog = true
}

// 关闭单个
const pauseSingle = (i: number) => {
  clearSelection()
  state.handleType = 'single'
  state.current = i
  state.pauseDialog = true
}

// 关闭多个
const pauseMulti = () => {
  state.handleType = 'multi'
  state.pauseDialog = true
}

const statusConfirm = async (status: boolean) => {
  try {
    state.dialogLoading = true
    let data: any = {}
    if (state.handleType === 'single') {
      data = {
        ids: [computedCurrent.value.id],
        status,
      }
    } else {
      data = {
        ids: state.multipleSelection.map(item => item.id),
        status,
      }
    }
    const { code } = await _toggleMonitor(data)
    state.dialogLoading = false
    if (code === 200) {
      await getData()
      message.success(t('common.operationSuccess'))
      state.playDialog = false
      state.pauseDialog = false
    }
  } catch (error) {
    state.dialogLoading = false
  }
}

// 清空所有选择
const clearSelection = () => {
  monitor_list_table.value?.clearSelection()
}

// 获取列表
const getData = async () => {
  try {
    state.loading = true
    const { code, data } = await _getMonitorList({
      keyword: state.searchValue,
      ...state.pagination,
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

const rowClassName = ({ row }) => {
  if (state.multipleSelection.find(item => item.id === row.id)) {
    return 'is-checked'
  } else {
    return ''
  }
}

// 去添加监控
const toAddMonitor = () => {
  pushRoute({
    name: 'AddMonitor',
    query: {
      edit: 0,
      name: 'MonitorTask',
      backTitle: 'addMonitor.backTitle',
    },
  })
}

// 去修改监控
const toChangeMonitor = async (row: any) => {
  pushRoute({
    name: 'AddMonitor',
    query: {
      edit: 1,
      id: row.id,
      name: 'MonitorTask',
      backTitle: 'addMonitor.backTitle',
    },
  })
}

// current
const computedCurrent = computed(() => state.tableData[state.current])

// 暂停
const pauseDisabled = computed(() => {
  if (state.multipleSelection.length === 0) {
    return true
  } else {
    // 判断是否都是启用着的
    return state.multipleSelection.some(item => item.status === 0)
  }
})
// 开启
const playDisabled = computed(() => {
  if (state.multipleSelection.length === 0) {
    return true
  } else {
    // 判断是否都是关闭着的
    return state.multipleSelection.some(item => item.status === 1)
  }
})

// delete
const deleteDisabled = computed(() => state.multipleSelection.length === 0)

onMounted(() => {
  getData()
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
</script>

<style scoped lang="scss">
.dns-monitor-list {
  padding: 0 20px;
  background-color: #fff;

  .content-handle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
  }
}

.table-status {
  display: flex;
  align-items: center;

  /* line-height: 1; */

  .round {
    width: 6px;
    height: 6px;
    margin-right: 5px;
    border-radius: 50%;

    &.success {
      background-color: var(--success-color);
    }

    &.error {
      background-color: var(--danger-color);
    }
  }
}

.status-content {
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
</style>
