<template>
  <div class="cdn-content page-box pd20">
    <el-form :model="form" inline>
      <el-form-item :label="t('time')">
        <DateTimePicker
          v-model:start_time="form.start_time"
          :loading="state.loading"
          :compare="false"
          @change="getData"
        />
      </el-form-item>
      <el-form-item :label="t('sendStatus')">
        <CatSelect
          v-model="form.status"
          :loading="state.loading"
          :disabled="state.loading"
          :list="filtetOptions.status"
          @change="
            $nextTick(() => {
              getData()
            })
          "
        />
      </el-form-item>
      <el-form-item :label="t('queryType')" style="margin-bottom: 20px !important">
        <CatSelect
          v-model="form.type"
          :disabled="state.loading"
          :list="filtetOptions.type"
          @change="
            $nextTick(() => {
              getData()
            })
          "
        />
      </el-form-item>
    </el-form>
    <div class="handle">
      <div class="left">
        <el-button type="primary" :disabled="state.loading" @click="handleDialog(true)">
          {{ t('refresh') }}
        </el-button>
        <el-button plain :disabled="state.loading" @click="handleDialog(false)">
          {{ t('prefetch') }}
        </el-button>
      </div>
      <div class="right">
        <el-input v-model="searchValue" :disabled="state.loading" maxlength="256" @keydown.enter="getData">
          <template #suffix>
            <SvgIcon name="dns-search" @click="getData" />
          </template>
        </el-input>
        <CdnIconButton class="ml10" @click="getData">
          <SvgIcon name="cat-cdn-refresh" :loading="state.loading" />
        </CdnIconButton>
      </div>
    </div>
    <RefreshDialog
      :dialog="state.refreshDialog"
      :is-refresh="state.isRefresh"
      @close="() => (state.refreshDialog = false)"
      @success="getData"
    />

    <el-table
      v-loading="state.loading"
      :data="state.tableData"
      style="width: 100%"
      class="cdn-content-table"
      :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
    >
      <el-table-column :label="t('sendStatus')" prop="status">
        <template #default="{ row }">
          <el-text :type="filterArray(statusMap, 'value', row.status)?.type || 'warning'">
            {{ filterArray(statusMap, 'value', row.status)?.label || '-' }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column :label="t('content1')" prop="content" />
      <el-table-column :label="t('taskSendTime')" prop="create_time">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('taskSendTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ getDateDayjs(row.create_time * 1000, 'string', true) }}
        </template>
      </el-table-column>
    </el-table>
    <CatPagination
      v-model:pagination="state.pagination"
      :custom-keys="['page', 'page_size']"
      :total="state.total"
      @change="getData"
    />
  </div>
</template>

<script setup lang="ts">
import { filtetOptions } from './config'
import { setDateTimeRangeDayjs, getDateDayjs } from '@/utils/format-time'
import RefreshDialog from './refresh-dialog.vue'
import t from '@/utils/i18n'

import type { RequestFilterInterface } from './type'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { filterArray } from '@/utils/filter'

enum StatusEnum {
  status0 = 0, // 失败
  status1 = 1, // 完成
  status2 = 2, // 处理中
}
const statusMap = [
  {
    value: StatusEnum.status0,
    label: t('fail'),
    type: 'danger',
  },
  {
    value: StatusEnum.status1,
    label: t('complete'),
    type: 'success',
  },
  {
    value: StatusEnum.status2,
    label: t('processing'),
    type: 'warning',
  },
]

const form = ref<RequestFilterInterface>({
  start_time: setDateTimeRangeDayjs('today').current,
  end_time: 0,
  type: 0,
  status: 0,
})
const state = reactive<{
  loading: boolean
  tableData: any[]
  pagination: {
    page: number
    page_size: number
  }
  total: number
  refreshDialog: boolean
  isRefresh: boolean
}>({
  loading: false,
  tableData: [],
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
  refreshDialog: false,
  isRefresh: false,
})
const handleDialog = (isR: boolean) => {
  state.isRefresh = isR
  state.refreshDialog = true
}
const searchValue = ref('')
const getData = () => {
  const params: any = {
    key: searchValue.value.trim(),
    status: form.value.status,
    start_time: maoYunDayJs(form.value.start_time[0]).valueOf() / 1000,
    end_time: maoYunDayJs(form.value.start_time[1]).valueOf() / 1000,
    ...state.pagination,
  }
  state.loading = true
  const fn = filtetOptions.type.find(item => item.value === form.value.type)!.fn
  fn(params)
    .then(res => {
      state.tableData = res.data.data || []
      state.total = res.data.total || 0
    })
    .finally(() => {
      state.loading = false
    })
}
onMounted(() => {
  getData()
})
</script>

<style lang="scss" scoped>
.cdn-content {
  .handle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .el-input {
      width: 280px;
    }

    div {
      display: flex;

      .refresh-btn {
        width: 34px;
        height: 34px;
        margin-left: 20px;
        border: 1px solid var(--tip-text);
        border-radius: 4px;

        svg {
          color: var(--sub-text);
        }
      }

      .refresh-btn:hover {
        border-color: var(--primary-color);

        svg {
          color: var(--primary-color);
        }
      }
    }
  }

  .status {
    width: 4px;
    height: 4px;
    margin-right: 4px;
    border-radius: 50%;
  }

  .el-icon {
    color: var(--el-color-primary);
    cursor: pointer;
  }

  .upload-box {
    height: 144px;
    padding: 16px;
    background-color: #feffff;
    border: 1px dashed #ddd;
    border-radius: 0;
    transition: all 0.2s;

    &:hover {
      border: 1px dashed var(--el-color-primary);
    }

    .text {
      color: #a6a7a7;
    }

    .file-detail {
      div {
        height: 16px;
        line-height: 16px;
      }
    }

    .file-tip {
      color: var(--sub-text);
    }

    .upload-button {
      display: none;
    }
  }
}

:deep(.el-table__expand-icon) {
  display: none;
}

:deep(.cdn-content-table) {
  thead,
  tbody {
    .el-table__cell {
      .cell {
        padding-left: 59px;
      }
    }
  }
}
</style>
