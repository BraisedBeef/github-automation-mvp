<template>
  <div class="file-download-list">
    <div v-if="state.showNotice" class="file-download-notice-wrap">
      <div class="file-download-notice">
        <SvgIcon name="tip-error" />
        <div class="msg">
          <div class="msg-t">
            {{ t('batchOperation.fileListTip1') }}
          </div>
          <div class="msg-d">
            <div>{{ t('batchOperation.fileListTip2') }}</div>
            <div>{{ t('batchOperation.fileListTip3') }}</div>
          </div>
        </div>
        <div class="link" @click="hideNotice">
          <SvgIcon name="dialog-close" pointer />
          {{ t('recordMana.noRemind') }}
        </div>
      </div>
    </div>
    <div class="file-download-content" :class="{ 'without-notice': !state.showNotice }">
      <el-table
        v-loading="state.loading"
        class="l-el-table"
        :data="state.tableData"
        :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
      >
        <el-table-column
          v-for="item in columns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :class="item.prop"
          :width="item.width"
          :min-width="item.minWidth"
          :fixed="item.fixed"
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
            <div v-if="item.prop === 'fileType'">
              {{ t(row.taskType) }}
            </div>

            <div v-else-if="item.prop === 'domain'" class="text-over">
              <!-- 域名 -->
              {{ row.domainList.join(', ') }}
            </div>
            <div v-else-if="item.prop === 'createTime'" class="text-over">
              <!-- 创建时间 -->
              {{ maoYunDayJs(row.createTime).format(FORMAT_TIME) }}
            </div>
            <div v-else-if="item.prop === 'completionTime'" class="text-over">
              <!-- 完成时间 -->
              {{ maoYunDayJs(row.completionTime).format(FORMAT_TIME) }}
            </div>
            <!-- status -->
            <div v-if="item.prop === 'status'" class="table-status">
              <div class="round" :class="statusOption.find(item => item.value === row.status)?.class" />
              {{ statusOption.find(item => item.value === row.status)?.label }}
            </div>

            <div v-if="item.prop === 'handle'" class="table-handle">
              <!-- 已经完成的才能下载 -->
              <el-link type="primary" :disabled="row.status !== 1" @click="handleDownload(row.fileUrl)">
                {{ t('batchOperation.fileDownload') }}
              </el-link>
              <!-- 已过期的才能删 -->
              <!-- :disabled="row.status !== 3" -->
              <el-link type="primary" @click="handleDelete(row.taskId)">
                {{ t('common.delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <CatPagination v-model:pagination="state.pagination" :total="state.total" @change="getData" />
    </div>
    <CatDialog v-model:dialog="state.deleteDialog" :loading="state.loading" @confirm="deleteConfirm">
      <div class="delete-cont">
        <SvgIcon name="tip-error" />
        <div>
          <div class="t">
            {{ t('batchOperation.deleteFile') }}
          </div>
          <div class="c">
            {{ t('batchOperation.deleteFileWarning') }}
          </div>
        </div>
      </div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { columns, statusOption } from './config'
import { _deleteDownload, _getDownloadList } from '@/apis/dns/batch'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { USER_HABIT } from '@/config/constant-config'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import { getHabit } from '@/utils/habit-utils'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
const HABIT_NAME: string = 'download-list'
const state = reactive<{
  showNotice: boolean
  pagination: Pager
  total: number
  loading: boolean
  tableData: any[]
  deleteDialog: boolean
  currentId: any
}>({
  showNotice: true,
  pagination: {
    page: 1,
    pageSize: 10,
  },
  total: 100,
  loading: false,
  tableData: [],
  deleteDialog: false,
  currentId: void 0,
})
const hideNotice = () => {
  state.showNotice = false
  const habit = getHabit()
  // 不再提醒
  _s_setItem(USER_HABIT, {
    ...habit,
    [HABIT_NAME]: { removeNotice: true },
  })
}
// 下载
const handleDownload = (url: string) => {
  window.open(url)
}
// 删除
const handleDelete = (taskId: number) => {
  state.currentId = taskId
  state.deleteDialog = true
}
const deleteConfirm = async () => {
  if (!state.currentId) return
  try {
    state.loading = true
    const { code } = await _deleteDownload({ taskId: state.currentId })
    state.loading = false
    if (code === 200) {
      state.deleteDialog = false
      message.success(t('common.deleteSuccess'))
      getData()
    }
  } catch (error) {
    state.loading = false
  }
}

const getData = async () => {
  try {
    state.loading = true
    const { code, data } = await _getDownloadList(state.pagination)
    state.loading = false
    if (code === 200) {
      const { total, list } = data
      state.total = total
      state.tableData = list || []
    }
  } catch (error) {
    state.loading = false
  }
}

onMounted(() => {
  getData()
  const habit = getHabit()
  if (habit && habit[HABIT_NAME]) {
    // 不再显示tip
    state.showNotice = !habit[HABIT_NAME]
  }
})
</script>

<style scoped lang="scss">
.file-download-list {
  width: 100%;
  height: 100%;
  background-color: transparent !important;

  .file-download-notice-wrap {
    /* border-radius: 4px; */
    padding: 8px 12px;
    margin-bottom: 20px;
    line-height: 20px;
    background-color: #ffe8e8;

    .file-download-notice {
      display: flex;

      svg {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        margin-top: 2px;
        margin-right: 8px;
        color: #999;
      }

      .msg {
        display: flex;
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--error-color);

        .msg-t {
          white-space: nowrap;
        }

        .msg-d {
          & > div {
            line-height: 20px;
          }

          div:first-child {
            margin-bottom: 8px;
          }
        }

        & > div:first-child {
          margin-right: 4px;
        }
      }

      .link {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        margin-left: auto;
        font-family: 'PingFang SC', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #555;
        cursor: pointer;

        svg {
          width: 14px;
          height: 14px;
          margin: 0;
          margin-right: 5px;
          vertical-align: middle;
        }
      }
    }
  }

  .file-download-content {
    &.without-notice {
      height: 100%;
    }

    .table-status {
      display: flex;
      align-items: center;

      .round {
        width: 6px;
        height: 6px;
        margin-right: 5px;
        border-radius: 50%;

        &.warning {
          background: var(--warning-color);
        }

        &.success {
          background: var(--success-color);
        }

        &.error {
          background: var(--error-color);
        }
      }
    }

    .cat-pagination {
      padding-bottom: 8px;
    }
  }
}

.delete-cont {
  display: flex;

  svg {
    width: 32px !important;
    height: 32px !important;
    margin-right: 12px;
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

:deep(.dialog-close) {
  position: relative;
  top: 1px;
  left: 0;
}

.ml5 {
  margin-left: 5px;
}
</style>
