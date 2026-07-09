<template>
  <CatDialog
    v-model:dialog="show"
    :title="props.title + 'cert'"
    width="680"
    destroy-on-close
    @confirm="sureHandle"
    @update:dialog="close"
  >
    <input v-show="false" ref="uploadDom" type="file" accept=".der,.cer,.pem,.crt,.key" @change="changeFileHandle" />
    <CatTip v-if="form.create_from === 0">
      {{ t('onlyPEM') }}
    </CatTip>
    <el-form
      ref="formDom"
      :model="form"
      label-position="left"
      label-width="auto"
      require-asterisk-position="right"
      class="mt20"
    >
      <el-form-item
        v-if="props.cert && props.title != 'edit'"
        :label="t('domain')"
        prop="domain_id"
        :rules="{ validator: (r, v) => !!v, message: '', trigger: 'change' }"
      >
        <CatSelect
          v-model="form.domain_id"
          :list="domainList as any"
          label-key="domain"
          value-key="id"
          :disabled="domainLoading"
          @change="changeDomain"
        />
      </el-form-item>
      <el-form-item :label="t('certFrom')" prop="create_from">
        <CatRadioGroup v-model="form.create_from" :list="certTypeList" />
      </el-form-item>
      <el-form-item
        v-if="form.create_from === 0"
        :label="t('certName')"
        prop="cert_name"
        :rules="{
          validator: (r, v) => v.length > 2 && v.length < 65,
          message: !form.cert_name ? '' : t('input3to64Tip'),
          trigger: 'change',
        }"
      >
        <el-input v-model="form.cert_name" :placeholder="t('pleaseInputCertName')" />
      </el-form-item>
      <el-form-item v-if="form.create_from === 0" :label="t('uploadType')" prop="uploadType">
        <CatRadioGroup
          v-model="form.uploadType"
          :list="[
            { label: t('localUpload'), value: 0 },
            { label: t('manualInput'), value: 1 },
          ]"
          @change="uploadTypeHandle"
        />
      </el-form-item>
      <el-form-item
        v-if="form.create_from === 0 && form.uploadType === 0"
        :label="t('certAuth')"
        prop="content"
        :rules="{ message: t('uploadCertTip'), required: true }"
      >
        <div class="df ac w-full">
          <el-input v-model="form.content" class="mr14" disabled />
          <el-button :disabled="!form.cert_name" type="primary" @click="uploadClick('content')">
            {{ t('clickUpload') }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item
        v-if="form.create_from === 0 && form.uploadType === 0"
        :label="t('keyAuth')"
        prop="private_key"
        :rules="{ message: t('uploadCertTip'), required: true }"
      >
        <div class="df ac w-full">
          <el-input v-model="form.private_key" class="mr14" disabled />
          <el-button :disabled="!form.cert_name" type="primary" @click="uploadClick('private_key')">
            {{ t('clickUpload') }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item
        v-if="form.create_from === 0 && form.uploadType === 1"
        :label="t('certContent')"
        prop="content"
        :rules="{
          validator: (r, v) => isCertificateValid(v, 'content').state,
          message: !form.content ? '' : t('certNotValid'),
          trigger: 'change',
          required: true,
        }"
      >
        <el-input v-model="form.content" type="textarea" resize="none" :rows="5" />
      </el-form-item>
      <el-form-item
        v-if="form.create_from === 0 && form.uploadType === 1"
        :label="t('keyContent')"
        prop="private_key"
        :rules="{
          validator: (r, v) => isCertificateValid(v, 'private_key').state,
          message: !form.private_key ? '' : t('keyNotValid'),
          trigger: 'change',
          required: true,
        }"
      >
        <el-input v-model="form.private_key" type="textarea" resize="none" :rows="5" />
      </el-form-item>
    </el-form>

    <el-table
      v-if="form.create_from === 1"
      v-loading="table_loading"
      :data="certificateList"
      show-overflow-tooltip
      class="mt20"
    >
      <el-table-column :label="t('certificateList')" width="80">
        <template #default="{ row }">
          <!-- <el-checkbox v-model="row.checked" @change="chooseCert(row)"
            :disabled="certConfig.checkedItem.length > 0 && row.id != certConfig.checkedItem[0].id" /> -->
          <el-radio
            v-model="row.checked"
            :disabled="(props.form as any)?.cert_id == row.id"
            size="large"
            @click="chooseCert(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="id" :label="t('certID')" width="100" />
      <el-table-column prop="name" :label="t('certName')" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.name || row.cert_str_id }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="domain" :label="t('domain')" />
      <el-table-column prop="expire_at" :label="t('expirationTime')">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('expirationTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ getDateDayjs(row.expire_at * 1000, 'string', true) }}
        </template>
      </el-table-column>
    </el-table>
  </CatDialog>
</template>

<script lang="ts" setup>
import { getDateDayjs } from '@/utils/format-time'
import { isCertificateValid } from '@/utils/certificate-utils'
import { certTypeList } from '@/assets/data/common'
import { message } from '@/utils/message'
import { _getDomainList } from '@/apis/cdn/domain'
import { _getUseSSLcert } from '@/apis/cdn/certificate'
import t from '@/utils/i18n'

import type { CertTableItem, HttpsTableData, CertificateUpload } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'

const route = useRoute()

const props = defineProps<{
  title: string
  type?: string
  form: CertTableItem | CertificateUpload | null
  cert?: boolean
}>()

const show = ref<boolean>(false)
const form = ref<CertTableItem | CertificateUpload | null | any>(null)
const table_loading = ref<boolean>(false)

const domainList = ref<HttpsTableData[]>([])
const domainLoading = ref<boolean>(false)
const getDomainList = () => {
  domainLoading.value = true
  _getDomainList({ page_size: 999, page: 1, channel_type: '0,1,2,3' } as any)
    .then(res => {
      domainList.value = res.data?.data || []
    })
    .finally(() => {
      domainLoading.value = false
    })
}

const certificateList = ref<CertTableItem[]>([])
const getUseSSLcert = (domain: string) => {
  table_loading.value = true
  _getUseSSLcert({
    page_size: 50,
    page: 1,
    domain,
  })
    .then(res => {
      certificateList.value = res.data.data?.map(v => ({ ...v, checked: false }))
    })
    .finally(() => {
      table_loading.value = false
    })
}

const certConfig = reactive<{
  content: string
  private_key: string
  expire_at: string
  checkedItem: any
}>({
  content: '',
  private_key: '',
  expire_at: '',
  checkedItem: null,
})

const changeDomain = (domain_id: any) => {
  getUseSSLcert(domainList.value.find(d => d.id === domain_id)!.domain)
}
const uploadTypeHandle = () => {
  form.value.content = ''
  form.value.private_key = ''
}

watch(
  () => props.form,
  n => {
    form.value = n
    let domain
    if (props.cert && props.title === 'upload') {
      getDomainList()
      return
    } else if (props.cert && props.title === 'edit') {
      domain = (props.form as any).domain
    } else if (props.type === 'config') {
      domain = route.query.domain
    } else {
      domain = localStorage.CDN_DOMAIN
    }
    getUseSSLcert(domain)
  },
  { immediate: true },
)

const uploadDom = ref<HTMLInputElement | null>(null)
const currentUploadType = ref<string>('')
const uploadClick = (type: string) => {
  currentUploadType.value = type
  uploadDom.value!.click()
}

const emit = defineEmits<{
  (event: 'sure', params: any): void
  (event: 'cancle'): void
}>()

const changeFileHandle = (e: Event) => {
  const file: File = (e.target as any).files[0]
  form.value![currentUploadType.value] = file
  const reader = new FileReader()
  reader.readAsText(form.value![currentUploadType.value] as any)
  reader.onload = function () {
    if (currentUploadType.value == 'content') {
      const { state, expire_at } = isCertificateValid(reader.result as string, currentUploadType.value)
      if (state) {
        form.value![currentUploadType.value] = file.name
        certConfig[currentUploadType.value] = reader.result as string
        certConfig.expire_at = expire_at!
      } else {
        form.value![currentUploadType.value] = ''
        message.error(t('certNotValid'))
      }
    } else {
      const { state } = isCertificateValid(reader.result as string, currentUploadType.value)
      if (state) {
        form.value![currentUploadType.value] = file.name
        certConfig[currentUploadType.value] = reader.result
      } else {
        form.value![currentUploadType.value] = ''
        message.error(t('keyNotValid'))
      }
    }
  }
  uploadDom.value!.value = ''
}

const chooseCert = (row: any) => {
  certificateList.value.forEach((v: any) => {
    v.checked = false
  })
  row.checked = true
  certConfig.checkedItem = row
}

const formDom = ref<FormInstance | null>(null)
const sureHandle = async () => {
  let params: any = { ...form.value }
  if (form.value!.create_from === 0) {
    const valid = await formDom.value?.validate(b => b)
    if (!valid) return
    if (form.value.uploadType === 0) {
      params.content_text = certConfig.content
      params.private_key_text = certConfig.private_key
      params.expire_at = certConfig.expire_at
    } else {
      params.content_text = form.value.content
      params.private_key_text = form.value.private_key
    }
  } else {
    if (!certConfig.checkedItem) {
      message.error(t('pleaseConfigCertTip'))
      return
    }
    params = { ...certConfig.checkedItem }
    params.expire_at = getDateDayjs(certConfig.checkedItem.expire_at * 1000, 'string')
    params.cert_name = certConfig.checkedItem.name
    params.checked = true
  }
  params.domain_id = form.value.domain_id
  emit('sure', params)
}

const close = () => {
  certConfig.checkedItem = null
  domainList.value = []
  certificateList.value = []
  emit('cancle')
}

defineExpose({ show })
</script>

<style lang="scss" scoped>
.el-form {
  .el-form-item:last-of-type {
    margin-bottom: 0;
  }
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: var(--success-color);
  border-color: var(--success-color);
}

:deep(.el-radio__inner:hover) {
  border: 1px solid var(--border-c);
}
</style>
