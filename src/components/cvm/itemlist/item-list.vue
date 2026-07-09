<template>
  <div class="item-layout">
    <!-- 渲染 Item 组件 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

interface PropType {
  marginLeft?: number
  marginBottom?: number
}

const props = withDefaults(defineProps<PropType>(), {
  marginLeft: 20,
  marginBottom: 20,
})

const timestamp = maoYunDayJs().valueOf()
const maxKeyWidth = ref<number>(0) // 每个Item的最大 Key 宽度

// 计算最大 key 宽度
const calcMaxKeyWidth = () => {
  const keyElements = document.querySelectorAll(`.key-${timestamp}`)
  console.log(`keyElements===>`, keyElements)

  let width = 0

  if (keyElements.length) {
    keyElements.forEach((el: any) => {
      width = Math.max(width, el?.offsetWidth)
    })
  }

  maxKeyWidth.value = width
  console.log(`maxKeyWidth===>`, maxKeyWidth.value)
}

// 提供给子组件
provide('timestamp', timestamp)
provide('maxKeyWidth', maxKeyWidth)
provide('marginLeft', props.marginLeft)
provide('marginBottom', props.marginBottom)
provide('calcMaxKeyWidth', calcMaxKeyWidth)

defineExpose({
  calcMaxKeyWidth,
})
</script>

<style scoped>
.item-layout {
  display: flex;
  flex-direction: column;
}
</style>
