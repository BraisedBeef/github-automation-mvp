<template>
  <div class="page" :class="{ 'page--sub-account': loginType === 'subAccount' }">
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

<style lang="scss">
.theme-v2 .v2-auth-panel .page {
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
        height: 48px !important;
        line-height: 24px;
      }

      .el-input {
        width: 100% !important;
      }

      .el-input__wrapper {
        height: 48px !important;
        padding: 12px 16px;
        border: 1px solid #dcdfe6;
        border-radius: 0;
        box-shadow: none !important;

        &:hover {
          border: 1px solid #06f;
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

    .agreement-wrap {
      height: 22px !important;

      .el-form-item__content {
        height: 22px !important;
        line-height: 22px;
      }
    }

    .agreement {
      font-family: inherit;
      font-size: 14px;
      line-height: 22px;
      color: #50596a;
      white-space: nowrap;
    }

    .login-btn-wrap {
      height: 48px !important;
    }

    .login-btn {
      width: 100% !important;
      height: 48px !important;
      padding: 12px 16px !important;
      font-family: inherit !important;
      font-size: 16px !important;
      line-height: 24px;
      border-radius: 0 !important;
    }

    .el-divider {
      position: relative;
      height: 22px;
      margin: 0;
      border-top: 0;

      &::before {
        position: absolute;
        top: 50%;
        right: 0;
        left: 0;
        height: 1px;
        content: '';
        background-color: #dcdfe6;
        transform: translateY(-50%);
      }
    }

    .el-divider__text {
      top: 50%;
      padding: 0 8px;
      font-family: inherit;
      font-size: 14px;
      line-height: 22px;
      color: #191c23;
      transform: translate(-50%, -50%);
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

    .handler {
      height: 22px;
      margin-top: 0;
      font-family: inherit;
      font-size: 14px;
      line-height: 22px;

      &-left {
        color: #828b9c;
      }
    }
  }

  &.page--sub-account {
    min-height: 0;
  }
}
</style>
