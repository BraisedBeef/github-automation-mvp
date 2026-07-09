<template>
  <V2AuthLayout v-if="isV2Theme" />
  <AuthLayout v-else />
</template>

<script setup lang="ts">
import AuthLayout from '@/components/layout/auth.vue'
import V2AuthLayout from '@/components/v2/layout/auth.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'

const route = useRoute()
const { isV2Theme, syncThemeVersion } = useThemeVersion()

watch(
  () => route.fullPath,
  () => {
    syncThemeVersion()
  },
  { immediate: true },
)
</script>
