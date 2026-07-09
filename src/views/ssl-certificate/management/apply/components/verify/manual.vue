<template>
  <div class="tpl-container">
    <p class="tips">
      {{ t('ssl-certificate.management.apply.verify.634549-1', { type: verify_type_map[factory_id || 1] }) }}
    </p>
    <el-steps class="steps" direction="vertical">
      <el-step class="step-item">
        <template #icon>
          <span class="step-num">1</span>
        </template>
        <template #title>
          <p class="step-title">
            {{ t('ssl-certificate.management.apply.verify.634549-2') }}
          </p>
        </template>
        <template #description>
          <p class="step-description">
            {{ t('ssl-certificate.management.apply.verify.634549-3') }}
          </p>
        </template>
      </el-step>
      <el-step class="step-item">
        <template #icon>
          <span class="step-num">2</span>
        </template>
        <template #title>
          <p class="step-title">
            {{ t('ssl-certificate.management.apply.verify.634549-4') }}
          </p>
        </template>
        <template #description>
          <p class="step-description">
            {{ t('ssl-certificate.management.apply.verify.634549-5') }}
          </p>
          <el-card v-loading="validateInfoStore.loading" class="mt20" body-style="background: #F9FAFC;" shadow="never">
            <template
              v-if="
                (validateInfoStore.cname_or_txt_validate && validateInfoStore.cname_or_txt_validate.length > 0) ||
                validateInfoStore.loading
              "
            >
              <div class="info-card">
                <div
                  v-for="v_info in validateInfoStore.cname_or_txt_validate"
                  :key="v_info.domain"
                  class="df v-info-group"
                >
                  <CatKVList :gutter="20">
                    <CatKVItem class="kvs" :label="t('ssl-certificate.management.apply.verify.634549-6')">
                      <template #label>
                        <p class="label">
                          {{ t('ssl-certificate.management.apply.verify.634549-6') }}
                        </p>
                      </template>
                      <div class="value auto-wrap">
                        {{ v_info.host_record }}
                        <SvgIcon
                          name="dns-copy"
                          size="16"
                          color="#999999"
                          class="pointer copy-vertical"
                          @click="handleCopy(v_info.host_record)"
                        />
                      </div>
                    </CatKVItem>
                    <CatKVItem class="kvs" :label="t('ssl-certificate.management.apply.verify.634549-7')">
                      <template #label>
                        <p class="label">
                          {{ t('ssl-certificate.management.apply.verify.634549-7') }}
                        </p>
                      </template>
                      <div class="value auto-wrap">
                        {{ v_info.record_value }}
                        <SvgIcon
                          name="dns-copy"
                          size="16"
                          color="#999999"
                          class="pointer copy-vertical"
                          @click="handleCopy(v_info.record_value)"
                        />
                      </div>
                    </CatKVItem>
                    <CatKVItem class="kvs" label="TTL">
                      <template #label>
                        <p class="label">TTL</p>
                      </template>
                      <p class="df ac value">600({{ t('ssl-certificate.management.apply.verify.634549-8') }})</p>
                    </CatKVItem>
                  </CatKVList>
                </div>
              </div>
              <TipsBar
                :tips="t('ssl-certificate.management.apply.verify.634549-9')"
                color="#f7b500"
                background="#fff3d3"
              />
            </template>
            <el-empty v-else :image-size="50" description="" />
          </el-card>
        </template>
      </el-step>
      <el-step class="step-item">
        <template #icon>
          <span class="step-num">3</span>
        </template>
        <template #title>
          <p class="step-title">
            {{ t('ssl-certificate.management.apply.verify.634549-10') }}
          </p>
        </template>
        <template #description>
          <p class="step-description">
            {{ t('ssl-certificate.management.apply.verify.634549-11') }}
          </p>
          <el-form-item>
            <el-button
              v-if="['1', '2'].includes(verifyDomainStore.status)"
              :loading="verifyDomainStore.loading"
              type="primary"
              style="min-width: 110px; margin-right: 10px"
              @click="verifyDomain"
            >
              {{ t('ssl-certificate.management.apply.verify.634549-12') }}
            </el-button>
            <el-button v-else type="default" style="min-width: 110px; margin-right: 10px">
              <SvgIcon name="cat-cdn-upload-success" size="18" style="margin-right: 4px" />
              {{ t('ssl-certificate.management.apply.verify.634549-13') }}
            </el-button>
            <!-- lets厂商不支持切换验证方式 -->
            <el-button
              v-if="factory_id != CertificateBrandsIds.letsencrypt"
              type="default"
              :disabled="['0'].includes(verifyDomainStore.status)"
              style="min-width: 130px"
              @click="verifyStore.dialogVisible = true"
            >
              {{ t('ssl-certificate.management.apply.verify.634549-14') }}
            </el-button>
          </el-form-item>
          <TipsBar
            v-if="['2'].includes(verifyDomainStore.status)"
            class="tips-group"
            color="#fe4d4f"
            background="#ffebeb"
          >
            <p class="tips-txt">
              {{ t('ssl-certificate.management.apply.verify.634549-15') }}
              <span class="link" @click="handleViewError">{{
                t('ssl-certificate.management.apply.verify.634549-16')
              }}</span>
              {{ t('ssl-certificate.management.apply.verify.634549-17') }}
            </p>
          </TipsBar>
        </template>
      </el-step>
      <el-step class="step-item">
        <template #icon>
          <span class="step-num">4</span>
        </template>
        <template #title>
          <p class="step-title">
            {{ t('ssl-certificate.management.apply.verify.634549-18') }}
          </p>
        </template>
        <template #description>
          <div class="df ac mb10">
            <el-link type="primary" style="margin-right: 10px" @click="handleHelp">
              {{ t('ssl-certificate.management.apply.verify.634549-19') }}
              <SvgIcon name="storage-link" class="icon" style="margin-left: 5px" />
            </el-link>
            <p style="font-size: 14px">
              {{ t('ssl-certificate.management.apply.verify.634549-20') }}
            </p>
          </div>
          <div class="df ac">
            <el-link href="/ssl/hosting" type="primary" style="margin-right: 10px">
              {{ t('ssl-certificate.management.apply.verify.634549-21') }}
              <SvgIcon name="storage-link" class="icon" style="margin-left: 5px" />
            </el-link>
            <p style="font-size: 14px">
              {{ t('ssl-certificate.management.apply.verify.634549-22') }}
            </p>
          </div>
        </template>
      </el-step>
    </el-steps>
    <el-divider style="margin-top: 0; border-color: #eee" />
    <el-form-item>
      <el-button type="primary" style="min-width: 90px; margin-right: 10px" @click="handleOver">
        {{ t('ssl-certificate.management.apply.verify.634549-23') }}
      </el-button>
      <el-button type="default" style="min-width: 90px" @click="handleBack">
        {{ t('ssl-certificate.management.apply.verify.634549-24') }}
      </el-button>
    </el-form-item>
  </div>
  <el-dialog v-model="verifyStore.dialogVisible" title="" width="550" class="verify-type-dialog" center>
    <template #header>
      <p class="title">
        {{ t('ssl-certificate.management.apply.verify.634549-25') }}
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
        <el-button type="primary" :loading="verifyStore.loading" @click="changVerifyType">
          {{ t('ssl-certificate.management.apply.verify.634549-26') }}
        </el-button>
        <el-button @click="verifyStore.dialogVisible = false">
          {{ t('ssl-certificate.management.apply.verify.634549-27') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="viewErrorDialogVisible" title="" width="550" class="error-reason-dialog" center>
    <template #header>
      <p class="title">
        {{ t('ssl-certificate.management.apply.verify.634549-28') }}
      </p>
    </template>
    <div class="line">
      <p class="line-head">
        {{ t('ssl-certificate.management.apply.verify.634549-29') }}
      </p>
      <p v-html="t('ssl-certificate.management.apply.verify.634549-29-0')" />
    </div>
    <br />
    <div class="line">
      <p class="line-head">
        {{ t('ssl-certificate.management.apply.verify.634549-30') }}
      </p>
      <p>{{ t('ssl-certificate.management.apply.verify.634549-31') }}</p>
    </div>
    <br />
    <div class="line">
      <p class="line-head">
        {{ t('ssl-certificate.management.apply.verify.634549-32') }}
      </p>
      <p>
        {{ t('ssl-certificate.management.apply.verify.634549-32-0') }}
      </p>
    </div>
    <br />
    <div class="line">
      <p class="line-head">
        {{ t('ssl-certificate.management.apply.verify.634549-33') }}
      </p>
    </div>
    <br />
    <div class="line">
      <p class="line-head">
        {{ t('ssl-certificate.management.apply.verify.634549-36') }}
      </p>
      <p>{{ t('ssl-certificate.management.apply.verify.634549-36-0') }}</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="viewErrorDialogVisible = false">
          {{ t('ssl-certificate.management.apply.verify.634549-26') }}
        </el-button>
        <el-button @click="viewErrorDialogVisible = false">
          {{ t('ssl-certificate.management.apply.verify.634549-27') }}
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
import { documentUrl } from '@/config/base-config'
import { replaceRoute } from '@/utils/router-jump'

const router = useRouter()
const route = useRoute()
const { cert_id } = route.query as { cert_id?: string; factory_id?: number }
const factory_id = _s_getItem(SSL_CERTIFICATE_FACTORY_ID)
const verify_type_map = ['-', 'CNAME', 'TXT']

const props = defineProps<{
  verifyType: number
}>()
const emits = defineEmits(['switchVerifyType'])

const validateInfoStore = reactive<{
  cname_or_txt_validate: ValidateInfoResp['cname_or_txt_validate']
  loading: boolean
}>({
  // 验证信息
  cname_or_txt_validate: [],
  loading: false,
})
const getValidateInfo = async () => {
  // 获取验证信息
  if (!cert_id) {
    message.error(t('ssl-certificate.management.apply.verify.634549-37'))
    return
  }
  try {
    validateInfoStore.loading = true
    const { code, msg, data } = await _validateInfo({
      cert_id: cert_id,
    })
    if (code === 200 && data) {
      validateInfoStore.cname_or_txt_validate = data.cname_or_txt_validate
    } else {
      message.error(msg || t('ssl-certificate.management.apply.verify.634549-38'))
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
  message.success(t('ssl-certificate.management.apply.verify.634549-39'))
}

// 验证域名状态
const verifyDomainStore = reactive({
  status: '1',
  loading: false,
})
const verifyDomain = async () => {
  // 获取验证信息
  if (!cert_id) {
    message.error(t('ssl-certificate.management.apply.verify.634549-37'))
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
        message.success(t('ssl-certificate.management.apply.verify.634549-40'))
      }
    } else {
      verifyDomainStore.status = '2'
      message.error(msg || t('ssl-certificate.management.apply.verify.634549-41'))
    }
  } catch (e) {
    // verifyDomainStore.status = '2'
  } finally {
    verifyDomainStore.loading = false
  }
}
// 查看失败原因弹窗
const viewErrorDialogVisible = ref(false)
const handleViewError = () => {
  // 查看失败原因
  viewErrorDialogVisible.value = true
}
// 切换验证方式
const verifyStore = reactive({
  dialogVisible: false,
  verifyType: 1,
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
    message.error(t('ssl-certificate.management.apply.verify.634549-37'))
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
      message.error(msg || t('ssl-certificate.management.apply.verify.634549-42'))
    }
  } finally {
    verifyStore.loading = false
  }
}
const handleHelp = () => {
  window.open(documentUrl + `document/detail?type=ssl&docs=2671230721613`)
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

    .info-card {
      max-height: 500px;
      padding-right: 20px;
      margin-bottom: 20px;
      overflow: auto;

      .v-info-group {
        padding-bottom: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;

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
        font-size: 14px;

        // padding: 7px 14px;
        font-weight: 400;
        line-height: 20px;
        color: #000;
      }

      .value {
        position: relative;
        box-sizing: content-box;
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

    .tips-group {
      padding: 7px 13px;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #f7b500;
      background: #fff3d3;

      .tips-txt {
        .link {
          color: #0063ff;
          cursor: pointer;
        }
      }

      .icon {
        margin-top: 3px;
        margin-right: 8px;
      }

      &.error {
        color: #fe4d4f;
        background: #ffebeb;
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

  .line {
    .line-head {
      font-weight: bold;
    }

    p {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #000;
    }
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
