<template>
  <div class="v2-login-page">
    <header class="v2-login-header">
      <button class="brand" type="button" @click="handleLogo">
        <SvgIcon :name="logoTextName" class="brand-logo" />
        <span class="brand-divider" />
        <span>{{ t('login.logRegist') }}</span>
      </button>
      <LanguageSwitcher icon="language-switcher-blue" />
    </header>

    <main class="v2-login-body">
      <section class="hero-panel">
        <div class="hero-copy">
          <h1>{{ t('login.welcomeLogin') }}</h1>
        </div>
        <div class="hero-visual" />
      </section>

      <section class="login-card">
        <template v-if="loginType === 'mainAccount'">
          <h2>{{ t('login.welcomeLogin') }}</h2>
          <el-form ref="loginFormRef" class="main-account-form" :model="loginForm" :rules="rules" label-position="left">
            <el-form-item prop="email">
              <el-input v-model.trim="loginForm.email" :placeholder="t('login.emailPlaceholder')" autocomplete="off" />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model.trim="loginForm.password"
                :placeholder="t('login.pwdPlaceholder')"
                autocomplete="off"
                show-password
                type="password"
                @keydown.enter="submitMainAccount(loginFormRef)"
              />
            </el-form-item>

            <div class="handler">
              <button type="button" @click="pushRoute({ name: 'Register' })">
                {{ t('login.registerFree') }}
              </button>
              <button type="button" @click="pushRoute({ name: 'ForgetPwd' })">
                {{ t('login.forgotPwd') }}
              </button>
            </div>

            <el-button
              class="primary-login-btn"
              type="primary"
              :loading="loading"
              @click="submitMainAccount(loginFormRef)"
            >
              {{ t('login.login') }}
            </el-button>

            <div class="divider">
              <span />
              <em>{{ t('login.or') }}</em>
              <span />
            </div>

            <button class="outline-action" type="button" @click="handleGoogle">
              <SvgIcon name="google2" />
              <span>{{ t('login.continueWithGoogle') }}</span>
            </button>

            <button class="outline-action" type="button" @click="loginType = 'subAccount'">
              {{ t('login.subuserLogin') }}
            </button>

            <p class="agreement">
              {{ t('login.agreementTip') }}
              <button type="button" @click.stop="toServiceAgreement">
                {{ t('login.bindAgreement') }}
              </button>
              <span>、</span>
              <button type="button" @click.stop="toServiceAgreement">
                {{ t('login.termsOfService') }}
              </button>
              <span>、</span>
              <button type="button" @click.stop="toPrivacyPolicy">
                {{ t('login.privacyPolicy') }}
              </button>
            </p>
          </el-form>
        </template>

        <template v-else>
          <h2>{{ t('login.CAMUserLoginLogin') }}</h2>
          <LoginSubAccountForm
            class="sub-account-form"
            :loading="loading"
            @login="login"
            @change-login-type="changeLoginType"
          />
        </template>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus/es'
import LanguageSwitcher from '@/components/v2/layout/components/header/login-header/language-switcher.vue'
import LoginSubAccountForm from '../components/login-sub-account-form.vue'
import { _googleAuthorizingUrl } from '@/apis/login'
import { logoTextName, owUrl } from '@/config/base-config'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'
import { toPrivacyPolicy, toServiceAgreement } from '@/utils/to-html'
import { EMIAL_REG } from '../config'
import { useLogin } from '../hooks/use-login'

interface LoginForm {
  email: string
  password: string
  accountType: number
}

const route = useRoute()
const { login, loading } = useLogin()

const loginType = ref<'mainAccount' | 'subAccount'>('mainAccount')
const loginFormRef = ref<FormInstance>()
const loginForm = reactive<LoginForm>({
  email: '',
  password: '',
  accountType: 1,
})

const checkEmail = (_rule: unknown, value: string, callback: (error?: Error | string) => void) => {
  if (!value) {
    callback('')
  } else if (!EMIAL_REG.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<LoginForm>>({
  email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
  password: [{ required: true, message: '', trigger: 'blur' }],
})

const submitMainAccount = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(valid => {
    if (valid) {
      login('mainAccount', loginForm)
    }
  })
}

const changeLoginType = (type: string) => {
  if (type === 'mainAccount' || type === 'subAccount') {
    loginType.value = type
  }
}

const handleGoogle = async () => {
  const redirectUrl = route.query?.redirect_url as string
  const res = await _googleAuthorizingUrl({
    redirectUrl,
  })

  if (res.success && res.data) {
    window.location.href = res.data
  }
}

const handleLogo = () => {
  location.href = owUrl
}
</script>

<style scoped lang="scss">
.v2-login-page {
  position: fixed;
  inset: 0;
  z-index: 900;
  min-width: 1180px;
  min-height: 754px;
  overflow: auto;
  font-family: PingFangSC-Regular, 'PingFang SC', Arial, sans-serif;
  color: #191c23;
  background: #f8fbff;
}

.v2-login-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px 0 16px;
}

.brand {
  display: inline-flex;
  gap: 16px;
  align-items: center;
  padding: 0;
  font-size: 14px;
  line-height: 20px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.brand-logo {
  width: 55px;
  height: 22px;
  color: #191c23;
}

.brand-divider {
  width: 1px;
  height: 14px;
  background: #191c23;
  opacity: 0.68;
}

.v2-login-body {
  position: relative;
  display: grid;
  grid-template-columns: minmax(560px, 1fr) 640px;
  gap: 60px;
  align-items: start;
  width: min(1280px, calc(100% - 160px));
  min-height: calc(100% - 56px);
  padding: 24px 0 80px;
  margin: 0 auto;
}

.hero-panel {
  align-self: stretch;
  min-height: 594px;
}

.hero-copy {
  max-width: 520px;
  margin-top: 48px;

  h1 {
    margin: 0;
    font-family: PingFangSC-Medium, 'PingFang SC';
    font-size: 48px;
    font-weight: 500;
    line-height: 1.24;
    color: #191c23;
  }
}

.hero-visual {
  width: 580px;
  height: 300px;
  margin-top: 147px;
  background: url('@/assets/v2/auth-login/v2-login-image-2.png') 44.4% 53.7% / 166.4% 341.3% no-repeat;
}

.login-card {
  width: 640px;
  min-height: 594px;
  padding: 52px 48px 48px;
  background: #fff;
  box-shadow:
    0 6px 18px rgb(31 73 125 / 6%),
    0 18px 48px rgb(31 73 125 / 10%);

  h2 {
    margin: 0 0 33px;
    font-family: PingFangSC-Medium, 'PingFang SC';
    font-size: 24px;
    font-weight: 500;
    line-height: 32px;
    color: #191c23;
  }
}

.main-account-form {
  width: 544px;
}

.main-account-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.main-account-form :deep(.el-form-item__content) {
  line-height: 48px;
}

.main-account-form :deep(.el-input) {
  height: 48px;
}

.main-account-form :deep(.el-input__wrapper) {
  height: 48px;
  padding: 0 16px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;

  &:hover,
  &.is-focus {
    box-shadow: 0 0 0 1px #06f inset;
  }
}

.main-account-form :deep(.el-input__inner) {
  font-size: 14px;
  color: #191c23;
}

.handler {
  display: flex;
  justify-content: space-between;
  margin: 8px 0 22px;

  button {
    padding: 0;
    font-size: 14px;
    line-height: 20px;
    color: #06f;
    cursor: pointer;
    background: transparent;
    border: 0;
  }
}

.primary-login-btn {
  width: 544px;
  height: 48px;
  font-size: 16px;
  background-color: #06f;
  border-color: #06f;
  border-radius: 0;
}

.divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 15px;
  align-items: center;
  margin: 28px 0 31px;

  span {
    height: 1px;
    background: #dcdfe6;
  }

  em {
    font-size: 14px;
    font-style: normal;
    line-height: 20px;
    color: #828b9c;
  }
}

.outline-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 544px;
  height: 48px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 20px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 0;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
    margin-right: 10px;
  }

  &:hover {
    color: #06f;
    border-color: #06f;
  }
}

.agreement {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  align-items: center;
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;

  button {
    padding: 0;
    font-size: inherit;
    line-height: inherit;
    color: #06f;
    cursor: pointer;
    background: transparent;
    border: 0;
  }
}

.sub-account-form {
  width: 544px;
}

.sub-account-form :deep(.el-form-item) {
  height: 48px;
  margin-bottom: 20px;
}

.sub-account-form :deep(.el-input),
.sub-account-form :deep(.el-button),
.sub-account-form :deep(.default-btn) {
  width: 544px !important;
  height: 48px !important;
  border-radius: 0 !important;
}

.sub-account-form :deep(.el-input__wrapper) {
  height: 48px;
  padding: 0 16px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

@media (width <= 1240px) {
  .v2-login-page {
    min-width: 0;
  }

  .v2-login-body {
    grid-template-columns: 1fr;
    justify-items: center;
    width: min(640px, calc(100% - 32px));
    padding: 48px 0;
  }

  .hero-panel {
    display: none;
  }
}

@media (width <= 700px) {
  .v2-login-page {
    min-height: 100vh;
  }

  .v2-login-header {
    padding: 0 16px;
  }

  .login-card {
    width: 100%;
    min-height: auto;
    padding: 48px 24px 32px;
  }

  .main-account-form,
  .sub-account-form,
  .primary-login-btn,
  .outline-action {
    width: 100%;
  }

  .sub-account-form :deep(.el-input),
  .sub-account-form :deep(.el-button),
  .sub-account-form :deep(.default-btn) {
    width: 100% !important;
  }
}
</style>
