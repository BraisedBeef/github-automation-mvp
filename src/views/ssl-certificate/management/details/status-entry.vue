<template>
  <V2AccountPageShell v-if="isV2Theme">
    <V2Status :id="props.id" />
  </V2AccountPageShell>
  <LegacyStatus v-else :id="props.id" />
</template>

<script setup lang="ts">
import LegacyStatus from './status.vue'
import V2Status from '@/views/v2/ssl-certificate/management/details/status.vue'
import V2AccountPageShell from '@/views/v2/account-system/components/page-shell.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import { useTempStore } from '@/store'

const props = defineProps<{
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
