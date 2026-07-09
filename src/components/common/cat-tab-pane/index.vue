<template>
  <div class="cat-tab__pane">
    <!-- 用于CatTabs控制显示哪一个组件内容 -->
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.cat-tab__pane {
  display: none; // 默认不显示
}
</style>
