<template>
  <V2AccountPageShell v-if="isV2Theme">
    <component :is="currentComponent" />
  </V2AccountPageShell>
  <component :is="currentComponent" v-else />
</template>

<script setup lang="ts">
import LegacySecuritySetting from './index.vue'
import V2MainSecuritySetting from '@/views/v2/account-system/security-setting/main.vue'
import V2SubSecuritySetting from '@/views/v2/account-system/security-setting/sub.vue'
import V2AccountPageShell from '@/views/v2/account-system/components/page-shell.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import { useTempStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const tempStore = useTempStore()
const { user } = storeToRefs(userStore)
const { isV2Theme, syncThemeVersion } = useThemeVersion()

const currentComponent = computed(() => {
  if (isV2Theme.value) {
    return user.value.accountType == 1 ? V2MainSecuritySetting : V2SubSecuritySetting
  }

  return LegacySecuritySetting
})

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
