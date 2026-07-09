<template>
  <div class="tpl-container">
    <p class="tips">
      {{ t('ssl-certificate.management.apply.verify.778200-0') }}
    </p>
    <el-steps class="steps" direction="vertical">
      <el-step class="step-item">
        <template #icon>
          <span class="step-num">1</span>
        </template>
        <template #title>
          <p class="step-title">
            {{ t('ssl-certificate.management.apply.verify.778200-1') }}
          </p>
        </template>
        <template #description>
          <template v-if="validateInfoStore.http_validate && validateInfoStore.http_validate.length > 0">
            <div class="info-card">
              <div v-for="v_info in validateInfoStore.http_validate" :key="v_info.domain" class="v-info-group">
                <p class="step-description">
                  {{ t('ssl-certificate.management.apply.verify.778200-2') }} {{ v_info.domain }}
                  {{ t('ssl-certificate.management.apply.verify.778200-3') }}
                </p>
                <p class="verify-tips">
                  {{ t('ssl-certificate.management.apply.verify.778200-4') }}
                  <span class="time">{{ t('ssl-certificate.management.apply.verify.778200-5') }}</span>
                  {{ t('ssl-certificate.management.apply.verify.778200-6') }}
                </p>
                <el-card
                  v-loading="validateInfoStore.loading"
                  class="card mt20"
                  body-style="background: #F9FAFC;"
                  shadow="never"
                >
                  <p class="tips mb20">
                    {{ t('ssl-certificate.management.apply.verify.778200-7') }}
                  </p>
                  <CatKVList :gutter="25" style="margin-bottom: 20px">
                    <CatKVItem class="kvs" :label="t('ssl-certificate.management.apply.verify.778200-8')">
                      <template #label>
                        <p class="label">
                          {{ t('ssl-certificate.management.apply.verify.778200-8') }}
                        </p>
                      </template>
                      <p class="value auto-wrap">
                        {{ v_info.file_url }}

                        <SvgIcon
                          name="dns-copy"
                          size="16"
                          color="#999999"
                          class="pointer copy-vertical"
                          @click="handleCopy(v_info.file_url)"
                        />
                      </p>
                    </CatKVItem>
                    <CatKVItem class="kvs" :label="t('ssl-certificate.management.apply.verify.778200-9')">
                      <template #label>
                        <p class="label">
                          {{ t('ssl-certificate.management.apply.verify.778200-9') }}
                        </p>
                      </template>
                      <p class="value auto-wrap">
                        {{ v_info.file_url.split('/').pop() }}

                        <SvgIcon
                          name="dns-copy"
                          size="16"
                          color="#999999"
                          class="pointer copy-vertical"
                          @click="handleCopy(v_info.file_url.split('/').pop() || '')"
                        />
                      </p>
                    </CatKVItem>
                    <CatKVItem class="kvs" :label="t('ssl-certificate.management.apply.verify.778200-10')">
                      <template #label>
                        <p class="label">
                          {{ t('ssl-certificate.management.apply.verify.778200-10') }}
                        </p>
                      </template>
                      <p class="value auto-wrap">
                        {{ v_info.content }}

                        <SvgIcon
                          name="dns-copy"
                          size="16"
                          color="#999999"
                          class="pointer copy-vertical"
                          @click="handleCopy(v_info.content)"
                        />
                      </p>
                    </CatKVItem>
                  </CatKVList>
                  <el-link
                    v-if="v_info.full_file_url"
                    type="primary"
                    target="_blank"
                    style="margin-right: 10px"
                    class="mb10"
                    @click="handleSee(v_info)"
                  >
                    {{ v_info.full_file_url }}
                    <SvgIcon name="storage-link" class="icon" style="margin-left: 5px" />
                  </el-link>
                  <p class="df" style="font-size: 14px">
                    {{ t('ssl-certificate.management.apply.verify.778200-11') }}
                    <br />
                    {{ t('ssl-certificate.management.apply.verify.778200-12') }}
                  </p>
                </el-card>
              </div>
            </div>
          </template>
          <el-empty v-else :image-size="50" description="" />
        </template>
      </el-step>
      <!-- <el-step class="step-item">
        <template #icon>
          <span class="step-num">2</span>
        </template>
        <template #title>
          <p class="step-title">{{ t('ssl-certificate.management.apply.verify.778200-13') }}</p>
        </template>
        <template #description>
          <p class="step-description">{{ t('ssl-certificate.management.apply.verify.778200-14') }}</p>
          <el-form-item>
            <el-button
              v-if="['1', '2'].includes(verifyDomainStore.status)"
              :loading="verifyDomainStore.loading"
              type="primary"
              @click="verifyDomain"
              style="min-width: 110px; margin-right: 10px"
              >{{ t('ssl-certificate.management.apply.verify.778200-13') }}</el-button
            >
            <el-button v-else type="default" style="min-width: 110px; margin-right: 10px">
              <SvgIcon name="cat-cdn-upload-success" size="18" style="margin-right: 4px" />
              {{ t('ssl-certificate.management.apply.verify.778200-15') }}
            </el-button>
            <el-button
              type="default"
              v-if="factory_id != CertificateBrandsIds.letsencrypt"
              @click="verifyStore.dialogVisible = true"
              :disabled="['0'].includes(verifyDomainStore.status)"
              style="min-width: 130px"
              >{{ t('ssl-certificate.management.apply.verify.778200-16') }}</el-button
            >
          </el-form-item>
          <TipsBar
            v-if="['2'].includes(verifyDomainStore.status)"
            :tips="t('ssl-certificate.management.apply.verify.778200-17')"
            color="#fe4d4f"
            background="#ffebeb"
          />
        </template>
      </el-step> -->
    </el-steps>
    <el-divider style="margin-top: 0; border-color: #eee" />
    <el-form-item>
      <el-button type="primary" style="min-width: 90px; margin-right: 10px" @click="handleOver">
        {{ t('ssl-certificate.management.apply.verify.778200-18') }}
      </el-button>
      <el-button type="default" style="min-width: 90px" @click="handleBack">
        {{ t('ssl-certificate.management.apply.verify.778200-19') }}
      </el-button>
    </el-form-item>
  </div>
  <el-dialog v-model="verifyStore.dialogVisible" title="" width="550" class="verify-type-dialog" center>
    <template #header>
      <p class="title">
        {{ t('ssl-certificate.management.apply.verify.778200-20') }}
      </p>
    </template>
    <el-select v-model="verifyStore.verifyType" placeholder="" style="width: 100%">
      <el-option
        v-for="item in certificateVerifyRadios"
        :key="item.key"
        :disabled="item.disabled?.(verifyStore.cert_domain_type)"
        :label="item.label"
        :value="item.key"
      />
    </el-select>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          type="primary"
          :loading="verifyStore.loading"
          style="min-width: 90px; margin-right: 10px"
          @click="changVerifyType"
        >
          {{ t('ssl-certificate.management.apply.verify.778200-21') }}
        </el-button>
        <el-button style="min-width: 90px" @click="verifyStore.dialogVisible = false">
          {{ t('ssl-certificate.management.apply.verify.778200-22') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'
import { CatKVList, CatKVItem } from '@/components/common/cat-kv-list'
import {
  certificateVerifyRadios,
  SSL_CERTIFICATE_CERT_DOMAIN_TYPE,
  SSL_CERTIFICATE_FACTORY_ID,
} from '@/views/ssl-certificate/management/config'
import TipsBar from '@/views/ssl-certificate/management/components/tips-bar.vue'
import { _changeVerifyTypes, _validateInfo, _verifyDomain } from '@/apis/ssl-certificate/management'
import type { ValidateInfoResp } from '@/apis/ssl-certificate/management/type'
import { _s_getItem } from '@/utils/storage'
import { filterArray } from '@/utils/filter'
import { CertificateBrandsIds } from '@/views/ssl-certificate/config'
import { replaceRoute } from '@/utils/router-jump'

const router = useRouter()
const route = useRoute()

const { cert_id } = route.query as { cert_id?: string; factory_id?: number }
const factory_id = _s_getItem(SSL_CERTIFICATE_FACTORY_ID)

const props = defineProps<{
  verifyType: number
}>()
const emits = defineEmits(['switchVerifyType'])

const validateInfoStore = reactive<{
  http_validate: (ValidateInfoResp['http_validate'][0] & { full_file_url: string })[]
  loading: boolean
}>({
  // 验证信息
  http_validate: [],
  loading: false,
})
const getValidateInfo = async () => {
  // 获取验证信息
  if (!cert_id) {
    message.error(t('ssl-certificate.management.apply.verify.778200-23'))
    return
  }
  try {
    validateInfoStore.loading = true
    const { code, msg, data } = await _validateInfo({
      cert_id: cert_id,
    })
    if (code === 200 && data) {
      validateInfoStore.http_validate = data.http_validate.map(v => {
        return {
          ...v,
          full_file_url: v.file_url?.startsWith('http') ? v.file_url : `http://${v.domain}${v.file_url}`,
        }
      })
    } else {
      message.error(msg || t('ssl-certificate.management.apply.verify.778200-24'))
    }
  } finally {
    validateInfoStore.loading = false
  }
}
onMounted(() => {
  getValidateInfo()
})

// 复制文本
const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(t('ssl-certificate.management.apply.verify.778200-25'))
}

const handleSee = (v: ValidateInfoResp['http_validate'][0] & { full_file_url: string }) => {
  // 查看
  window.open(v.full_file_url)
}

// 验证域名状态
const verifyDomainStore = reactive({
  status: '1',
  loading: false,
})
const verifyDomain = async () => {
  // 获取验证信息
  if (!cert_id) {
    message.error(t('ssl-certificate.management.apply.verify.778200-23'))
    return
  }

  try {
    verifyDomainStore.loading = true
    const { code, msg, data } = await _verifyDomain({
      cert_id: cert_id,
    })
    if (code === 200 && data) {
      // 验证域名
      if (data.fail_domain.length > 0) {
        for (let i = 0; i < data.fail_domain.length; i++) {
          const element = data.fail_domain[i]
          message.error(`${element.domain} ${element.reason}`)
        }
        verifyDomainStore.status = '2'
      } else {
        message.success(t('ssl-certificate.management.apply.verify.778200-26'))
      }
    } else {
      verifyDomainStore.status = '2'
      message.error(msg || t('ssl-certificate.management.apply.verify.778200-27'))
    }
  } catch (e) {
    // verifyDomainStore.status = '2'
  } finally {
    verifyDomainStore.loading = false
  }
}
// 切换验证方式
const verifyStore = reactive({
  dialogVisible: false,
  verifyType: 3,
  cert_domain_type: 1,
  loading: false,
})
onMounted(() => {
  verifyStore.cert_domain_type = _s_getItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE)
})

const changVerifyType = async () => {
  if (props.verifyType === verifyStore.verifyType) {
    verifyStore.dialogVisible = false
    return
  }
  if (!cert_id) {
    message.error(t('ssl-certificate.management.apply.verify.778200-23'))
    return
  }
  // 切换验证方式
  try {
    verifyStore.loading = true
    const { code, msg } = await _changeVerifyTypes({
      cert_id: cert_id,
      verify_types: filterArray(certificateVerifyRadios, 'key', verifyStore.verifyType)!.value,
    })
    if (code === 200) {
      // 验证域名
      emits('switchVerifyType', verifyStore.verifyType)
      verifyStore.dialogVisible = false
    } else {
      message.error(msg || t('ssl-certificate.management.apply.verify.778200-28'))
    }
  } finally {
    verifyStore.loading = false
  }
}
const handleOver = async () => {
  // 完成
  replaceRoute({ name: 'ssl_certificate_management' })
}
const handleBack = () => {
  // 返回列表
  replaceRoute({ name: 'ssl_certificate_management' })
}
</script>

<style lang="scss" scoped>
.tpl-container {
  .tips {
    margin-bottom: 28px;
    font-size: 14px;
    font-weight: bold;
    line-height: 20px;
    color: #000;
  }

  .steps {
    margin-left: 6px;
  }

  .step-item {
    :deep(.el-step__line) {
      top: 32px;
      bottom: 9px;
      width: 1px;
      border: 1px solid #eee;
    }

    :deep(.el-step__description) {
      margin-bottom: 40px;
    }

    .step-num {
      display: block;
      width: 24px;
      height: 24px;
      font-size: 14px;
      font-weight: 400;
      line-height: 24px;
      color: #000;
      text-align: center;
      background: #eee;
      border-radius: 50%;
    }

    .step-title {
      margin-bottom: 3px;
      font-size: 14px;
      font-weight: bold;
      line-height: 20px;
      color: #000;
    }

    .step-description {
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
    }

    .verify-tips {
      margin-top: 40px;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #000;

      .time {
        color: #fc8c00;
      }
    }

    .info-card {
      max-height: 500px;
      margin-bottom: 20px;
      overflow: auto;

      .v-info-group {
        padding-bottom: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;

        &.err {
          border: 1px solid #f00;
        }

        &:last-child {
          padding-bottom: 0;
          margin-bottom: 0;
          border-bottom-width: 0;
        }
      }
    }

    .kvs {
      align-items: center;
      justify-content: space-between;
      list-style: none;

      .label {
        padding: 7px 0;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: #000;
      }

      .value {
        position: relative;
        flex: 1;
        justify-content: space-between;
        min-height: 18px;
        padding: 7px 14px;
        padding-right: 25px;
        background: #fff;
        border: 1px dotted #ddd;
        border-radius: 4px;

        .copy-vertical {
          position: absolute;
          right: 10px;
          bottom: 10px;
        }
      }
    }
  }
}

.error-reason-dialog {
  .title {
    font-size: 16px;
    font-weight: bold;
    line-height: 22px;
    color: #000;
    text-align: left;
  }

  p {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #000;
  }
}

.verify-type-dialog {
  .title {
    font-size: 16px;
    font-weight: bold;
    line-height: 22px;
    color: #000;
    text-align: left;
  }
}
</style>
