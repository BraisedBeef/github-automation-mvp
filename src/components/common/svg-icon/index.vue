<template>
  <svg :font-size="props.size" :class="svgClass" v-bind="attrs" :style="{ pointerEvents: disabled ? 'none' : 'auto' }">
    <use :xlink:href="iconName" rel="external nofollow" />
  </svg>
</template>

<script setup lang="ts">
const attrs = useAttrs()
const props = withDefaults(
  defineProps<{
    name: string
    disabled?: boolean
    size?: number | string
  }>(),
  {
    disabled: false,
  },
)

const iconName = computed(() => `#icon-${props.name}`)
const svgClass = computed(() => {
  return props.name ? `svg-icon ${iconName.value} ${props.name}` : 'svg-icon'
})
</script>

<style scoped lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentcolor !important;

  &[loading='true'] {
    cursor: loading !important;
    animation: svg-loading 1s infinite ease-out;
  }

  &.loading {
    cursor: loading !important;
    animation: svg-loading 1s infinite ease-out;
  }

  &.disabled {
    cursor: not-allowed;
  }

  &[disabled] {
    cursor: not-allowed;
  }

  &[pointer] {
    cursor: pointer;
  }

  @keyframes svg-loading {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
}
</style>
