<template>
  <div class="v2-segmented-tabs">
    <button
      v-for="item in items"
      :key="item.value"
      class="v2-segmented-tabs__item"
      :class="{ 'is-active': modelValue === item.value, 'is-disabled': item.disabled }"
      type="button"
      :disabled="item.disabled"
      @click="$emit('update:modelValue', item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>
  modelValue: string | number
}>()

defineEmits<{
  (event: 'update:modelValue', value: string | number): void
}>()
</script>

<style scoped lang="scss">
.v2-segmented-tabs {
  display: flex;
  flex-wrap: wrap;
}

.v2-segmented-tabs__item {
  min-width: 78px;
  height: 34px;
  padding: 0 18px;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  appearance: none;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9dde5;
}

.v2-segmented-tabs__item + .v2-segmented-tabs__item {
  margin-left: -1px;
}

.v2-segmented-tabs__item.is-active {
  position: relative;
  z-index: 1;
  color: #06f;
  border-color: #06f;
}

.v2-segmented-tabs__item.is-disabled {
  color: #b7c0cd;
  cursor: not-allowed;
  background: #f7f8fa;
}
</style>
