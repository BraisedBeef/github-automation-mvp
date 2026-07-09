<template>
  <div class="ssl-create-csr-v2">
    <PageBreadcrumbToolbar
      :items="[t('ssl-certificate.router.931344-0'), t('ssl-certificate.router.931344-8')]"
      :show-doc="false"
    />

    <section class="ssl-create-csr-v2__panel">
      <el-form
        ref="ruleFormRef"
        :model="formState"
        :rules="rules"
        label-position="left"
        hide-required-asterisk
        class="ssl-create-csr-v2__form"
      >
        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-0')"
          prop="csr_type"
          class="ssl-create-csr-v2__item ssl-create-csr-v2__item--radio"
        >
          <el-radio-group v-model="formState.csr_type">
            <el-radio :label="1">
              {{ t('ssl-certificate.management.csr.021631-1') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="domain" class="ssl-create-csr-v2__item">
          <template #label>
            <span class="ssl-create-csr-v2__label">
              {{ t('ssl-certificate.management.csr.021631-2') }}
              <span class="ssl-create-csr-v2__required">*</span>
            </span>
          </template>

          <div class="ssl-create-csr-v2__domain">
            <span class="ssl-create-csr-v2__domain-prefix">https://</span>
            <el-input
              v-model.trim="formState.domain"
              :placeholder="t('ssl-certificate.management.csr.021631-3')"
              class="ssl-create-csr-v2__control ssl-create-csr-v2__control--domain"
            />
          </div>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-4')"
          prop="backup_domain_str"
          class="ssl-create-csr-v2__item ssl-create-csr-v2__item--top"
        >
          <div class="ssl-create-csr-v2__textarea-wrap">
            <el-input
              v-model="state.backup_domain_str"
              :placeholder="t('ssl-certificate.management.csr.021631-5')"
              type="textarea"
              resize="none"
              :rows="3"
              class="ssl-create-csr-v2__control ssl-create-csr-v2__textarea"
            />
            <div class="ssl-create-csr-v2__count">{{ backupDomainCount }}/50</div>
          </div>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-6')"
          prop="company"
          class="ssl-create-csr-v2__item"
        >
          <el-input
            v-model.trim="formState.company"
            :placeholder="t('ssl-certificate.management.csr.021631-7')"
            class="ssl-create-csr-v2__control"
          />
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-8')"
          prop="department"
          class="ssl-create-csr-v2__item"
        >
          <el-input
            v-model.trim="formState.department"
            :placeholder="t('ssl-certificate.management.csr.021631-9')"
            class="ssl-create-csr-v2__control"
          />
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-10')"
          prop="email"
          class="ssl-create-csr-v2__item"
        >
          <el-input
            v-model.trim="formState.email"
            :placeholder="t('ssl-certificate.management.csr.021631-11')"
            class="ssl-create-csr-v2__control"
          />
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-12')"
          prop="country"
          class="ssl-create-csr-v2__item"
        >
          <el-select v-model="formState.country" class="ssl-create-csr-v2__control">
            <el-option
              v-for="country in dict.countryList"
              :key="country.code"
              :label="country.name"
              :value="country.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-13')"
          prop="province"
          class="ssl-create-csr-v2__item"
        >
          <el-input
            v-model.trim="formState.province"
            :placeholder="t('ssl-certificate.management.csr.021631-27')"
            class="ssl-create-csr-v2__control"
          />
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-14')"
          prop="city"
          class="ssl-create-csr-v2__item"
        >
          <el-input
            v-model.trim="formState.city"
            :placeholder="t('ssl-certificate.management.csr.021631-27')"
            class="ssl-create-csr-v2__control"
          />
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-15')"
          prop="encryption"
          class="ssl-create-csr-v2__item"
        >
          <el-select v-model="formState.encryption" class="ssl-create-csr-v2__control">
            <el-option
              v-for="encryption in ENCRYPTION_MAP"
              :key="encryption.value"
              :label="encryption.label"
              :value="encryption.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.csr.021631-16')"
          prop="key_length"
          class="ssl-create-csr-v2__item"
        >
          <el-select v-model="formState.key_length" class="ssl-create-csr-v2__control">
            <el-option v-for="item in keyLengthOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="ssl-create-csr-v2__footer">
        <el-button type="primary" :loading="state.loading" @click="submitForm()">
          {{ t('ssl-certificate.management.csr.021631-17') }}
        </el-button>
        <el-button :disabled="state.loading" @click="cancel()">
          {{ t('ssl-certificate.management.csr.021631-18') }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { CreateCsrReq } from '@/apis/ssl-certificate/management/type'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus/es'
import { _createCsr } from '@/apis/ssl-certificate/management'
import { _getCountry } from '@/apis/domain'
import { filterArray } from '@/utils/filter'
import t from '@/utils/i18n'
import { DOMAIN_REG } from '@/utils/reg'
import { backRoute, replaceRoute } from '@/utils/router-jump'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import { ENCRYPTION_MAP, KEY_LENGTH_MAP } from '@/views/ssl-certificate/config'
import { validSingleDomain, validWildcardDomain } from '@/views/ssl-certificate/management/config'

const ruleFormRef = ref<FormInstance>()
const state = reactive({
  loading: false,
  backup_domain_str: '',
})

const formState = reactive<CreateCsrReq>({
  csr_type: 1,
  domain: '',
  encryption: 1,
  key_length: 1,
})

const dict = reactive<{
  countryList: Array<{ code: string; name: string }>
}>({
  countryList: [],
})

const keyLengthOptions = computed(() => filterArray(KEY_LENGTH_MAP, 'encryption', [formState.encryption]))

const backupDomainList = computed(() => {
  return state.backup_domain_str
    .split(/,|\n/)
    .map(item => item.trim())
    .filter(Boolean)
})

const backupDomainCount = computed(() => backupDomainList.value.length)

watch(
  () => formState.encryption,
  () => {
    formState.key_length = (keyLengthOptions.value?.[0]?.value || 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7
  },
)

const rules = reactive<FormRules<typeof formState & { backup_domain_str?: string }>>({
  domain: {
    required: true,
    trigger: 'blur',
    validator: (rule, value, callback) => {
      value = value?.trim()
      if (!value) {
        callback(new Error(t('ssl-certificate.management.csr.021631-19')))
      } else if (!DOMAIN_REG.test(value)) {
        callback(new Error(t('ssl-certificate.management.csr.021631-20')))
      } else {
        callback()
      }
    },
  },
  backup_domain_str: {
    required: false,
    trigger: 'blur',
    validator: (rule, value, callback) => {
      if (!state.backup_domain_str) {
        callback()
        return
      }

      const domains = backupDomainList.value
      const setDomain = new Set()

      if (domains.length === 0) {
        callback()
        return
      }

      try {
        if (domains.length > 50) throw t('ssl-certificate.management.csr.021631-22')

        domains.forEach(domain => {
          if (setDomain.has(domain)) throw t('ssl-certificate.management.csr.021631-23')
          setDomain.add(domain)
        })

        if (!domains.every(domain => validSingleDomain(domain) || validWildcardDomain(domain)))
          throw t('ssl-certificate.management.csr.021631-24')

        callback()
      } catch (error: any) {
        callback(error)
      }
    },
  },
  company: {
    trigger: 'blur',
    validator(rule, value, callback) {
      if (!/^[a-zA-Z0-9\s-\/]+$/.test(value)) {
        callback(new Error(t('ssl-certificate.management.csr.021631-7-0')))
      } else {
        callback()
      }
    },
  },
})

const getCountry = async () => {
  const res = await _getCountry()
  dict.countryList = res.data.countries || []
}

const submitForm = async () => {
  await ruleFormRef.value?.validate()
  state.loading = true

  try {
    if (state.backup_domain_str) {
      formState.backup_domain = state.backup_domain_str
        ?.split(/,|\n/)
        .map(v => v.trim())
        .filter(v => v)
    }

    const { code, msg } = await _createCsr(formState)
    if (code === 200) {
      replaceRoute({
        name: 'ssl_certificate_management',
      })
      ElMessage.success(t('ssl-certificate.management.csr.021631-25'))
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.csr.021631-26'))
    }
  } finally {
    state.loading = false
  }
}

const cancel = async () => {
  backRoute()
}

onMounted(() => {
  getCountry()
})
</script>

<style scoped lang="scss">
.ssl-create-csr-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ssl-create-csr-v2__panel {
  padding: 16px 28px 0;
  background: #fff;
  border-radius: 0 0 16px 16px;
}

.ssl-create-csr-v2__form {
  max-width: 720px;
}

.ssl-create-csr-v2__item {
  margin-bottom: 16px;

  :deep(.el-form-item__label) {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    width: 90px;
    margin-right: 16px;
    font-size: 14px;
    line-height: 22px;
    color: #828b9c;
  }

  :deep(.el-form-item__content) {
    min-height: 34px;
    line-height: 22px;
  }
}

.ssl-create-csr-v2__item--radio {
  margin-bottom: 20px;

  :deep(.el-radio) {
    margin-right: 0;
  }

  :deep(.el-radio__label) {
    font-size: 14px;
    color: #191c23;
  }
}

.ssl-create-csr-v2__item--top {
  :deep(.el-form-item__content) {
    align-items: flex-start;
  }
}

.ssl-create-csr-v2__label {
  display: inline-flex;
  gap: 2px;
  align-items: center;
}

.ssl-create-csr-v2__required {
  color: #e54839;
}

.ssl-create-csr-v2__domain {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ssl-create-csr-v2__domain-prefix {
  flex: 0 0 auto;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.ssl-create-csr-v2__control {
  width: 460px;
}

.ssl-create-csr-v2__control--domain {
  width: 314px;
}

.ssl-create-csr-v2__control :deep(.el-input__wrapper),
.ssl-create-csr-v2__control :deep(.el-select__wrapper),
.ssl-create-csr-v2__textarea :deep(.el-textarea__inner) {
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.ssl-create-csr-v2__control :deep(.el-input__inner),
.ssl-create-csr-v2__control :deep(.el-select__selected-item),
.ssl-create-csr-v2__textarea :deep(.el-textarea__inner) {
  font-size: 14px;
  color: #191c23;
}

.ssl-create-csr-v2__control :deep(.el-input__inner)::placeholder,
.ssl-create-csr-v2__textarea :deep(.el-textarea__inner)::placeholder {
  color: #a1a9b8;
}

.ssl-create-csr-v2__textarea-wrap {
  position: relative;
  width: 460px;
}

.ssl-create-csr-v2__textarea :deep(.el-textarea__inner) {
  min-height: 60px !important;
  padding: 6px 10px 24px;
  resize: none;
}

.ssl-create-csr-v2__count {
  position: absolute;
  right: 10px;
  bottom: 6px;
  font-size: 12px;
  line-height: 20px;
  color: #a1a9b8;
  pointer-events: none;
}

.ssl-create-csr-v2__footer {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 24px 0;
  margin-top: 16px;
  border-top: 1px solid #e8ecf3;
}

@media (width <= 960px) {
  .ssl-create-csr-v2__panel {
    padding: 16px;
    border-radius: 16px;
  }

  .ssl-create-csr-v2__form {
    max-width: none;
  }

  .ssl-create-csr-v2__item {
    :deep(.el-form-item__content) {
      display: block;
    }
  }

  .ssl-create-csr-v2__domain,
  .ssl-create-csr-v2__textarea-wrap,
  .ssl-create-csr-v2__control,
  .ssl-create-csr-v2__control--domain {
    width: 100%;
  }
}
</style>
