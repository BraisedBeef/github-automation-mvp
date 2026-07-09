<template>
  <el-select v-model="filterData.productType" style="width: 160px" @change="getTableList">
    <el-option v-for="item in productTypeRadio" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
  <CatCdnTable
    v-loading="tableStore.loading"
    show-overflow-tooltip
    :data="tableStore.listData"
    :max-height="tableStore.height"
  >
    <el-table-column prop="task_id" :label="t('ssl-certificate.management.details.391305-0')" />
    <el-table-column prop="product_type" :label="t('ssl-certificate.management.details.391305-1')">
      <template #default="{ row }">
        {{ ['-', t('ssl-certificate.management.config.844970-41')][row.product_type] || '-' }}
      </template>
    </el-table-column>
    <el-table-column prop="" :label="t('ssl-certificate.management.details.391305-2')"> - </el-table-column>
    <el-table-column prop="created_at" :label="t('ssl-certificate.management.details.391305-3')" width="220">
      <template #header>
        <span class="mr10">{{ t('ssl-certificate.management.details.391305-3') }}</span>
        <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
          <SvgIcon name="cat-cdn-help" />
        </el-tooltip>
      </template>
      <template #default="{ row }">
        {{ getDateDayjs(row.created_at * 1000, 'string', true) }}
      </template>
    </el-table-column>
    <el-table-column prop="updated_at" :label="t('ssl-certificate.management.details.391305-4')" width="220">
      <template #header>
        <span class="mr10">{{ t('ssl-certificate.management.details.391305-4') }}</span>
        <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
          <SvgIcon name="cat-cdn-help" />
        </el-tooltip> </template
      ><template #default="{ row }">
        {{ getDateDayjs(row.updated_at * 1000, 'string', true) }}
      </template>
    </el-table-column>
    <el-table-column prop="status" :label="t('ssl-certificate.management.details.391305-5')">
      <template #default="{ row }">
        {{ statusMap[row.status] || '-' }}
      </template>
    </el-table-column>
    <el-table-column fixed="right" :label="t('ssl-certificate.management.details.391305-6')">
      <template #default="{ row }">
        <el-link type="primary" class="mr10" @click="handleOperate('status', row)">
          {{ t('ssl-certificate.management.details.391305-7') }}
        </el-link>
        <el-link type="primary" class="mr10" @click="handleOperate('delete', row)">
          {{ t('ssl-certificate.management.details.391305-8') }}
        </el-link>
      </template>
    </el-table-column>
  </CatCdnTable>
  <CatPagination
    v-model:pagination="tableStore.pagination"
    :total="tableStore.total"
    :custom-keys="['page', 'page_size']"
    @change="getTableList"
  />
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { ElMessageBox } from 'element-plus/es'
import { _deleteDeploy, _getDeployList } from '@/apis/ssl-certificate/management'
import { DeployListResp } from '@/apis/ssl-certificate/management/type'
import { message } from '@/utils/message'
import { getDateDayjs } from '@/utils/format-time'
import { filterArray } from '@/utils/filter'
import { deploy_type_map } from '../../config'
import { pushRoute } from '@/utils/router-jump'

const statusMap = [
  '-',
  t('ssl-certificate.management.details.391305-9'),
  t('ssl-certificate.management.details.391305-10'),
  t('ssl-certificate.management.details.391305-11'),
]

const router = useRouter()

//~~~~ config
// 产品类型Radio
const productTypeRadio = [
  { label: t('ssl-certificate.management.details.391305-12'), value: 0 },
  { label: t('ssl-certificate.management.details.391305-13'), value: 1 },
]
////~

//~~~~ types
interface TableDataType {
  listData?: DeployListResp['items']
  selectListData?: DeployListResp['items']
  selectRow?: DeployListResp['items'][0]
  loading: boolean
  height: number
  pagination: {
    page: number
    page_size: number
  }
  total: number
  // [k: string]: any
}
///~

/// 证书id
const props = defineProps({
  id: String,
})

/// 表格筛选
const filterData = reactive({
  productType: 0,
})
/// 表格
const tableStore = reactive<TableDataType>({
  listData: [],
  selectListData: [],
  loading: false,
  height: 450,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})
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

// 操作
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
  tableStore.height = document.documentElement.clientHeight - 400
  getTableList()
})
</script>

<style lang="scss" scoped></style>
