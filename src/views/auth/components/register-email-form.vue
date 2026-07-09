<template>
  <el-form ref="registerFormRef" :model="registerForm" :rules="rules" label-position="left">
    <!-- 邮箱 -->
    <el-form-item prop="email">
      <el-input
        v-model.trim="registerForm.email"
        :placeholder="isV2Theme ? t('login.emailAddressPlaceholder') : t('login.emailPlaceholder')"
      />
    </el-form-item>
    <!-- 密码 -->
    <el-form-item prop="password" class="password-wrap">
      <el-input
        v-model.trim="registerForm.password"
        :placeholder="t('login.pwdPlaceholder')"
        :type="isV2Theme && passwordVisible ? 'text' : 'password'"
        :max-length="32"
        :show-password="!isV2Theme"
        @focus="() => (showPanel = true)"
        @blur="() => (showPanel = false)"
      >
        <template v-if="isV2Theme" #suffix>
          <button
            class="password-visibility"
            type="button"
            :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
            @mousedown.prevent
            @click="passwordVisible = !passwordVisible"
          >
            <el-icon>
              <View v-if="passwordVisible" />
              <Hide v-else />
            </el-icon>
          </button>
        </template>
      </el-input>
      <!-- 密码强度提示 -->
      <PwdPanel v-show="showPanel" :value="registerForm.password" class="pwd-panel" />
    </el-form-item>
    <!-- 确认密码 -->
    <el-form-item prop="re_password">
      <el-input
        v-model.trim="registerForm.re_password"
        :placeholder="isV2Theme ? t('login.confirmPasswordPlaceholder') : t('login.reConfirmPwd')"
        :type="isV2Theme && confirmPasswordVisible ? 'text' : 'password'"
        :show-password="!isV2Theme"
        :max-length="32"
      >
        <template v-if="isV2Theme" #suffix>
          <button
            class="password-visibility"
            type="button"
            :aria-label="confirmPasswordVisible ? 'Hide password' : 'Show password'"
            @click="confirmPasswordVisible = !confirmPasswordVisible"
          >
            <el-icon>
              <View v-if="confirmPasswordVisible" />
              <Hide v-else />
            </el-icon>
          </button>
        </template>
      </el-input>
    </el-form-item>
    <!-- 验证码 -->
    <el-form-item prop="code" class="code-wrap">
      <div class="w-full h-full">
        <el-input v-model.trim="registerForm.code" :max-length="6" :placeholder="t('login.codePlaceholder')" />
        <VerifyCodeBtn :verify-fun="getCode" :border="false" :active="active" class="verifyCodeBtn" />
      </div>
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
      <el-button type="primary" class="register-btn w-full" :loading="loading" @click="register(registerFormRef)">
        {{ isV2Theme ? t('login.registerNow') : t('login.register') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { FormInstance, FormRules } from 'element-plus/es'
import { Hide, View } from '@element-plus/icons-vue'
import t from '@/utils/i18n'
import PwdPanel from './pwd-panel.vue'
import { toServiceAgreement, toPrivacyPolicy } from '@/utils/to-html'
import { EMIAL_REG, PWD_REG } from '../config'
import { _noAuthSendMail } from '@/apis/login'
import { _deepClone } from '@/utils/collection-utils'
import { message } from '@/utils/message'
import { useThemeVersion } from '@/hooks/use-theme-version'

interface Register {
  password: string // 密码
  code: string // 验证码
  email: string // 邮箱
}

interface RegisterForm {
  email: string
  password: string
  re_password: string
  code: string
}

withDefaults(
  defineProps<{
    loading: boolean
  }>(),
  {
    loading: false,
  },
)

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

// 校验海外账号两次密码是否相同
const checkOverSeasRePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback('')
  } else if (value !== registerForm.password) {
    return callback(new Error(t('login.samePwdValidate')))
  } else {
    callback()
  }
}

const emits = defineEmits<{
  (event: 'register', registerType: string, registerForm: Register): void
}>()

const registerFormRef = ref<FormInstance>()
const { isV2Theme } = useThemeVersion()
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const registerForm = reactive<RegisterForm>({
  email: '',
  password: '',
  re_password: '',
  code: '',
})

const rules = reactive<FormRules<RegisterForm>>({
  email: [{ validator: checkEmail, trigger: 'blur' }],
  password: [{ validator: checkPwd, trigger: 'blur' }],
  re_password: [{ validator: checkOverSeasRePassword, trigger: 'blur' }],
  code: [{ required: true, message: '', trigger: 'blur' }],
})

const checkAgreement = ref<boolean>(false)
const showCheckAgreement = ref<boolean>(false) // 是否展示验证checkbox
const showPanel = ref<boolean>(false) // 密码强度显示面板
const active = ref<boolean>(false) // 验证码按钮是否激活

// 获取验证码
const getCode = async () => {
  console.log(`获取验证码===>`)

  const res = await _noAuthSendMail({
    email: registerForm.email,
    type: 1,
  })

  if (res.success) {
    message.success(t('common.codeSent'))
    return true
  } else {
    message.warning(res.msg)
    return false
  }
}

// 注册
const register = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  showCheckAgreement.value = true

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      if (checkAgreement.value) {
        const form = _deepClone(registerForm)
        delete form.re_password

        emits('register', 'email', form)
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

watch(
  () => registerForm.email,
  value => {
    // registerFormRef.value?.validateField('email', valid => {
    //   console.log(`validateField===>`, valid)
    //   active.value = valid
    // })

    active.value = EMIAL_REG.test(value) ? true : false
  },
)
</script>

<style lang="scss" scoped>
@use '../style/btn';
@use '../style/pwd-panel';
@use '../style/code';

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
    flex-direction: column !important;
    align-items: flex-start;
    width: 100%;
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
</style>
