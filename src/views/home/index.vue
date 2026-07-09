<template>
  <div class="home-entry">
    <component :is="currentComponent" />
  </div>
</template>

<script setup lang="ts">
import V1Main from './components/main.vue'
import V1Sub from './components/sub.vue'
import V2Main from '@/views/v2/home/main.vue'
import V2Sub from '@/views/v2/home/sub.vue'
import { useTempStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useThemeVersion } from '@/hooks/use-theme-version'

const tempStore = useTempStore()
const userStore = useUserStore()
const route = useRoute()
const { isV2Theme, setThemeVersion, syncThemeVersion } = useThemeVersion()

const { user } = storeToRefs(userStore)

const currentComponent = computed(() => {
  if (isV2Theme.value) {
    return user.value.accountType == 1 ? V2Main : V2Sub
  }
  return user.value.accountType == 1 ? V1Main : V1Sub
})

watch(
  () => route.query.theme,
  value => {
    if (value === 'v1' || value === 'v2') {
      setThemeVersion(value)
      return
    }

    syncThemeVersion()
  },
  {
    immediate: true,
  },
)

onBeforeMount(() => {
  // console.log('onBeforeMount==>')
  tempStore.set('showSlider', false)
})
onBeforeUnmount(() => {
  // console.log('onBeforeUnmount==>')
  tempStore.set('showSlider', true)
})
onBeforeRouteLeave(() => {
  // console.log('onBeforeRouteLeave==>')
  tempStore.set('showSlider', true)
})
</script>

<style lang="scss" scoped>
.home-entry {
  position: relative;
}
</style>
