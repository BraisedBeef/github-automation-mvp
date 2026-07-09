<template>
  <div class="page">
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
