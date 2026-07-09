<template>
  <p class="df tip-bar" :style="{ color: props.color, background: props.background }">
    <SvgIcon :name="props.iconName" class="icon" />
    <slot>
      {{ props.tips }}
    </slot>
  </p>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
const props = withDefaults(
  defineProps<{
    tips?: string
    iconName?: string
    color?: string
    background?: string
  }>(),
  {
    tips: '',
    iconName: 'cat-cdn-tip',
    color: '#0063FF',
    background: '#e3edff',
  },
)
</script>

<style lang="scss" scoped>
.tip-bar {
  padding: 7px 13px;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #0063ff;
  background: #e3edff;

  .icon {
    margin-top: 3px;
    margin-right: 8px;
  }
}
</style>
