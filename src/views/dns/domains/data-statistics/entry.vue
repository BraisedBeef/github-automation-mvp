<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import LegacyDataStatistics from './index.vue'
import V2DataStatistics from '@/views/v2/dns/domains/data-statistics/index.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'

const { isV2Theme, syncThemeVersion } = useThemeVersion()

const currentComponent = computed(() => (isV2Theme.value ? V2DataStatistics : LegacyDataStatistics))

onBeforeMount(() => {
  syncThemeVersion()
})
</script>
