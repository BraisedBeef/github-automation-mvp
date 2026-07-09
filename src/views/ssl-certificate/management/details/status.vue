<template>
  <TipsBar class="mb20" :tips="t('ssl-certificate.management.details.728573-0')" />
  <el-card shadow="never" class="table-container">
    <div class="df ac jsb table-form-group mb20">
      <div class="btn-group">
        <el-button @click="handleBack">
          {{ t('ssl-certificate.management.details.728573-1') }}
        </el-button>
        <el-button type="primary" @click="handleRefresh">
          {{ t('ssl-certificate.management.details.728573-2') }}
        </el-button>
        <!-- <el-button @click="handleRetry">一键重试</el-button> -->
        <!-- <el-button @click="handleBack">一键回退</el-button> -->
      </div>
    </div>
    <div class="table-group">
      <el-table
        v-loading="tableData.loading"
        show-overflow-tooltip
        :data="tableData.listData"
        :max-height="tableData.height"
        @selection-change="tableSelect"
      >
        <el-table-column fixed="left" type="selection" />
        <el-table-column prop="domain" :label="t('ssl-certificate.management.details.728573-3')" width="300" />
        <el-table-column prop="cert_id" :label="t('ssl-certificate.management.details.728573-4')">
          <template #default="{ row }">
            {{ row.cert_id || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" :label="t('ssl-certificate.management.details.728573-5')" width="220">
          <template #header>
            <span class="mr10">{{ t('ssl-certificate.management.details.728573-5') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </template>
          <template #default="{ row }">
            {{ getDateDayjs(row.updatedAt * 1000, 'string', true) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('ssl-certificate.management.details.728573-6')">
          <template #default="{ row }">
            {{ statusMap[row.status] || '-' }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="t('ssl-certificate.management.details.728573-7')">
          <template #default="{ row }">
            <el-link type="primary" class="mr10" @click="handleOperate('refresh', row)">
              {{ t('ssl-certificate.management.details.728573-8') }}
            </el-link>
          </template>
        </el-table-column>
      </el-table>
      <CatPagination
        v-model:pagination="tableData.pagination"
        :total="tableData.total"
        :custom-keys="['page', 'page_size']"
        @change="getTableList"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _getDeployDetail } from '@/apis/ssl-certificate/management'
import { message } from '@/utils/message'
import TipsBar from '@/views/ssl-certificate/management/components/tips-bar.vue'
import { getDateDayjs } from '@/utils/format-time'
import { backRoute } from '@/utils/router-jump'

interface TableDataType {
  loading: boolean
  height: number
  pagination: {
    page: number
    page_size: number
  }
  total: number
  [k: string]: any
}

const statusMap = [
  '-',
  t('ssl-certificate.management.details.728573-9'),
  t('ssl-certificate.management.details.728573-10'),
  t('ssl-certificate.management.details.728573-11'),
]

const router = useRouter()

const props = defineProps({
  id: String,
})

/// 表格
const tableData = reactive<TableDataType>({
  listData: [],
  selectListData: [],
  selectRow: {},
  loading: false,
  height: 450,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})
const tableSelect = rows => {
  tableData.selectListData = rows
}
const getTableList = async () => {
  // 获取部署明细
  if (!props.id) {
    message.error('error')
    return
  }
  try {
    tableData.loading = true
    const { code, msg, data } = await _getDeployDetail({
      task_id: props.id,
    })
    if (code === 200 && data) {
      tableData.listData = data.items
      tableData.total = data.total
    } else {
      message.error(msg || t('ssl-certificate.management.details.728573-12'))
    }
  } finally {
    tableData.loading = false
  }
}

// 操作
const handleOperate = (operate: string, row) => {
  tableData.selectRow = row
  switch (operate) {
    case 'refresh':
      handleRefresh()
      break
  }
}

const handleRefresh = () => {
  getTableList()
}

const handleRetry = () => {
  // TODO: 一键重试
  console.log('CRSTable handleRetry')
}

const handleBack = () => {
  backRoute()
}

onMounted(() => {
  tableData.height = document.documentElement.clientHeight - 400
  getTableList()
})
</script>

<style lang="scss" scoped></style>
