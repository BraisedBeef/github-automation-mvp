<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-position="left">
    <!-- 邮箱 -->
    <el-form-item prop="email">
      <el-input
        v-model.trim="loginForm.email"
        :placeholder="isV2Theme ? t('login.emailAddressPlaceholder') : t('login.emailPlaceholder')"
        autocomplete="off"
      />
    </el-form-item>
    <!-- 密码 -->
    <el-form-item prop="password">
      <el-input
        v-model.trim="loginForm.password"
        :placeholder="t('login.pwdPlaceholder')"
        autocomplete="off"
        :show-password="!isV2Theme"
        :type="isV2Theme && passwordVisible ? 'text' : 'password'"
        @keydown.enter="login(loginFormRef)"
      >
        <template v-if="isV2Theme" #suffix>
          <button
            class="password-visibility"
            type="button"
            :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
            @click="passwordVisible = !passwordVisible"
          >
            <el-icon>
              <View v-if="passwordVisible" />
              <Hide v-else />
            </el-icon>
          </button>
        </template>
      </el-input>
    </el-form-item>
    <!-- 协议 -->
    <el-form-item class="agreement-wrap">
      <div class="agreement">
        {{ t('login.agreementTip') }}
        <span @click.stop="toServiceAgreement">{{ t('login.bindAgreement') }}、</span>
        <span @click.stop="toServiceAgreement">{{ t('login.termsOfService') }}、</span>
        <span @click.stop="toPrivacyPolicy">{{ t('login.privacyPolicy') }}</span>
      </div>
    </el-form-item>
    <!-- 登录按钮 -->
    <el-form-item class="login-btn-wrap">
      <el-button type="primary" class="login-btn w-full" :loading="loading" @click="login(loginFormRef)">
        {{ isV2Theme ? t('login.loginNow') : t('login.login') }}
      </el-button>
    </el-form-item>

    <el-divider> {{ t('login.or') }} </el-divider>

    <!-- 子用户登录 -->
    <el-form-item>
      <div class="default-btn cat-flex" @click="emits('changeLoginType', 'subAccount')">
        {{ isV2Theme ? t('login.subAccountLogin') : t('login.subuserLogin') }}
      </div>
    </el-form-item>

    <!-- 没有账号?免费注册 -->
    <div class="handler tip">
      <div class="handler-left">
        <span>{{ t('login.noAccount') }}</span>
        <span class="register" @click="pushRoute({ name: 'Register' })"> {{ t('login.registerFree') }}</span>
      </div>
      <div class="handler-right" @click="pushRoute({ name: 'ForgetPwd' })">
        {{ t('login.forgotPwd') }}
      </div>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { FormInstance, FormRules } from 'element-plus/es'
import { Hide, View } from '@element-plus/icons-vue'
import t from '@/utils/i18n'
import { toServiceAgreement, toPrivacyPolicy } from '@/utils/to-html'
import { EMIAL_REG } from '../config'
import { pushRoute } from '@/utils/router-jump'
import { useThemeVersion } from '@/hooks/use-theme-version'

interface LoginForm {
  email: string
  password: string
  accountType: number
}

withDefaults(
  defineProps<{
    loading: boolean
  }>(),
  {
    loading: false,
  },
)

const emits = defineEmits<{
  (event: 'login', loginType: string, loginForm: LoginForm): void
  (event: 'changeLoginType', loginType: string): void
}>()

const { isV2Theme } = useThemeVersion()
const loginFormRef = ref<FormInstance>()
const passwordVisible = ref(false)
const loginForm = reactive<LoginForm>({
  email: '',
  password: '',
  accountType: 1,
})
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

const rules = reactive<FormRules<LoginForm>>({
  email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
  password: [{ required: true, message: '', trigger: 'blur' }],
})

// 登录
const login = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      emits('login', 'mainAccount', loginForm)
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<style lang="scss" scoped>
@use '../style/btn';

.agreement-wrap {
  height: auto !important;

  .agreement {
    font-family: PingFangSC-Regular, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #5b6786;

    span {
      color: var(--primary-color);
      cursor: pointer;
    }
  }
}

.password-visibility {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #828b9c;
  cursor: pointer;
  background: transparent;
  border: 0;
}

// handler
.handler {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;

  .handler-left {
    color: #7a8ca6;

    .register {
      color: var(--primary-color);
      cursor: pointer;
    }
  }

  .handler-right {
    color: var(--primary-color);
    cursor: pointer;
  }
}
</style>
