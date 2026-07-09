<script setup lang="ts">
const props = defineProps<{
  text: string
  width?: string
  maxWidth?: string
}>()

const container = ref<Element>()
const disabled = ref(false)

const updateOverflow = () => {
  requestAnimationFrame(() => {
    if (container.value) {
      const isOverflow = container.value.scrollWidth > container.value.clientWidth
      disabled.value = !isOverflow
    }
  })
}

const resizeObserver = new ResizeObserver(updateOverflow)
const mutationObserver = new MutationObserver(updateOverflow)

onMounted(() => {
  if (container.value) {
    resizeObserver.observe(container.value)
    mutationObserver.observe(container.value, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }
})
onUnmounted(() => {
  resizeObserver.disconnect()
  mutationObserver.disconnect()
})
</script>

<template>
  <el-tooltip effect="dark" :content="props.text" :disabled="disabled" placement="top-start">
    <template #content>
      <p class="cat-ellipsis-tooltip__content">
        {{ props.text }}
      </p>
    </template>
    <p ref="container" class="cat-ellipsis-tooltip__text" :style="{ width: props.width, maxWidth: props.maxWidth }">
      {{ props.text }}
    </p>
  </el-tooltip>
</template>

<style lang="scss" scoped>
.cat-ellipsis-tooltip__text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;
}
</style>
