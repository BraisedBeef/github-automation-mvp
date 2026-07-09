<template>
  <V2AccountPageShell v-if="isV2Theme">
    <component :is="currentComponent" />
  </V2AccountPageShell>
  <component :is="currentComponent" v-else />
</template>

<script setup lang="ts">
import LegacyMainUser from './main-info/index.vue'
import LegacySubUser from './sub-info/index.vue'
import V2MainUser from '@/views/v2/account-system/account/main.vue'
import V2SubUser from '@/views/v2/account-system/account/sub.vue'
import V2AccountPageShell from '@/views/v2/account-system/components/page-shell.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import { useTempStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const tempStore = useTempStore()
const { user } = storeToRefs(userStore)
const { isV2Theme, syncThemeVersion } = useThemeVersion()

const syncPageHeaderVisible = () => {
  tempStore.setPageHeader(!isV2Theme.value)
}

const currentComponent = computed(() => {
  if (isV2Theme.value) {
    return user.value.accountType == 1 ? V2MainUser : V2SubUser
  }

  return user.value.accountType == 1 ? LegacyMainUser : LegacySubUser
})

onBeforeMount(() => {
  syncThemeVersion()
  syncPageHeaderVisible()
})

watch(
  () => isV2Theme.value,
  value => {
    tempStore.setPageHeader(!value)
  },
)

onMounted(() => {
  nextTick(() => {
    // Re-apply after mount so the previous page's cleanup can't override this page's layout mode.
    syncPageHeaderVisible()
  })
})

onBeforeUnmount(() => {
  tempStore.setPageHeader(true)
})

onBeforeRouteLeave(() => {
  tempStore.setPageHeader(true)
})
</script>
