<template>
  <V2AccountPageShell v-if="showV2AllPage">
    <V2ManagementPage @change-tab="handleTabChange" />
  </V2AccountPageShell>
  <LegacyManagementPage v-else />
</template>

<script setup lang="ts">
import LegacyManagementPage from './index.vue'
import V2ManagementPage from '@/views/v2/ssl-certificate/management/index.vue'
import V2AccountPageShell from '@/views/v2/account-system/components/page-shell.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import { useTempStore } from '@/store'
import { _s_getItem } from '@/utils/storage'
import { SSL_CERTIFICATE_MANAGEMENT_TAB } from './config'

const tempStore = useTempStore()
const { isV2Theme, syncThemeVersion } = useThemeVersion()

const activeTab = ref('0')
let syncTimer: number | undefined

const syncActiveTab = () => {
  activeTab.value = String(_s_getItem(SSL_CERTIFICATE_MANAGEMENT_TAB) || '0')
}

const showV2AllPage = computed(() => isV2Theme.value && ['0', '1', '2', '3'].includes(activeTab.value))

const syncPageHeader = () => {
  tempStore.setPageHeader(!showV2AllPage.value)
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

onBeforeMount(() => {
  syncThemeVersion()
  syncActiveTab()
  syncPageHeader()
})

onMounted(() => {
  syncTimer = window.setInterval(syncActiveTab, 200)
})

watch([() => isV2Theme.value, activeTab], syncPageHeader)

onBeforeUnmount(() => {
  if (syncTimer) {
    window.clearInterval(syncTimer)
  }
  tempStore.setPageHeader(true)
})

onBeforeRouteLeave(() => {
  tempStore.setPageHeader(true)
})
</script>
