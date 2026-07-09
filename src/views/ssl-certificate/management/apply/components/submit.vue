<template>
  <el-form
    ref="formRef"
    :model="formStore"
    :rules="formRules"
    label-position="left"
    label-width="auto"
    class="ssl-form"
  >
    <el-form-item :label="t('ssl-certificate.management.apply.516752-0')">
      <p class="product">
        {{ t('ssl-certificate.management.apply.516752-1') }}
        {{ filterArray(CERTIFICATE_TYPES_MAP, 'id', cert_type)?.fullName }}
        {{ filterArray(CERT_DOMAIN_TYPES_MAP, 'id', formStore.cert_domain_type)?.name }}
      </p>
    </el-form-item>
    <el-form-item :label="t('ssl-certificate.management.apply.516752-2')" prop="backup_domain_str">
      <el-input
        v-model="formStore.backup_domain_str"
        type="textarea"
        :disabled="formStore.csr_generate_type === 3"
        :class="{ 'is-invalid': !formDomainValid && formStore.backup_domain_str }"
        :autosize="{ minRows: 5, maxRows: 8 }"
        :placeholder="t('ssl-certificate.management.apply.516752-3')"
      />
    </el-form-item>
    <el-form-item :label="t('ssl-certificate.management.apply.516752-4')" prop="csr_generate_type">
      <el-radio-group v-model="formStore.csr_generate_type">
        <el-radio
          v-for="c in csrCreateRadios"
          :key="c.value"
          :label="c.value"
          :disabled="c.disabled?.(formStore.validate_type)"
          class="df ac"
        >
          <p class="df ac">
            {{ c.label }}
            <el-tooltip v-if="c.tooltip" :content="c.tooltip" placement="top" effect="light" popper-class="max-400">
              <SvgIcon name="cat-cdn-tip" class="icon" style="margin-left: 5px; color: #999" />
            </el-tooltip>
          </p>
        </el-radio>
      </el-radio-group>
      <TipsBar
        :tips="filterArray(csrCreateRadios, 'value', formStore.csr_generate_type)?.tips"
        color="#f7b500"
        background="#fff3d3"
      />
    </el-form-item>
    <template v-if="formStore.csr_generate_type === 2">
      <el-form-item :label="t('ssl-certificate.management.apply.516752-5')" prop="email" class="form-item">
        <!-- <el-input v-model.trim="formStore.email" :placeholder="'Such as myssl@maoyun.com'" /> -->
        <el-input v-model.trim="formStore.email" :placeholder="t('ssl-certificate.management.apply.516752-6')" />
      </el-form-item>
      <div class="df ac">
        <el-form-item :label="t('ssl-certificate.management.apply.516752-7')" prop="company" class="form-item">
          <el-input v-model.trim="formStore.company" :placeholder="t('ssl-certificate.management.apply.516752-8')" />
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.management.apply.516752-9')" prop="department" class="form-item">
          <el-input
            v-model="formStore.department"
            style="margin-bottom: 20px"
            :placeholder="t('ssl-certificate.management.apply.516752-10')"
          />
        </el-form-item>
      </div>
      <el-form-item :label="t('ssl-certificate.management.apply.516752-11')" prop="country" class="form-item">
        <el-select v-model="formStore.country" placeholder="" style="width: 100%">
          <el-option
            v-for="country in dict.countryList"
            :key="country.code"
            :label="country.name"
            :value="country.code"
          />
        </el-select>
      </el-form-item>
      <div class="df ac">
        <el-form-item :label="t('ssl-certificate.management.apply.516752-12')" prop="province" class="form-item">
          <el-input v-model.trim="formStore.province" :placeholder="t('ssl-certificate.management.apply.516752-13')" />
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.management.apply.516752-14')" prop="city" class="form-item">
          <el-input
            v-model.trim="formStore.city"
            style="width: 100%; margin-bottom: 20px"
            :placeholder="t('ssl-certificate.management.apply.516752-13')"
          />
        </el-form-item>
      </div>
      <div class="df ac">
        <el-form-item
          :label="t('ssl-certificate.management.apply.516752-15')"
          prop="encryption"
          class="form-item"
          style="width: 40%"
        >
          <el-select v-model="formStore.encryption" placeholder="" style="width: 100%">
            <el-option
              v-for="encryption in ENCRYPTION_MAP"
              :key="encryption.value"
              :label="encryption.label"
              :value="encryption.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="t('ssl-certificate.management.apply.516752-16')"
          prop="key_length"
          class="form-item"
          style="width: 40%"
        >
          <el-select v-model="formStore.key_length" placeholder="" style="width: 100%; margin-bottom: 20px">
            <el-option v-for="key in key_length_map_comd" :key="key.value" :label="key.label" :value="key.value" />
          </el-select>
        </el-form-item>
      </div>
    </template>
    <template v-if="formStore.csr_generate_type === 3">
      <el-form-item label=" " prop="csr_id">
        <el-select
          v-model="formStore.csr_id"
          :placeholder="t('ssl-certificate.management.apply.516752-17')"
          style="width: 400px"
          filterable
          remote-show-suffix
          :filter-method="csrFilterMethod"
          :loading="csrStore.loading"
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
        <br />
        <el-link type="primary" class="mt20" @click="handleCreateCrs">
          {{ t('ssl-certificate.management.apply.516752-18') }}
          <SvgIcon name="storage-link" class="icon" style="margin-left: 7px" />
        </el-link>
      </el-form-item>
    </template>
    <el-form-item
      style="margin-bottom: 15px"
      :label="t('ssl-certificate.management.apply.516752-19')"
      prop="validate_type"
    >
      <el-radio-group v-model="formStore.validate_type">
        <el-radio
          v-for="c in certificateVerifyRadios"
          :key="c.key"
          :label="c.key"
          :disabled="c.disabled?.(formStore.cert_domain_type)"
          class="df ac"
        >
          <p class="df ac">
            {{ c.label }}
            <el-tooltip v-if="c.tooltip" :content="c.tooltip" placement="top" effect="light" popper-class="max-400">
              <SvgIcon name="cat-cdn-tip" class="icon" style="margin-left: 5px; color: #999" />
            </el-tooltip>
          </p>
        </el-radio>
      </el-radio-group>
      <p class="type-tips mt10">
        {{ filterArray(certificateVerifyRadios, 'key', formStore.validate_type)?.tips }}
      </p>
    </el-form-item>
    <el-form-item
      v-if="filterArray(certificateVerifyRadios, 'key', formStore.validate_type)?.key === EnumCertificateVerifyKey.AUTO"
      label=" "
      prop="auto_config"
    >
      <el-checkbox v-model="formStore.auto_config" style="width: 100%" label="y">
        {{ t('ssl-certificate.management.apply.516752-20') }}
      </el-checkbox>

      <p />
    </el-form-item>
    <el-form-item :label="t('ssl-certificate.management.apply.516752-21')">
      {{ t('ssl-certificate.management.apply.516752-22') }}
    </el-form-item>
    <el-divider style="border-color: #eee" />
    <el-form-item>
      <el-button type="primary" :loading="loading" style="min-width: 210px; margin-right: 10px" @click="onSubmit">
        {{ t('ssl-certificate.management.apply.516752-23') }}
      </el-button>
      <el-button type="default" style="min-width: 90px" @click="handleBack">
        {{ t('ssl-certificate.management.apply.516752-24') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus/es'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { filterArray } from '@/utils/filter'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import { EMAIL_REG } from '@/utils/reg'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { _getCsrList, _createCert, _getCsrDetail } from '@/apis/ssl-certificate/management'
import type { ListCSRResp, CreateCertReq } from '@/apis/ssl-certificate/management/type'
import {
  csrCreateRadios,
  certificateVerifyRadios,
  validSingleDomain,
  validWildcardDomain,
  SSL_CERTIFICATE_VERIFY_TYPE,
  SSL_CERTIFICATE_CERT_DOMAIN_TYPE,
} from '@/views/ssl-certificate/management/config'
import {
  ENCRYPTION_MAP,
  KEY_LENGTH_MAP,
  CERTIFICATE_TYPES_MAP,
  CERT_DOMAIN_TYPES_MAP,
  CertDomainTypes,
  EnumCertificateVerifyKey,
} from '@/views/ssl-certificate/config'
import TipsBar from '@/views/ssl-certificate/management/components/tips-bar.vue'
import { _getCountry } from '@/apis/domain'
import { pushRoute, replaceRoute } from '@/utils/router-jump'

const router = useRouter()
const route = useRoute()
const { cert_id, factory_id, cert_type } = route.query as {
  cert_id?: string
  cert_type?: number
  factory_id?: number
}

const emits = defineEmits(['switchTab'])
/// 表单
const formRef = ref<FormInstance>()
const formDomainValid = ref(true)
const loading = ref(false)
const formStore = reactive<
  CreateCertReq & {
    backup_domain_str?: string
    cert_domain_type: number
    auto_config?: boolean
  }
>({
  // backup_domain_str: 'dd.com',
  cert_domain_type: CertDomainTypes.SINGLE,

  validate_type: EnumCertificateVerifyKey.AUTO,
  cert_id: cert_id || '',
  csr_generate_type: 1,
  domain: 'dd.com',
  encryption: 1,
  key_length: 1,
})
const dict = reactive<{
  countryList: any[]
}>({
  countryList: [],
})
const getCountry = () => {
  _getCountry().then(res => {
    dict.countryList = res.data.countries
  })
}
onMounted(() => {
  formStore.cert_domain_type = _s_getItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE)
  getCountry()
})
// 证书验证方式
watch(
  () => formStore.cert_domain_type,
  v => {
    // 根据证书类型自动选择验证方式
    if (v === 2) formStore.validate_type = 2
    else if (v === 3 && formStore.validate_type === 3) formStore.validate_type = 2
  },
)
// csr_generate_type
watch(
  () => formStore.csr_generate_type,
  v => {
    if (v == 3) {
      const csr = csrStore.list.find(v => v.csr_id === formStore.csr_id)
      formStore.backup_domain_str = csr?.common_name
      formRef.value?.clearValidate()
      formDomainValid.value = true
    }
  },
)

const key_length_map_comd = computed(() => filterArray(KEY_LENGTH_MAP, 'encryption', [formStore.encryption!]))
watch(
  () => formStore.encryption,
  () => {
    // @ts-ignore
    formStore.key_length = key_length_map_comd.value?.[0].value
  },
)

// CRSList
const csrStore = reactive<{
  list: ListCSRResp['items']
  query: string
  loading: boolean
}>({
  list: [],
  query: '',
  loading: false,
})
const getCrsList = async () => {
  // 获取CRS列表
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
      if (data.total > data.items.length) {
        scrollStore.status = 'padding'
      } else {
        scrollStore.status = 'noData'
      }
    } else {
      message.error(msg || t('common.error'))
    }
  } finally {
    csrStore.loading = false
  }
}
// 搜索
const csrFilterMethod = (query: string) => {
  csrStore.query = query
  getCrsList()
}

const innerRef = ref<HTMLDivElement>()
const scrollStore = reactive<{
  status: 'failed' | 'loading' | 'noData' | 'padding'
  page: {
    page: number
    page_size: number
    total: number
  }
}>({
  status: 'failed',
  page: {
    page: 1,
    page_size: 15,
    total: 0,
  },
})
const addCrsList = async ({ scrollTop }) => {
  if (['loading', 'noData'].includes(scrollStore.status)) return

  const iH = innerRef.value?.clientHeight
  if (iH! - scrollTop > 200) return

  // 获取CRS列表
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
      if (data.items.length === 0) {
        scrollStore.status = 'noData'
      } else {
        scrollStore.status = 'padding'
      }
    } else {
      scrollStore.page.page -= 1
      scrollStore.status = 'failed'
      message.error(msg || t('common.error'))
    }
  } catch (e) {
    scrollStore.page.page -= 1
    scrollStore.status = 'failed'
  } finally {
    csrStore.loading = false
  }
}

const handleCrsChange = async (csr_id: string) => {
  // const csr = csrStore.list.find(v => v.csr_id === csr_id)

  const { code, data, msg } = await _getCsrDetail({
    csr_id,
  })
  if (code == 200 && data) {
    formStore.backup_domain_str = data?.subject_alt_names?.join(',')
  } else {
    message.error(msg || t('common.error'))
  }
}
const handleCreateCrs = () => {
  // 去创建CRS
  pushRoute({ name: 'ssl_certificate_create_csr' })
}
onMounted(() => {
  getCrsList()
})

// 表单验证规则
const formRules: FormRules<typeof formStore> = {
  validate_type: [
    {
      validator(rule, value, callback) {
        if (!value) {
          callback(new Error(t('ssl-certificate.management.apply.516752-25')))
        } else {
          callback()
        }
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
          .map(v => v.trim())
          .filter(v => v)
        const setDomain = new Set()

        try {
          // 类型校验
          if (formStore.cert_domain_type == CertDomainTypes.SINGLE) {
            if (domains.length > 1) throw t('ssl-certificate.management.apply.516752-28')
            if (domains.some(domain => domain.startsWith('*'))) throw t('ssl-certificate.management.apply.516752-29')
          }
          if (formStore.cert_domain_type == CertDomainTypes.MULTIPLE && domains.some(domain => domain.startsWith('*')))
            throw t('ssl-certificate.management.apply.516752-29')
          if (formStore.cert_domain_type == CertDomainTypes.WILDCARD) {
            if (!domains.every(domain => domain.startsWith('*'))) throw t('ssl-certificate.management.apply.516752-30')
          }

          // 数量校验
          if (domains.length === 0) throw t('ssl-certificate.management.apply.516752-27')
          if (domains.length > 50) throw t('ssl-certificate.management.apply.516752-31')

          // 重复校验
          domains.forEach(domain => {
            if (setDomain.has(domain)) throw t('ssl-certificate.management.apply.516752-32')
            setDomain.add(domain)
          })

          // 格式校验
          if (!domains.every(domain => validSingleDomain(domain) || validWildcardDomain(domain)))
            throw t('ssl-certificate.management.apply.516752-33')

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
        if (!value) {
          callback(new Error(t('ssl-certificate.management.apply.516752-34')))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  csr_generate_type: [
    {
      validator(rule, value, callback) {
        if (!value) {
          callback(new Error(t('ssl-certificate.management.apply.516752-34')))
        } else {
          callback()
        }
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
const onSubmit = async () => {
  // 提交表单
  const isValid = await formRef.value?.validate(v => {
    formDomainValid.value = v
  })
  if (!isValid) return
  // 提交表单
  // TODO 根据生成方式、验证方式提交不同的数据
  const { backup_domain_str, csr_generate_type } = formStore

  let data = {
    cert_id: formStore.cert_id,
    domain: backup_domain_str
      ?.split(/,|\n/)
      .map(v => v.trim())
      .filter(v => v)
      .join(','),
    validate_type: filterArray(certificateVerifyRadios, 'key', formStore.validate_type)?.value,
    csr_generate_type,
    encryption: formStore.encryption || 1,
    key_length: formStore.key_length || 1,
  } as CreateCertReq

  if (csr_generate_type === 1) {
    // 自动生成
    data.csr_id = ''
  }
  if (csr_generate_type === 2) {
    // 手动填写
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
    // 选择已有CSR
    data.csr_id = formStore.csr_id
  }

  try {
    loading.value = true
    const { code, msg } = await _createCert(data)
    if (code === 200) {
      message.success(t('ssl-certificate.management.apply.516752-40'))
      emits('switchTab', { value: 1 })
      _s_setItem(SSL_CERTIFICATE_VERIFY_TYPE, formStore.validate_type)
    } else {
      message.error(msg || t('common.error'))
    }
  } finally {
    loading.value = false
  }
}
const handleBack = () => {
  // 返回列表
  replaceRoute({ name: 'ssl_certificate_management' })
}
</script>

<style lang="scss" scoped>
.product {
  padding: 0 20px;
  color: #0063ff;
  background-color: #ecf5ff;
  border: 1px solid #0063ff;
  border-radius: 4px;
}

.type-tips {
  margin-top: 17px;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #999;
}

.is-invalid {
  :deep(.el-textarea__inner) {
    color: red;
  }
}

.form-item {
  width: 40%;
  margin-right: 20px;
}
</style>
