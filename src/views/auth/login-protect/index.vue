<template>
  <div class="page">
    <!-- title -->
    <LoginTitle style="margin-bottom: 25px" :title="t('login.loginAuth')" />
    <!-- tip -->
    <div class="tip-wrap mb20">
      <div class="ac tip">
        <SvgIcon name="warn-primary" class="mr4" style="margin-top: -2px" />
        <span>{{ t('login.protectTip') }}</span>
      </div>
    </div>
    <!-- form -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="left"
      label-width="auto"
      require-asterisk-position="right"
    >
      <el-form-item :label="t('login.authWay')">
        {{ t('login.emailAuth') }}
      </el-form-item>
      <el-form-item :label="t('login.emailNum')">
        {{ loginProtectForm.email }}
      </el-form-item>
      <!-- 验证码 -->
      <el-form-item label-width="0" prop="code" class="code-wrap" style="margin-bottom: 32px">
        <div class="w-full">
          <el-input v-model.trim="form.code" :placeholder="t('login.codePlaceholder')" autocomplete="off" />
          <VerifyCodeBtn
            :verify-fun="getCode"
            :active="loginProtectForm.email ? true : false"
            :border="false"
            class="verifyCodeBtn"
          />
        </div>
      </el-form-item>
    </el-form>

    <!-- btn -->
    <div class="df ac">
      <el-button class="btn login-protect-btn" type="primary" :loading="loading" @click="handleConfirm(formRef)">
        {{ t('common.confirm') }}
      </el-button>
      <el-button class="btn login-protect-btn" @click="backRoute()">
        {{ t('common.cancel') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { _noAuthSendMail } from '@/apis/login'
import t from '@/utils/i18n'
import { useLoginStore } from '@/store'
import { storeToRefs } from 'pinia'
import { _verifyEmailCode } from '@/apis/login'

import LoginTitle from '../components/login-title.vue'
import { useLogin } from '../hooks/use-login'
import { backRoute } from '@/utils/router-jump'

interface Form {
  code: string
}

const { login, loading } = useLogin()
const loginStore = useLoginStore()
const route = useRoute()

const { loginProtectForm, loginForm, loginType } = storeToRefs(loginStore)
const rules = reactive<FormRules<Form>>({
  code: [{ required: true, message: '', trigger: 'blur' }],
})
const formRef = ref<FormInstance>()
const form = reactive<Form>({
  code: '',
})

// 获取验证码
const getCode = async () => {
  console.log(`获取验证码===>`)

  const res = await _noAuthSendMail({
    email: loginProtectForm.value.email,
    type: route.query.type === 'loginProtection' ? 6 : 7,
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
  console.log(`route.query.type===>`, route.query.type)

  try {
    loading.value = true

    const res = await _verifyEmailCode({
      email: loginProtectForm.value.email,
      code: form.code,
      type: route.query.type === 'loginProtection' ? 6 : 7,
    })

    console.log(`verifyEmailCode ===>`, res)

    loading.value = false

    if (res.success) {
      login(loginType.value, loginForm.value)
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 点击确定
const handleConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')

      verifyEmailCode()
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<style scoped lang="scss">
@use '../style/page';
@use '../style/btn';
@use '../style/form.scss' as form;
@use '../style/code';
@include form.formStyles;

.tip-wrap {
  width: 400px;
  min-height: 60px;
  padding: 9px 15px 11px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  color: var(--primary-color);
  background: rgb(0 99 255 / 8%);
  border-radius: 8px;
}

.code {
  .el-form-item__content {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;

    .el-input {
      flex: 1;
      flex-shrink: 0;
      height: 100% !important;
    }
  }
}

.btn {
  width: 50%;
}
</style>
