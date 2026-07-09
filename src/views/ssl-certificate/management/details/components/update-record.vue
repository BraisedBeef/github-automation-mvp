<template>
  <el-button type="primary" @click="updateCertificate">
    {{ t('ssl-certificate.management.details.833446-0') }}
  </el-button>
  <CatCdnTable v-loading="tableData.loading" :data="tableData.listData" :max-height="tableData.height">
    <el-table-column prop="task_id" :label="t('ssl-certificate.management.details.833446-1')" />
    <el-table-column prop="new_cert_id" :label="t('ssl-certificate.management.details.833446-2')" />
    <el-table-column prop="old_cert_id" :label="t('ssl-certificate.management.details.833446-3')">
      <template #default="{ row }">
        {{ row.old_cert_id || '-' }}
      </template>
    </el-table-column>
    <el-table-column prop="updated_at" :label="t('ssl-certificate.management.details.833446-4')" width="220">
      <template #header>
        <span class="mr10">{{ t('ssl-certificate.management.details.833446-4') }}</span>
        <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
          <SvgIcon name="cat-cdn-help" />
        </el-tooltip>
      </template>
      <template #default="{ row }">
        {{ getDateDayjs(row.updated_at * 1000, 'string', true) }}
      </template>
    </el-table-column>
    <el-table-column prop="status" :label="t('ssl-certificate.management.details.833446-5')">
      <template #default="{ row }">
        {{
          [
            '-',
            t('ssl-certificate.management.details.833446-6'),
            t('ssl-certificate.management.details.833446-7'),
            t('ssl-certificate.management.details.833446-8'),
          ][row.status] || '-'
        }}
      </template>
    </el-table-column>
    <el-table-column fixed="right" :label="t('ssl-certificate.management.details.833446-9')">
      <template #default="{ row }">
        <el-link type="primary" class="mr10" @click="handleOperate('delete', row)">
          {{ t('ssl-certificate.management.details.833446-10') }}
        </el-link>
      </template>
    </el-table-column>
  </CatCdnTable>
  <CatPagination
    v-model:pagination="tableData.pagination"
    :total="tableData.total"
    :custom-keys="['page', 'page_size']"
    @change="getTableList"
  />
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _getUpdateList } from '@/apis/ssl-certificate/management'
import type { UpdateListResp } from '@/apis/ssl-certificate/management/type'
import { getDateDayjs } from '@/utils/format-time'
import { pushRoute } from '@/utils/router-jump'

//~~~~ types
interface TableDataType {
  listData: UpdateListResp['items']
  selectListData: UpdateListResp['items']
  selectRow?: UpdateListResp['items'][0]
  loading: boolean
  height: number
  pagination: {
    page: number
    page_size: number
  }
  total: number
}
///~

const router = useRouter()
const route = useRoute()
const query = route.query as unknown as { cert_id?: string; id?: string; domain?: string }
/// 证书id
const props = defineProps({
  id: String,
})

const updateCertificate = () => {
  // 更新证书
  console.log('updateCertificate', props.id)
  pushRoute({ name: 'ssl_certificate_update', params: { id: props.id } })
  pushRoute({
    name: 'ssl_certificate_update',
    params: {
      id: props.id,
    },
    query: query,
  })
}
/// 表格
const tableData = reactive<TableDataType>({
  listData: [],
  selectListData: [],
  selectRow: undefined,
  loading: false,
  height: 450,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})
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
// 操作
const handleOperate = (operate: string, row) => {
  tableData.selectRow = row
  console.log('handleOperate', operate, row)
}
onMounted(() => {
  tableData.height = document.documentElement.clientHeight - 400
  getTableList()
})
</script>

<style lang="scss" scoped></style>
