<template>
  <V2CreatePage v-if="isV2Theme" />
  <LegacyCreatePage v-else />
</template>

<script setup lang="ts">
import LegacyCreatePage from './index.vue'
import V2CreatePage from '@/views/v2/cvm/ins/create/index.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import { useTempStore } from '@/store'

const tempStore = useTempStore()
const { isV2Theme, syncThemeVersion } = useThemeVersion()

const syncPageHeader = () => {
  tempStore.setPageHeader(!isV2Theme.value)
}

onBeforeMount(() => {
  syncThemeVersion()
  if (isV2Theme.value) {
    tempStore.setSlider(false)
  }
  syncPageHeader()
})

watch(
  () => isV2Theme.value,
  value => {
    tempStore.setSlider(!value)
    syncPageHeader()
  },
)

onBeforeUnmount(() => {
  tempStore.setPageHeader(true)
  tempStore.setSlider(true)
})

onBeforeRouteLeave(() => {
  tempStore.setPageHeader(true)
  tempStore.setSlider(true)
})
</script>
