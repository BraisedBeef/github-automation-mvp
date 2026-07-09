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
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="left"
      label-width="110px"
      require-asterisk-position="right"
    >
      <el-form-item :label="t('invoice.mailbox')" prop="mailbox">
        <el-input v-model.trim="form.mailbox" :placeholder="t('invoice.mailboxPlaceholder')" autocomplete="off" />
      </el-form-item>
    </el-form>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { _addVcInvoice, _updateVcInvoice } from '@/apis/cost-center/expense-bill'
import t from '@/utils/i18n'
import { EMIAL_REG } from '@/views/auth/config'

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
    type: number
    detail: any
  }>(),
  {
    type: 1, // type：1添加 2修改
  },
)

const emits = defineEmits<{
  (event: 'success'): void
}>()

const loading = ref<boolean>(false)

// 校验邮箱
const checkEmail = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback('')
  } else if (!EMIAL_REG.test(value)) {
    return callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<Form>>({
  mailbox: [{ required: true, validator: checkEmail, trigger: 'blur' }],
})
const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const form = reactive<Form>({
  mailbox: '',
  invoiceType: 0,
  companyName: '',
  name: '',
  phone: '',
  address: '',
})

const title = computed(() => {
  return props.type === 1 ? t('invoice.mailboxAddTit') : t('invoice.mailboxModifyTit')
})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')

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
  // 添加需重置表单
  if (props.type === 1) {
    form.mailbox = ''
  } else {
    // 修改需表单默认值
    form.mailbox = props.detail.mailbox
  }
}
// 添加发票邮箱
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

// 修改发票邮箱
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

// 监听type
watch(
  () => props.detail,
  () => {
    form.invoiceType = props.detail.invoiceType
    form.companyName = props.detail.companyName
    form.name = props.detail.name
    form.phone = props.detail.phone
    form.address = props.detail.address

    if (props.type === 2) {
      form.mailbox = props.detail.mailbox
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
  height: 34px;
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
