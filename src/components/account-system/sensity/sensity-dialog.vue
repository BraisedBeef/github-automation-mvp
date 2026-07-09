<template>
  <component :is="content" v-if="dialogVisible" :on-handle-close="onHandleClose" :on-handle-confirm="onHandleConfirm" />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    content: any
    dialogVisible: boolean
    onHandleClose: any
    onHandleConfirm: any
  }>(),
  {
    dialogVisible: false,
    onHandleClose: () => {},
    onHandleConfirm: () => {},
  },
)
</script>

<style lang="scss" scoped></style>
