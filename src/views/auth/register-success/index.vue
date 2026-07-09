<template>
  <div v-if="isV2Theme" class="page register-success-v2">
    <div class="register-success-v2__icon">
      <img :src="registerSuccessIcon" alt="" />
    </div>

    <div class="register-success-v2__content">
      <div class="register-success-v2__title">
        {{ t('login.registSuccess') }}
      </div>
      <div class="register-success-v2__desc">
        {{ t('login.registSuccessTip') }}
      </div>
      <div class="register-success-v2__account">{{ t('login.loginName') }}：{{ state.account }}</div>
    </div>

    <el-button type="primary" class="register-success-v2__button" @click="pushRoute({ name: 'Layout' })">
      {{ t('login.enterConsole') }}
    </el-button>
  </div>

  <div v-else class="page">
    <!-- icon -->
    <div class="register-success-header">
      <SvgIcon name="register-success" />
      <span>{{ t('login.registSuccess') }}</span>
    </div>
    <div class="register-success-desc">
      {{ t('login.registSuccessTip') }}
    </div>
    <div class="register-success-user">
      <!-- 登录名 -->
      <div class="register-success-account">{{ t('login.loginName') }}: {{ state.account }}</div>
    </div>

    <el-button type="primary" class="register-success-btn w-full" @click="pushRoute({ name: 'Layout' })">
      {{ t('login.toConsole') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'
import { useThemeVersion } from '@/hooks/use-theme-version'
import registerSuccessIcon from '@/assets/v2/auth-login/register-success.svg?url'

const route = useRoute()
const { isV2Theme } = useThemeVersion()
const state = reactive({
  account: '',
  phone: '',
})

onMounted(() => {
  // console.log(route.query)
  const { name, phone } = route.query as any
  state.account = name
  state.phone = phone
})
</script>

<style scoped lang="scss">
@use '../style/page';
@use '../style/btn';

.register-success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-family: PingFangSC-Medium, 'PingFang SC';
  font-size: 24px;

  // font-weight: 500;
  color: #324065;

  svg {
    width: 110px;
    height: 110px;
    margin-bottom: 25px;
  }
}

.register-success-desc {
  margin-bottom: 20px;
  font-family: PingFangSC-Regular, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #5b6786;
}

.register-success-user {
  margin-bottom: 35px;
  font-family: PingFangSC-Regular, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #324065;

  .register-success-account {
    margin-bottom: 10px;
  }
}
</style>

<style lang="scss">
.theme-v2 .register-success-v2 {
  position: relative;
  top: auto;
  left: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  width: 500px;
  min-height: 0;
  padding: 48px;
  font-family: 'Noto Sans CJK SC', 'PingFang SC', sans-serif;
  background: #fff;
  border-radius: 0;
  box-shadow: 0 4px 10px rgb(0 0 0 / 10%);
  transform: none;

  &__icon {
    position: relative;
    flex-shrink: 0;
    width: 72px;
    height: 72px;

    img {
      position: absolute;
      inset: 8.85%;
      width: 82.3%;
      height: 82.3%;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    width: 100%;
    text-align: center;
  }

  &__title {
    font-size: 24px;
    font-weight: 500;
    line-height: 32px;
    color: #191c23;
  }

  &__desc {
    width: 100%;
    font-size: 14px;
    line-height: 22px;
    color: #828b9c;
  }

  &__account {
    width: 100%;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
  }

  &__button {
    width: 100%;
    height: 48px !important;
    padding: 12px 16px !important;
    font-family: inherit !important;
    font-size: 16px !important;
    line-height: 24px;
    border-radius: 0 !important;
  }
}
</style>
