<template>
  <V2AccountPageShell v-if="isV2Theme">
    <V2CustomImageDetail />
  </V2AccountPageShell>
  <LegacyCustomImageDetail v-else />
</template>

<script setup lang="ts">
import LegacyCustomImageDetail from './custom.vue'
import V2CustomImageDetail from '@/views/v2/cvm/image/detail/custom.vue'
import V2AccountPageShell from '@/views/v2/account-system/components/page-shell.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import { useTempStore } from '@/store'

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
