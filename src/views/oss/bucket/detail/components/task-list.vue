<template>
  <div>
    <el-drawer v-model="drawer" size="60%" direction="rtl" class="task-drawer" :before-close="handleClose">
      <template #header>
        <p v-if="taskType === 'task'" class="title">
          {{ t('oss.fileList.taskList') }}
        </p>
        <div v-else class="title title_back">
          <SvgIcon name="sub-back" style="color: #0063ff" @click="viewTaskList" />
          <p class="title">
            {{ subTaskName }}
          </p>
        </div>
      </template>
      <div class="h-full task-drawer-content">
        <div style="height: 56px">
          <Tip type="OneToOne" :text="[{ main: t('oss.fileList.taskListTip') }]" />
          <div class="line" />
        </div>

        <div v-if="taskType === 'task'">
          <el-table :data="dataList" class="table" tooltip-effect="light">
            <el-table-column
              :label="t('oss.fileList.taskName')"
              prop="taskName"
              show-overflow-tooltip
              min-width="220"
            />
            <el-table-column :label="t('oss.fileList.taskStatus')" prop="type" min-width="110" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="df ac">
                  <SvgIcon :name="STATUS_MAP[row.status].icon" />
                  <span class="ml4">{{ STATUS_MAP[row.status].label }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :label="t('oss.fileList.completedTaskCount')"
              prop="status"
              min-width="160"
              show-overflow-tooltip
              :formatter="
                row =>
                  row.type === TaskType.UPLOAD
                    ? `${row.tasking}/${row.taskNumber}`
                    : t('oss.s7.completedTaskCount', [row.success, row.failed])
              "
            />
            <el-table-column :label="t('oss.operation')" prop="progress" width="220">
              <template #default="{ row }">
                <div v-if="row.type === TaskType.UPLOAD" class="df" style="gap: 12px">
                  <DisableText v-if="canRetry(row)" :disabled="false" :text="t('oss.retry')" @click="retry(row)" />
                  <DisableText v-if="canStart(row)" :disabled="false" :text="t('oss.start')" @click="start(row)" />
                  <DisableText v-if="canPause(row)" :disabled="false" :text="t('oss.pause')" @click="pause(row)" />
                  <DisableText v-if="canCancel(row)" :disabled="false" :text="t('oss.cancel')" @click="cancel(row)" />
                  <DisableText
                    v-if="canClear(row)"
                    :disabled="false"
                    :text="t('oss.clearRecord')"
                    @click="clearRecord(row)"
                  />
                  <DisableText :disabled="false" :text="t('oss.viewDetails')" @click="viewDetail(row)" />
                </div>
                <div
                  v-else-if="row.type === TaskType.CLEAR_BUCKET || row.type === TaskType.BATCH_DELETE"
                  class="df"
                  style="gap: 12px"
                >
                  <DisableText
                    v-if="row.status === 1"
                    :disabled="false"
                    :text="t('oss.cancel')"
                    @click="delCancel(row)"
                  />
                  <DisableText
                    v-if="row.status === 3 || row.status === 4"
                    :disabled="false"
                    :text="t('oss.clearRecord')"
                    @click="clearRecord(row)"
                  />
                </div>
                <div v-else-if="hasTaskTypeChange(row.type)" class="df" style="gap: 12px">
                  <DisableText
                    v-if="row.status === 3 || row.status === 4"
                    :disabled="false"
                    :text="t('oss.clearRecord')"
                    @click="clearRecord(row)"
                  />
                  <DisableText :disabled="false" :text="t('oss.viewDetails')" @click="viewDetail(row)" />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else class="sub-table">
          <CatTabs v-model="active" class="tabs" :tabs="tabsWithCount" @change="onTabChange" />

          <!-- <el-table :data="filteredDetailList" class="table" tooltip-effect="light">
          <el-table-column :label="t('oss.fileList.objectName')" prop="key" show-overflow-tooltip min-width="220" />
          <el-table-column
            :label="t('oss.fileList.size')"
            prop="size"
            min-width="120"
            :formatter="row => formatSize(row.size)"
          >
            <template #default="{ row }">
              <div>
                <span
                  v-if="
                    !(
                      row.type === TaskType.BATCH_DELETE ||
                      row.type === TaskType.BATCH_UPDATE_ACL ||
                      row.type === TaskType.BATCH_UPDATE_ENCRYPTION
                    )
                  "
                  >{{ formatSize(row.size) }}</span
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('oss.fileList.progress')" prop="progress" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <el-progress
                v-if="row.status !== 3"
                :color="row.status !== 2 ? '#0063ff' : '#CCCCCC'"
                :percentage="row.progress || 0"
                :format="percentage => (row.percentage ? row.percentage : `${percentage}%`)"
              ></el-progress>
              <span v-else style="color: #ff3546">{{ t('oss.fileList.uploadFailed') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('oss.operation')" prop="progress" fixed="right" min-width="160">
            <template #default="{ row }">
              <div v-if="!hasTaskTypeChange(row.type)" class="df" style="gap: 12px">
                <DisableText v-if="canRetry(row)" :disabled="false" :text="t('oss.retry')" @click="retrySub(row)" />
                <DisableText
                  v-else-if="canStart(row)"
                  :disabled="false"
                  :text="t('oss.start')"
                  @click="resumeSub(row)"
                />
                <DisableText
                  v-else-if="canPause(row)"
                  :disabled="false"
                  :text="t('oss.pause')"
                  @click="pauseSub(row)"
                />
                <DisableText
                  v-if="row.status === 1 || row.status === 2"
                  :disabled="false"
                  :text="t('oss.cancel')"
                  @click="cancelSub(row)"
                />
                <DisableText
                  v-if="row.status === 3 || row.status === 4"
                  :disabled="false"
                  :text="t('oss.clearRecord')"
                  @click="clearRecordSub(row)"
                />
              </div>
              <div v-else>
                <DisableText
                  v-if="row.status === 3 || row.status === 4"
                  :disabled="false"
                  :text="t('oss.clearRecord')"
                  @click="clearRecordSub(row)"
                />
              </div>
            </template>
          </el-table-column>
        </el-table> -->
          <div class="sub-table-box">
            <el-auto-resizer>
              <template #default="{ height, width }">
                <el-table-v2
                  :width="width"
                  :height="height"
                  :columns="dynamicColumns"
                  :data="filteredDetailList"
                  fixed
                />
              </template>
            </el-auto-resizer>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ElProgress, ElTooltip } from 'element-plus'
import t from '@/utils/i18n'
import { db } from '@/views/oss/utils/upload-db'
import {
  resumeTask,
  pauseTask,
  retryTask,
  cancelTask,
  pauseFile,
  resumeFile,
  cancelFile,
  retryFile,
  checkAndUpdateOverallStatus,
} from '@/views/oss/utils/upload-task-manager'
import { formatFileSize } from '@/views/oss/utils/upload'
import { TaskType } from '@/views/oss/types'
import DisableText from '@/components/cvm/disable-text/index.vue'
import { useTaskManager } from '@/views/oss/hooks/use-task-manager'

const columns = [
  {
    key: 'key',
    title: t('oss.fileList.objectName'),
    width: 220,
    class: 'columns_key',
    headerClass: 'columns_key',
    cellRenderer: (({ rowData }) => {
      return h(
        ElTooltip,
        {
          content: rowData.key,
          placement: 'top',
          disabled: false,
          effect: 'light',
        },
        () => h('div', { class: 'ellipsis-tooltip' }, rowData.key),
      )
    }) as any,
  },
  {
    key: 'size',
    title: t('oss.fileList.size'),
    width: 120,
    class: 'columns_size',
    headerClass: 'columns_size',
    cellRenderer: ({ rowData }) => formatSize(rowData.size),
  },
  {
    key: 'progress',
    title: t('oss.fileList.progress'),
    width: 200,
    class: 'columns_progress',
    headerClass: 'columns_progress',
    cellRenderer: ({ rowData }) => {
      // 如果是修改权限或加密任务且在执行中，显示"修改中"
      if (
        (rowData.type === TaskType.BATCH_UPDATE_ACL || rowData.type === TaskType.BATCH_UPDATE_ENCRYPTION) &&
        rowData.status === 1
      ) {
        return h(ElProgress, {
          color: rowData.status !== 2 ? '#0063ff' : '#CCCCCC',
          percentage: rowData.progress || 0,
          format: () => t('oss.s7.modifying'),
        })
      }
      // 其他情况保持原有逻辑
      if (rowData.status !== 3) {
        return h(ElProgress, {
          color: rowData.status !== 2 ? '#0063ff' : '#CCCCCC',
          percentage: rowData.progress || 0,
          format: percentage => (rowData.percentage ? rowData.percentage : `${percentage}%`),
        })
      }
      return h(
        'span',
        { style: { color: '#ff3546' } },
        rowData.type === TaskType.UPLOAD ? t('oss.fileList.uploadFailed') : t('oss.fileList.setFailed'),
      )
    },
  },
  {
    key: 'operation',
    title: t('oss.operation'),
    width: 160,
    class: 'columns_operation',
    headerClass: 'columns_operation',
    cellRenderer: ({ rowData }) => {
      if (!hasTaskTypeChange(rowData.type)) {
        return h(
          'div',
          { style: { display: 'flex', gap: '12px' } },
          [
            canRetry(rowData) &&
              h(DisableText, {
                disabled: false,
                text: t('oss.retry'),
                onClick: () => retrySub(rowData),
              }),
            canStart(rowData) &&
              h(DisableText, {
                disabled: false,
                text: t('oss.start'),
                onClick: () => resumeSub(rowData),
              }),
            canPause(rowData) &&
              h(DisableText, {
                disabled: false,
                text: t('oss.pause'),
                onClick: () => pauseSub(rowData),
              }),
            (rowData.status === 1 || rowData.status === 2) &&
              h(DisableText, {
                disabled: false,
                text: t('oss.cancel'),
                onClick: () => cancelSub(rowData),
              }),
            (rowData.status === 3 || rowData.status === 4) &&
              h(DisableText, {
                disabled: false,
                text: t('oss.clearRecord'),
                onClick: () => clearRecordSub(rowData),
              }),
          ].filter(Boolean),
        )
      }
      return h(
        'div',
        { style: { display: 'flex', gap: '12px' } },
        [
          (rowData.status === 3 || rowData.status === 4) &&
            h(DisableText, {
              disabled: false,
              text: t('oss.clearRecord'),
              onClick: () => clearRecordSub(rowData),
            }),
        ].filter(Boolean),
      )
    },
  },
]

const showSizeColumn = ref(true) // 控制是否显示size列

const dynamicColumns = computed(() => {
  return columns.filter(col => {
    if (col.key === 'size') {
      return showSizeColumn.value
    }
    return true
  })
})

const STATUS_MAP = {
  1: {
    label: t('oss.fileList.executing'),
    icon: 'loading',
  },
  2: {
    label: t('oss.fileList.paused'),
    icon: 'storage-upload-stopped',
  },
  3: {
    label: t('oss.fileList.executionFailed'),
    icon: 'error-icon',
  },
  4: {
    label: t('oss.fileList.executionSuccess'),
    icon: 'success-icon',
  },
}

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['update:show'])

const { deleteTaskTotal, cancelTask: _delCancel } = useTaskManager()

const drawer = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
})

const filteredDetailList = ref<any[]>([])

// 判断任务类型
const hasTaskTypeChange = type => {
  return (
    type === TaskType.BATCH_UPDATE_ACL || type === TaskType.BATCH_UPDATE_ENCRYPTION || type === TaskType.COPY_OBJECT
  )
}

// Worker 实例
let worker: Worker | null = null
// 初始化 Worker
const initWorker = () => {
  worker = new Worker(new URL('@/views/oss/utils/task-worker.ts', import.meta.url), { type: 'module' })

  worker.onmessage = e => {
    const { type, payload } = e.data

    switch (type) {
      case 'TASKS_LOADED':
        dataList.value = payload
        break

      case 'SUBTASKS_LOADED':
        if (payload.taskId === selectedTaskId.value) {
          detailList.value = payload.subtasks
        }
        break

      case 'SUBTASKS_FILTERED':
        filteredDetailList.value = payload
        break

      case 'TASKS_UPDATED':
        dataList.value = payload
        break

      case 'SUBTASKS_UPDATED': {
        if (payload.taskId === selectedTaskId.value) {
          detailList.value = payload.subtasks
          filterSubtasks() // 更新后立即过滤
        }
        break
      }

      case 'SUBTASK_CLEARED': {
        if (payload.shouldReturnToTaskList) {
          taskType.value = 'task'
        }
        break
      }

      case 'ERROR':
        console.error('Worker error:', payload)
        break
    }
  }
  worker.postMessage({ type: 'SUBSCRIBE_TASKS' })
}

const taskType = ref<'task' | 'detail'>('task')
const dataList = ref<any[]>([])
const detailList = ref<any[]>([])
const selectedTaskId = ref<number | null>(null)
const active = ref(1)
const executingCount = computed(() => detailList.value.filter(r => r.status === 1 || r.status === 2).length)
const successCount = computed(() => detailList.value.filter(r => r.status === 4).length)
const failCount = computed(() => detailList.value.filter(r => r.status === 3).length)

const subTaskName = computed(() => {
  const task = dataList.value.find(t => t.id === selectedTaskId.value)
  return task?.taskName
})

const tabsWithCount = computed(() => [
  { label: t('oss.fileList.taskInProgress', [executingCount.value]), value: 1 },
  { label: t('oss.fileList.taskSuccess', [successCount.value]), value: 2 },
  { label: t('oss.fileList.taskFailed', [failCount.value]), value: 3 },
])

const formatSize = (n: number) => formatFileSize(n || 0)

// 过滤子任务
const filterSubtasks = () => {
  console.log(detailList.value)

  worker?.postMessage({
    type: 'FILTER_SUBTASKS',
    payload: {
      subtasks: detailList.value.map(item => ({ ...item })), // 传递副本以避免共享内存问题
      active: active.value,
    },
  })
}

// 监听 active 变化
watch(
  active,
  () => {
    if (selectedTaskId.value) {
      filterSubtasks()
    }
  },
  { immediate: true },
)

const loadSubtasks = async (taskId: number) => {
  // 查询子任务
  // const subtasks = await db.subtasks.where('taskId').equals(taskId).toArray()
  // detailList.value = subtasks.sort((a, b) => (a.index || 0) - (b.index || 0))
  worker?.postMessage({
    type: 'LOAD_SUBTASKS',
    payload: { taskId },
  })
}

const canRetry = (row: any) => row?.status === 3
const canStart = (row: any) => row?.status === 2
const canPause = (row: any) => row?.status === 1
const canCancel = (row: any) => row?.status === 1 || row?.status === 2 || row?.status === 3
const canClear = (row: any) => row?.status === 4

const retry = async (row: any) => {
  if (!row?.id) return
  await retryTask(row.id)
}
const start = async (row: any) => {
  if (!row?.id) return
  await resumeTask(row.id)
}
const pause = async (row: any) => {
  if (!row?.id) return
  await pauseTask(row.id)
}
const cancel = async (row: any) => {
  if (!row?.id) return
  await cancelTask(row.id)
  // 取消后清除记录
  clearRecord(row)
}

// 新增：子任务级操作
const pauseSub = async (row: any) => {
  if (!row?.id || !selectedTaskId.value) return
  await pauseFile(selectedTaskId.value, row.id)
}
const resumeSub = async (row: any) => {
  if (!row?.id || !selectedTaskId.value) return
  await resumeFile(selectedTaskId.value, row.id)
}
const cancelSub = async (row: any) => {
  if (!row?.id || !selectedTaskId.value) return
  await cancelFile(selectedTaskId.value, row.id)
  // 取消后清除记录
  clearRecordSub(row)
}
const retrySub = async (row: any) => {
  if (!row?.id || !selectedTaskId.value) return
  await retryFile(selectedTaskId.value, row.id)
}

// 删除的取消事件需要通知后端
const delCancel = async (row: any) => {
  if (!row?.id) return
  _delCancel(row.tid)
  clearRecord(row)
}

const clearRecordSub = async (row: any) => {
  if (!row?.id || !selectedTaskId.value) return
  worker?.postMessage({
    type: 'CLEAR_SUBTASK',
    payload: {
      taskId: selectedTaskId.value,
      subtaskId: row.id,
    },
  })
  deleteTaskTotal(row.tid, row.status === 4 ? 'del_success' : 'del_failed')
}

const clearRecord = async (row: any) => {
  if (!row?.id) return
  try {
    await db.subtasks.where('taskId').equals(row.id).delete() // 先删除子任务
    await db.tasks.delete(row.id) // 再删除主任务
  } catch (e) {
    console.error('clearRecord error', e)
  }
}

const viewDetail = async (row: any) => {
  console.log('viewDetail===>', row)
  if (!row?.id) return
  showSizeColumn.value =
    row.type !== TaskType.BATCH_DELETE &&
    row.type !== TaskType.BATCH_UPDATE_ACL &&
    row.type !== TaskType.BATCH_UPDATE_ENCRYPTION
  selectedTaskId.value = row.id
  await loadSubtasks(row.id)
  taskType.value = 'detail'
  row.status === 1 || row.status === 2 ? (active.value = 1) : row.status === 4 ? (active.value = 2) : (active.value = 3)
}

const onTabChange = async () => {
  if (selectedTaskId.value) {
    await loadSubtasks(selectedTaskId.value) // 重新加载子任务
  }
}

const viewTaskList = async () => {
  if (selectedTaskId.value) {
    await checkAndUpdateOverallStatus(selectedTaskId.value)
  }
  taskType.value = 'task'
}
// // 关闭组件时清除任务
const handleClose = async () => {
  taskType.value = 'task'
  if (selectedTaskId.value) {
    await checkAndUpdateOverallStatus(selectedTaskId.value)
  }
  selectedTaskId.value = null
  emit('update:show', false)
  // await db.tasks.clear() // 清除所有任务
}

// let tasksSub: any = null
// let subtasksSub: any = null
onMounted(() => {
  initWorker()
  // 监听主任务列表
  // tasksSub = liveQuery(() => db.tasks.toArray()).subscribe({
  //   next: (tasks: any[]) => {
  //     dataList.value = tasks
  //   },
  //   error: err => {
  //     console.error('liveQuery tasks error', err)
  //   },
  // })
})

// 当 selectedTaskId 变化时，重新订阅子任务
watch(
  () => selectedTaskId.value,
  newTaskId => {
    if (newTaskId) {
      worker?.postMessage({
        type: 'SUBSCRIBE_SUBTASKS',
        payload: { taskId: newTaskId },
      })
    }
  },
)

onBeforeUnmount(() => {
  if (worker) {
    worker.postMessage({ type: 'UNSUBSCRIBE' })
    worker.terminate()
  }
  // if (tasksSub && typeof tasksSub.unsubscribe === 'function') tasksSub.unsubscribe()
  // if (subtasksSub && typeof subtasksSub.unsubscribe === 'function') subtasksSub.unsubscribe()
})
</script>

<style lang="scss" scoped>
.title {
  font-size: 21px;
  font-weight: 500;
  color: #000;
}

.title_back {
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
}

:deep(.el-drawer__body) {
  display: flex;
  flex-direction: column;

  .task-drawer-content {
    display: flex;
    flex-direction: column;

    .sub-table {
      display: flex;
      flex: 1;
      flex-direction: column;
      height: 0;

      .sub-table-box {
        flex: 1;
        margin-top: 20px;

        .el-progress-bar {
          min-width: 100px;
        }

        .el-table-v2 {
          .el-table-v2__header {
            background-color: #f9fafc;

            .el-table-v2__header-row {
              display: flex;

              .el-table-v2__header-cell:nth-child(1) {
                flex: 4 !important;
              }

              .el-table-v2__header-cell:nth-child(2) {
                flex: 1 !important;
              }

              .el-table-v2__header-cell:nth-child(3) {
                flex: 2 !important;
              }

              .el-table-v2__header-cell:nth-child(4) {
                flex: 2 !important;
              }
            }
          }

          .el-table-v2__header .el-table-v2__header-cell {
            font-family: 'PingFang SC', 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: #555;
            background-color: #f9fafc;
          }

          .el-table-v2__row {
            display: flex;

            .el-table-v2__row-cell:nth-child(1) {
              flex: 4 !important;
            }

            .el-table-v2__row-cell:nth-child(2) {
              flex: 1 !important;
            }

            .el-table-v2__row-cell:nth-child(3) {
              flex: 2 !important;
            }

            .el-table-v2__row-cell:nth-child(4) {
              flex: 2 !important;
            }
          }

          .ellipsis-tooltip {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .columns_key {
            // width: 40% !important;
            min-width: 220px;
            white-space: nowrap;
          }

          .columns_size {
            // width: 15% !important;
            min-width: 120px;
          }

          .columns_progress {
            // width: 20% !important;
            min-width: 200px;
          }

          .columns_operation {
            // width: 25% !important;
            min-width: 160px;
          }
        }
      }
    }
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
}

.line {
  height: 1px;
  margin: 0 -20px;
  background: #eee;
}

.table {
  margin-top: 20px;
}
</style>
