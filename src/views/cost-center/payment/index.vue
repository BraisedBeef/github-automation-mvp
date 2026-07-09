<template>
  <div class="payment">
    <router-view v-slot="{ Component, route }" :key="route.path">
      <transition name="slide-fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { useTempStore } from '@/store'
const tempStore = useTempStore()
const route = useRoute()

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
.payment {
  height: 100%;
  min-height: 100%;
}
</style>
