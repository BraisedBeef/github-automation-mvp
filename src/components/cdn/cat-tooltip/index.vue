<template>
  <el-tooltip :visible="visible" effect="light" placement="top" v-bind="attrs">
    <div class="cat-tool-tip" :style="{ width: props.width }" @mouseenter="enterHandle" @mouseleave="leaveHandle">
      <slot />
    </div>
    <template #content>
      <div class="cat-tool-tip-content max-400">
        {{ props.content }}
      </div>
    </template>
  </el-tooltip>
</template>

<script setup lang="ts">
const attrs = useAttrs()
const props = withDefaults(
  defineProps<{
    content: any
    width?: any
  }>(),
  {
    width: '100%',
  },
)

const visible = ref<boolean>(false)

const enterHandle = e => {
  visible.value = e.target.scrollWidth > e.target.clientWidth ? true : false
}

const leaveHandle = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.cat-tool-tip {
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;

  :deep(*) {
    display: inline;
    vertical-align: bottom;
  }
}

.cat-tool-tip-content {
  max-width: 400px;
}
</style>
