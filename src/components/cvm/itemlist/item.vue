<template>
  <div
    class="item"
    :style="{
      marginBottom: `${marginBottom}px`,
    }"
  >
    <div class="key-wrap" :style="{ width: maxKeyWidth ? `${maxKeyWidth}px` : 'auto' }">
      <div ref="keyRef" :class="`key-${timestamp} h-full`" style="display: inline">
        <slot name="key" />
      </div>
    </div>
    <div
      class="value-wrap"
      :style="{
        marginLeft: `${marginLeft}px`,
        width: maxKeyWidth ? `calc(100% - ${maxKeyWidth}px) - ${marginLeft}px` : 'auto',
      }"
    >
      <div class="value">
        <slot name="value" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const timestamp = inject('timestamp')
const maxKeyWidth = inject('maxKeyWidth')
const marginLeft = inject('marginLeft')
const marginBottom = inject('marginBottom')
const calcMaxKeyWidth = inject('calcMaxKeyWidth') as () => void

const keyRef = ref() // key dom
const observer = ref()

onMounted(() => {
  if (calcMaxKeyWidth) calcMaxKeyWidth()

  observer.value = new MutationObserver(() => {
    console.log(`observer==>`)
    nextTick(() => {
      calcMaxKeyWidth()
    })
  })

  observer.value.observe(keyRef.value, {
    childList: true, // 监听子节点变化
    subtree: true, // 监听后代节点变化
    characterData: true, // 监听文本内容变化
  })
})
</script>

<style scoped>
.item {
  display: flex;

  /* align-items: center; */
}

.key-wrap {
  /* background-color: red; */
}

.value-wrap {
  /* background-color: yellow; */
  flex-grow: 1;
}
</style>
