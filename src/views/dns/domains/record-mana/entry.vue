<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import LegacyRecordMana from './index.vue'
import V2RecordMana from '@/views/v2/dns/domains/record-mana/index.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'

const { isV2Theme, syncThemeVersion } = useThemeVersion()

const currentComponent = computed(() => (isV2Theme.value ? V2RecordMana : LegacyRecordMana))

onBeforeMount(() => {
  syncThemeVersion()
})
</script>
