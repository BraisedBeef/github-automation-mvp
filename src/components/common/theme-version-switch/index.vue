<template>
  <button class="theme-version-switch" type="button" @click="toggleThemeVersion">
    {{ isV2Theme ? t('home.switchToV1') : t('home.switchToV2') }}
  </button>
</template>

<script setup lang="ts">
import { useThemeVersion } from '@/hooks/use-theme-version'
import t from '@/utils/i18n'

const { isV2Theme, toggleThemeVersion } = useThemeVersion()
</script>

<style lang="scss" scoped>
.theme-version-switch {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
  line-height: 20px;
  color: #005ff7;
  cursor: pointer;
  background: rgb(255 255 255 / 92%);
  border: 1px solid rgb(0 95 247 / 12%);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgb(13 61 157 / 8%);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    background-color 0.24s ease;

  &:hover {
    background: #fff;
    box-shadow: 0 14px 28px rgb(13 61 157 / 14%);
    transform: translateY(-1px);
  }
}

@media (width <= 768px) {
  .theme-version-switch {
    right: 12px;
    bottom: 12px;
    height: 32px;
    padding: 0 12px;
    font-size: 12px;
  }
}
</style>
