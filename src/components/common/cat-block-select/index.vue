<template>
  <div class="block-list df ac">
    <div
      v-for="(item, itemi) in list"
      :key="'item' + itemi"
      :class="[
        'block-item',
        item.disabled ? 'block-disabled' : item.value === props.modelValue ? 'block-active' : '',
        props.bottom ? 'mb10' : '',
      ]"
      @click="changeActiveItem(item)"
    >
      {{ item.label }}
      <div v-if="item.discount" class="block-item-tip">
        {{ item.discount }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    list: { label: string | number; value: string | number; discount?: any; disabled?: boolean }[]
    modelValue: number | string
    width?: string
    bottom?: boolean
    multiple?: boolean
  }>(),
  {
    width: '',
    bottom: false,
  },
)

const { multiple } = props

function activeStyle(curItem: any) {
  if (multiple) {
    return (props.modelValue as unknown as (string | number)[]).includes(curItem.value) ? 'block-active' : ''
  }
  return curItem.value === props.modelValue ? 'block-active' : ''
}

const emit = defineEmits<{
  (event: 'change', params: any): void
  (event: 'update:modelValue', params: any): void
}>()

const changeActiveItem = v => {
  // if (v.disabled || v.value === props.modelValue) return;
  emit('update:modelValue', v.value)
  emit('change', v.value)
}
</script>

<style lang="scss" scoped>
.block-list {
  flex-wrap: wrap;
  gap: 15px 6px;

  .block-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 104px;
    height: 40px;
    padding: 8px 40px;
    color: #000;
    cursor: pointer;
    user-select: none;
    background-color: #eaebf1;
    border-radius: 4px;
    transition: all 0.3s;

    .block-item-tip {
      position: absolute;
      top: -8px;
      right: -2px;
      padding: 0 4px;
      font-size: 12px;
      color: #fff;
      background-color: var(--warning-color);
      border-radius: 8px;
    }
  }

  .block-active {
    color: #fff;
    background-color: var(--el-color-primary);

    &:hover {
      background-color: var(--el-color-primary);
    }
  }

  .block-disabled {
    color: var(--tip-text);
    cursor: not-allowed;
  }
}
</style>
