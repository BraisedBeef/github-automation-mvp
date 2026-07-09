<template>
  <div class="page">
    <!-- title -->
    <LoginTitle style="margin-bottom: 25px" svg-icon="google2" :title="loginStore.loginGoogleForm.email" />
    <!-- tip -->
    <div class="tip-wrap df mb20" :style="tipStyle">
      <SvgIcon name="warn-primary" class="mr4" :style="tipSvgStyle" />
      <span class="mark">{{ t('login.googleRegisterTip') }}</span>
    </div>

    <el-form ref="registerFormRef" :model="registerForm" :rules="rules" label-position="left">
      <!-- 密码 -->
      <el-form-item prop="password">
        <el-input
          v-model.trim="registerForm.password"
          :placeholder="t('login.pwdPlaceholder')"
          type="password"
          :max-length="20"
          show-password
          @focus="() => (showPanel = true)"
          @blur="() => (showPanel = false)"
        />

        <PwdPanel v-show="showPanel" :value="registerForm.password" class="pwd-panel" />
      </el-form-item>
      <!-- 确认密码 -->
      <el-form-item prop="re_password">
        <el-input
          v-model.trim="registerForm.re_password"
          :placeholder="t('login.reConfirmPwd')"
          type="password"
          show-password
          :max-length="20"
        />
      </el-form-item>
      <!-- 协议 -->
      <el-form-item class="agreement-wrap">
        <div>
          <div class="df ac" style="flex-wrap: wrap">
            <el-checkbox v-model="checkAgreement" />
            <span class="ml4">{{ t('login.alreadyReadAndAgree') }}</span>
            <span class="ml4 mark" @click="toServiceAgreement">{{ t('login.serviceAgreement') }}、</span>
            <span class="mark" @click="toPrivacyPolicy">{{ t('login.privacyStatement') }}</span>
          </div>
          <div
            class="text-error"
            :style="{
              opacity: showCheckAgreement && !checkAgreement ? 1 : 0,
              fontSize: '12px',
            }"
          >
            {{ t('login.readAndAgree') }}
          </div>
        </div>
      </el-form-item>

      <!--注册按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          class="google-register-btn w-full"
          :loading="loading"
          @click="register(registerFormRef)"
        >
          {{ t('login.confirmChange') }}
        </el-button>
      </el-form-item>
    </el-form>
    <el-divider>
      {{ t('login.or') }}
    </el-divider>
    <!-- 其他注册方式 -->
    <el-form-item>
      <div class="default-btn cat-flex" @click="pushRoute({ name: 'Register' })">
        {{ t('login.registerMethod') }}
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { FormInstance, FormRules } from 'element-plus/es'
import { toServiceAgreement, toPrivacyPolicy } from '@/utils/to-html'
import { addUserInfoCookie } from '../config'
import { pushRoute } from '@/utils/router-jump'
import { setCookies } from '@/utils/cookie'
import { message } from '@/utils/message'
import { useLoginStore, useUserStore, useBaseStore } from '@/store'
import PwdPanel from '../components/pwd-panel.vue'
import { _googleChangePasswordLogin } from '@/apis/login'
import { _setItem } from '@/utils/storage'
import { TOKEN, USER_STORE } from '@/config/constant-config'
import LoginTitle from '../components/login-title.vue'
import { useI18n } from 'vue-i18n'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface RegisterForm {
  password: string
  re_password: string
}

// 密码正则
const specialCharacters = '!@#$%^&*()_+~`|}{[\\]:;?><,./-'
const regexString = `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[${specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}])[a-zA-Z0-9${specialCharacters}]{8,32}$`
const pwdReg = new RegExp(regexString)

// 校验密码
const checkPwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!pwdReg.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

// 校验海外账号两次密码是否相同
const checkOverSeasRePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback('')
  } else if (value !== registerForm.password) {
    return callback(new Error(t('myDomains.samePwdValidate')))
  } else {
    callback()
  }
}

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const tipStyleMap = {
  [ja]: {
    lineHeight: '30px',
  },
  [en]: {
    lineHeight: '40px',
  },
  [zh]: {
    lineHeight: '40px',
  },
}
const tipSvgStyleMap = {
  [ja]: {
    marginTop: '8px',
  },
  [en]: {
    marginTop: '12px',
  },
  [zh]: {
    marginTop: '13px',
  },
}

const tipStyle = useI18nStyle(tipStyleMap)
const tipSvgStyle = useI18nStyle(tipSvgStyleMap)
const loginStore = useLoginStore()
const userStore = useUserStore()
const baseStore = useBaseStore()
const { locale } = useI18n()

const registerFormRef = ref<FormInstance>()
const registerForm = reactive<RegisterForm>({
  password: '',
  re_password: '',
})

const rules = reactive<FormRules<RegisterForm>>({
  password: [{ validator: checkPwd, trigger: 'blur' }],
  re_password: [{ validator: checkOverSeasRePassword, trigger: 'blur' }],
})
const checkAgreement = ref<boolean>(false)
const showCheckAgreement = ref<boolean>(false) // 是否展示验证checkbox
const showPanel = ref<boolean>(false) // 密码强度显示面板
const loading = ref<boolean>(false)

// 点击注册
const register = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  showCheckAgreement.value = true

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      if (checkAgreement.value) {
        googleChangePasswordLogin()
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 谷歌注册
const googleChangePasswordLogin = async () => {
  try {
    loading.value = true

    const res = await _googleChangePasswordLogin({
      email: loginStore.loginGoogleForm.email,
      newPassword: registerForm.password,
      confirmPassword: registerForm.re_password,
    })

    if (res.success) {
      // 存放token
      _setItem(TOKEN, res.data.token)
      userStore.setToken(res.data.token)
      userStore.setUser(res.data)

      // 存放cookie
      setCookies(TOKEN, res.data.token)
      setCookies(USER_STORE, JSON.stringify(addUserInfoCookie(res.data)))

      pushRoute({
        name: 'RegisterSuccess',
        query: {
          name: loginStore.loginGoogleForm.email,
        },
      })

      message.success(t('login.registSuccess'))
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use '../style/form.scss' as form;
@use '../style/pwd-panel';
@use '../style/page';
@use '../style/btn';
@include form.formStyles;

.tip-wrap {
  width: 400px;
  min-height: 40px;
  padding: 0 15px;
  line-height: 40px;
  color: var(--primary-color);
  word-break: break-all;
  background: rgb(0 99 255 / 8%);
  border-radius: 4px;
}

.agreement-wrap {
  font-family: PingFangSC-Regular, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;

  span {
    color: #5b6786;
    cursor: pointer;
  }

  .mark {
    color: var(--primary-color);
  }

  .el-form-item__content {
    flex-wrap: nowrap;
    align-items: flex-start;
    width: 100%;
  }
}
</style>
