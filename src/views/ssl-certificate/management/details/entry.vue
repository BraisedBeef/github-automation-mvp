<template>
  <V2AccountPageShell v-if="isV2Theme">
    <V2Details :id="props.id" />
  </V2AccountPageShell>
  <LegacyDetails v-else :id="props.id" />
</template>

<script setup lang="ts">
import LegacyDetails from './index.vue'
import V2Details from '@/views/v2/ssl-certificate/management/details/index.vue'
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
