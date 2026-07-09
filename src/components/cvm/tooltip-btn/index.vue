<template>
  <el-tooltip :visible="visible" effect="light" :content="content" placement="top">
    <el-button
      :class="className"
      :disabled="disabled"
      @mouseenter="mouseenter"
      @mouseleave="mouseleave"
      @click="emits('click')"
    >
      {{ text }}
    </el-button>
  </el-tooltip>
</template>

<script setup lang="ts">
interface PropType {
  disabled: boolean
  visible: boolean
  text: string
  content: string
  class?: any
}

const props = withDefaults(defineProps<PropType>(), {
  disabled: true,
  visible: true,
  text: '',
  content: '',
  class: '',
})

const emits = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'click'): void
}>()

const className = computed(() => {
  return props.class || ''
})

const mouseenter = () => {
  if (props.disabled) {
    emits('update:visible', true)
  } else {
    emits('update:visible', false)
  }
}

const mouseleave = () => {
  emits('update:visible', false)
}
</script>

<style lang="scss" scoped></style>
