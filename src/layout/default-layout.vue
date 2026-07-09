<template>
  <V2DefaultLayout v-if="isV2Theme" />
  <DefaultLayout v-else />
</template>

<script setup lang="ts">
import DefaultLayout from '@/components/layout/default.vue'
import V2DefaultLayout from '@/components/v2/layout/default.vue'
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
