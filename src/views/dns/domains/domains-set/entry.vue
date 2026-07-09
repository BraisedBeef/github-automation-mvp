<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import LegacyDomainsSet from './index.vue'
import V2DomainsSet from '@/views/v2/dns/domains/domains-set/index.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'

const { isV2Theme, syncThemeVersion } = useThemeVersion()

const currentComponent = computed(() => (isV2Theme.value ? V2DomainsSet : LegacyDomainsSet))

onBeforeMount(() => {
  syncThemeVersion()
})
</script>
