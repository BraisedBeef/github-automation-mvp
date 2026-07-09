<template>
  <CatDialog
    v-model:dialog="show"
    :title="title"
    width="460px"
    destroy-on-close
    :loading="loading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="closeHandle"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="left"
      :label-width="formLabelWidth"
      require-asterisk-position="right"
    >
      <el-form-item :label="t('invoice.invoiceType')" prop="type">
        <el-radio v-model="form.invoiceType" :label="0">
          {{ t('invoice.electronicInvoice') }}
        </el-radio>
      </el-form-item>
      <!-- 公司名称 -->
      <el-form-item :label="t('invoice.companyNames')" prop="companyName">
        <el-input
          v-model="form.companyName"
          minlength="4"
          maxlength="32"
          :placeholder="t('invoice.companyNamePlaceholder')"
          autocomplete="off"
        />
      </el-form-item>
      <!-- 姓名 -->
      <el-form-item :label="t('invoice.name')" prop="name">
        <el-input
          v-model="form.name"
          minlength="1"
          maxlength="20"
          :placeholder="t('invoice.namePlaceholder')"
          autocomplete="off"
        />
      </el-form-item>
      <!-- 手机号码 -->
      <el-form-item :label="t('invoice.phone')" prop="phone">
        <el-input
          v-model.trim="form.phone"
          maxlength="30"
          :placeholder="t('invoice.phonePlaceholder')"
          autocomplete="off"
          @input="handlePhone"
        />
      </el-form-item>
      <!-- 地址 -->
      <el-form-item :label="t('invoice.address')" prop="address">
        <el-input
          v-model="form.address"
          :rows="3"
          minlength="3"
          maxlength="100"
          type="textarea"
          :placeholder="t('invoice.addressPlaceholder')"
          autocomplete="off"
        />
      </el-form-item>
    </el-form>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { _addVcInvoice, _updateVcInvoice } from '@/apis/cost-center/expense-bill'
import t from '@/utils/i18n'
import { useBaseStore } from '@/store'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface Form {
  mailbox: string
  invoiceType: number
  companyName: string
  name: string
  phone: string
  address: string
}

const props = withDefaults(
  defineProps<{
    type: number // type：1添加 2修改
    detail: any
  }>(),
  {
    // type: 1, // type：1添加 2修改
    // detail: () => ({}),
  },
)

const emits = defineEmits<{
  (event: 'success'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const formLabelWidthMap = {
  [ja]: '110px',
  [en]: '150px',
  [zh]: '110px',
}

const formLabelWidth = useI18nStyle(formLabelWidthMap)

const phoneReg = /^1[3-9]\d{9}$/ // 手机正则 大陆+86
const nameReg = /^[^\d]{1,20}$/ // 姓名正则
const companyNameReg = /^[^\d]{4,32}$/ // 公司名称正则

// 校验姓名
const checkName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  }
  if (!nameReg.test(value)) {
    callback(new Error(t('invoice.nameRule')))
  } else {
    callback()
  }
}

// 校验手机
const checkPhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  }
  if (!phoneReg.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

// 校验公司名称
const checkCompanyNameReg = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  }
  if (!companyNameReg.test(value)) {
    callback(new Error(t('invoice.companyNameRule')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<Form>>({
  invoiceType: [{ required: true, message: '', trigger: 'change' }],
  companyName: [{ required: true, validator: checkCompanyNameReg, trigger: 'blur' }],
  name: [{ required: true, validator: checkName, trigger: 'blur' }],
  phone: [{ required: true, validator: checkPhone, trigger: 'blur' }],
  address: [{ required: true, message: '', trigger: 'blur' }],
})
const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const loading = ref<boolean>(false)
const form = reactive<Form>({
  mailbox: '',
  invoiceType: 0,
  companyName: '',
  name: '',
  phone: '',
  address: '',
})

const tips = computed(() => [
  {
    main: t('invoice.modifyTip'),
  },
])

const title = computed(() => {
  return props.type === 1 ? t('invoice.add') : t('invoice.modify')
})

// 手机输入
const handlePhone = (value: string) => {
  if (!/^\d*$/.test(value)) {
    form.phone = value.replace(/\D/g, '')
  }
}

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')
      console.log(`form===>`, form)

      if (props.type === 1) {
        await addVcInvoice()
      } else {
        await updateVcInvoice()
      }

      emits('success')
    } else {
      console.log('error submit!', fields)
    }
  })
}

const closeHandle = () => {
  if (props.type === 1) {
    // 添加需重置表单
    form.companyName = ''
    form.name = ''
    form.phone = ''
    form.address = ''
  } else {
    // 修改需表单默认值
    form.invoiceType = props.detail.invoiceType
    form.companyName = props.detail.companyName
    form.name = props.detail.name
    form.phone = props.detail.phone
    form.address = props.detail.address
  }
}

// 添加发票抬头
const addVcInvoice = async () => {
  try {
    loading.value = true
    const res = await _addVcInvoice(form)
    console.log(`_getInvoice===>`, res)
    if (res.success) {
      show.value = false
      message.success(t('invoice.addSuccess'))
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 修改发票抬头
const updateVcInvoice = async () => {
  try {
    loading.value = true
    const res = await _updateVcInvoice(form)
    console.log(`_updateVcInvoice===>`, res)
    if (res.success) {
      show.value = false
      message.success(t('invoice.modifySuccess'))
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 监听detail
watch(
  () => props.detail,
  () => {
    form.mailbox = props.detail.mailbox
    if (props.type === 2) {
      form.invoiceType = props.detail.invoiceType
      form.companyName = props.detail.companyName
      form.name = props.detail.name
      form.phone = props.detail.phone
      form.address = props.detail.address
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.el-form-item {
  min-height: 34px;
  margin-bottom: 20px;
}

.code {
  .el-form-item__content {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;

    .el-input {
      flex: 1;
      flex-shrink: 0;
    }
  }
}

:deep(.el-form-item__error) {
  left: 0 !important;
}
</style>
