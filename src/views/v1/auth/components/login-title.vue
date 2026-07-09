<template>
  <p class="df ac title">
    <SvgIcon v-if="svgIcon" :name="svgIcon" /><span class="ml4">{{ title }}</span>
  </p>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    svgIcon?: string
  }>(),
  {
    title: '',
    svgIcon: '',
  },
)
</script>

<style scoped lang="scss">
.title {
  /* margin-bottom: 25px; */
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 24px;
  color: var(--primary-text);

  svg {
    width: 26px;
    height: 26px;
  }
}
</style>
