<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-position="left">
    <!-- 主账号ID -->
    <el-form-item prop="masterAccountId">
      <el-input
        v-model.trim="loginForm.masterAccountId"
        :placeholder="t('login.masterAccountIdPlaceholder')"
        autocomplete="off"
        style="width: 400px"
      />
    </el-form-item>
    <!-- 子用户名 -->
    <el-form-item prop="userName">
      <el-input
        v-model="loginForm.userName"
        :placeholder="t('login.userNamePlaceholder')"
        autocomplete="off"
        style="width: 400px"
      />
    </el-form-item>
    <!-- 密码 -->
    <el-form-item prop="password">
      <el-input
        v-model="loginForm.password"
        :placeholder="t('login.enterPwd')"
        autocomplete="off"
        show-password
        style="width: 400px"
        type="password"
        @keydown.enter="login(loginFormRef)"
      />
    </el-form-item>
    <!-- 登录按钮 -->
    <el-form-item class="login-btn-wrap">
      <el-button type="primary" class="login-btn" :loading="loading" style="width: 400px" @click="login(loginFormRef)">
        {{ t('login.login') }}
      </el-button>
    </el-form-item>
    <el-divider>
      {{ t('login.or') }}
    </el-divider>

    <!-- 主账号登录 -->
    <el-form-item>
      <div class="default-btn cat-flex" @click="emits('changeLoginType', 'mainAccount')">
        {{ t('login.mainAccountLogin') }}
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { FormInstance, FormRules } from 'element-plus/es'
import t from '@/utils/i18n'

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
</style>
