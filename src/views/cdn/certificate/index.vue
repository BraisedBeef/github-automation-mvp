<template>
  <div class="certificate page-box pd20">
    <div class="table-head df jsb">
      <div class="left df ac">
        <el-button type="primary" @click="openCertDialog('upload')">
          {{ t('uploadCert') }}
        </el-button>
      </div>
      <div class="right df ac">
        <el-input
          v-model.trim="certificate.search"
          maxlength="256"
          class="input-with-select"
          :placeholder="t('myDomains.searchPlaceholder')"
          @keydown.enter="getAllSSLcert"
        >
          <template #suffix>
            <SvgIcon name="dns-search" @click="getAllSSLcert" />
          </template>
        </el-input>
        <CdnIconButton class="ml10" @click="getAllSSLcert">
          <SvgIcon name="cat-cdn-refresh" :loading="certificate.loading" />
        </CdnIconButton>
      </div>
    </div>

    <el-table ref="tableDom" v-loading="certificate.loading" :data="certificate.tableData" class="mt20">
      <el-table-column prop="domain" :label="t('domain')" width="200">
        <template #default="{ row }">
          <div class="hover-item df ac">
            <el-tooltip effect="light" :content="row.domain" placement="top">
              <div class="ellipsis">
                {{ row.domain }}
              </div>
            </el-tooltip>
            <SvgIcon name="cat-cdn-copy" class="ml4 icon-hover" @click="copyText(row.domain)" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="cert_name" :label="t('IDname')">
        <template #default="{ row }">
          <div>{{ row.cert_id }}</div>
          <el-tooltip effect="light" :content="row.cert_name" placement="top">
            <div class="ellipsis" style="width: 100%">
              {{ row.cert_name }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="create_from" :label="t('certFrom')">
        <template #default="{ row }">
          {{ t('managedCert') }}
        </template>
      </el-table-column>
      <el-table-column prop="create_time" width="180" :label="t('createTime')">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('createTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ getDateDayjs(row.create_time * 1000, 'string', true) }}
        </template>
      </el-table-column>
      <el-table-column prop="expire_at" width="180" :label="t('expireTime1')">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('expireTime1') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ getDateDayjs(row.expire_at * 1000, 'string', true) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('configStatus')">
        <template #default="{ row }">
          <el-text :type="row.status ? 'success' : 'danger'">
            {{ row.status ? t('setSuccess') : t('configFailed') }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column :label="t('operation')" width="120" fixed="right">
        <template #default="{ row }">
          <div class="table-handle">
            <el-link type="primary" @click="openCertDialog('edit', row)">
              {{ t('edit') }}
            </el-link>
            <el-link type="primary" @click="openDeleteDialog(row)">
              {{ t('delete') }}
            </el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <CatPagination
      v-model:pagination="certificate.pagination"
      :custom-keys="['page', 'page_size']"
      :total="certificate.total"
      @change="getAllSSLcert"
    />

    <CertificateDialog ref="uploadDom" :title="upload.title" :form="upload.form!" cert @sure="add_or_edit_cert" />

    <CatDialog v-model:dialog="del" title="warmTip" width="550" @confirm="delSSLcert">
      <div>{{ t('deleteCertTip1') }}</div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import CertificateDialog from '@/components/cdn/certificate-dialog/index.vue'
import { copyText } from '@/utils/dom-utils'
import { getDateDayjs } from '@/utils/format-time'
import { _getAllSSLcert, _addSSLcert, _updateSSLcert, _delSSLcert } from '@/apis/cdn/certificate'
import t from '@/utils/i18n'

import type { CertificateUpload, CertTableItem } from '@/views/cdn/common'
import type { TableInstance } from 'element-plus/es'
import { notification } from '../domain/index-domain'

const certificate = reactive<{
  search: string
  tableData: CertTableItem[]
  loading: boolean
  pagination: {
    [key: string]: number
  }
  total: number
}>({
  search: '',
  tableData: [],
  loading: false,
  pagination: {
    page_size: 10,
    page: 1,
  },
  total: 0,
})
const selectedItem = ref<CertTableItem[]>([])
const tableDom = ref<TableInstance | null>(null)
const getAllSSLcert = async () => {
  certificate.loading = true
  await _getAllSSLcert({
    domain: certificate.search,
    page_size: certificate.pagination.page_size,
    page: certificate.pagination.page,
  })
    .then(res => {
      certificate.tableData = res.data?.data || []
      certificate.total = res.data.total
    })
    .finally(() => {
      certificate.loading = false
    })
}
getAllSSLcert()

const upload = reactive<{
  title: string
  form: CertTableItem | CertificateUpload | null
  rowForm: CertificateUpload
  new_certificate: CertificateUpload | null
}>({
  title: 'upload',
  form: null,
  rowForm: {
    domain_id: '',
    create_from: 0,
    cert_name: '',
    uploadType: 0,
    content: '',
    private_key: '',
  },
  new_certificate: null,
})
const uploadDom = ref<any>(null)
const openCertDialog = (title: string, row?: CertTableItem) => {
  if (row) {
    upload.form = { ...row, uploadType: 0 }
  } else {
    upload.form = { ...upload.rowForm }
  }
  upload.title = title
  uploadDom.value.show = true
}
const add_or_edit_cert = async form => {
  const params: any = {
    domain_id: form.domain_id,
  }

  if (form.checked) {
    params.certificate_id = form.id
  } else {
    params.new_certificate = {
      name: form.cert_name,
      content: form.content_text,
      private_key: form.private_key_text,
    }
  }
  const fn = upload.title === 'upload' ? _addSSLcert : _updateSSLcert
  fn(params)
    .then(() => {
      notification({ type: 'success', msg: 'setSuccess' })
      getAllSSLcert()
    })
    .catch(() => {
      // notification({ type: 'failed', msg: 'configFailed' })
    })
    .finally(() => {
      uploadDom.value.show = false
    })
}

const del = ref<boolean>(false)
const openDeleteDialog = (row: CertTableItem) => {
  selectedItem.value = [{ ...row }]
  del.value = true
}
const delSSLcert = async () => {
  _delSSLcert(selectedItem.value[0].domain_id).then(async res => {
    if (res.code == 200) {
      await getAllSSLcert()
    }
    selectedItem.value = []
    del.value = false
  })
}
</script>

<style lang="scss" scoped>
.certificate {
  .table-head {
    .right {
      .el-input {
        width: 280px;
      }

      .el-button {
        width: 34px;
        height: 34px;
        padding: 0 !important;
      }
    }
  }

  .hover-item .icon-hover {
    visibility: hidden;
  }

  .hover-item:hover .icon-hover {
    visibility: visible;
  }
}

.upload-item {
  .el-input,
  .el-textarea {
    width: 80%;
  }
}
</style>
