<template>
  <div v-if="status !== 0" class="bill-dimension-v2-qoq" :class="{ 'is-down': status < 0 }">
    <SvgIcon :name="status > 0 ? 'trend-red' : 'trend-green'" />
    <span>{{ displayValue }}</span>
  </div>
  <span v-else>{{ displayValue }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: number | string
}>()

const numericValue = computed(() => Number(props.value || 0))
const status = computed(() => {
  if (numericValue.value > 0) return 1
  if (numericValue.value < 0) return -1
  return 0
})
const displayValue = computed(() => {
  if (!props.value || Number(props.value) === 0) return props.value || 0
  return `${props.value}%`
})
</script>

<style scoped lang="scss">
.bill-dimension-v2-qoq {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  color: #e54839;

  &.is-down {
    color: #17b26a;
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}
</style>
