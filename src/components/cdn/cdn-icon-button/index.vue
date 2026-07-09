<template>
  <el-button v-bind="attrs" plain class="icon-button">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
const attrs = useAttrs()
</script>

<style lang="scss" scoped>
.el-button.is-plain.icon-button {
  width: 34px;
  color: var(--sub-text);

  &:hover {
    color: var(--primary-color);
  }
}
</style>
