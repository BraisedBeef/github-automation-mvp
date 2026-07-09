<template>
  <div class="cost-export-v2">
    <PageBreadcrumbToolbar :items="[t('costCenterRoutes.export')]" @doc="openHelpDoc" />

    <section class="cost-export-v2__panel">
      <div class="cost-export-v2__toolbar">
        <el-select
          v-model="select.type"
          class="cost-export-v2__select"
          :teleported="true"
          :placeholder="t('export.all')"
          value-key="value"
          @change="handleTypeChange"
        >
          <el-option v-for="item in select.options" :key="item.value" :value="item" :label="item.label" />
        </el-select>
      </div>

      <TableV2
        v-loading="loading"
        :data="tableData.list"
        :total="paginationConfig.total"
        :pagination="pagination"
        show-pagination
        @update:pagination="handlePaginationChange"
      >
        <el-table-column min-width="180" prop="fileType" :label="t('export.fileType')">
          <template #default="{ row }">
            <span class="cost-export-v2__primary-text">
              {{ select.options.find(i => i.value === row.fileType)?.label }}
            </span>
          </template>
        </el-table-column>

        <el-table-column min-width="300" prop="fileName" :label="t('export.fileName')" />

        <el-table-column min-width="180" prop="status" :label="t('export.status')">
          <template #default="{ row }">
            <StatusColumn :row="row" />
          </template>
        </el-table-column>

        <el-table-column min-width="210" prop="fileTime">
          <template #header>
            <div class="cost-export-v2__th-with-icon">
              <span>{{ t('export.fileTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="cost-export-v2__help-icon" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <span v-if="row.status === 0" class="cost-export-v2__primary-text">
              {{ t('export.fileGenerating') }}
            </span>
            <span v-if="row.status === 1">
              {{ row.fileTime ? maoYunDayJs(row.fileTime).format(FORMAT_TIME) : '-' }}
            </span>
            <span v-if="row.status === 2">-</span>
          </template>
        </el-table-column>

        <el-table-column min-width="210" prop="lastDownloadTime">
          <template #header>
            <div class="cost-export-v2__th-with-icon">
              <span>{{ t('export.lastDownloadTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="cost-export-v2__help-icon" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <span>{{ row.exportTime ? maoYunDayJs(row.exportTime).format(FORMAT_TIME) : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="120" fixed="right" :label="t('common.operation')">
          <template #default="{ row }">
            <button
              class="cost-export-v2__action"
              :class="{ 'is-disabled': row.status !== 1 }"
              type="button"
              @click="download(row)"
            >
              {{ t('export.download') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { _generatePage, _getPath } from '@/apis/cost-center/export'
import { message } from '@/utils/message'
import { usePermission } from '@/hooks/permission/use-permission'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import StatusColumn from '@/views/cost-center/export/components/status-column.vue'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

type GeneratePageType = {
  createTime: string
  downloadUrl: string
  fileName: string
  filePath: string
  fileTime: string
  fileType: number
  id: number
  parentId: number
  status: number
  exportTime?: string
}

const generateGetPathPermission = usePermission('feeApi:generateGetPath')

const route = useRoute()
const timeId = ref<any>(null)
const loading = ref(false)
const select = reactive<{
  options: Array<{ value: number; label: string }>
  type: { value: number; label: string }
}>({
  type: {
    value: 0,
    label: t('export.all'),
  },
  options: [
    {
      value: 0,
      label: t('export.all'),
    },
    {
      value: 1,
      label: t('export.fileType0'),
    },
    {
      value: 2,
      label: t('export.fileType1'),
    },
    {
      value: 3,
      label: t('export.fileType2'),
    },
    {
      value: 4,
      label: t('export.fileType3'),
    },
    {
      value: 5,
      label: t('export.fileType4'),
    },
    {
      value: 6,
      label: t('export.fileType5'),
    },
    {
      value: 7,
      label: t('export.fileType6'),
    },
  ],
})

const tableData = reactive<{
  list: GeneratePageType[]
}>({
  list: [],
})

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const pagination = computed(() => ({
  page: paginationConfig.pagination.page,
  pageSize: paginationConfig.pagination.pageSize,
}))

const download = (row: GeneratePageType) => {
  if (!generateGetPathPermission.checkPermissionRes) {
    generateGetPathPermission.dialog({
      show: true,
      i18nKey: 'export.downloadPerm',
    })
    return
  }

  if (row.status === 1) {
    getPath(row.id)
  } else {
    message.warning(t('export.downloadFail'))
  }
}

const getList = async () => {
  try {
    if (!timeId.value) {
      loading.value = true
    }

    const params = {
      fileType: select.type.value as number,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    }

    const res = await _generatePage(params)

    if (res.success) {
      tableData.list = res.data.list || []
      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const getPath = async (id: number) => {
  const res = await _getPath({
    id,
  })

  if (res.success) {
    const url = res.data

    if (url) {
      window.open(url)
      getList()
    } else {
      message.warning(t('export.downloadFail'))
    }
  }
}

const handleTypeChange = () => {
  paginationConfig.pagination.page = 1
  getList()
}

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  paginationConfig.pagination.page = page
  paginationConfig.pagination.pageSize = pageSize
  getList()
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

onMounted(() => {
  const type = route.query.type

  if (type) {
    select.type = select.options.find(el => el.value === Number(type)) || select.options[0]
  }

  timeId.value = setInterval(() => {
    getList()
  }, 3 * 1000)

  getList()
})

onBeforeUnmount(() => {
  clearInterval(timeId.value)
})
</script>

<style scoped lang="scss">
.cost-export-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cost-export-v2__panel {
  padding: 20px;
  background: #fff;
}

.cost-export-v2__toolbar {
  margin-bottom: 20px;
}

.cost-export-v2__select {
  width: 140px;
}

.cost-export-v2__th-with-icon {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.cost-export-v2__help-icon {
  color: #b7c0cd;
}

.cost-export-v2__primary-text {
  color: #06f;
}

.cost-export-v2__action {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;

  &.is-disabled {
    color: #b7c0cd;
    cursor: not-allowed;
  }
}
</style>
