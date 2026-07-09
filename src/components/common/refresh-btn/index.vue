<template>
  <div class="refresh-btn">
    <SvgIcon name="storage-refresh" :disabled="disabled" :loading="loading" @click="handleRefresh" />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    disabled: false,
    loading: false,
  },
)

const emit = defineEmits<{
  (event: 'refresh')
}>()

const handleRefresh = () => {
  emit('refresh')
}
</script>

<style scoped lang="scss">
.refresh-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
