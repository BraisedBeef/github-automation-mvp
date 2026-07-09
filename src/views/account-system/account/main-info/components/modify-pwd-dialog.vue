<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('account.changeLoginPwd')"
    width="460px"
    destroy-on-close
    :loading="loading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="closeHandle"
  >
    <el-form
      ref="formRef"
      require-asterisk-position="right"
      :model="form"
      class="multilingual_form"
      :rules="rules"
      label-position="left"
    >
      <el-form-item :label="t('account.newPwd')" prop="newPassword">
        <el-input v-model.trim="form.newPassword" :placeholder="t('domainSet2.pwdPlaceholder2')" />
      </el-form-item>
      <el-form-item :label="t('account.confirmNewPwd')" prop="confirmPassword">
        <el-input v-model.trim="form.confirmPassword" :placeholder="t('login.confirmNewPwd')" />
      </el-form-item>
      <el-form-item style="margin-top: -5px">
        <p class="tip">
          {{ t('account.pwdRule1') }}
        </p>
        <p class="tip">
          {{ t('account.pwdRule2') }}
        </p>
      </el-form-item>
      <!-- 验证码 -->
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
import { _resetPassword, _sendMail } from '@/apis/account-system/user'
import { PWD_REG } from '@/views/auth/config'
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

interface ModifyPwdForm {
  newPassword: string
  confirmPassword: string
  code: string
}

// 校验密码
const checkPwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!PWD_REG.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

// 校验二次密码
const checkRePwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (value !== form.newPassword) {
    callback(new Error(t('myDomains.samePwdValidate')))
  } else {
    callback()
  }
}

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const loading = ref<boolean>(false)
const rules = reactive<FormRules<ModifyPwdForm>>({
  newPassword: [{ required: true, validator: checkPwd, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: checkRePwd, trigger: 'blur' }],
  code: [{ required: true, message: '', trigger: 'blur' }],
})

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const form = reactive<ModifyPwdForm>({
  newPassword: '',
  confirmPassword: '',
  code: '',
})
const active = ref<boolean>(false) // 验证码按钮是否激活

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')
      resetPassword()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const closeHandle = () => {
  form.newPassword = ''
  form.confirmPassword = ''
  form.code = ''
}

// 修改密码
const resetPassword = async () => {
  try {
    loading.value = true
    const res = await _resetPassword(form)

    if (res.success) {
      message.success(t('account.modifyPwdSuccess'))
      show.value = false

      userStore.logOut()
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
    email: user.value.contactEmail, // 安全邮箱
    type: 3,
  })

  if (res.success) {
    message.success(t('common.codeSent'))
    return true
  } else {
    message.warning(res.msg)
    return false
  }
}

// 新密码
watch(
  () => form.newPassword,
  () => {
    formRef.value?.validateField('newPassword', valid => {
      console.log(`validateField===>`, valid)
      active.value = valid
    })
  },
)

// 确认新密码
watch(
  () => form.confirmPassword,
  () => {
    formRef.value?.validateField('confirmPassword', valid => {
      console.log(`validateField===>`, valid)
      active.value = valid
    })
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

.tip {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: var(--common-text);
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

  :deep(.el-form-item__error) {
    left: 0 !important;
  }
}
</style>
