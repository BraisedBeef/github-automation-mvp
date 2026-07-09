<template>
  <div class="df ac tit-wrap">
    <div class="reat" />
    <span class="text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface PropType {
  text: string
}

const props = withDefaults(defineProps<PropType>(), {})
</script>

<style lang="scss" scoped>
.tit-wrap {
  /* margin-top: 40px;
  margin-bottom: 24px; */

  .reat {
    width: 3px;
    height: 16px;
    margin-right: 10px;
    background: #0063ff;
  }

  .text {
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    color: #000;
  }
}
</style>
