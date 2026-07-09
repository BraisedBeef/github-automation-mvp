<template>
  <div class="page">
    <!-- title -->
    <LoginTitle
      style="margin-bottom: 28px"
      :title="loginType === 'mainAccount' ? t('login.welcomeLogin') : t('login.CAMUserLoginLogin')"
    />

    <!-- 主账户登录 -->
    <LoginMainAccountForm
      v-if="loginType === 'mainAccount'"
      :loading="loading"
      @login="login"
      @change-login-type="loginType = $event"
    />
    <!-- 子用户登录 -->
    <LoginSubAccountForm
      v-if="loginType === 'subAccount'"
      :loading="loading"
      @login="login"
      @change-login-type="loginType = $event"
    />
  </div>
</template>

<script setup lang="ts">
import LoginMainAccountForm from '../components/login-main-account-form.vue'
import LoginSubAccountForm from '../components/login-sub-account-form.vue'
import { useBaseStore } from '@/store'
import t from '@/utils/i18n'
import LoginTitle from '../components/login-title.vue'
import { useLogin } from '../hooks/use-login'

const baseStore = useBaseStore()
const { login, loading } = useLogin()

const loginType = ref<string>('') // 登录类型

onMounted(() => {
  loginType.value = 'mainAccount'
})

onActivated(() => {
  console.log(`loginType.value===>`, loginType.value)
  if (baseStore) {
    // baseStore.selectedKeys = ''
  }
})
</script>

<style scoped lang="scss">
@use '../style/page';
@use '../style/form.scss' as form;
@include form.formStyles;
</style>
