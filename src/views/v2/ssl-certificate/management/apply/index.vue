<template>
  <div class="ssl-apply-v2">
    <PageToolbar :title="t('ssl-certificate.router.931344-4')" :show-doc="false" />

    <section class="ssl-apply-v2__panel">
      <div class="ssl-apply-v2__steps">
        <div class="ssl-apply-v2__step" :class="{ 'is-active': step.current === 0, 'is-done': step.current > 0 }">
          <span class="ssl-apply-v2__step-badge">{{ step.current > 0 ? '✓' : '1' }}</span>
          <span class="ssl-apply-v2__step-label">{{ t('ssl-certificate.management.apply.760402-0') }}</span>
        </div>

        <span class="ssl-apply-v2__step-line" />

        <div class="ssl-apply-v2__step" :class="{ 'is-active': step.current === 1 }">
          <span class="ssl-apply-v2__step-badge">2</span>
          <span class="ssl-apply-v2__step-label">{{ t('ssl-certificate.management.apply.760402-1') }}</span>
        </div>
      </div>

      <section v-if="step.current === 0" class="ssl-apply-v2__content">
        <el-form
          ref="formRef"
          :model="formStore"
          :rules="formRules"
          label-position="left"
          label-width="132px"
          hide-required-asterisk
          class="ssl-apply-v2__form"
        >
          <el-form-item :label="t('ssl-certificate.management.apply.516752-0')" class="ssl-apply-v2__item">
            <div class="ssl-apply-v2__product">
              {{ productLabel }}
            </div>
          </el-form-item>

          <el-form-item prop="backup_domain_str" class="ssl-apply-v2__item ssl-apply-v2__item--top">
            <template #label>
              <span class="ssl-apply-v2__label">
                {{ t('ssl-certificate.management.apply.516752-2') }}
                <span class="ssl-apply-v2__required">*</span>
              </span>
            </template>

            <div class="ssl-apply-v2__textarea-wrap">
              <el-input
                v-model="formStore.backup_domain_str"
                type="textarea"
                resize="none"
                :rows="4"
                :disabled="formStore.csr_generate_type === 3"
                :class="[
                  'ssl-apply-v2__control',
                  'ssl-apply-v2__textarea',
                  { 'is-invalid': !formDomainValid && formStore.backup_domain_str },
                ]"
                :placeholder="t('ssl-certificate.management.apply.516752-3')"
              />
              <div class="ssl-apply-v2__count">{{ domainTextCount }}/200</div>
            </div>
          </el-form-item>

          <el-form-item prop="csr_generate_type" class="ssl-apply-v2__item">
            <template #label>
              <span class="ssl-apply-v2__label">
                {{ t('ssl-certificate.management.apply.516752-4') }}
                <span class="ssl-apply-v2__required">*</span>
              </span>
            </template>

            <div class="ssl-apply-v2__block">
              <el-radio-group v-model="formStore.csr_generate_type" class="ssl-apply-v2__radio-group">
                <el-radio
                  v-for="item in csrCreateRadios"
                  :key="item.value"
                  :label="item.value"
                  :disabled="item.disabled?.(formStore.validate_type)"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </div>
          </el-form-item>

          <el-form-item
            v-if="currentCsrTips"
            class="ssl-apply-v2__item ssl-apply-v2__item--sub ssl-apply-v2__item--compact"
          >
            <template #label>
              <span class="ssl-apply-v2__placeholder-label" />
            </template>

            <div class="ssl-apply-v2__alert">
              <SvgIcon name="cat-cdn-warning" class="ssl-apply-v2__alert-icon" />
              <span v-html="currentCsrTips" />
            </div>
          </el-form-item>

          <el-form-item v-if="formStore.csr_generate_type === 2" class="ssl-apply-v2__item ssl-apply-v2__item--sub">
            <template #label>
              <span class="ssl-apply-v2__placeholder-label" />
            </template>

            <div class="ssl-apply-v2__manual">
              <div class="ssl-apply-v2__manual-inner">
                <div class="ssl-apply-v2__grid ssl-apply-v2__grid--single">
                  <el-form-item prop="email" class="ssl-apply-v2__nested-item">
                    <template #label>
                      <span class="ssl-apply-v2__nested-label">{{
                        t('ssl-certificate.management.apply.516752-5')
                      }}</span>
                    </template>
                    <el-input
                      v-model.trim="formStore.email"
                      :placeholder="t('ssl-certificate.management.apply.516752-6')"
                      class="ssl-apply-v2__control"
                    />
                  </el-form-item>
                </div>

                <div class="ssl-apply-v2__grid ssl-apply-v2__grid--double">
                  <el-form-item prop="company" class="ssl-apply-v2__nested-item">
                    <template #label>
                      <span class="ssl-apply-v2__nested-label">{{
                        t('ssl-certificate.management.apply.516752-7')
                      }}</span>
                    </template>
                    <el-input
                      v-model.trim="formStore.company"
                      :placeholder="t('ssl-certificate.management.apply.516752-8')"
                      class="ssl-apply-v2__control"
                    />
                  </el-form-item>

                  <el-form-item prop="department" class="ssl-apply-v2__nested-item">
                    <template #label>
                      <span class="ssl-apply-v2__nested-label">{{
                        t('ssl-certificate.management.apply.516752-9')
                      }}</span>
                    </template>
                    <el-input
                      v-model.trim="formStore.department"
                      :placeholder="t('ssl-certificate.management.apply.516752-10')"
                      class="ssl-apply-v2__control"
                    />
                  </el-form-item>
                </div>

                <div class="ssl-apply-v2__grid ssl-apply-v2__grid--double">
                  <el-form-item prop="country" class="ssl-apply-v2__nested-item">
                    <template #label>
                      <span class="ssl-apply-v2__nested-label">{{
                        t('ssl-certificate.management.apply.516752-11')
                      }}</span>
                    </template>
                    <el-select v-model="formStore.country" class="ssl-apply-v2__control">
                      <el-option
                        v-for="country in dict.countryList"
                        :key="country.code"
                        :label="country.name"
                        :value="country.code"
                      />
                    </el-select>
                  </el-form-item>
                </div>

                <div class="ssl-apply-v2__grid ssl-apply-v2__grid--double">
                  <el-form-item prop="province" class="ssl-apply-v2__nested-item">
                    <template #label>
                      <span class="ssl-apply-v2__nested-label">{{
                        t('ssl-certificate.management.apply.516752-12')
                      }}</span>
                    </template>
                    <el-input
                      v-model.trim="formStore.province"
                      :placeholder="t('ssl-certificate.management.apply.516752-13')"
                      class="ssl-apply-v2__control"
                    />
                  </el-form-item>

                  <el-form-item prop="city" class="ssl-apply-v2__nested-item">
                    <template #label>
                      <span class="ssl-apply-v2__nested-label">{{
                        t('ssl-certificate.management.apply.516752-14')
                      }}</span>
                    </template>
                    <el-input
                      v-model.trim="formStore.city"
                      :placeholder="t('ssl-certificate.management.apply.516752-13')"
                      class="ssl-apply-v2__control"
                    />
                  </el-form-item>
                </div>

                <div class="ssl-apply-v2__grid ssl-apply-v2__grid--double">
                  <el-form-item prop="encryption" class="ssl-apply-v2__nested-item">
                    <template #label>
                      <span class="ssl-apply-v2__nested-label">{{
                        t('ssl-certificate.management.apply.516752-15')
                      }}</span>
                    </template>
                    <el-select v-model="formStore.encryption" class="ssl-apply-v2__control">
                      <el-option
                        v-for="encryption in ENCRYPTION_MAP"
                        :key="encryption.value"
                        :label="encryption.label"
                        :value="encryption.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item prop="key_length" class="ssl-apply-v2__nested-item">
                    <template #label>
                      <span class="ssl-apply-v2__nested-label">{{
                        t('ssl-certificate.management.apply.516752-16')
                      }}</span>
                    </template>
                    <el-select v-model="formStore.key_length" class="ssl-apply-v2__control">
                      <el-option
                        v-for="item in keyLengthOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item
            v-else-if="formStore.csr_generate_type === 3"
            class="ssl-apply-v2__item ssl-apply-v2__item--sub"
          >
            <template #label>
              <span class="ssl-apply-v2__placeholder-label" />
            </template>

            <div class="ssl-apply-v2__existing">
              <div class="ssl-apply-v2__existing-row">
                <el-form-item prop="csr_id" class="ssl-apply-v2__nested-item ssl-apply-v2__nested-item--csr">
                  <el-select
                    v-model="formStore.csr_id"
                    filterable
                    remote-show-suffix
                    :filter-method="csrFilterMethod"
                    :loading="csrStore.loading"
                    class="ssl-apply-v2__control ssl-apply-v2__control--wide"
                    :placeholder="t('ssl-certificate.management.apply.516752-17')"
                    @change="handleCrsChange"
                  >
                    <el-scrollbar max-height="200px" @scroll="addCrsList">
                      <div ref="innerRef">
                        <el-option
                          v-for="crs in csrStore.list"
                          :key="crs.csr_id"
                          :label="`${crs.remark || 'undefined'} | ${crs.csr_id}`"
                          :value="crs.csr_id"
                        />
                      </div>
                    </el-scrollbar>
                  </el-select>
                </el-form-item>

                <el-link type="primary" class="ssl-apply-v2__create-link" @click="handleCreateCrs">
                  {{ t('ssl-certificate.management.apply.516752-18') }}
                  <SvgIcon name="storage-link" class="ssl-apply-v2__create-link-icon" />
                </el-link>
              </div>
            </div>
          </el-form-item>

          <el-form-item prop="validate_type" class="ssl-apply-v2__item ssl-apply-v2__item--verify">
            <template #label>
              <span class="ssl-apply-v2__label">
                {{ t('ssl-certificate.management.apply.516752-19') }}
                <span class="ssl-apply-v2__required">*</span>
              </span>
            </template>

            <div class="ssl-apply-v2__block">
              <el-radio-group v-model="formStore.validate_type" class="ssl-apply-v2__radio-group">
                <el-radio
                  v-for="item in certificateVerifyRadios"
                  :key="item.key"
                  :label="item.key"
                  :disabled="item.disabled?.(formStore.cert_domain_type)"
                >
                  <span class="ssl-apply-v2__radio-text">
                    {{ item.label }}
                    <el-tooltip
                      v-if="item.tooltip"
                      :content="item.tooltip"
                      placement="top"
                      effect="light"
                      popper-class="max-400"
                    >
                      <SvgIcon name="cat-cdn-tip" class="ssl-apply-v2__tip-icon" />
                    </el-tooltip>
                  </span>
                </el-radio>
              </el-radio-group>

              <p v-if="currentVerifyTips" class="ssl-apply-v2__tips">
                {{ currentVerifyTips }}
              </p>

              <el-form-item
                v-if="currentVerifyKey === EnumCertificateVerifyKey.AUTO"
                prop="auto_config"
                class="ssl-apply-v2__nested-item ssl-apply-v2__nested-item--checkbox"
              >
                <el-checkbox v-model="formStore.auto_config" label="y">
                  {{ t('ssl-certificate.management.apply.516752-20') }}
                </el-checkbox>
              </el-form-item>
            </div>
          </el-form-item>

          <el-form-item :label="t('ssl-certificate.management.apply.516752-21')" class="ssl-apply-v2__item">
            <span class="ssl-apply-v2__validity">{{ t('ssl-certificate.management.apply.516752-22') }}</span>
          </el-form-item>
        </el-form>

        <div class="ssl-apply-v2__footer">
          <el-button type="primary" :loading="loading" @click="onSubmit">
            {{ t('ssl-certificate.management.apply.516752-23') }}
          </el-button>
          <el-button :disabled="loading" @click="handleBack">
            {{ t('ssl-certificate.management.apply.516752-24') }}
          </el-button>
        </div>
      </section>

      <section v-else class="ssl-apply-v2__verify">
        <LegacyVerifyPage />
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus/es'
import type { CreateCertReq, ListCSRResp } from '@/apis/ssl-certificate/management/type'
import { _getCountry } from '@/apis/domain'
import { _createCert, _getCsrDetail, _getCsrList } from '@/apis/ssl-certificate/management'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import {
  ENCRYPTION_MAP,
  KEY_LENGTH_MAP,
  CERTIFICATE_TYPES_MAP,
  CERT_DOMAIN_TYPES_MAP,
  CertDomainTypes,
  EnumCertificateVerifyKey,
} from '@/views/ssl-certificate/config'
import {
  SSL_CERTIFICATE_APPLY_TAB,
  SSL_CERTIFICATE_CERT_DOMAIN_TYPE,
  SSL_CERTIFICATE_VERIFY_TYPE,
  certificateVerifyRadios,
  csrCreateRadios,
  validSingleDomain,
  validWildcardDomain,
} from '@/views/ssl-certificate/management/config'
import LegacyVerifyPage from '@/views/ssl-certificate/management/apply/components/verify/index.vue'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'
import { filterArray } from '@/utils/filter'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { EMAIL_REG } from '@/utils/reg'
import { pushRoute, replaceRoute } from '@/utils/router-jump'
import { _s_getItem, _s_setItem } from '@/utils/storage'

const route = useRoute()
const { cert_id, cert_type } = route.query as {
  cert_id?: string
  cert_type?: number
}

const formRef = ref<FormInstance>()
const formDomainValid = ref(true)
const loading = ref(false)
const step = reactive({
  current: Number(_s_getItem(SSL_CERTIFICATE_APPLY_TAB) || 0),
})

const formStore = reactive<
  CreateCertReq & {
    backup_domain_str?: string
    cert_domain_type: number
    auto_config?: boolean
  }
>({
  cert_domain_type: CertDomainTypes.SINGLE,
  validate_type: EnumCertificateVerifyKey.AUTO,
  cert_id: cert_id || '',
  csr_generate_type: 1,
  domain: 'dd.com',
  encryption: 1,
  key_length: 1,
})

const dict = reactive<{
  countryList: Array<{ code: string; name: string }>
}>({
  countryList: [],
})

const productLabel = computed(() => {
  const productName = filterArray(CERTIFICATE_TYPES_MAP, 'id', cert_type)?.fullName || ''
  const domainTypeName = filterArray(CERT_DOMAIN_TYPES_MAP, 'id', formStore.cert_domain_type)?.name || ''
  return `${productName}${domainTypeName}`
})

const domainTextCount = computed(() => formStore.backup_domain_str?.length || 0)
const currentCsrTips = computed(() => filterArray(csrCreateRadios, 'value', formStore.csr_generate_type)?.tips || '')
const currentVerifyTips = computed(
  () => filterArray(certificateVerifyRadios, 'key', formStore.validate_type)?.tips || '',
)
const currentVerifyKey = computed(() => filterArray(certificateVerifyRadios, 'key', formStore.validate_type)?.key)
const keyLengthOptions = computed(() => filterArray(KEY_LENGTH_MAP, 'encryption', [formStore.encryption!]))

const getCountry = async () => {
  const res = await _getCountry()
  dict.countryList = res.data.countries
}

watch(
  () => formStore.cert_domain_type,
  value => {
    if (value === 2) formStore.validate_type = 2
    else if (value === 3 && formStore.validate_type === 3) formStore.validate_type = 2
  },
)

watch(
  () => formStore.csr_generate_type,
  value => {
    if (value === 3) {
      const csr = csrStore.list.find(item => item.csr_id === formStore.csr_id)
      formStore.backup_domain_str = csr?.common_name
      formRef.value?.clearValidate()
      formDomainValid.value = true
    }
  },
)

watch(
  () => formStore.encryption,
  () => {
    formStore.key_length = (keyLengthOptions.value?.[0]?.value || 1) as CreateCertReq['key_length']
  },
)

const csrStore = reactive<{
  list: ListCSRResp['items']
  query: string
  loading: boolean
}>({
  list: [],
  query: '',
  loading: false,
})

const innerRef = ref<HTMLDivElement>()
const scrollStore = reactive({
  status: 'failed' as 'failed' | 'loading' | 'noData' | 'padding',
  page: {
    page: 1,
    page_size: 15,
    total: 0,
  },
})

const getCrsList = async () => {
  try {
    scrollStore.page.page = 1
    csrStore.loading = true
    const { code, msg, data } = await _getCsrList({
      page: 1,
      csr_domain_type: formStore.cert_domain_type,
      page_size: scrollStore.page.page_size,
      csr_name: csrStore.query,
    })

    if (code === 200 && data) {
      scrollStore.page.total = data.total
      csrStore.list = data.items
      scrollStore.status = data.total > data.items.length ? 'padding' : 'noData'
      return
    }

    message.error(msg || t('common.error'))
  } finally {
    csrStore.loading = false
  }
}

const csrFilterMethod = (query: string) => {
  csrStore.query = query
  getCrsList()
}

const addCrsList = async ({ scrollTop }: { scrollTop: number }) => {
  if (['loading', 'noData'].includes(scrollStore.status)) return

  const innerHeight = innerRef.value?.clientHeight || 0
  if (innerHeight - scrollTop > 200) return

  try {
    scrollStore.status = 'loading'
    scrollStore.page.page += 1
    const { code, msg, data } = await _getCsrList({
      csr_name: csrStore.query,
      csr_domain_type: formStore.cert_domain_type,
      page: scrollStore.page.page,
      page_size: scrollStore.page.page_size,
    })

    if (code === 200 && data) {
      scrollStore.page.page = data.page
      scrollStore.page.page_size = data.page_size
      scrollStore.page.total = data.total
      csrStore.list = [...csrStore.list, ...data.items]
      scrollStore.status = data.items.length === 0 ? 'noData' : 'padding'
      return
    }

    scrollStore.page.page -= 1
    scrollStore.status = 'failed'
    message.error(msg || t('common.error'))
  } catch (error) {
    scrollStore.page.page -= 1
    scrollStore.status = 'failed'
  } finally {
    csrStore.loading = false
  }
}

const handleCrsChange = async (csr_id: string) => {
  const { code, data, msg } = await _getCsrDetail({ csr_id })
  if (code === 200 && data) {
    formStore.backup_domain_str = data.subject_alt_names?.join(',')
    return
  }

  message.error(msg || t('common.error'))
}

const handleCreateCrs = () => {
  pushRoute({ name: 'ssl_certificate_create_csr' })
}

const formRules: FormRules<typeof formStore> = {
  validate_type: [
    {
      validator(rule, value, callback) {
        if (!value) callback(new Error(t('ssl-certificate.management.apply.516752-25')))
        else callback()
      },
    },
  ],
  auto_config: {
    validator(rule, value, callback) {
      if (formStore.validate_type === EnumCertificateVerifyKey.AUTO && !value) {
        callback(new Error(t('ssl-certificate.management.apply.516752-26')))
      } else {
        callback()
      }
    },
  },
  backup_domain_str: [
    { required: true, message: t('ssl-certificate.management.apply.516752-27'), trigger: 'blur' },
    {
      validator: (rule, value: string, callback) => {
        if (!value) callback(new Error(t('ssl-certificate.management.apply.516752-27')))

        const domains = value
          .split(/,|\n/)
          .map(item => item.trim())
          .filter(Boolean)
        const setDomain = new Set()

        try {
          if (formStore.cert_domain_type === CertDomainTypes.SINGLE) {
            if (domains.length > 1) throw t('ssl-certificate.management.apply.516752-28')
            if (domains.some(domain => domain.startsWith('*'))) throw t('ssl-certificate.management.apply.516752-29')
          }

          if (
            formStore.cert_domain_type === CertDomainTypes.MULTIPLE &&
            domains.some(domain => domain.startsWith('*'))
          ) {
            throw t('ssl-certificate.management.apply.516752-29')
          }

          if (formStore.cert_domain_type === CertDomainTypes.WILDCARD) {
            if (!domains.every(domain => domain.startsWith('*'))) throw t('ssl-certificate.management.apply.516752-30')
          }

          if (domains.length === 0) throw t('ssl-certificate.management.apply.516752-27')
          if (domains.length > 50) throw t('ssl-certificate.management.apply.516752-31')

          domains.forEach(domain => {
            if (setDomain.has(domain)) throw t('ssl-certificate.management.apply.516752-32')
            setDomain.add(domain)
          })

          if (!domains.every(domain => validSingleDomain(domain) || validWildcardDomain(domain))) {
            throw t('ssl-certificate.management.apply.516752-33')
          }

          formDomainValid.value = true
          callback()
        } catch (error: any) {
          callback(error)
          formDomainValid.value = false
        }
      },
      trigger: 'blur',
    },
  ],
  csr_id: [
    {
      validator(rule, value, callback) {
        if (!value) callback(new Error(t('ssl-certificate.management.apply.516752-34')))
        else callback()
      },
      trigger: 'change',
    },
  ],
  csr_generate_type: [
    {
      validator(rule, value, callback) {
        if (!value) callback(new Error(t('ssl-certificate.management.apply.516752-34')))
        else callback()
      },
      trigger: 'change',
    },
  ],
  email: [
    {
      required: true,
      trigger: 'blur',
      validator(rule, value, callback) {
        if (!value) {
          callback(new Error(t('ssl-certificate.management.apply.516752-27')))
        } else if (!EMAIL_REG.test(value)) {
          callback(t('ssl-certificate.management.apply.516752-35'))
        } else {
          callback()
        }
      },
    },
  ],
  company: { max: 32, message: t('ssl-certificate.management.apply.516752-36'), trigger: 'blur' },
  department: { max: 32, message: t('ssl-certificate.management.apply.516752-37'), trigger: 'blur' },
  province: { max: 32, message: t('ssl-certificate.management.apply.516752-38'), trigger: 'blur' },
  city: { max: 32, message: t('ssl-certificate.management.apply.516752-39'), trigger: 'blur' },
}

const switchStep = (value: number) => {
  step.current = value
  _s_setItem(SSL_CERTIFICATE_APPLY_TAB, value)
}

const onSubmit = async () => {
  const isValid = await formRef.value?.validate(valid => {
    formDomainValid.value = valid
  })

  if (!isValid) return

  const { backup_domain_str, csr_generate_type } = formStore

  let data = {
    cert_id: formStore.cert_id,
    domain: backup_domain_str
      ?.split(/,|\n/)
      .map(item => item.trim())
      .filter(Boolean)
      .join(','),
    validate_type: filterArray(certificateVerifyRadios, 'key', formStore.validate_type)?.value,
    csr_generate_type,
    encryption: formStore.encryption || 1,
    key_length: formStore.key_length || 1,
  } as CreateCertReq

  if (csr_generate_type === 1) {
    data.csr_id = ''
  }

  if (csr_generate_type === 2) {
    data = {
      ...data,
      csr_type: 1,
      email: formStore.email,
      company: formStore.company,
      department: formStore.department,
      country: formStore.country,
      province: formStore.province,
      city: formStore.city,
      encryption: formStore.encryption,
      key_length: formStore.key_length,
    }
  }

  if (csr_generate_type === 3) {
    data.csr_id = formStore.csr_id
  }

  try {
    loading.value = true
    const { code, msg } = await _createCert(data)
    if (code === 200) {
      message.success(t('ssl-certificate.management.apply.516752-40'))
      _s_setItem(SSL_CERTIFICATE_VERIFY_TYPE, formStore.validate_type)
      switchStep(1)
      return
    }

    message.error(msg || t('common.error'))
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  replaceRoute({ name: 'ssl_certificate_management' })
}

onMounted(() => {
  formStore.cert_domain_type = _s_getItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE) || CertDomainTypes.SINGLE
  getCountry()
  getCrsList()
})

onBeforeUnmount(() => {
  _s_setItem(SSL_CERTIFICATE_APPLY_TAB, 0)
})
</script>

<style scoped lang="scss">
.ssl-apply-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ssl-apply-v2__panel {
  padding: 32px 36px 0;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.ssl-apply-v2__steps {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

.ssl-apply-v2__step {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  color: #bbc0ca;
}

.ssl-apply-v2__step.is-active,
.ssl-apply-v2__step.is-done {
  color: #06f;
}

.ssl-apply-v2__step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 18px;
  font-weight: 500;
  line-height: 1;
  color: #fff;
  background: #bbc0ca;
  border-radius: 50%;
}

.ssl-apply-v2__step.is-active .ssl-apply-v2__step-badge,
.ssl-apply-v2__step.is-done .ssl-apply-v2__step-badge {
  background: #06f;
}

.ssl-apply-v2__step-label {
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
}

.ssl-apply-v2__step-line {
  position: relative;
  flex: 0 0 380px;
  height: 1px;
  margin: 0 16px;
  border-top: 1px dashed #cfd8e6;

  &::after {
    position: absolute;
    top: 50%;
    right: -1px;
    width: 0;
    height: 0;
    content: '';
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 7px solid #cfd8e6;
    transform: translateY(-50%);
  }
}

.ssl-apply-v2__content {
  display: flex;
  flex-direction: column;
}

.ssl-apply-v2__form {
  max-width: 1160px;
}

.ssl-apply-v2__item {
  align-items: flex-start;
  margin-bottom: 32px;
}

.ssl-apply-v2__item--top {
  :deep(.el-form-item__label) {
    padding-top: 6px;
  }
}

.ssl-apply-v2__item--compact {
  margin-top: -8px;
  margin-bottom: 20px;
}

.ssl-apply-v2__item--sub {
  margin-top: -4px;
}

.ssl-apply-v2__placeholder-label {
  display: block;
  width: 100%;
  height: 1px;
  opacity: 0;
}

.ssl-apply-v2__label,
.ssl-apply-v2__nested-label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.ssl-apply-v2__required {
  margin-left: 2px;
  color: #e54839;
}

.ssl-apply-v2__product {
  display: inline-flex;
  padding: 5px 16px;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  background: #edf4ff;
  border: 1px solid #bcd6ff;
  border-radius: 2px;
}

.ssl-apply-v2__block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}

.ssl-apply-v2__radio-group {
  display: flex;
  align-items: center;
  min-height: 22px;

  :deep(.el-radio) {
    display: inline-flex;
    align-items: center;
    margin-right: 28px;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
  }

  :deep(.el-radio__label) {
    padding-left: 8px;
    line-height: 22px;
  }
}

.ssl-apply-v2__radio-text {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.ssl-apply-v2__tip-icon {
  color: #828b9c;
}

.ssl-apply-v2__alert {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: min(986px, 100%);
  padding: 12px 16px;
  font-size: 14px;
  line-height: 22px;
  color: #ff720d;
  background: rgb(255 114 13 / 16%);
}

.ssl-apply-v2__alert-icon {
  margin-top: 1px;
  font-size: 20px;
  color: #ff720d;
}

.ssl-apply-v2__textarea-wrap {
  position: relative;
  width: min(1014px, 100%);
}

.ssl-apply-v2__count {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
  pointer-events: none;
}

.ssl-apply-v2__control {
  width: 434px;
}

.ssl-apply-v2__control--wide {
  width: 426px;
}

.ssl-apply-v2__textarea {
  width: 100%;

  :deep(.el-textarea__inner) {
    min-height: 118px !important;
    padding-bottom: 30px;
  }
}

.ssl-apply-v2__manual,
.ssl-apply-v2__existing {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.ssl-apply-v2__grid {
  display: grid;
  gap: 24px;
}

.ssl-apply-v2__grid--single {
  grid-template-columns: minmax(0, 540px);
}

.ssl-apply-v2__grid--double {
  grid-template-columns: repeat(2, minmax(0, 540px));
}

.ssl-apply-v2__nested-item {
  align-items: flex-start;
  margin-bottom: 0;

  :deep(.el-form-item__label) {
    width: 90px !important;
    padding-top: 6px !important;
    line-height: 22px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}

.ssl-apply-v2__nested-item--csr {
  width: 100%;

  :deep(.el-form-item__label) {
    display: none;
  }
}

.ssl-apply-v2__nested-item--checkbox {
  margin-top: 0;

  :deep(.el-form-item__label) {
    display: none;
  }
}

.ssl-apply-v2__create-link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  margin-left: 0;
}

.ssl-apply-v2__create-link-icon {
  font-size: 16px;
}

.ssl-apply-v2__tips {
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
}

.ssl-apply-v2__validity {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.ssl-apply-v2__footer {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 24px 0 32px;
  margin-top: 8px;
  border-top: 1px solid #e8ecf3;
}

.ssl-apply-v2__verify {
  padding-bottom: 32px;
}

.is-invalid {
  :deep(.el-textarea__inner) {
    color: #e54839;
  }
}

:deep(.el-form-item__label) {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

:deep(.el-form-item__content) {
  line-height: 22px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

:deep(.el-select__wrapper.is-focused),
:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #06f inset;
}

@media (width <= 1400px) {
  .ssl-apply-v2__step-line {
    flex-basis: 220px;
  }

  .ssl-apply-v2__grid--double {
    grid-template-columns: minmax(0, 540px);
  }
}

@media (width <= 1024px) {
  .ssl-apply-v2__panel {
    padding: 24px 20px 0;
  }

  .ssl-apply-v2__steps {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .ssl-apply-v2__step-line {
    flex-basis: auto;
    width: 1px;
    height: 24px;
    margin: 0 0 0 15px;
    border-top: 0;
    border-left: 1px dashed #cfd8e6;

    &::after {
      inset: auto auto -1px 50%;
      border-top: 7px solid #cfd8e6;
      border-right: 4px solid transparent;
      border-bottom: 0;
      border-left: 4px solid transparent;
      transform: translateX(-50%);
    }
  }

  .ssl-apply-v2__control,
  .ssl-apply-v2__control--wide,
  .ssl-apply-v2__grid--single,
  .ssl-apply-v2__textarea-wrap {
    width: 100%;
  }

  .ssl-apply-v2__grid--single,
  .ssl-apply-v2__grid--double {
    grid-template-columns: minmax(0, 1fr);
  }

  .ssl-apply-v2__nested-item {
    :deep(.el-form-item__label) {
      width: 100% !important;
      padding-top: 0;
      margin-bottom: 8px;
    }
  }
}
</style>
