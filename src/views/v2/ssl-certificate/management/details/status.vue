<template>
  <section class="ssl-deploy-status-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" :show-doc="false" />

    <InfoNotice class="ssl-deploy-status-v2__notice">
      {{ t('ssl-certificate.management.details.728573-0') }}
    </InfoNotice>

    <section class="ssl-deploy-status-v2__panel">
      <div class="ssl-deploy-status-v2__toolbar">
        <div class="ssl-deploy-status-v2__actions">
          <el-button @click="handleBack">
            {{ t('ssl-certificate.management.details.728573-1') }}
          </el-button>
          <el-button type="primary" @click="handleRefresh">
            {{ t('ssl-certificate.management.details.728573-2') }}
          </el-button>
        </div>
      </div>

      <TableV2
        v-loading="tableData.loading"
        :data="tableData.listData"
        :total="tableData.total"
        :pagination="pagination"
        show-pagination
        empty-text="暂无数据"
        :max-height="tableData.height"
        @selection-change="tableSelect"
        @update:pagination="handlePaginationChange"
      >
        <el-table-column fixed="left" type="selection" width="56" />

        <el-table-column prop="domain" :label="t('ssl-certificate.management.details.728573-3')" min-width="260" />

        <el-table-column prop="cert_id" :label="t('ssl-certificate.management.details.728573-4')" min-width="260">
          <template #default="{ row }">
            {{ row.cert_id || '-' }}
          </template>
        </el-table-column>

        <el-table-column min-width="260">
          <template #header>
            <div class="ssl-deploy-status-v2__head">
              <span>{{ t('ssl-certificate.management.details.728573-5') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>

          <template #default="{ row }">
            {{ getDateDayjs(row.updatedAt * 1000, 'string', true) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" :label="t('ssl-certificate.management.details.728573-6')" min-width="160">
          <template #default="{ row }">
            <span :class="`ssl-deploy-status-v2__status is-${row.status}`">
              {{ statusMap[row.status] || '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" :label="t('ssl-certificate.management.details.728573-7')" min-width="160">
          <template #default="{ row }">
            <el-link type="primary" @click="handleOperate('refresh', row)">
              {{ t('ssl-certificate.management.details.728573-8') }}
            </el-link>
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </section>
</template>

<script setup lang="ts">
import { _getDeployDetail } from '@/apis/ssl-certificate/management'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { getDateDayjs } from '@/utils/format-time'
import { backRoute } from '@/utils/router-jump'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import SvgIcon from '@/components/common/svg-icon/index.vue'

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

const props = defineProps<{
  id: string
}>()

const breadcrumbItems = computed(() => [props.id])

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

const pagination = computed(() => ({
  page: tableData.pagination.page,
  pageSize: tableData.pagination.page_size,
}))

const tableSelect = rows => {
  tableData.selectListData = rows
}

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  tableData.pagination.page = page
  tableData.pagination.page_size = pageSize
  getTableList()
}

const getTableList = async () => {
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

const handleBack = () => {
  backRoute()
}

onMounted(() => {
  tableData.height = document.documentElement.clientHeight - 400
  getTableList()
})
</script>

<style scoped lang="scss">
.ssl-deploy-status-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.ssl-deploy-status-v2__notice {
  :deep(.v2-info-notice__text) {
    font-size: 14px;
    line-height: 22px;
  }
}

.ssl-deploy-status-v2__panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  padding: 24px;
  background: #fff;
}

.ssl-deploy-status-v2__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ssl-deploy-status-v2__actions {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.ssl-deploy-status-v2__head {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  :deep(svg) {
    width: 16px;
    height: 16px;
    color: #828b9c;
  }
}

.ssl-deploy-status-v2__status {
  &.is-1,
  &.is-2 {
    color: #ff7d00;
  }

  &.is-3 {
    color: #01a66f;
  }
}
</style>
