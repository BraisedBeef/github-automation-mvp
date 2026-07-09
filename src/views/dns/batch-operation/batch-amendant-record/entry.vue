<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import LegacyPage from './index.vue'
import V2Page from '@/views/v2/dns/batch-operation/batch-amendant-record/index.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'

const { isV2Theme, syncThemeVersion } = useThemeVersion()
const currentComponent = computed(() => (isV2Theme.value ? V2Page : LegacyPage))

onBeforeMount(() => {
  syncThemeVersion()
})
</script>
