<template>
  <V2AccountPageShell v-if="isV2Theme">
    <component :is="currentComponent" />
  </V2AccountPageShell>
  <component :is="currentComponent" v-else />
</template>

<script setup lang="ts">
import LegacyRoleCreate from './index.vue'
import V2RoleCreate from '@/views/v2/account-system/access/role-create/index.vue'
import V2AccountPageShell from '@/views/v2/account-system/components/page-shell.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import { useTempStore } from '@/store'

const tempStore = useTempStore()
const { isV2Theme, syncThemeVersion } = useThemeVersion()

const currentComponent = computed(() => (isV2Theme.value ? V2RoleCreate : LegacyRoleCreate))

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
