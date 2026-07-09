<template>
  <div class="page register-page-v2">
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

<style lang="scss">
.theme-v2 .v2-auth-panel .register-page-v2 {
  min-height: 0;
  font-family: 'Noto Sans CJK SC', 'PingFang SC', sans-serif;

  .title {
    margin-bottom: 20px !important;
    font-family: inherit;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    color: #191c23;
  }

  .el-form {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .el-form-item {
      height: 48px;
      margin: 0 !important;

      .el-form-item__content,
      .el-input {
        width: 100%;
        height: 48px !important;
        line-height: 24px;
      }

      .el-input__wrapper {
        height: 48px !important;
        padding: 12px 16px;
        border: 1px solid #dcdfe6;
        border-radius: 0;
        box-shadow: none !important;

        &:hover {
          border-color: #06f;
        }

        &.is-focus {
          border: 1px solid #06f !important;
        }
      }

      .el-input__inner {
        height: 24px;
        font-family: inherit;
        font-size: 16px;
        line-height: 24px;
        color: #191c23;

        &::placeholder {
          color: #828b9c;
        }
      }

      .el-input__suffix-inner svg {
        width: 20px;
        height: 20px;
        color: #828b9c;
      }

      &.is-error {
        .el-input__wrapper {
          border: 1px solid var(--error-color) !important;
        }
      }
    }

    .code-wrap {
      .el-input__wrapper {
        padding-right: 132px;
      }

      .verifyCodeBtn {
        height: 48px;
        padding: 0 16px;
        margin-left: 0;
        font-family: inherit;
        font-size: 16px;
        line-height: 24px;
        color: #06f;
        cursor: pointer;
        border-radius: 0;
      }
    }

    .agreement-wrap {
      position: relative;
      height: 22px !important;

      > .el-form-item__content {
        height: 22px !important;
        min-height: 22px;
        line-height: 22px;
      }

      .df {
        flex-wrap: nowrap !important;
        height: 22px;
        color: #191c23;
        white-space: nowrap;
      }

      .el-checkbox {
        height: 16px;
        margin-right: 4px;
      }

      .el-checkbox__inner {
        width: 16px;
        height: 16px;
        border-radius: 0;
      }

      .text-error {
        position: absolute;
        top: 22px;
        left: 0;
      }
    }

    .register-btn {
      width: 100%;
      height: 48px !important;
      padding: 12px 16px !important;
      font-family: inherit !important;
      font-size: 16px !important;
      line-height: 24px;
      border-radius: 0 !important;
    }

    .el-divider {
      height: 22px;
      margin: 0;
      border-color: #dcdfe6;
    }

    .el-divider__text {
      padding: 0 8px;
      font-family: inherit;
      font-size: 14px;
      line-height: 22px;
      color: #191c23;
    }

    .default-btn {
      height: 48px;
      font-family: inherit;
      font-size: 16px;
      line-height: 24px;
      color: #191c23;
      border-color: #dcdfe6;
      border-radius: 0 !important;

      svg {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }
    }
  }

  .handle {
    margin-top: 20px;
    font-family: inherit;
    font-size: 14px;
    line-height: 22px;
    color: #828b9c;
    text-align: center;
  }
}
</style>
