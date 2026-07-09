<template>
  <div class="timeline-list">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string | number
    status: 'success' | 'error' | ''
  }>(),
  {},
)
</script>

<style lang="scss" scoped></style>
