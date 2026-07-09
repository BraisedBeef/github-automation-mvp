<template>
  <el-card class="page-container" shadow="never">
    <el-form ref="ruleFormRef" :model="formState" :rules="rules" label-width="auto" label-position="left" status-icon>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-0')" prop="csr_type" class="form-item">
        <el-radio-group v-model="formState.csr_type">
          <el-radio :label="1">
            {{ t('ssl-certificate.management.csr.021631-1') }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-2')" prop="domain" class="form-item">
        <div class="df ac">
          <span class="mr20"> https:// </span>
          <el-input v-model="formState.domain" :placeholder="t('ssl-certificate.management.csr.021631-3')" />
        </div>
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-4')" prop="backup_domain_str" class="form-item">
        <el-input
          v-model="state.backup_domain_str"
          :placeholder="t('ssl-certificate.management.csr.021631-5')"
          type="textarea"
          rows="3"
        />
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-6')" prop="company" class="form-item">
        <el-input v-model="formState.company" :placeholder="t('ssl-certificate.management.csr.021631-7')" />
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-8')" prop="department" class="form-item">
        <el-input v-model="formState.department" :placeholder="t('ssl-certificate.management.csr.021631-9')" />
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-10')" prop="email" class="form-item">
        <el-input v-model="formState.email" :placeholder="t('ssl-certificate.management.csr.021631-11')" />
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-12')" prop="country" class="form-item">
        <el-select v-model="formState.country" placeholder="">
          <el-option
            v-for="country in dict.countryList"
            :key="country.code"
            :label="country.name"
            :value="country.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-13')" prop="province" class="form-item">
        <el-input v-model="formState.province" :placeholder="t('ssl-certificate.management.csr.021631-27')" />
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-14')" prop="city" class="form-item">
        <el-input v-model="formState.city" :placeholder="t('ssl-certificate.management.csr.021631-27')" />
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-15')" prop="encryption" class="form-item">
        <el-select v-model="formState.encryption" placeholder="">
          <el-option
            v-for="encryption in ENCRYPTION_MAP"
            :key="encryption.value"
            :label="encryption.label"
            :value="encryption.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.csr.021631-16')" prop="key_length" class="form-item">
        <el-select v-model="formState.key_length" placeholder="">
          <el-option v-for="key in key_length_map_comd" :key="key.value" :label="key.label" :value="key.value" />
        </el-select>
      </el-form-item>
      <el-divider style="border-color: #eee" />
      <el-form-item>
        <el-button type="primary" :loading="state.loading" @click="submitForm()">
          {{ t('ssl-certificate.management.csr.021631-17') }}
        </el-button>
        <el-button :disabled="state.loading" @click="cancel()">
          {{ t('ssl-certificate.management.csr.021631-18') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus/es'
import { _createCsr } from '@/apis/ssl-certificate/management'
import { DOMAIN_REG } from '@/utils/reg'
import { filterArray } from '@/utils/filter'
import type { CreateCsrReq } from '@/apis/ssl-certificate/management/type'
import { ENCRYPTION_MAP, KEY_LENGTH_MAP } from '../../config'
import { validSingleDomain, validWildcardDomain } from '../config'
import { _getCountry } from '@/apis/domain'
import { backRoute, replaceRoute } from '@/utils/router-jump'

const router = useRouter()

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
const key_length_map_comd = computed(() => filterArray(KEY_LENGTH_MAP, 'encryption', [formState.encryption]))
watch(
  () => formState.encryption,
  () => {
    // @ts-ignore
    formState.key_length = key_length_map_comd.value?.[0].value
  },
)
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
  getCountry()
})

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
      if (!state.backup_domain_str) callback()

      const domains = state.backup_domain_str
        ?.split(/,|\n/)
        .map(v => v.trim())
        .filter(v => v)
      const setDomain = new Set()
      if (domains.length === 0) callback()

      console.log(state.backup_domain_str, domains)

      try {
        // 数量校验
        if (domains.length > 50) throw t('ssl-certificate.management.csr.021631-22')

        // 重复校验
        domains.forEach(domain => {
          if (setDomain.has(domain)) throw t('ssl-certificate.management.csr.021631-23')
          setDomain.add(domain)
        })

        // 格式校验
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
      // 英文、数字、中划线、空格、斜杠
      if (!/^[a-zA-Z0-9\s-\/]+$/.test(value)) {
        callback(new Error(t('ssl-certificate.management.csr.021631-7-0')))
      } else {
        callback()
      }
    },
  },
  // encryption: [{ required: true, message: '请选择秘钥算法', trigger: 'blur' }],
  // key_length: [{ required: true, message: '请选择秘钥强度', trigger: 'blur' }],
})

const submitForm = async () => {
  await ruleFormRef.value?.validate()

  state.loading = true
  try {
    // 处理备用域名
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
</script>

<style lang="scss" scoped>
.page-container {
  width: 100%;
  background-color: #fff;

  .form-item {
    width: 50%;
    min-width: 600px;
    max-width: 700px;
  }
}
</style>
