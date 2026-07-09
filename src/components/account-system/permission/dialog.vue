<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import LegacyPermissionDialog from './v1/dialog.vue'
import V2PermissionDialog from './v2/dialog.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'

const { isV2Theme, syncThemeVersion } = useThemeVersion()

const currentComponent = computed(() => (isV2Theme.value ? V2PermissionDialog : LegacyPermissionDialog))

onBeforeMount(() => {
  syncThemeVersion()
})
</script>
