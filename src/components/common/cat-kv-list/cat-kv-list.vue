<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    gutter?: number | string
    align?: string
    width?: string
    list?: any[]
  }>(),
  {
    gutter: 10,
    algin: 'left',
    width: '100%',
  },
)

let i = -1
provide('getRow', () => {
  i++
  return toRef({
    info: props.list?.[i] || {},
    ...props,
  })
})
const maxWidth = ref(0)
const groupEle = ref<HTMLElement | null>(null)
// 获取所有类名为 cat-k-v-item 的元素
let itemElements = document.querySelectorAll('.cat-k-v-item')

const resetWidth = () => {
  requestAnimationFrame(() => {
    if (itemElements) {
      // 遍历元素，计算最大宽度
      itemElements.forEach(item => {
        const label = item.querySelector('.cat-k-v-item__label')
        if (label) {
          const width = label.clientWidth

          if (width > maxWidth.value) {
            maxWidth.value = width
          }
        }
      })

      // 设置所有类名为 cat-k-v-list__label 的元素的宽度
      itemElements.forEach(item => {
        const label = item.querySelector('.cat-k-v-item__label') as HTMLElement | null
        if (label) {
          label.style.width = `${maxWidth.value}px`
        }
      })
    }
  })
}
const resizeObserver = new ResizeObserver(resetWidth)
const mutationObserver = new MutationObserver(resetWidth)

onMounted(() => {
  if (!groupEle.value) return
  itemElements = document.querySelectorAll('.cat-k-v-item')
  resizeObserver.observe(groupEle.value)
  mutationObserver.observe(groupEle.value, {
    childList: true,
    subtree: true,
  })
})
watch(
  () => props.list,
  () => {
    resetWidth()
  },
  {
    deep: true,
  },
)
onUnmounted(() => {
  resizeObserver.disconnect()
  mutationObserver.disconnect()
})
</script>

<template>
  <div ref="groupEle" class="cat-k-v-list">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.cat-k-v-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}
</style>
