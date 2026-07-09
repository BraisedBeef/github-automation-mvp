<template>
  <div class="ssl-details-table-v2">
    <div class="ssl-details-table-v2__toolbar">
      <el-button type="primary" @click="updateCertificate">
        {{ t('ssl-certificate.management.details.833446-0') }}
      </el-button>
    </div>

    <TableV2
      v-loading="tableData.loading"
      :data="tableData.listData"
      :total="tableData.total"
      :pagination="pagination"
      show-pagination
      empty-text="暂无数据"
      @update:pagination="handlePaginationChange"
    >
      <el-table-column prop="task_id" :label="t('ssl-certificate.management.details.833446-1')" min-width="180" />

      <el-table-column prop="new_cert_id" :label="t('ssl-certificate.management.details.833446-2')" min-width="180" />

      <el-table-column prop="old_cert_id" :label="t('ssl-certificate.management.details.833446-3')" min-width="180">
        <template #default="{ row }">
          {{ row.old_cert_id || '-' }}
        </template>
      </el-table-column>

      <el-table-column prop="updated_at" min-width="260">
        <template #header>
          <div class="ssl-details-table-v2__head">
            <span>{{ t('ssl-certificate.management.details.833446-4') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>

        <template #default="{ row }">
          {{ getDateDayjs(row.updated_at * 1000, 'string', true) }}
        </template>
      </el-table-column>

      <el-table-column prop="status" :label="t('ssl-certificate.management.details.833446-5')" min-width="140">
        <template #default="{ row }">
          <span :class="`ssl-details-table-v2__status is-${row.status}`">
            {{
              [
                '-',
                t('ssl-certificate.management.details.833446-6'),
                t('ssl-certificate.management.details.833446-7'),
                t('ssl-certificate.management.details.833446-8'),
              ][row.status] || '-'
            }}
          </span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" :label="t('ssl-certificate.management.details.833446-9')" min-width="120">
        <template #default="{ row }">
          <el-link type="primary" @click="handleOperate('delete', row)">
            {{ t('ssl-certificate.management.details.833446-10') }}
          </el-link>
        </template>
      </el-table-column>
    </TableV2>
  </div>
</template>

<script setup lang="ts">
import { _getUpdateList } from '@/apis/ssl-certificate/management'
import type { UpdateListResp } from '@/apis/ssl-certificate/management/type'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

interface TableDataType {
  listData: UpdateListResp['items']
  selectRow?: UpdateListResp['items'][0]
  loading: boolean
  pagination: {
    page: number
    page_size: number
  }
  total: number
}

const route = useRoute()
const query = route.query as unknown as { cert_id?: string; id?: string; domain?: string }

const props = defineProps<{
  id: string
}>()

const updateCertificate = () => {
  console.log('updateCertificate', props.id)
  pushRoute({ name: 'ssl_certificate_update', params: { id: props.id } })
  pushRoute({
    name: 'ssl_certificate_update',
    params: {
      id: props.id,
    },
    query,
  })
}

const tableData = reactive<TableDataType>({
  listData: [],
  selectRow: undefined,
  loading: false,
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

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  tableData.pagination.page = page
  tableData.pagination.page_size = pageSize
  getTableList()
}

const getTableList = async () => {
  if (!query.cert_id) {
    message.error('error')
    return
  }

  try {
    tableData.loading = true
    const { code, msg, data } = await _getUpdateList({
      cert_id: query.cert_id,
      page: tableData.pagination.page,
      limit: tableData.pagination.page_size,
    })
    if (code === 200 && data) {
      tableData.listData = data.items
      tableData.total = data.total
    } else {
      message.error(msg || t('ssl-certificate.management.details.833446-11'))
    }
  } finally {
    tableData.loading = false
  }
}

const handleOperate = (operate: string, row: UpdateListResp['items'][0]) => {
  tableData.selectRow = row
  console.log('handleOperate', operate, row)
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
}
</style>
