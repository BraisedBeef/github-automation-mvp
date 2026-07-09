<template>
  <div ref="cat_tab_box_ref" class="cat-tab-box">
    <div
      v-for="item in props.list"
      :key="item.value"
      class="cat-tab-box-item"
      :class="{
        active: modelValue === item.value,
        'cat-tab-box-item-disabled': item.disabled,
      }"
      @click="handleChange(item)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface CatTabBoxItem {
  label: string
  value: number | string
  disabled?: boolean
}
const props = withDefaults(
  defineProps<{
    list?: CatTabBoxItem[]
    modelValue?: number | string
    disabled?: boolean
  }>(),
  {
    list: () => [],
  },
)

const emit = defineEmits<{
  (event: 'change', item: CatTabBoxItem): void
  (event: 'update:modelValue', active: number | string): void
}>()

const handleChange = (item: CatTabBoxItem) => {
  if (item.disabled) return
  emit('update:modelValue', item.value)
  emit('change', item)
}
</script>

<style scoped lang="scss">
.cat-tab-box {
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  overflow: hidden;
  border-radius: 4px;

  .cat-tab-box-item {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: var(--input-height);
    padding: 0 20px;
    margin-right: -1px;
    color: var(--primary-text);
    cursor: pointer;
    background-color: #fff;
    border: 1px solid #ccc;

    &:first-child {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }

    &:last-child {
      margin-right: 0;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    &.active {
      z-index: 2;
      color: var(--primary-color);
      background-color: rgb(0 99 255 / 6%);
      border: 1px solid var(--primary-color);
    }

    &.disabled {
      cursor: not-allowed;
    }
  }

  .cat-tab-box-item-disabled {
    color: var(--el-disabled-text-color);
    pointer-events: unset;
    cursor: not-allowed;
    user-select: none;
    background-color: var(--el-disabled-bg-color);
  }
}
</style>
