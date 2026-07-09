<template>
  <div class="domain-template-detail bgcf pd20">
    <div v-if="pageType === 'edit'">
      <div class="d-title">
        {{ t('domain.template.detail.473291-0') }}
      </div>
      <CatTip class="mt20 mb20">
        {{ t('domain.template.detail.473291-1') }}
      </CatTip>
      <el-form :model="form" label-position="left" label-width="auto" class="mb20">
        <el-form-item :label="t('domain.template.detail.473291-2')">
          <el-input v-model="domain" type="textarea" rows="3" disabled class="domain-area" />
        </el-form-item>
      </el-form>
    </div>

    <div class="d-title">
      {{ t('domain.template.detail.473291-3') }}
    </div>
    <div class="detail-info mt20 df">
      <el-form
        ref="formDom1"
        :model="form"
        :rules="formRules"
        label-position="left"
        label-width="auto"
        require-asterisk-position="right"
      >
        <el-form-item :label="t('domain.template.detail.473291-4')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('domain.template.detail.473291-6')" prop="last_name">
          <el-input v-model="form.last_name" />
        </el-form-item>
        <el-form-item :label="t('domain.template.detail.473291-8')" prop="country">
          <!-- <el-input v-model="form.country" /> -->
          <CatSelect
            v-model="form.country"
            filterable
            :list="dict.countryList"
            label-key="name"
            value-key="code"
            style="width: 100%"
            @change="code => getProvince(code)"
          />
        </el-form-item>
        <el-form-item filterable :label="t('domain.template.detail.473291-10')" prop="city">
          <!-- <el-input v-model="form.city" /> -->
          <CatSelect
            v-model="form.city"
            filterable
            :disabled="dict.provinceList.length === 0"
            :list="dict.cityList"
            label-key="name"
            value-key="name"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('domain.template.detail.473291-12')" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item :label="t('domain.template.detail.473291-17')">
          <el-input v-model="form.fax" />
        </el-form-item>
      </el-form>

      <el-form
        ref="formDom2"
        :model="form"
        :rules="formRules"
        label-position="left"
        label-width="auto"
        require-asterisk-position="right"
      >
        <el-form-item porp="company" :label="t('domain.template.detail.473291-18')">
          <el-input v-model="form.company" />
        </el-form-item>
        <el-form-item :label="t('domain.template.detail.473291-19')" prop="first_name">
          <el-input v-model="form.first_name" />
        </el-form-item>
        <el-form-item :label="t('domain.template.detail.473291-21')" prop="province">
          <!-- <el-input v-model="form.province" /> -->
          <CatSelect
            v-model="form.province"
            filterable
            :disabled="dict.provinceList.length === 0 || dict.provinceList.length === 1"
            :list="dict.provinceList"
            label-key="name"
            value-key="name"
            style="width: 100%"
            @change="name => getCity(name)"
          />
        </el-form-item>
        <el-form-item :label="t('domain.template.detail.473291-23')" prop="postal_code">
          <el-input v-model="form.postal_code" />
        </el-form-item>
        <el-form-item :label="t('domain.template.detail.473291-14')" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <!-- <el-form-item :label="t('domain.template.detail.473291-26')" required>
          <div class="df fdc" style="width: 100%;">
            <el-input v-model="form.email" disabled />
            <div class="form-tip mt4">
              <el-text type="danger">*</el-text><el-text size="small"
                type="info">{{ t('domain.template.detail.473291-27') }}</el-text>
            </div>
          </div>
        </el-form-item> -->
      </el-form>
    </div>
    <div class="border-btn">
      <el-button :loading="loading" type="primary" @click="send">
        {{ t('domain.template.detail.473291-28') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  _addContactsTemplate,
  _updateContactsTemplate,
  _getContactsTemplateDomain,
  _getCountry,
  _getProvince,
  _getCity,
} from '@/apis/domain'
import { ElMessage } from 'element-plus'

import { useUserStore } from '@/store'
import type { ContactsForm } from '@/apis/domain'
import type { FormInstance } from 'element-plus/es'
import CatSelect from '@/components/common/cat-select/index.vue'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'

const userStore = useUserStore()
const router: any = useRouter()
const route: any = useRoute()

const pageType = ref<'add' | 'edit'>(route.query.type || 'add')
const loading = ref(false)
const form = ref<ContactsForm>({
  address: '',
  city: '',
  company: '',
  country: '',
  // 由后端使用默认邮箱
  // email: userStore.user.email,
  fax: '',
  first_name: '',
  last_name: '',
  name: '',
  phone: '',
  postal_code: '',
  province: '',
  remark: '',
  is_default: 1,
})
const formRules = reactive({
  // name: [{ validator: (r, v) => /[a-zA-Z0-9]/.test(v) || !v, message: t('domain.template.detail.473291-5'), trigger: 'change' }],
  last_name: [
    { message: t('domain.template.detail.473291-7'), trigger: 'change', required: true },
    {
      validator: (r, v) => /^(?!.*[\s,-]{2})[a-zA-Z-'\s]+$/.test(v),
      message: t('domain.template.detail.473291-5'),
      trigger: 'change',
    },
  ],
  country: { trigger: 'change', required: true, message: t('domain.template.detail.473291-9') },
  city: {
    validator: (r, v) => v !== '' || dict.value.provinceList.length === 0,
    message: t('domain.template.detail.473291-11'),
    trigger: 'change',
    required: true,
  },
  address: [
    { message: t('domain.template.detail.473291-13'), trigger: 'change', required: true },
    // { validator: (r, v) => /[a-zA-Z]/.test(v), message: t('domain.template.detail.473291-5'), trigger: 'change' }
  ],
  phone: {
    validator: (r, v) => v.length > 3,
    message: t('domain.template.detail.473291-16'),
    trigger: 'change',
    required: true,
  },
  email: { required: true, message: t('domain.template.detail.473291-27'), trigger: 'change' },

  // company: { validator: (r, v) => /[a-zA-Z0-9]/.test(v) || !v, message: t('domain.template.detail.473291-5'), trigger: 'change' },
  first_name: [
    { message: t('domain.template.detail.473291-20'), trigger: 'change', required: true },
    { validator: (r, v) => /[a-zA-Z]/.test(v), message: t('domain.template.detail.473291-5'), trigger: 'change' },
  ],
  province: {
    validator: (r, v) => v !== '' || dict.value.provinceList.length === 0 || dict.value.provinceList.length === 1,
    message: t('domain.template.detail.473291-22'),
    trigger: 'change',
    required: true,
  },
  postal_code: { required: true, message: t('domain.template.detail.473291-25'), trigger: 'change' },
})

const domain = ref<string>()
const getContactsTemplateDomain = () => {
  _getContactsTemplateDomain({ id: form.value.id }).then(res => {
    domain.value = res.data.domains.join('\n')
  })
}
if (pageType.value === 'edit') {
  form.value = JSON.parse(decodeURIComponent(atob(route.query.detail))) as any
  getContactsTemplateDomain()
}

const dict = ref<{
  countryList: any[]
  provinceList: any[]
  cityList: any[]
  [x: string]: any[]
}>({
  countryList: [],
  provinceList: [],
  cityList: [],
})
const getCountry = () => {
  _getCountry().then(res => {
    dict.value.countryList = res.data.countries
  })
}
getCountry()
const getProvince = code => {
  form.value.city = ''
  dict.value.cityList = []
  form.value.province = ''
  dict.value.provinceList = []
  _getProvince({ country_id: dict.value.countryList.find(v => v.code === code).id }).then(res => {
    dict.value.provinceList = res.data.states
    if (dict.value.provinceList.length === 1) {
      form.value.province = dict.value.provinceList[0].code
      getCity(form.value.province)
    }
  })
}
const getCity = name => {
  form.value.province = ''
  dict.value.cityList = []
  _getCity({ state_id: dict.value.provinceList.find(v => v.name === name).id }).then(res => {
    dict.value.cityList = res.data.cities
  })
}

const formDom1 = ref<FormInstance>()
const formDom2 = ref<FormInstance>()
const send = async () => {
  let rules1, rules2
  try {
    rules1 = await formDom1.value?.validate()
  } finally {
    rules2 = await formDom2.value?.validate()
  }
  if (!rules1 || !rules2) return

  loading.value = true
  // 设置默认模板名称为姓氏+名字
  if (!form.value.name) form.value.name = `${form.value.last_name}${form.value.first_name}`

  const fn = pageType.value === 'add' ? _addContactsTemplate : _updateContactsTemplate
  fn(form.value)
    .then(res => {
      if (res.code === 20000) {
        ElMessage.success(t(pageType.value === 'add' ? 'common.addSuccess' : 'common.changeSuccess'))
        pushRoute('/domain/template/table')
      } else {
        ElMessage.error(res.message)
      }
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style lang="scss" scoped>
@import '@/views/domain/config';

.detail-info {
  .el-form {
    flex: 1 1 0;
    margin-right: 100px;
  }
}

.form-tip {
  display: flex;

  * {
    align-self: flex-start;
    line-height: 18px !important;
  }
}
</style>
