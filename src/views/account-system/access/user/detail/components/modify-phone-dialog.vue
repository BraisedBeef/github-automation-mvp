<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('user.changePhone')"
    width="600px"
    destroy-on-close
    :loading="loading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="closeHandle"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="left"
      class="multilingual_form"
      require-asterisk-position="right"
    >
      <el-form-item :label="t('user.newphone')" prop="phone" class="phone">
        <el-input
          v-model.trim="form.phone"
          :placeholder="t('user.phonePlaceholder')"
          autocomplete="off"
          class="phone"
          @input="handleChangePhone"
        >
          <template #prepend>
            <el-select v-model="phonePre" class="select">
              <el-option label="+86" value="86" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('user.phoneCode')" prop="code" class="code-wrap">
        <div class="w-full h-full df ac">
          <el-input v-model.trim="form.code" :placeholder="t('account.emailCodePlaceholder')" autocomplete="off" />
          <VerifyCodeBtn :verify-fun="getCode" :active="phoneReg.test(form.phone) ? true : false" :border="false" />
        </div>
      </el-form-item>
    </el-form>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import t from '@/utils/i18n'
import { _sendUpdatePhoneSms, _verifySms } from '@/apis/account-system/access/user'

interface Form {
  phone: string
  code: string
}

const props = withDefaults(
  defineProps<{
    user: any
  }>(),
  {
    user: () => ({}),
  },
)

const emits = defineEmits<{
  (event: 'success'): void
}>()

const phoneReg = /^1[3-9]\d{9}$/ // 手机正则 大陆+86

// 校验手机号
const checkPhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback('')
  } else if (!phoneReg.test(value)) {
    return callback(new Error(t('common.formatErr')))
  } else if (props.user.mobile === value) {
    return callback(new Error(t('user.phoneWarn')))
  } else {
    callback()
  }
}

const route = useRoute()
const rules = reactive<FormRules<Form>>({
  phone: [{ required: true, validator: checkPhone, trigger: 'blur' }],
  code: [{ required: true, message: '', trigger: 'blur' }],
})

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const loading = ref<boolean>(false)
const form = reactive<Form>({
  phone: '',
  code: '',
})
const phonePre = ref<string>('中国大陆（+86）') // 手机号前缀

const tips = computed(() => [
  {
    main: t('user.modifyPhoneTip1', [props.user.userName, props.user.id]),
    sub: [t('user.modifyPhoneTip2'), t('user.modifyPhoneTip3'), t('user.modifyPhoneTip4')],
  },
])

// 手机输入
const handleChangePhone = (value: string) => {
  if (!/^\d*$/.test(value)) {
    form.phone = value.replace(/\D/g, '')
  }
}

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')

      verifySms()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const closeHandle = () => {
  form.phone = ''
}

// 获取验证码
const getCode = async () => {
  console.log(`获取验证码===>`)
  const res = await _sendUpdatePhoneSms({
    phone: form.phone, // 该字段取新手机
    uid: Number(route.params.id) as number, //用户id
  })

  if (res.success) {
    message.success(t('common.codeSent'))
    return true
  } else {
    message.warning(res.msg)
    return false
  }
}

// 修改手机号
const verifySms = async () => {
  try {
    loading.value = true
    const res = await _verifySms({
      uid: Number(route.params.id) as number,
      phone: form.phone,
      code: form.code,
    })

    if (res.success) {
      show.value = false
      emits('success')
      message.success(t('account.changeSuccess'))
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.el-form-item {
  // height: 34px;
  margin-bottom: 20px;
}

.phone {
  :deep(.el-input-group__prepend) {
    background: transparent;
  }
}

.code-wrap {
  .el-form-item__content {
    width: 100%;

    /* display: flex;
    flex-wrap: nowrap; */

    .el-input {
      flex: 1;
      flex-shrink: 0;
    }
  }
}

.select {
  width: 160px;
  height: 34px;

  :deep(.el-select__wrapper) {
    height: 100%;

    .el-select__selected-item {
      color: var(--parmary-text);
    }
  }
}
</style>
