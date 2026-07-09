<template>
  <section class="v2-info-notice" :class="`v2-info-notice--${variant}`">
    <div class="v2-info-notice__icon">
      <SvgIcon :name="iconName" />
    </div>
    <div class="v2-info-notice__text">
      <slot>
        <span v-if="prefix">{{ prefix }}</span>
        <button v-if="actionText" class="v2-info-notice__link" type="button" @click="$emit('action')">
          {{ actionText }}
        </button>
        <span v-if="suffix">{{ suffix }}</span>
        <span v-if="!prefix && !actionText && !suffix">{{ text }}</span>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string
    prefix?: string
    actionText?: string
    suffix?: string
    variant?: 'info' | 'danger'
    iconName?: string
  }>(),
  {
    variant: 'info',
    iconName: 'v2-cat-message-info',
  },
)

defineEmits<{
  (event: 'action'): void
}>()
</script>

<style scoped lang="scss">
.v2-info-notice {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 16px;
  background: #dbe9ff;
}

.v2-info-notice__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;

  :deep(svg) {
    width: 20px;
    height: 20px;
  }
}

.v2-info-notice__text {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
}

.v2-info-notice__link {
  display: inline;
  padding: 0;
  color: #ff720d;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.v2-info-notice--danger {
  background: #fff1f0;

  .v2-info-notice__text {
    color: #e54839;
  }

  .v2-info-notice__link {
    color: #e54839;
  }
}
</style>
