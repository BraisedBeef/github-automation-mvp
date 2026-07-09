<template>
  <div v-if="isV2Theme" class="page reset-success-v2">
    <div class="reset-success-v2__icon">
      <img :src="resetSuccessIcon" alt="" />
    </div>
    <div class="reset-success-v2__title">
      {{ t('login.pwdResetSuccess') }}
    </div>
    <el-button type="primary" class="reset-success-v2__button" @click="pushRoute({ name: 'Login' })">
      {{ t('login.backLogin') }}
    </el-button>
  </div>

  <div v-else class="page">
    <!-- icon -->
    <div class="reset-success-header">
      <SvgIcon name="register-success" />
      <span>{{ t('login.pwdResetSuccess') }}</span>
    </div>

    <el-button type="primary" class="reset-success-btn w-full" @click="pushRoute({ name: 'Login' })">
      {{ t('login.backLogin') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { pushRoute } from '@/utils/router-jump'
import t from '@/utils/i18n'
import { useThemeVersion } from '@/hooks/use-theme-version'
import resetSuccessIcon from '@/assets/v2/auth-login/reset-success.svg?url'

const { isV2Theme } = useThemeVersion()
</script>

<style scoped lang="scss">
@use '../style/page';
@use '../style/btn';

.reset-success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  font-family: PingFangSC-Medium, 'PingFang SC';
  font-size: 24px;

  // font-weight: 500;
  color: #324065;

  svg {
    width: 110px;
    height: 110px;
    margin-bottom: 38px;
  }
}
</style>

<style lang="scss">
.theme-v2 .reset-success-v2 {
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
    width: 72px;
    height: 72px;

    img {
      position: absolute;
      inset: 8.85%;
      width: 82.3%;
      height: 82.3%;
    }
  }

  &__title {
    width: 100%;
    font-size: 24px;
    font-weight: 500;
    line-height: 32px;
    color: #191c23;
    text-align: center;
  }

  &__button {
    width: 100%;
    height: 48px !important;
    padding: 12px 16px !important;
    margin: 0;
    font-family: inherit;
    font-size: 16px;
    line-height: 24px;
    background: #06f;
    border-color: #06f;
    border-radius: 0 !important;
  }
}
</style>
