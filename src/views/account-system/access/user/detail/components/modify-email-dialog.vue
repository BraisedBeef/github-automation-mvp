<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('user.changeSecureEmail')"
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
      <el-form-item :label="t('account.newEmail')" prop="email" class="email">
        <el-input v-model.trim="form.email" :placeholder="t('account.emailPlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('account.emailCode')" prop="code" class="code-wrap">
        <div class="w-full h-full df ac">
          <el-input v-model.trim="form.code" :placeholder="t('account.emailCodePlaceholder')" />
          <VerifyCodeBtn :verify-fun="getCode" :active="active" :border="false" />
        </div>
      </el-form-item>
    </el-form>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { _sendMail } from '@/apis/account-system/user'
import { _updateEmail } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { EMIAL_REG } from '@/views/auth/config'

interface Form {
  email: string
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

const userStore = useUserStore()

// 校验邮箱
const checkEmail = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback('')
  } else if (!EMIAL_REG.test(value)) {
    return callback(new Error(t('common.formatErr')))
  } else if (props.user.contactEmail === value) {
    // 不能与安全邮箱设置相同
    return callback(new Error(t('account.emailCheckTip')))
  } else if (userStore.user.email === value) {
    // 不能与登录邮箱设置相同
    return callback(new Error(t('user.emailValueWarn')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<Form>>({
  email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
  code: [{ required: true, message: '', trigger: 'blur' }],
})
const route = useRoute()
const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const loading = ref<boolean>(false)
const form = reactive<Form>({
  email: '',
  code: '',
})
const active = ref<boolean>(false) // 验证码按钮是否激活

const tips = computed(() => [
  {
    main: t('user.modifyTip1', [props.user.userName, props.user.id]),
    sub: [t('user.modifyTip2'), t('user.modifyTip3'), t('user.modifyTip4')],
  },
])

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')

      updateEmail()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const closeHandle = () => {
  form.email = ''
  form.code = ''
}

// 修改安全邮箱
const updateEmail = async () => {
  try {
    loading.value = true
    const res = await _updateEmail({
      uid: Number(route.params.id) as number, //用户id
      email: form.email, // 邮箱
      code: form.code, //验证码
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

// 获取验证码
const getCode = async () => {
  console.log(`获取验证码===>`)

  const res = await _sendMail({
    email: form.email, // 该字段取新邮箱
    type: 5,
  })

  if (res.success) {
    message.success(t('common.codeSent'))
    return true
  } else {
    message.warning(res.msg)
    return false
  }
}

watch(
  () => form.email,
  value => {
    if (EMIAL_REG.test(value)) {
      // 不能与登录邮箱和安全邮箱设置相同
      if (props.user.contactEmail === value || userStore.user.email === value) {
        active.value = false
      } else {
        active.value = true
      }
    } else {
      active.value = false
    }
  },
)

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.el-form-item {
  // height: 34px;
  margin-bottom: 20px;
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

:deep(.el-form-item__error) {
  left: 0 !important;
}
</style>
