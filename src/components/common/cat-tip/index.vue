<template>
  <div class="cat-tip df" :style="{ color: obj[props.type] }">
    <div class="cat-tip-bg" :style="{ backgroundColor: props.showBackground ? obj[props.type] : '', opacity: 0.12 }" />
    <div class="content df">
      <div>
        <div class="dif ac">
          <SvgIcon name="cat-cdn-tip" />
          &nbsp;
        </div>
      </div>
      <div class="text">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'primary' | 'warning' | 'success' | 'danger'
    showBackground?: boolean
  }>(),
  {
    type: 'primary',
    showBackground: true,
  },
)

const obj = {
  primary: 'var(--primary-color)',
  warning: 'var(--warning-color)',
  success: 'var(--success-color)',
  danger: 'var(--error-color)',
}
</script>

<style lang="scss" scoped>
.cat-tip {
  position: relative;
  overflow: hidden;
  font-size: 14px;
  border-radius: 4px;

  .cat-tip-bg {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .content {
    margin: 10px;
  }
}
</style>
