<template>
  <div class="login-header">
    <div class="login-header-left cat-flex">
      <div id="logo" class="cursor-pointer">
        <SvgIcon :name="logoTextName" class="logo-icon" @click="handleLogo" />
      </div>
      <div>{{ t('login.logRegist') }}</div>
    </div>
    <div class="login-header-right cat-flex">
      <div v-if="false" class="btn cat-flex" @click="handle">
        {{ t('login.backHome') }}
      </div>
      <LanguageSwitcher icon="language-switcher-blue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import LanguageSwitcher from './language-switcher.vue'
import { owUrl, logoTextName } from '@/config/base-config'

const emit = defineEmits<{
  (event: 'back'): void
}>()

const handleLogo = () => {
  location.href = owUrl
}

const handle = () => {
  emit('back')
}
</script>

<style scoped lang="scss">
.login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--header-h);
  padding: 0 100px;
  border-bottom: 1px solid #f5f5f8;

  .login-header-left {
    #logo {
      margin-right: 50px;

      .logo-icon {
        font-size: 76px;
      }
    }

    & > div:last-child {
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #334164;
    }
  }
}
</style>
