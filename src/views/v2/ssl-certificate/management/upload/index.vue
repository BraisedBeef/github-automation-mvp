<template>
  <div class="ssl-upload-v2">
    <PageBreadcrumbToolbar :items="[t('ssl-certificate.router.931344-5')]" :show-doc="false" />
    <InfoNotice class="ssl-upload-v2__tips">
      <span>{{ t('ssl-certificate.management.upload.728595-0') }}</span>
    </InfoNotice>
    <section class="ssl-upload-v2__panel">
      <div class="ssl-upload-v2__content">
        <div class="ssl-upload-v2__form-card">
          <div class="ssl-upload-v2__section-title">
            {{ t('ssl-certificate.management.upload.728595-1') }}
          </div>

          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-position="left"
            label-width="148px"
            class="ssl-upload-v2__form"
            status-icon
          >
            <el-form-item
              :label="t('ssl-certificate.management.upload.728595-2')"
              prop="cert_name"
              class="ssl-upload-v2__form-item"
            >
              <el-input
                v-model="ruleForm.cert_name"
                :placeholder="t('ssl-certificate.management.upload.728595-3')"
                class="ssl-upload-v2__input"
              />
              <p class="ssl-upload-v2__field-tip">
                {{ t('ssl-certificate.management.upload.728595-4') }}
              </p>
            </el-form-item>

            <el-form-item
              :label="t('ssl-certificate.management.upload.728595-5')"
              prop="cert_content"
              class="ssl-upload-v2__form-item ssl-upload-v2__form-item--top"
            >
              <div class="ssl-upload-v2__field-block">
                <el-input
                  v-model="ruleForm.cert_content"
                  type="textarea"
                  :rows="4"
                  :placeholder="t('ssl-certificate.management.upload.728595-6')"
                  resize="none"
                  class="ssl-upload-v2__textarea"
                  maxlength="200"
                  show-word-limit
                />
                <button class="ssl-upload-v2__upload-btn" type="button" @click="uploadPublicKeyFile">
                  {{ t('ssl-certificate.management.upload.728595-7') }}
                </button>
                <input id="publicKeyUpload" type="file" style="display: none" @change="handlePublicKeyUpload" />
              </div>
            </el-form-item>

            <el-form-item
              :label="t('ssl-certificate.management.upload.728595-8')"
              prop="private_key"
              class="ssl-upload-v2__form-item ssl-upload-v2__form-item--top"
            >
              <div class="ssl-upload-v2__field-block">
                <el-input
                  v-model="ruleForm.private_key"
                  type="textarea"
                  :rows="4"
                  :placeholder="t('ssl-certificate.management.upload.728595-9')"
                  resize="none"
                  class="ssl-upload-v2__textarea"
                  maxlength="200"
                  show-word-limit
                />
                <button class="ssl-upload-v2__upload-btn" type="button" @click="uploadPrivateKeyFile">
                  {{ t('ssl-certificate.management.upload.728595-12') }}
                </button>
                <input id="privateKeyUpload" type="file" style="display: none" @change="handlePrivateKeyUpload" />
              </div>
            </el-form-item>
          </el-form>
        </div>

        <aside class="ssl-upload-v2__guide">
          <div class="ssl-upload-v2__guide-title">
            {{ t('ssl-certificate.management.upload.728595-13') }}
          </div>
          <div class="ssl-upload-v2__guide-body">
            <p>{{ t('ssl-certificate.management.upload.728595-14') }}</p>
            <p>{{ t('ssl-certificate.management.upload.728595-15') }}</p>
            <p>{{ t('ssl-certificate.management.upload.728595-16') }}</p>
          </div>
        </aside>
      </div>

      <div class="ssl-upload-v2__footer">
        <el-button type="primary" :loading="loading" @click="onSubmit">
          {{ t('ssl-certificate.management.upload.728595-17') }}
        </el-button>
        <el-button @click="router.back()">
          {{ t('ssl-certificate.management.upload.728595-18') }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { _uploadCert } from '@/apis/ssl-certificate/management'
import type { UploadCertReq } from '@/apis/ssl-certificate/management/type'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { backRoute } from '@/utils/router-jump'
import type { FormInstance, FormRules } from 'element-plus/es'

const router = useRouter()

const ruleFormRef = ref<FormInstance>()
const loading = ref(false)
const ruleForm = reactive<UploadCertReq>({
  cert_name: '',
  cert_content: '',
  private_key: '',
})

const rules = reactive<FormRules<typeof ruleForm>>({
  cert_name: [
    { required: true, message: t('ssl-certificate.management.upload.728595-19'), trigger: 'blur' },
    {
      validator(rule, value, callback) {
        const pattern = /^[a-zA-Z0-9_\-.]+$/
        if (!pattern.test(value)) {
          callback(new Error(t('ssl-certificate.management.upload.728595-20')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  cert_content: [
    { required: true, message: t('ssl-certificate.management.upload.728595-21'), trigger: 'change' },
    {
      validator(rule, value, callback) {
        const pattern = /^-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----$/
        if (!pattern.test(value?.trim())) {
          callback(new Error(t('ssl-certificate.management.upload.728595-22')))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  private_key: [
    { required: true, message: t('ssl-certificate.management.upload.728595-23'), trigger: 'change' },
    {
      validator(rule, value, callback) {
        const pattern = /^-----BEGIN \(?RSA\)? PRIVATE KEY-----[\s\S]+-----END \(?RSA\)? PRIVATE KEY-----$/
        if (!pattern.test(value?.trim())) {
          callback(new Error(t('ssl-certificate.management.upload.728595-24')))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
})

const updateFieldFromFile = (event: Event, field: 'cert_content' | 'private_key') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = e => {
    ruleForm[field] = (e.target?.result as string) || ''
  }
}

const uploadPublicKeyFile = () => {
  const fileInput = document.getElementById('publicKeyUpload') as HTMLInputElement
  fileInput?.click()
}

const handlePublicKeyUpload = (event: Event) => {
  updateFieldFromFile(event, 'cert_content')
}

const uploadPrivateKeyFile = () => {
  const fileInput = document.getElementById('privateKeyUpload') as HTMLInputElement
  fileInput?.click()
}

const handlePrivateKeyUpload = (event: Event) => {
  updateFieldFromFile(event, 'private_key')
}

const onSubmit = async () => {
  await ruleFormRef.value?.validate()
  try {
    loading.value = true
    const { code, msg } = await _uploadCert(ruleForm)
    if (code === 200) {
      message.success(t('ssl-certificate.management.upload.728595-25'))
      backRoute()
    } else {
      message.error(msg || t('ssl-certificate.management.upload.728595-26'))
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.ssl-upload-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ssl-upload-v2__panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #fff;
}

.ssl-upload-v2__tips {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px 20px;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  background: rgb(0 102 255 / 16%);
}

.ssl-upload-v2__tips-icon {
  flex: none;
  color: inherit;
}

.ssl-upload-v2__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 46px;
  align-items: start;

  // padding: 28px 36px 0;
  // border: 1px solid #eef1f5;
}

.ssl-upload-v2__form-card {
  min-width: 0;
}

.ssl-upload-v2__guide {
  position: relative;
  box-sizing: border-box;
  height: 416px;
  padding: 16px;
  overflow: hidden;

  // background: linear-gradient(180deg, #f8fbff 0%, #f6f9ff 100%);
  background: url("('@/assets/v2/home-figma/images/ssl-certificate.png'")) no-repeat;
  background-size: cover;
  border: 1px solid #eef1f5;
}

.ssl-upload-v2__section-title,
.ssl-upload-v2__guide-title {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.ssl-upload-v2__section-title {
  margin-bottom: 24px;
}

.ssl-upload-v2__form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #828b9c;
}

.ssl-upload-v2__form-item {
  margin-bottom: 24px;
}

.ssl-upload-v2__form-item--top {
  :deep(.el-form-item__content) {
    align-items: flex-start;
  }
}

.ssl-upload-v2__field-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.ssl-upload-v2__input,
.ssl-upload-v2__textarea {
  width: 100%;
}

.ssl-upload-v2__input :deep(.el-input__wrapper),
.ssl-upload-v2__textarea :deep(.el-textarea__inner) {
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.ssl-upload-v2__textarea :deep(.el-textarea__inner) {
  height: 84px !important;
  padding: 10px 12px;
}

.ssl-upload-v2__field-tip {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
}

.ssl-upload-v2__upload-btn {
  // width: 116px;
  padding: 6px 16px;
  margin-top: 8px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.ssl-upload-v2__guide-body {
  display: flex;
  flex-direction: column;
  gap: 28px;
  font-size: 14px;
  line-height: 22px;
  color: #50596a;
  white-space: pre-wrap;
}

.ssl-upload-v2__guide-body p {
  margin: 0;
}

.ssl-upload-v2__footer {
  display: flex;
  gap: 12px;
  padding: 24px 0 0;
  border-top: 1px solid #e8ecf3;
}

.ssl-upload-v2__textarea :deep(.el-input__count) {
  right: 12px;
  bottom: 8px;
  line-height: 20px;
  color: #828b9c;
  background: transparent;
}

@media (width <= 1024px) {
  .ssl-upload-v2__content {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    padding: 20px;
  }

  .ssl-upload-v2__guide {
    min-height: auto;
  }
}

@media (width <= 768px) {
  .ssl-upload-v2__panel {
    padding: 16px;
  }

  .ssl-upload-v2__content {
    padding: 16px;
  }

  .ssl-upload-v2__footer {
    flex-wrap: wrap;
    padding-left: 16px;
  }
}
</style>
