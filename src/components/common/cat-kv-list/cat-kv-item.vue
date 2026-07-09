<script setup lang="ts">
const props = defineProps<{
  gutter?: number | string
  label?: string
  align?: string
  width?: string
}>()

const getRow = inject<any>('getRow')
const row = getRow()

const itemStyle = computed(() => ({ width: props.width || row.value?.width }))
const labelStyle = computed(() => ({
  textAlign: props.align || row.value?.align,
  marginRight: props.gutter || row.value?.gutter + 'px',
}))
</script>

<template>
  <div class="cat-k-v-item" :style="itemStyle">
    <div class="cat-k-v-item__label" :style="labelStyle">
      <slot name="label" :row="row.info">
        {{ props.label }}
      </slot>
    </div>
    <div class="cat-k-v-item__body">
      <slot :row="row.info" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cat-k-v-item {
  display: flex;

  &:not(:last-child) {
    margin-bottom: 20px;
  }

  .cat-k-v-item__label {
    display: inline-block; /* 宽度由内容决定 */
    flex: 0 0 auto; /* label 不伸缩，宽度由内容或设置决定 */
    color: #999;
    white-space: nowrap; /* 防止文本换行 */
  }

  .cat-k-v-item__body {
    flex: 1;
    width: inherit;
  }
}
</style>
