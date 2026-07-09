<template>
  <CatDialog
    v-if="show"
    v-model:dialog="dialogVisible"
    :loading="loading"
    :title="$t('oss.createBucket')"
    :width="dialogClass"
    @update:dialog="cancel"
    @open="open"
  >
    <div class="step df jc">
      <CatStep v-model="step" :steps="stepList" class="mt20 mb20" />
    </div>
    <el-form ref="formRef" :model="form" class="create-oss-form" label-width="auto" label-position="left">
      <template v-if="step === 0">
        <el-form-item :label="t('oss.region')" prop="region">
          <div>
            <el-select v-model="form.location" disabled>
              <el-option label="亚太地区" :value="1" />
            </el-select>
            <el-select v-model="form.region" disabled class="ml20">
              <el-option label="日本-东京" value="ap-tokyo-1" />
            </el-select>
          </div>
          <p style="color: #666">
            <span style="color: #000">{{ t('oss.regionTip1') }}</span
            >{{ t('oss.regionTip2') }}
          </p>
        </el-form-item>
        <el-form-item
          :label="t('oss.name')"
          prop="name"
          :rules="[
            {
              validator: (rule, value, cb) => {
                // change时只本地校验
                const msg = localValidateName(value)
                if (msg) cb(new Error(msg))
                else cb()
              },
              trigger: 'change',
            },
            { validator: asyncValidateName, trigger: 'blur' },
          ]"
        >
          <template #label>
            <div class="df ac h-full">
              <p>{{ t('oss.name') }}<span style="color: #f53f3f">*</span></p>
              <el-tooltip :content="t('oss.nameTip2')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="ml10" />
              </el-tooltip>
            </div>
          </template>
          <div>
            <el-input v-model="form.name" :placeholder="t('oss.bucketNameTip')" class="mr10" style="width: 360px" />
            <span>-{{ appId }}</span>
          </div>
        </el-form-item>
        <p :style="`margin-left: ${labelMargin}; margin-top: -10px; margin-bottom: 10px`">
          <span v-show="60 - osName.length > 0" class="desc">{{
            t('oss.nameTip1', [60 - osName.length > 0 ? 60 - osName.length : 0])
          }}</span
          ><span class="desc">{{ t('oss.nameTip2') }}</span
          >{{ t('oss.nameTip') }}
        </p>
        <el-form-item :label="t('oss.accessPermissions')">
          <el-radio-group v-model="form.access">
            <el-radio :label="1">
              {{ t('oss.privateReadWrite') }}
            </el-radio>
            <el-radio :label="2">
              <div class="df ac">
                {{ t('oss.publicReadPrivateWrite')
                }}<el-tag type="danger" class="ml10">
                  {{ t('oss.highRisk') }}
                </el-tag>
              </div>
            </el-radio>
            <el-radio :label="3">
              <div class="df ac">
                {{ t('oss.publicReadWrite')
                }}<el-tag type="danger" class="ml10">
                  {{ t('oss.highRisk') }}
                </el-tag>
              </div>
            </el-radio>
          </el-radio-group>
          <p v-if="form.access === 1" class="desc">
            {{ t('oss.readWriteTip1') }}
          </p>
          <template v-else-if="form.access === 2 || form.access === 3">
            <p v-if="form.access === 2" class="desc">
              {{ t('oss.readWriteTip2') }}
            </p>
            <p v-else class="desc">
              {{ t('oss.readWriteTip3') }}
            </p>
            <p class="desc df ac">
              <el-tag type="warning" class="mr10">
                {{ t('oss.billing') }} </el-tag
              >{{ t('oss.readWriteTip4') }}
            </p>
            <p class="desc df ac">
              <el-tag type="danger" class="mr10">
                {{ t('oss.attention') }} </el-tag
              >{{ t('oss.readWriteTip5') }}
            </p>
          </template>
        </el-form-item>
        <!-- <el-form-item v-if="form.access !== 1" :label="t('oss.defaultWarning')">
          <el-switch v-model="form.default" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
          <div class="desc">{{ t('oss.defaultWarningTip') }}</div>
        </el-form-item> -->
        <el-form-item class="mt10" :label="t('oss.requestDomain')">
          <p>{{ `<${form.name || t('oss.name')}>-${appId}${domainSuffix}` }}</p>
          <div>
            <p class="desc">
              {{ t('oss.requestDomainTip1') }}
            </p>
            <p class="desc df ac mt10">
              <el-tag type="danger" class="mr10">
                {{ t('oss.attention') }} </el-tag
              >{{ t('oss.requestDomainTip2') }}
            </p>
          </div>
        </el-form-item>
      </template>
      <template v-else-if="step === 1">
        <!-- <el-form-item :label="t('oss.versionControl')">
          <el-switch v-model="form.versionFlag"></el-switch>
          <div class="desc">{{ t('oss.versionControlTip1') }}</div>
          <div class="desc">{{ t('oss.versionControlTip2') }}</div>
        </el-form-item> -->
        <el-form-item :label="t('oss.serverEncryption')">
          <el-radio-group v-model="form.serverEnc">
            <el-radio :label="1">
              {{ t('oss.noEncryption') }}
            </el-radio>
            <el-radio :label="2">
              <div class="df ac">
                {{ t('oss.sseCosEncryption') }}
                <el-tooltip :content="t('oss.sseCosEncryptionTip')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </el-radio>
          </el-radio-group>
          <p v-if="form.serverEnc === 2" class="desc">
            {{ t('oss.sseCosEncryptionTip1') }}
          </p>
        </el-form-item>
      </template>
      <template v-else-if="step === 2">
        <el-form-item class="mt10" :label="t('oss.name')">
          <p>
            {{ `${form.name}-${appId}` }}<span class="desc">{{ t('oss.notModifyAfterCreation') }}</span>
          </p>
        </el-form-item>
        <el-form-item class="mt10" :label="t('oss.region')">
          <p>
            {{ `亚太地区 日本东京` }}<span class="desc">{{ t('oss.notModifyAfterCreation') }}</span>
          </p>
        </el-form-item>
        <el-form-item class="mt10" :label="t('oss.accessPermissions')">
          <p>
            {{
              [t('oss.privateReadWrite'), t('oss.publicReadPrivateWrite'), t('oss.publicReadWrite')][form.access - 1]
            }}
          </p>
        </el-form-item>
        <el-form-item class="mt10" :label="t('oss.requestDomain')">
          <p>
            {{ `${form.name}-${appId}${domainSuffix}` }}

            <el-tooltip :content="t('oss.highRiskTip')" placement="top" effect="light">
              <el-tag type="danger" class="ml10">
                {{ t('oss.highRisk') }}
              </el-tag>
            </el-tooltip>
          </p>
        </el-form-item>
        <!-- <el-form-item class="mt10" :label="t('oss.versionControl')">
          <p>{{ form.versionFlag ? t(`oss.open`) : t(`oss.close`) }}</p>
        </el-form-item> -->
        <el-form-item class="mt10" :label="t('oss.serverEncryption')">
          <p>
            {{ form.serverEnc === 1 ? t(`oss.noEncryption`) : t(`oss.sseCosEncryption`) }}
          </p>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <div class="cat-dialog-footer">
        <el-button class="mb20" @click="cancel">
          {{ step === 0 ? $t('oss.cancel') : t('oss.previousStep') }}
        </el-button>
        <el-button type="primary" class="mb20" @click="submit">
          {{ step === stepList.length - 1 ? t('oss.create') : t('oss.nextStep') }}
        </el-button>
      </div>
    </template>
  </CatDialog>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import t from '@/utils/i18n'
import { _checkStorageName, _createStorage, _getBucketDomainSuffix } from '@/apis/oss/storage-list'
import { notify } from '@/utils/notification'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['update:show', 'success'])
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '810px',
  [en]: '940px',
  [zh]: '810px',
}
const labelMarginMap = {
  [ja]: '148px',
  [en]: '148px',
  [zh]: '78px',
}
const dialogClass = useI18nStyle(dialogMap)
const labelMargin = useI18nStyle(labelMarginMap)

const userStore = useUserStore()
const formRef = ref<any>(null)
const loading = ref<boolean>(false)

const dialogVisible = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
})

const step = ref<number>(0)
const stepList = [
  { label: t('oss.basicInformation'), value: 0 },
  { label: t('oss.advancedOptionalConfiguration'), value: 1 },
  { label: t('oss.confirmConfiguration'), value: 2 },
]

const form = reactive({
  location: 1,
  region: 'ap-tokyo-1',
  name: '',
  access: 1,
  default: true,
  versionFlag: false,
  serverEnc: 1,
})

const domainSuffix = ref('-') // 地域简称和后缀
const appId = computed(() => userStore.user.appId || '')
const maxDomainLength = 60

const localValidateName = (value: string) => {
  if (!value) {
    return t('oss.pleaseEnterBucketName')
  }
  if (!/^[a-z0-9-]+$/.test(value)) {
    return t('oss.nameRule')
  }
  if (value.startsWith('-') || value.endsWith('-')) {
    return t('oss.nameRule1')
  }
  const fullDomain = `${value}-${appId.value}${domainSuffix.value}`
  if (fullDomain.length > maxDomainLength) {
    return t('oss.nameRule2', [maxDomainLength])
  }
  return ''
}

const asyncValidateName = (rule: any, value: string, callback: any) => {
  const localMsg = localValidateName(value)
  if (localMsg) {
    callback(new Error(localMsg))
    return
  }
  _checkStorageName({ bucketNameWithAppid: `${value}-${appId.value}` })
    .then(res => {
      if (res.data.exists) {
        callback(new Error(t('oss.nameCheckError')))
        return
      }
      callback()
    })
    .catch(() => {
      callback(new Error(t('oss.nameCheckError')))
    })
}

const osName = computed(() => {
  return `${form.name}-${appId.value}${domainSuffix.value}`
})

// 获取桶域名后缀
const getDomainSuffix = () => {
  _getBucketDomainSuffix({
    region: form.region,
  })
    .then(res => {
      domainSuffix.value = res.data.domainSuffix
    })
    .catch(() => {})
}

// 弹窗打开
const open = async () => {
  emit('update:show', true)
}

watch(
  () => props.show,
  val => {
    if (val) {
      getDomainSuffix()
    }
  },
  {
    immediate: true,
  },
)

// 弹窗关闭
const cancel = () => {
  if (step.value === 0) {
    emit('update:show', false)
  } else {
    step.value = step.value - 1
  }
}

const submit = () => {
  if (step.value === 0) {
    formRef.value &&
      formRef.value.validateField(['name'], (valid: boolean) => {
        if (valid) {
          step.value = 1
        }
      })
  } else if (step.value === 1) {
    step.value = 2
  } else if (step.value === 2) {
    createBucket()
  }
}

const createBucket = async () => {
  loading.value = true
  const { data } = await _createStorage({
    bucketName: `${form.name}-${appId.value}`,
    region: form.region,
    'x-cos-acl': ['private', 'public-read', 'public-read-write'][form.access - 1],
    'x-oss-server-side-encryption': form.serverEnc === 2 ? 'AES256' : 'default',
  })

  loading.value = false
  if (data.code !== 200) {
    notify.error({
      message: t(data.message || data.msg),
      offset: 100,
      duration: 3000,
    })
  } else {
    notify.success({
      message: t('oss.createSuccess'),
      offset: 100,
      duration: 3000,
    })
    emit('success')
    dialogVisible.value = false
  }
}

defineExpose({
  open,
  cancel,
})
</script>

<style lang="scss" scoped>
.el-radio-group :deep(.el-radio.is-checked) .el-radio__input .el-radio__inner {
  background: var(--success-color);
  border: 1px solid var(--success-color);
}

.desc {
  font-size: 14px;
  font-weight: 400;
  color: #666;
}

.step {
  border-bottom: 1px solid #eee;

  .cat-step {
    width: auto;

    :deep(.cat-step-item) {
      width: auto;
      min-width: auto;
      margin-right: 0;
      margin-bottom: 0;

      .step-item-arrow {
        margin: 0 30px;
      }

      .step-item-text {
        max-width: none;
      }
    }
  }
}

.create-oss-form {
  margin-top: 22px;

  :deep(.el-form-item__label) {
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }

  :deep(.el-form-item__content) {
    display: block !important;
  }
}

.cat-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 0 0;

  .el-button {
    width: auto !important;
    max-width: max-content;
    height: var(--input-height);
    padding: 0 24px !important;

    span {
      flex-shrink: 0;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
