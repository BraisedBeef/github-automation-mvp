<template>
  <div class="blue-tip" :type="type">
    <SvgIcon v-if="!hideIcon" name="dialog-warn" />
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'primary' | 'warning' | 'error'
    hideIcon?: boolean
  }>(),
  {
    type: 'primary',
    hideIcon: false,
  },
)
</script>

<style scoped lang="scss">
.blue-tip {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 7px 12px;
  font-size: 14px;
  font-weight: 400;
  border-radius: 4px;

  svg {
    align-self: baseline;
    width: 16px;
    height: 16px;
    margin-top: 2px;
    margin-right: 8px;
  }

  &[type='primary'] {
    color: var(--primary-color);
    background-color: #e3edff;
  }

  &[type='warning'] {
    color: var(--warning-color);
    background-color: #fff3d3;
  }

  &[type='error'] {
    color: var(--error-color);
    background-color: #ffebeb;
  }
}
</style>
