<template>
  <V2AccountPageShell v-if="isV2Theme">
    <V2Deploy :id="id" />
  </V2AccountPageShell>
  <LegacyDeploy v-else :id="id" />
</template>

<script setup lang="ts">
import LegacyDeploy from './index.vue'
import V2Deploy from '@/views/v2/ssl-certificate/management/deploy/index.vue'
import V2AccountPageShell from '@/views/v2/account-system/components/page-shell.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import { useTempStore } from '@/store'

defineProps<{
  id: string
}>()

const tempStore = useTempStore()
const { isV2Theme, syncThemeVersion } = useThemeVersion()

onBeforeMount(() => {
  syncThemeVersion()
  tempStore.setPageHeader(!isV2Theme.value)
})

watch(
  () => isV2Theme.value,
  value => {
    tempStore.setPageHeader(!value)
  },
)

onBeforeUnmount(() => {
  tempStore.setPageHeader(true)
})

onBeforeRouteLeave(() => {
  tempStore.setPageHeader(true)
})
</script>
