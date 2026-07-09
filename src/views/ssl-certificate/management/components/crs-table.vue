<template>
  <CatCdnTable
    v-loading="tableData.loading"
    :data="tableData.listData"
    show-overflow-tooltip
    @selection-change="tableSelect"
  >
    <!-- <el-table-column fixed="left" type="selection" /> -->
    <el-table-column prop="csr_id" :label="t('ssl-certificate.management.index.611178-0')" width="200">
      <template #default="{ row }">
        <div class="cert-info mt10 mb10">
          <Copy class="id" :text="row.csr_id">
            <span @click="handleOperate('detail', row)">{{ row.csr_id }}</span>
          </Copy>
          <div class="remark df ac">
            <P class="text">
              {{ row.remark || 'undefined' }}
            </P>
            <SvgIcon name="cat-cdn-edit" class="pointer ml4 copy-icon" @click="updateCertRemark(row)" />
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="common_name" :label="t('ssl-certificate.management.index.611178-1')">
      <template #default="{ row }">
        <Copy v-if="row.common_name" :text="row.common_name">
          {{ row.common_name }}
        </Copy>
      </template>
    </el-table-column>
    <el-table-column prop="encryption" :label="t('ssl-certificate.management.index.611178-2')" width="120">
      <template #default="{ row }">
        {{ filterArray(ENCRYPTION_MAP, 'value', row.encryption)?.label }}
      </template>
    </el-table-column>
    <el-table-column prop="created_at" :label="t('ssl-certificate.management.index.611178-3')" min-width="220">
      <template #header>
        <div class="df ac">
          <span class="mr4">{{ t('ssl-certificate.management.index.611178-3') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" />
          </el-tooltip>
        </div>
      </template>
      <template #default="{ row }">
        {{ _formateTimeDayjs(row.created_at * 1000, FORMAT_TIME) }}
      </template>
    </el-table-column>
    <el-table-column fixed="right" :label="t('ssl-certificate.management.index.611178-4')" width="220">
      <template #default="{ row }">
        <el-tooltip
          effect="light"
          :disabled="row.is_delete !== 2"
          :content="t('ssl-certificate.management.index.611178-5')"
          placement="top"
        >
          <el-link :disabled="row.is_delete == 2" type="primary" class="mr10" @click="handleOperate('delete', row)">
            {{ t('ssl-certificate.management.index.611178-6') }}
          </el-link>
        </el-tooltip>
        <el-link type="primary" class="mr10" @click="handleOperate('detail', row)">
          {{ t('ssl-certificate.management.index.611178-7') }}
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
  <!-- 删除弹窗 -->
  <el-dialog
    v-model="deleteDialog.visible"
    :title="t('ssl-certificate.management.index.611178-8')"
    width="500"
    class="delete-dialog"
  >
    <span class="tip-text">{{ t('ssl-certificate.management.index.611178-9') }}</span>
    <div class="df warning-card">
      <SvgIcon class="icon" name="cat-cdn-tip" color="#0063ff" />
      <p class="warning-text">
        {{ t('ssl-certificate.management.index.611178-10') }}
      </p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="danger" :loading="deleteDialog.loading" @click="handleDelete">
          {{ t('ssl-certificate.management.index.611178-11') }}
        </el-button>
        <el-button :disabled="deleteDialog.loading" @click="deleteDialog.visible = false">
          {{ t('ssl-certificate.management.index.611178-12') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-drawer
    v-model="drawer.show"
    :title="t('ssl-certificate.management.index.611178-13')"
    size="50%"
    class="csr-drawer"
    modal-class="detail-modal"
  >
    <template #header="{ titleId, titleClass }">
      <p :id="titleId" :class="titleClass" class="title">
        {{ t('ssl-certificate.management.index.611178-13') }}
      </p>
    </template>
    <div v-loading="drawer.loading">
      <CatKVList style="margin-bottom: 40px" width="50%">
        <CatKVItem :label="t('ssl-certificate.management.index.611178-0')">
          {{ drawer.data?.remark || 'undefined' }}
          <SvgIcon name="cat-cdn-edit" class="pointer ml4 copy-icon" @click="updateCertRemark(drawer.data!)" />
        </CatKVItem>
        <CatKVItem :label="t('ssl-certificate.management.index.611178-3')">
          {{ drawer.data?.created_at ? _formateTimeDayjs(drawer.data.created_at * 1000, FORMAT_TIME) : '' }}
        </CatKVItem>
        <CatKVItem :label="t('ssl-certificate.management.index.611178-14')">
          <EllipsisTooltip :text="drawer.data?.common_name || '-'" max-width="200px" />
        </CatKVItem>
        <CatKVItem :label="t('ssl-certificate.management.index.611178-15')">
          {{ drawer.data?.email || '-' }}
        </CatKVItem>
        <CatKVItem :label="t('ssl-certificate.management.index.611178-16')">
          <MoreInfoDialog
            :title="t('ssl-certificate.management.index.611178-16')"
            :text="drawer.data?.subject_alt_names.length || 0"
          >
            <p v-for="item in drawer.data?.subject_alt_names" :key="item">
              {{ item }}
            </p>
          </MoreInfoDialog>
        </CatKVItem>
        <CatKVItem :label="t('ssl-certificate.management.index.611178-17')">
          {{ drawer.data?.company || '-' }}
        </CatKVItem>
        <CatKVItem :label="t('ssl-certificate.management.index.611178-2')">
          {{ filterArray(ENCRYPTION_MAP, 'value', drawer.data?.encryption)?.label || '-' }}
        </CatKVItem>
        <CatKVItem :label="t('ssl-certificate.management.index.611178-18')">
          {{ drawer.data?.department || '-' }}
        </CatKVItem>
        <CatKVItem :label="t('ssl-certificate.management.index.611178-19')">
          {{ filterArray(KEY_LENGTH_MAP, 'encryption', drawer.data?.key_size)?.label || '-' }}
        </CatKVItem>
        <CatKVItem :label="t('ssl-certificate.management.index.611178-20')"> - </CatKVItem>
      </CatKVList>
      <div class="csr-group">
        <span class="type">{{ t('ssl-certificate.management.index.611178-21') }}</span>
        <el-card class="detail-card" body-class="detail-card-body" shadow="never">
          <div class="text line-break">
            {{ drawer.data?.csr }}
          </div>
          <SvgIcon
            class="pointer copy-vertical"
            color="#999999"
            name="dns-copy"
            @click="handleCopy(drawer.data?.csr)"
          />
        </el-card>
      </div>
      <div class="key-group">
        <span class="type">{{ t('ssl-certificate.management.index.611178-22') }}</span>
        <el-card class="detail-card" body-class="detail-card-body" shadow="never">
          <div class="text line-break">
            {{ drawer.data?.private_key }}
          </div>
          <SvgIcon
            class="pointer copy-vertical"
            color="#999999"
            name="dns-copy"
            @click="handleCopy(drawer.data?.private_key)"
          />
        </el-card>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import MoreInfoDialog from './more-info-dialog.vue'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'
import t from '@/utils/i18n'
import { _formateTimeDayjs } from '@/utils/format-time'
import { handleCopyValue } from '@/utils/dom-utils'
import { message } from '@/utils/message'
import { _getCsrList, _deleteCsr, _getCsrDetail, _updateCsrBase } from '@/apis/ssl-certificate/management'
import type { ListCSRResp, CSRDetailResp } from '@/apis/ssl-certificate/management/type'
import { CatKVList, CatKVItem } from '@/components/common/cat-kv-list'
import { filterArray } from '@/utils/filter'
import { ENCRYPTION_MAP, KEY_LENGTH_MAP } from '../../config'
import Copy from './copy.vue'
import { FORMAT_TIME } from '@/utils/mao-yun-day-js'

interface TableDataType {
  listData: ListCSRResp['items']
  selectListData: ListCSRResp['items']
  selectRow?: ListCSRResp['items'][0]
  loading: boolean
  height: number
  pagination: {
    page: number
    page_size: number
  }
  total: number
}

const props = defineProps({
  tableForm: {
    type: Object,
    required: true,
  },
})

/// 表格
const tableData = reactive<TableDataType>({
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
const tableSelect = (rows: ListCSRResp['items']) => {
  tableData.selectListData = rows
}
const getTableList = async () => {
  tableData.loading = true
  try {
    const { code, msg, data } = await _getCsrList({
      domain: props.tableForm.domain,
      csr_name: props.tableForm.csr_name,
      page: tableData.pagination.page,
      page_size: tableData.pagination.page_size,
    })
    if (code === 200 && data) {
      tableData.listData = data.items
      tableData.total = data.total
    } else {
      message.error(msg)
    }
  } finally {
    tableData.loading = false
  }
}

/// 弹窗
const deleteDialog = reactive({
  visible: false,
  loading: false,
})
const handleDelete = async () => {
  if (!tableData.selectRow) {
    message.error(t('ssl-certificate.management.index.611178-23'))
    return
  }
  deleteDialog.loading = true
  try {
    const { code, msg } = await _deleteCsr({
      csr_id: tableData.selectRow.csr_id,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.index.611178-24'))
      deleteDialog.visible = false
      getTableList()
      // 删除tableData.listData里的当前行
      // tableData.listData = tableData.listData.filter((item) => item.csr_id !== tableData.selectRow!.csr_id)
    } else {
      message.error(msg)
    }
  } finally {
    deleteDialog.loading = false
  }
}
// 详情
const drawer = reactive<{
  show: boolean
  loading: boolean
  data?: CSRDetailResp
}>({
  show: false,
  loading: false,
})
const handleCopy = async (v?: string) => {
  if (!v) return
  await handleCopyValue(v)
  message.success(t('ssl-certificate.management.index.611178-25'))
}

const updateCertRemark = async (row: ListCSRResp['items'][0] | CSRDetailResp) => {
  // 修改备注
  ElMessageBox.prompt(t('ssl-certificate.management.index.611178-26'), t('ssl-certificate.management.index.611178-8'), {
    confirmButtonText: t('ssl-certificate.management.index.611178-27'),
    inputPattern: /^.+$/,
    inputErrorMessage: t('ssl-certificate.management.index.611178-28'),
    // inputValue: row.remark,
  }).then(async ({ value }) => {
    const { code, msg } = await _updateCsrBase({
      csr_id: row.csr_id,
      remark: value,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.index.611178-29'))
      row.remark = value
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.611178-30'))
    }
  })
}
// 操作
const handleOperate = async (operate: string, row: ListCSRResp['items'][0]) => {
  tableData.selectRow = row
  if (operate === 'delete') {
    deleteDialog.visible = true
    return
  }
  if (operate === 'detail') {
    try {
      drawer.data = undefined
      drawer.show = true
      drawer.loading = true
      const { code, msg, data } = await _getCsrDetail({ csr_id: row.csr_id })
      if (code === 200 && data) {
        drawer.data = data
      } else {
        message.error(msg || t('ssl-certificate.management.index.611178-31'))
      }
    } finally {
      drawer.loading = false
    }
    return
  }
}
onMounted(() => {
  getTableList()
})

// 导出
defineExpose({
  getTableList,
})
</script>

<style lang="scss">
.id {
  color: #0063ff;
  cursor: pointer;
}

.delete-dialog {
  .tip-text {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #000;
  }

  .warning-card {
    display: flex;
    padding: 7px 12px;
    margin-top: 16px;
    background: #e3edff;

    .icon {
      margin-top: 2px;
      margin-right: 8px;
      color: #0063ff;
    }

    .warning-text {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #0063ff;
    }
  }

  .dialog-footer {
    text-align: center;
  }
}

.detail-modal {
  background-color: rgb(0 0 0 / 10%);
}

.key-group {
  margin-top: 60px;
}

.csr-group,
.key-group {
  .type {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #000;
  }

  .detail-card {
    margin-top: 20px;
    background-color: #f9fafc;

    .detail-card-body {
      display: flex;
      align-items: end;
    }
  }
}

.csr-drawer {
  .title {
    font-weight: bold;
    color: #000;
  }

  .el-drawer__header {
    padding: 20px 40px 20px 20px;
    margin-bottom: 0;
    border-bottom: 1px solid #e8e8e8;
  }

  .text {
    width: 100%;
  }
}
</style>
