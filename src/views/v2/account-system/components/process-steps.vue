<template>
  <div
    class="v2-process-steps"
    :class="{
      'is-compact': compact,
    }"
  >
    <div v-for="(step, index) in steps" :key="step.value" class="v2-process-steps__item" :class="getStepClass(index)">
      <span class="v2-process-steps__badge">
        <template v-if="index < activeIndex">✓</template>
        <template v-else>{{ index + 1 }}</template>
      </span>
      <span class="v2-process-steps__label">{{ step.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    steps: Array<{ label: string; value: string }>
    active: string
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const activeIndex = computed(() => props.steps.findIndex(step => step.value === props.active))

const getStepClass = (index: number) => {
  if (index < activeIndex.value) return 'is-complete'
  if (index === activeIndex.value) return 'is-active'
  return 'is-pending'
}
</script>

<style scoped lang="scss">
.v2-process-steps {
  display: flex;
  gap: 10px;
  width: 100%;
  overflow: hidden;
}

.v2-process-steps__item {
  position: relative;
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%);
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
  color: #828b9c;
  background: #eef4ff;

  &::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    clip-path: inherit;
    content: '';
    background: inherit;
  }

  &:first-child {
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
  }

  &:last-child {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%);
  }

  &:not(:first-child) {
    margin-left: -10px;
  }

  &.is-complete {
    color: #06f;

    &::before {
      background: #dbe9ff;
    }
  }

  &.is-active {
    color: #fff;

    &::before {
      background: #06f;
    }
  }

  &.is-pending {
    color: #828b9c;

    &::before {
      background: #fff;
      box-shadow: inset 0 0 0 1px #e8ecf3;
    }
  }
}

.v2-process-steps__badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
  background: #fff;
  border: 1px solid rgb(255 255 255 / 85%);
  border-radius: 50%;
}

.v2-process-steps__label {
  position: relative;
  z-index: 1;
}

.v2-process-steps__item.is-complete .v2-process-steps__badge {
  color: #fff;
  background: #06f;
  border-color: #06f;
}

.v2-process-steps__item.is-pending .v2-process-steps__badge {
  color: #fff;
  background: #828b9c;
  border-color: #828b9c;
}

.v2-process-steps__item.is-active .v2-process-steps__badge {
  color: #06f;
  background: #fff;
  border-color: #fff;
}

.is-compact .v2-process-steps__item {
  min-height: 32px;
  font-size: 14px;
  line-height: 22px;
}

@media (width <= 1024px) {
  .v2-process-steps {
    flex-direction: column;
    gap: 8px;
    overflow: visible;
  }

  .v2-process-steps__item,
  .v2-process-steps__item:first-child {
    justify-content: flex-start;
    margin-left: 0;
    clip-path: none;
    border-radius: 0;
  }
}
</style>
