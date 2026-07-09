<template>
  <component :is="currentComponent">
    <slot />
  </component>
</template>

<script setup lang="ts">
import LegacyPermissionPage from './v1/page.vue'
import V2PermissionPage from './v2/page.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'

const { isV2Theme, syncThemeVersion } = useThemeVersion()

const currentComponent = computed(() => (isV2Theme.value ? V2PermissionPage : LegacyPermissionPage))

onBeforeMount(() => {
  syncThemeVersion()
})
</script>
