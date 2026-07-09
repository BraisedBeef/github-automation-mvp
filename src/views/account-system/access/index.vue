<template>
  <div class="account-system-access">
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
