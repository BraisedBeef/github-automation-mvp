<template>
  <div class="dns bgcf pd20">
    <div v-show="!logDetail.show" class="log-list">
      <div class="d-title">
        {{ t('domain.batch-operate.722959-0') }}
      </div>
      <CatCdnTable v-loading="log.loading" :max-height="tableMaxHeight" :data="log.tableData">
        <el-table-column prop="task_name" :label="t('domain.batch-operate.722959-1')" />
        <el-table-column prop="domain_nums" :label="t('domain.batch-operate.722959-2')" />
        <el-table-column prop="result" :label="t('domain.batch-operate.722959-3')">
          <template #default="{ row }">
            <span :class="'result c' + row.result">{{
              [
                '',
                t('domain.batch-operate.722959-4'),
                t('domain.batch-operate.722959-5'),
                t('domain.batch-operate.722959-6'),
                t('domain.batch-operate.722959-7'),
              ][row.result] || row.result
            }}</span>
          </template>
        </el-table-column>
        <!-- 提交时间 -->
        <el-table-column sortable prop="commit_time" :label="t('domain.batch-operate.722959-8')" width="220px">
          <template #header>
            <span>
              {{ t('domain.batch-operate.722959-8') }}
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon class="ml10" name="cat-cdn-help" />
              </el-tooltip>
            </span>
          </template>
          <template #default="{ row }">
            {{ row.commit_time ? maoYunDayJs(row.commit_time).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('domain.batch-operate.722959-9')" fixed="right">
          <template #default="{ row }">
            <el-link class="mr20" type="primary" @click="handleViewDetail(row)">
              {{ t('domain.batch-operate.722959-10') }}
            </el-link>
          </template>
        </el-table-column>
      </CatCdnTable>
      <CatPagination
        v-model:pagination="log.pagination"
        :total="log.pagination.total"
        :custom-keys="['page', 'limit']"
        @change="getData"
      />
    </div>
    <div v-if="logDetail.show" class="log-detail">
      <div class="df jsb d-title">
        <div class="df ac title" @click="backList">
          <el-icon color="#1890ff">
            <ArrowLeftBold />
          </el-icon>
          <h3>{{ t('domain.batch-operate.722959-11') }}</h3>
        </div>
        <el-button plain :icon="Download" @click="handleExport" />
      </div>
      <CatCdnTable v-loading="logDetail.loading" :max-height="tableMaxHeight" :data="logDetail.tableData">
        <el-table-column prop="task_name" :label="t('domain.batch-operate.722959-1')" />
        <el-table-column prop="domain" :label="t('domain.batch-operate.722959-12')" />
        <el-table-column sortable prop="commit_time" :label="t('domain.batch-operate.722959-13')" width="220px">
          <template #header>
            <span>
              {{ t('domain.batch-operate.722959-13') }}
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </span>
          </template>
          <template #default="{ row }">
            {{ row.commit_time ? maoYunDayJs(row.commit_time).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="result" :label="t('domain.batch-operate.722959-3')" fixed="right">
          <template #default="{ row }">
            <span :class="'result c' + row.result">{{
              [
                '',
                t('domain.batch-operate.722959-4'),
                t('domain.batch-operate.722959-5'),
                t('domain.batch-operate.722959-6'),
                t('domain.batch-operate.722959-7'),
              ][row.result] || row.result
            }}</span>
          </template>
        </el-table-column>
      </CatCdnTable>
      <!-- <CatPagination
        v-model:pagination="logDetail.pagination"
        :total="logDetail.pagination.total"
        @change="getData"
        :custom-keys="['page', 'limit']"
      /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { ElMessage } from 'element-plus'
import { ArrowLeftBold, Download } from '@element-plus/icons'
import { _getBatchOperationLogList, _getBatchOperationLogDetail, _exportBatchOperationLog } from '@/apis/domain'
import type { PageParams } from '@/views/domain/common'
import { download } from '@/utils/download'
import t from '@/utils/i18n'

const tableMaxHeight = ref(450)

interface TableDataType {
  id: string
  task_name: string
  domain_nums: number
  result: string
  commit_time: string
}
interface LogDataType {
  loading: boolean
  tableData: TableDataType[]
  selectChange?: TableDataType
  pagination: PageParams
}
type LogDetailDataType = {
  show: boolean
} & Omit<LogDataType, 'selectChange'>

const log = reactive<LogDataType>({
  loading: false,
  tableData: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
})
const getData = async () => {
  log.loading = true
  const res = await _getBatchOperationLogList({
    page: log.pagination.page,
    limit: log.pagination.limit,
  })
  if (res.code === 20000) {
    log.tableData = res.data.list
    log.pagination.total = res.data.total
  } else {
    ElMessage.error(res.message)
  }
  log.loading = false
}
const initTableHeight = () => {
  tableMaxHeight.value = window.innerHeight - 380
}
onMounted(() => {
  initTableHeight()
  getData()
})

// 查看详情
const logDetail = reactive<LogDetailDataType>({
  loading: false,
  tableData: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  show: false,
})
const handleViewDetail = async (row: TableDataType) => {
  log.selectChange = row
  logDetail.show = true
  logDetail.loading = true
  const res = await _getBatchOperationLogDetail({ id: row.id })
  if (res.code === 20000) {
    logDetail.tableData = res.data.List
    logDetail.pagination.total = res.data.total
  } else {
    ElMessage.error(res.message)
  }
  logDetail.loading = false
}
const backList = () => {
  logDetail.show = false
  logDetail.tableData = []
}
const handleExport = async () => {
  const res = await _exportBatchOperationLog({ id: log.selectChange!.id })
  if (res.code === 20000) {
    download(res.data.url, `${log.selectChange!.task_name}.xlsx`)
  } else {
    ElMessage.error(res.message)
  }
}
</script>

<style lang="scss" scoped>
@import '@/views/domain/config';

.result {
  position: relative;

  &::before {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 5px;
    margin-bottom: 2px;
    content: '';
    border-radius: 50%;
  }

  &.c1 {
    &::before {
      background-color: #0063ff;
    }
  }

  &.c2 {
    &::before {
      background-color: #fc8c00;
    }
  }

  &.c3 {
    &::before {
      background-color: #0fbe5b;
    }
  }

  &.c4 {
    &::before {
      background-color: #fe4d4f;
    }
  }
}

.log-detail {
  .d-title {
    .title {
      cursor: pointer;

      h3 {
        margin-left: 5px;
      }
    }
  }
}
</style>
