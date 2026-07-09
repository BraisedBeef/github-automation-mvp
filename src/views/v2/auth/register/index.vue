<template>
  <div class="page">
    <!-- title -->
    <LoginTitle style="margin-bottom: 28px" :title="t('login.emailRegister')" />
    <!-- 邮箱注册 -->
    <RegisterEmailForm v-if="registerType === 'email'" :loading="loading" @register="register" />
    <!-- 跳转登录 -->
    <div class="handle">
      <span>{{ t('login.alreadyHaveAccount') }}</span>
      <span class="mark" @click="pushRoute({ name: 'Login' })">{{ t('login.toLogin') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterEmailForm from '../components/register-email-form.vue'
import LoginTitle from '../components/login-title.vue'
import { addUserInfoCookie } from '../config'
import { pushRoute } from '@/utils/router-jump'
import { setCookies } from '@/utils/cookie'
import { useUserStore } from '@/store'
import t from '@/utils/i18n'
import { _register } from '@/apis/login'
import { message } from '@/utils/message'
import { _setItem } from '@/utils/storage'
import { TOKEN, USER_STORE } from '@/config/constant-config'

const userStore = useUserStore()

const registerType = ref<string>('') // 注册类型
const loading = ref<boolean>(false) // register status

// 注册
const register = async (registerType, registerForm) => {
  console.log(`register===>`, registerType, registerForm)

  try {
    loading.value = true

    // 海外=>邮箱注册
    if (registerType === 'email') {
      const res = await _register(registerForm)

      if (res.success) {
        // 存放token
        _setItem(TOKEN, res.data.token)
        userStore.setToken(res.data.token)
        userStore.getUser().then(() => {
          // 存放cookie
          setCookies(TOKEN, res.data.token)
          setCookies(USER_STORE, JSON.stringify(addUserInfoCookie(res.data)))

          pushRoute({
            name: 'RegisterSuccess',
            query: {
              name: registerForm.email,
            },
          })
        })

        message.success(t('login.registSuccess'))
      } else {
        message.warning(res.msg)
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  registerType.value = 'email'
})

onActivated(() => {
  console.log(`loginType.value===>`, registerType.value)
})
</script>

<style scoped lang="scss">
@use '../style/form.scss' as form;
@use '../style/page';
@include form.formStyles;

.handle {
  font-family: PingFangSC-Regular, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--sub-text);

  .mark {
    color: var(--primary-color);
    cursor: pointer;
  }
}
</style>
