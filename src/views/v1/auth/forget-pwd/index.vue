<template>
  <div class="page">
    <!-- title -->
    <LoginTitle style="margin-bottom: 28px" :title="t('login.codeTitle')" />

    <el-form ref="forgetPwdFormRef" :model="forgetPwdForm" :rules="rules" label-position="left">
      <!-- 邮箱 -->
      <el-form-item prop="email">
        <el-input
          v-model.trim="forgetPwdForm.email"
          :placeholder="t('login.emailPlaceholder')"
          style="width: 100%"
          @blur="emailBlur"
        />
      </el-form-item>
      <!-- 验证码 -->
      <el-form-item prop="code" class="code-wrap">
        <div class="w-full h-full">
          <el-input v-model.trim="forgetPwdForm.code" :max-length="6" :placeholder="t('login.codePlaceholder')" />
          <VerifyCodeBtn :verify-fun="getCode" :active="active" :border="false" class="verifyCodeBtn" />
        </div>
      </el-form-item>
      <!-- 下一步 -->
      <el-form-item>
        <el-button
          type="primary"
          class="forget-pwd-btn"
          style="width: 100%"
          :loading="loading"
          @click="submit(forgetPwdFormRef)"
        >
          {{ t('common.next') }}
        </el-button>
      </el-form-item>

      <el-divider>
        {{ t('login.or') }}
      </el-divider>

      <!-- 返回登录 -->
      <el-form-item>
        <div class="default-btn cat-flex" @click="pushRoute({ name: 'Login' })">
          {{ t('login.backLogin') }}
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { pushRoute } from '@/utils/router-jump'
import LoginTitle from '../components/login-title.vue'
import { _noAuthSendMail, _verifyEmailCode } from '@/apis/login'
import t from '@/utils/i18n'
import { FormInstance, FormRules } from 'element-plus/es'
import { EMIAL_REG } from '../config'
import { message } from '@/utils/message'

interface ForgetPwdForm {
  email: string
  code: string
}

const forgetPwdFormRef = ref<FormInstance>()
const loading = ref<boolean>(false)
const forgetPwdForm = reactive<ForgetPwdForm>({
  email: '',
  code: '',
})
const active = ref<boolean>(false) // 验证码按钮是否激活
const phonePre = ref<string>('86')

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

const rules = reactive<FormRules<ForgetPwdForm>>({
  email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
  code: [{ required: true, message: '', trigger: 'blur' }],
})

const emailBlur = () => {}

// 获取验证码
const getCode = async () => {
  console.log(`获取验证码===>`)

  const res = await _noAuthSendMail({
    email: forgetPwdForm.email,
    type: 2,
  })

  if (res.success) {
    message.success(t('common.codeSent'))
    return true
  } else {
    message.warning(res.msg)
    return false
  }
}

// 验证邮箱验证码
const verifyEmailCode = async () => {
  try {
    loading.value = true
    const res = await _verifyEmailCode({
      email: forgetPwdForm.email,
      code: forgetPwdForm.code,
      type: 2,
    })

    console.log(`verifyEmailCode res ===>`, res)

    if (res.success) {
      pushRoute({
        name: 'ResetPwd',
        query: {
          account: forgetPwdForm.email,
          code: forgetPwdForm.code,
        },
      })
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 下一步
const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      verifyEmailCode()
    } else {
      console.log('error submit!', fields)
    }
  })
}

watch(
  () => forgetPwdForm.email,
  value => {
    // forgetPwdFormRef.value?.validateField('email', valid => {
    //   console.log(`validateField===>`, valid)
    //   active.value = valid
    // })

    active.value = EMIAL_REG.test(value) ? true : false
  },
)
</script>

<style scoped lang="scss">
@use '../style/page';
@use '../style/btn';
@use '../style/form.scss' as form;
@use '../style/code';
@include form.formStyles;
</style>
