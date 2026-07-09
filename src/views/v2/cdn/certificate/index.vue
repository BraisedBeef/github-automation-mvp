<template>
  <div class="cdn-certificate-v2">
    <PageBreadcrumbToolbar :items="[t('certificate')]" @doc="openHelpDoc" />

    <!-- <InfoNotice v-if="showNotice">
      <div class="cdn-certificate-v2__notice">
        <span>{{ infoNoticeText }}</span>
        <button
          class="cdn-certificate-v2__notice-close"
          type="button"
          @click="showNotice = false"
        >
          <SvgIcon name="close" />
        </button>
      </div>
    </InfoNotice> -->

    <section class="cdn-certificate-v2__panel">
      <div class="cdn-certificate-v2__toolbar">
        <el-button type="primary" class="cdn-certificate-v2__upload-btn" @click="openCertDialog('upload')">
          <div>
            <SvgIcon name="cat-cdn-upload" />
            {{ t('uploadCert') }}
          </div>
        </el-button>

        <div class="cdn-certificate-v2__search-wrap">
          <el-input
            v-model.trim="certificate.search"
            :placeholder="t('myDomains.searchPlaceholder')"
            maxlength="256"
            class="cdn-certificate-v2__search"
            @keydown.enter="getAllSSLcert"
          >
            <template #prefix>
              <SvgIcon name="dns-search" />
            </template>
          </el-input>
          <button class="cdn-certificate-v2__icon-btn" type="button" @click="getAllSSLcert">
            <SvgIcon name="cat-cdn-refresh" :loading="certificate.loading" />
          </button>
        </div>
      </div>

      <TableV2
        ref="tableRef"
        v-loading="certificate.loading"
        :data="certificate.tableData"
        :total="certificate.total"
        :pagination="pagination"
        show-pagination
        @update:pagination="handlePaginationChange"
      >
        <el-table-column type="selection" width="56" />

        <el-table-column :label="t('domain')" prop="domain" min-width="220">
          <template #default="{ row }">
            <div class="cdn-certificate-v2__domain">
              <span>{{ row.domain }}</span>
              <SvgIcon name="cat-cdn-copy" class="cdn-certificate-v2__copy" @click="copyText(row.domain)" />
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('IDname')" min-width="220">
          <template #default="{ row }">
            <div>{{ row.cert_id }}</div>
            <div class="cdn-certificate-v2__sub-text">
              {{ row.cert_name }}
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('certFrom')" prop="create_from" min-width="180">
          <template #default>
            {{ t('managedCert') }}
          </template>
        </el-table-column>

        <el-table-column :label="t('createTime')" prop="create_time" min-width="220">
          <template #default="{ row }">
            {{ getDateDayjs(row.create_time * 1000, 'string', true) }}
          </template>
        </el-table-column>

        <el-table-column :label="t('expireTime1')" prop="expire_at" min-width="220">
          <template #default="{ row }">
            {{ getDateDayjs(row.expire_at * 1000, 'string', true) }}
          </template>
        </el-table-column>

        <el-table-column :label="t('configStatus')" prop="status" min-width="160">
          <template #default="{ row }">
            <div class="cdn-certificate-v2__status" :class="{ 'is-success': row.status, 'is-danger': !row.status }">
              <span class="cdn-certificate-v2__status-dot" />
              <span>{{ row.status ? t('setSuccess') : t('configFailed') }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('operation')" min-width="140" fixed="right">
          <template #default="{ row }">
            <div class="cdn-certificate-v2__ops">
              <button type="button" @click="openCertDialog('edit', row)">
                {{ t('edit') }}
              </button>
              <button type="button" @click="openDeleteDialog(row)">
                {{ t('delete') }}
              </button>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <CertificateDialog ref="uploadDom" :title="upload.title" :form="upload.form!" cert @sure="addOrEditCert" />

    <CatDialog v-model:dialog="del" title="warmTip" width="550" @confirm="delSSLcert">
      <div>{{ t('deleteCertTip1') }}</div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { _addSSLcert, _delSSLcert, _getAllSSLcert, _updateSSLcert } from '@/apis/cdn/certificate'
import { documentUrl } from '@/config/base-config'
import CertificateDialog from '@/components/cdn/certificate-dialog/index.vue'
import { copyText } from '@/utils/dom-utils'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import type { CertificateUpload, CertTableItem } from '@/views/cdn/common'
import { notification } from '@/views/cdn/domain/index-domain'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const infoNoticeText = '用于表示普通操作信息提示，可关闭，通常信息较长'
const showNotice = ref(true)

const certificate = reactive({
  search: '',
  tableData: [] as CertTableItem[],
  loading: false,
  pagination: {
    page_size: 10,
    page: 1,
  },
  total: 0,
})

const pagination = computed(() => ({
  page: certificate.pagination.page,
  pageSize: certificate.pagination.page_size,
}))

const selectedItem = ref<CertTableItem[]>([])
const tableRef = ref()

const getAllSSLcert = async () => {
  certificate.loading = true
  await _getAllSSLcert({
    domain: certificate.search,
    page_size: certificate.pagination.page_size,
    page: certificate.pagination.page,
  })
    .then(res => {
      certificate.tableData = res.data?.data || []
      certificate.total = res.data.total || 0
    })
    .finally(() => {
      certificate.loading = false
    })
}

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  certificate.pagination.page = page
  certificate.pagination.page_size = pageSize
  getAllSSLcert()
}

const upload = reactive<{
  title: string
  form: CertTableItem | CertificateUpload | null
  rowForm: CertificateUpload
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
})

const uploadDom = ref<any>(null)

const openCertDialog = (title: string, row?: CertTableItem) => {
  upload.form = row ? { ...row, uploadType: 0 } : { ...upload.rowForm }
  upload.title = title
  uploadDom.value.show = true
}

const addOrEditCert = async form => {
  const params: any = { domain_id: form.domain_id }

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
    .finally(() => {
      uploadDom.value.show = false
    })
}

const del = ref(false)

const openDeleteDialog = (row: CertTableItem) => {
  selectedItem.value = [{ ...row }]
  del.value = true
}

const delSSLcert = async () => {
  _delSSLcert(selectedItem.value[0].domain_id).then(async res => {
    if (res.code === 200) {
      await getAllSSLcert()
    }
    selectedItem.value = []
    del.value = false
  })
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

onMounted(() => {
  getAllSSLcert()
})
</script>

<style scoped lang="scss">
.cdn-certificate-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-certificate-v2__panel {
  padding: 20px 28px 28px;
  background: #fff;
}

.cdn-certificate-v2__notice,
.cdn-certificate-v2__toolbar,
.cdn-certificate-v2__search-wrap,
.cdn-certificate-v2__domain,
.cdn-certificate-v2__status,
.cdn-certificate-v2__ops {
  display: flex;
  align-items: center;
}

.cdn-certificate-v2__notice {
  gap: 16px;
  justify-content: space-between;
  width: 100%;
}

.cdn-certificate-v2__notice-close,
.cdn-certificate-v2__icon-btn,
.cdn-certificate-v2__ops button {
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-certificate-v2__toolbar {
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cdn-certificate-v2__upload-btn {
  gap: 8px;
}

.cdn-certificate-v2__upload-btn :deep(.svg-icon) {
  color: #fff;
}

.cdn-certificate-v2__search-wrap {
  gap: 12px;
  margin-left: auto;
}

.cdn-certificate-v2__search {
  width: 320px;
}

.cdn-certificate-v2__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #191c23;
  border: 1px solid #dcdfe6;
}

.cdn-certificate-v2__domain {
  gap: 8px;
}

.cdn-certificate-v2__copy {
  color: #97a0af;
  cursor: pointer;
}

.cdn-certificate-v2__sub-text {
  overflow: hidden;
  color: #828b9c;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cdn-certificate-v2__status {
  gap: 8px;
}

.cdn-certificate-v2__status-dot {
  width: 8px;
  height: 8px;
  border: 2px solid currentcolor;
  border-radius: 999px;
}

.cdn-certificate-v2__status.is-success {
  color: #01a66f;
}

.cdn-certificate-v2__status.is-danger {
  color: #e54839;
}

.cdn-certificate-v2__ops {
  gap: 16px;
}

.cdn-certificate-v2__ops button {
  color: #06f;
}

@media (width <= 1024px) {
  .cdn-certificate-v2__panel {
    padding: 16px;
  }

  .cdn-certificate-v2__toolbar,
  .cdn-certificate-v2__search-wrap {
    flex-direction: column;
    align-items: stretch;
  }

  .cdn-certificate-v2__search {
    width: 100%;
  }
}
</style>
