<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-position="left">
    <!-- 主账号ID -->
    <el-form-item prop="masterAccountId">
      <el-input
        v-model.trim="loginForm.masterAccountId"
        :placeholder="t('login.masterAccountIdPlaceholder')"
        autocomplete="off"
      />
    </el-form-item>
    <!-- 子用户名 -->
    <el-form-item prop="userName">
      <el-input v-model="loginForm.userName" :placeholder="t('login.userNamePlaceholder')" autocomplete="off" />
    </el-form-item>
    <!-- 密码 -->
    <el-form-item prop="password">
      <el-input
        v-model="loginForm.password"
        :placeholder="isV2Theme ? t('login.loginPasswordPlaceholder') : t('login.enterPwd')"
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
    <!-- 登录按钮 -->
    <el-form-item class="login-btn-wrap">
      <el-button
        type="primary"
        class="login-btn"
        :loading="loading"
        :style="isV2Theme ? undefined : { width: '400px' }"
        @click="login(loginFormRef)"
      >
        {{ isV2Theme ? t('login.loginNow') : t('login.login') }}
      </el-button>
    </el-form-item>
    <el-divider>
      {{ t('login.or') }}
    </el-divider>

    <!-- 主账号登录 -->
    <el-form-item>
      <div class="default-btn cat-flex" @click="emits('changeLoginType', 'mainAccount')">
        {{ isV2Theme ? t('login.mainAccountLoginV2') : t('login.mainAccountLogin') }}
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { FormInstance, FormRules } from 'element-plus/es'
import { Hide, View } from '@element-plus/icons-vue'
import t from '@/utils/i18n'
import { useThemeVersion } from '@/hooks/use-theme-version'

interface LoginForm {
  masterAccountId: string
  userName: string
  password: string
  accountType: number
}

const emits = defineEmits<{
  (event: 'login', loginType: string, loginForm: LoginForm): void
  (event: 'changeLoginType', loginType: string): void
}>()

withDefaults(
  defineProps<{
    loading: boolean
  }>(),
  {
    loading: false,
  },
)

const loginFormRef = ref<FormInstance>()
const { isV2Theme } = useThemeVersion()
const passwordVisible = ref(false)
const loginForm = reactive<LoginForm>({
  masterAccountId: '',
  userName: '',
  password: '',
  accountType: 2,
})

const rules = reactive<FormRules<LoginForm>>({
  masterAccountId: [{ required: true, message: '', trigger: 'blur' }],
  userName: [{ required: true, message: '', trigger: 'blur' }],
  password: [{ required: true, message: '', trigger: 'blur' }],
})

// 登录
const login = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      emits('login', 'subAccount', loginForm)
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<style lang="scss" scoped>
@use '../style/btn';

.login-btn-wrap {
  margin-top: 24px !important;
  margin-bottom: 24px !important;
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
