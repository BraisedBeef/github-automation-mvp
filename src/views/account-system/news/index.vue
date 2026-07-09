<template>
  <div class="account-system-news">
    <router-view v-slot="{ Component, route }" :key="route.path">
      <transition name="slide-fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
</script>

<style lang="scss" scoped>
.account-system-news {
  height: 100%;
  min-height: 100%;
}
</style>
