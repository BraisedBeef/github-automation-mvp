<template>
  <div class="tpl-container">
    <TipsBar :tips="t('ssl-certificate.management.upload.728595-0')" />
    <el-card class="mt20" shadow="never">
      <div class="df jsb">
        <div class="form-group right">
          <p class="title">
            {{ t('ssl-certificate.management.upload.728595-1') }}
          </p>
          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-position="left"
            label-width="auto"
            class="ruleForm"
            status-icon
          >
            <el-form-item :label="t('ssl-certificate.management.upload.728595-2')" prop="cert_name">
              <el-input v-model="ruleForm.cert_name" :placeholder="t('ssl-certificate.management.upload.728595-3')" />
              <p class="tip">
                {{ t('ssl-certificate.management.upload.728595-4') }}
              </p>
            </el-form-item>
            <el-form-item :label="t('ssl-certificate.management.upload.728595-5')" prop="cert_content">
              <el-input
                v-model="ruleForm.cert_content"
                type="textarea"
                :rows="5"
                :placeholder="t('ssl-certificate.management.upload.728595-6')"
              />
            </el-form-item>
            <el-form-item label=" ">
              <el-button style="color: #0063ff" @click="uploadPublicKeyFile">
                {{ t('ssl-certificate.management.upload.728595-7') }}
              </el-button>
              <input id="publicKeyUpload" type="file" style="display: none" @change="handlePublicKeyUpload" />
            </el-form-item>
            <el-form-item :label="t('ssl-certificate.management.upload.728595-8')" prop="private_key">
              <el-input
                v-model="ruleForm.private_key"
                type="textarea"
                :rows="5"
                :placeholder="t('ssl-certificate.management.upload.728595-9')"
              />
            </el-form-item>
            <el-form-item label=" ">
              <el-button style="color: #0063ff" @click="uploadPrivateKeyFile">
                {{ t('ssl-certificate.management.upload.728595-12') }}
              </el-button>
              <input id="privateKeyUpload" type="file" style="display: none" @change="handlePrivateKeyUpload" />
            </el-form-item>
          </el-form>
        </div>
        <el-card class="guide-card left" shadow="never">
          <p class="title">
            {{ t('ssl-certificate.management.upload.728595-13') }}
          </p>
          <div class="content">
            <p class="text">
              {{ t('ssl-certificate.management.upload.728595-14') }}
            </p>
            <br />
            <p class="text">
              {{ t('ssl-certificate.management.upload.728595-15') }}
            </p>
            <br />
            <p class="text">
              {{ t('ssl-certificate.management.upload.728595-16') }}
            </p>
          </div>
        </el-card>
      </div>
      <el-divider style="border-color: #eee" />
      <el-form-item>
        <el-button type="primary" @click="onSubmit">
          {{ t('ssl-certificate.management.upload.728595-17') }}
        </el-button>
        <el-button type="default" @click="router.back">
          {{ t('ssl-certificate.management.upload.728595-18') }}
        </el-button>
      </el-form-item>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import type { FormInstance, FormRules } from 'element-plus/es'
import { _uploadCert } from '@/apis/ssl-certificate/management'
import type { UploadCertReq } from '@/apis/ssl-certificate/management/type'
import TipsBar from '../components/tips-bar.vue'
import { message } from '@/utils/message'
import { backRoute } from '@/utils/router-jump'

const router = useRouter()

/// form
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
      validator(rule, value, callback, source, options) {
        // 名称仅支持英文字母、英文句号、数字、下划线、中划线
        const pattern = /^[a-zA-Z0-9_\-\.]+$/
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
        // 以“-----BEGIN CERTIFICATE-----”开头，以“-----END CERTIFICATE-----”结尾。
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
        // 以“-----BEGIN (RSA) PRIVATE KEY-----”开头，以“-----END(RSA) PRIVATE KEY-----”结尾。
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
const uploadPublicKeyFile = () => {
  // 上传证书文件
  const fileInput = document.getElementById('publicKeyUpload') as HTMLInputElement
  fileInput.click()
}
const handlePublicKeyUpload = (event: Event) => {
  // 处理证书文件上传
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = e => {
      ruleForm.cert_content = e.target?.result as string
    }
  }
}
const uploadPrivateKeyFile = () => {
  // 上传私钥文件
  const fileInput = document.getElementById('privateKeyUpload') as HTMLInputElement
  fileInput.click()
}
const handlePrivateKeyUpload = (event: Event) => {
  // 处理私钥文件上传
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = e => {
      ruleForm.private_key = e.target?.result as string
    }
  }
}
const onSubmit = async () => {
  await ruleFormRef.value?.validate()
  // TODO 确定
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

<style lang="scss" scoped>
.tpl-container {
  .form-group {
    flex: 1;

    .title {
      margin-bottom: 40px;
      font-size: 14px;
      font-weight: bold;
      line-height: 20px;
      color: #000;
    }

    .tip {
      font-size: 14px;
      font-weight: 400;
      color: #000;
    }
  }

  .guide-card {
    width: 360px;
    height: 456px;
    margin-left: 43px;
    background: #f9fafc;

    .title {
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: bold;
      line-height: 22px;
      color: #000;
    }

    .text {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #555;
    }
  }
}
</style>
