<template>
  <div class="ssl-details-table-v2">
    <div class="ssl-details-table-v2__toolbar">
      <el-select v-model="filterData.productType" class="ssl-details-table-v2__select" @change="getTableList">
        <el-option v-for="item in productTypeRadio" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>

    <TableV2
      v-loading="tableStore.loading"
      :data="tableStore.listData"
      :total="tableStore.total"
      :pagination="pagination"
      show-pagination
      empty-text="暂无数据"
      @update:pagination="handlePaginationChange"
    >
      <el-table-column prop="task_id" :label="t('ssl-certificate.management.details.391305-0')" min-width="190" />

      <el-table-column prop="product_type" :label="t('ssl-certificate.management.details.391305-1')" min-width="150">
        <template #default="{ row }">
          {{ ['-', t('ssl-certificate.management.config.844970-41')][row.product_type] || '-' }}
        </template>
      </el-table-column>

      <el-table-column prop="region" :label="t('ssl-certificate.management.details.391305-2')" min-width="150">
        <template #default> - </template>
      </el-table-column>

      <el-table-column prop="created_at" min-width="260">
        <template #header>
          <div class="ssl-details-table-v2__head">
            <span>{{ t('ssl-certificate.management.details.391305-3') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>

        <template #default="{ row }">
          {{ getDateDayjs(row.created_at * 1000, 'string', true) }}
        </template>
      </el-table-column>

      <el-table-column prop="updated_at" min-width="260">
        <template #header>
          <div class="ssl-details-table-v2__head">
            <span>{{ t('ssl-certificate.management.details.391305-4') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>

        <template #default="{ row }">
          {{ getDateDayjs(row.updated_at * 1000, 'string', true) }}
        </template>
      </el-table-column>

      <el-table-column prop="status" :label="t('ssl-certificate.management.details.391305-5')" min-width="140">
        <template #default="{ row }">
          <span :class="`ssl-details-table-v2__status is-${row.status}`">
            {{ statusMap[row.status] || '-' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" :label="t('ssl-certificate.management.details.391305-6')" min-width="160">
        <template #default="{ row }">
          <div class="ssl-details-table-v2__actions">
            <el-link type="primary" @click="handleOperate('status', row)">
              {{ t('ssl-certificate.management.details.391305-7') }}
            </el-link>
            <el-link type="primary" @click="handleOperate('delete', row)">
              {{ t('ssl-certificate.management.details.391305-8') }}
            </el-link>
          </div>
        </template>
      </el-table-column>
    </TableV2>
  </div>
</template>

<script setup lang="ts">
import { _deleteDeploy, _getDeployList } from '@/apis/ssl-certificate/management'
import type { DeployListResp } from '@/apis/ssl-certificate/management/type'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'
import { ElMessageBox } from 'element-plus'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const statusMap = [
  '-',
  t('ssl-certificate.management.details.391305-9'),
  t('ssl-certificate.management.details.391305-10'),
  t('ssl-certificate.management.details.391305-11'),
]

const productTypeRadio = [
  { label: t('ssl-certificate.management.details.391305-12'), value: 0 },
  { label: t('ssl-certificate.management.details.391305-13'), value: 1 },
]

interface TableDataType {
  listData?: DeployListResp['items']
  selectRow?: DeployListResp['items'][0]
  loading: boolean
  pagination: {
    page: number
    page_size: number
  }
  total: number
}

const props = defineProps<{
  id: string
}>()

const filterData = reactive({
  productType: 0,
})

const tableStore = reactive<TableDataType>({
  listData: [],
  loading: false,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})

const pagination = computed(() => ({
  page: tableStore.pagination.page,
  pageSize: tableStore.pagination.page_size,
}))

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  tableStore.pagination.page = page
  tableStore.pagination.page_size = pageSize
  getTableList()
}

const getTableList = async () => {
  if (!props.id) {
    message.error(t('ssl-certificate.management.details.391305-14'))
    return
  }

  try {
    tableStore.loading = true
    const { code, msg, data } = await _getDeployList({
      cert_id: props.id,
      product_type: filterData.productType,
      page: tableStore.pagination.page,
      limit: tableStore.pagination.page_size,
    })
    if (code === 200 && data) {
      tableStore.listData = data.items
      tableStore.total = data.total
    } else {
      message.error(msg || t('ssl-certificate.management.details.391305-15'))
    }
  } finally {
    tableStore.loading = false
  }
}

const deleteDeploy = async () => {
  ElMessageBox.confirm(
    t('ssl-certificate.management.details.391305-16'),
    t('ssl-certificate.management.details.391305-17'),
    {
      confirmButtonText: t('ssl-certificate.management.details.391305-18'),
      cancelButtonText: t('ssl-certificate.management.details.391305-19'),
      type: 'warning',
    },
  ).then(async () => {
    if (!tableStore.selectRow) {
      message.error(t('ssl-certificate.management.details.391305-20'))
      return
    }

    const { code, msg } = await _deleteDeploy({
      did: tableStore.selectRow.id,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.details.391305-21'))
      getTableList()
    } else {
      message.error(msg || t('ssl-certificate.management.details.391305-22'))
    }
  })
}

const handleOperate = (operate: string, row: DeployListResp['items'][0]) => {
  tableStore.selectRow = row
  switch (operate) {
    case 'delete':
      deleteDeploy()
      break
    case 'status':
      pushRoute({
        name: 'ssl_certificate_deploy_status',
        params: { id: row.task_id },
      })
      break
    default:
      break
  }
}

onMounted(() => {
  getTableList()
})
</script>

<style scoped lang="scss">
.ssl-details-table-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ssl-details-table-v2__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.ssl-details-table-v2__select {
  width: 160px;
}

.ssl-details-table-v2__head {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  :deep(svg) {
    width: 16px;
    height: 16px;
    color: #828b9c;
  }
}

.ssl-details-table-v2__status {
  &.is-3 {
    color: #01a66f;
  }

  &.is-2,
  &.is-1 {
    color: #ff7d00;
  }
}

.ssl-details-table-v2__actions {
  display: inline-flex;
  gap: 16px;
  align-items: center;
}
</style>
