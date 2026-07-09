<template>
  <div class="login-header">
    <div class="login-header-left">
      <button class="brand" type="button" @click="handleLogo">
        <SvgIcon name="v2-header-logo" class="logo-icon" />
      </button>
      <span class="page-name">{{ pageName }}</span>
    </div>

    <div class="login-header-right">
      <div v-if="false" class="btn cat-flex" @click="handle">
        {{ t('login.backHome') }}
      </div>
      <LanguageSwitcher />
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import LanguageSwitcher from './language-switcher.vue'
import { owUrl } from '@/config/base-config'

const emit = defineEmits<{
  (event: 'back'): void
}>()

const route = useRoute()
const pageName = computed(() => {
  if (route.name === 'Login') return t('login.login')
  if (route.name === 'Register' || route.name === 'RegisterGoogle' || route.name === 'RegisterSuccess') {
    return t('login.register')
  }
  if (route.name === 'ForgetPwd') return t('login.login')
  if (route.name === 'ResetPwd' || route.name === 'ResetSuccess') return t('login.login')
  return t('login.logRegist')
})

const handleLogo = () => {
  location.href = owUrl
}

const handle = () => {
  emit('back')
}
</script>

<style scoped lang="scss">
.login-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1440px;
  height: 56px;
  padding: 0;
  margin: 0 auto;

  &-left,
  &-right {
    display: flex;
    align-items: center;
    height: 100%;
  }

  &-left {
    padding-left: 16px;
  }

  &-right {
    padding-right: 16px;
  }
}

.brand {
  display: inline-flex;
  align-items: center;
  height: 56px;
  padding: 0;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.logo-icon {
  width: 55px;
  height: 22px;
}

.page-name {
  display: inline-flex;
  align-items: center;
  height: 22px;
  margin-left: 16px;
  font-family: 'Noto Sans CJK SC', 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;

  &::before {
    width: 1px;
    height: 14px;
    margin-right: 16px;
    content: '';
    background: #dcdfe6;
  }
}
</style>
