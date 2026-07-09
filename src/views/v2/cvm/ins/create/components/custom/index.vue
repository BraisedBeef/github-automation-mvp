<template>
  <div class="cvm-create-custom-v2">
    <div class="cvm-create-custom-v2__steps">
      <div
        v-for="(step, index) in steps"
        :key="step.value"
        class="cvm-create-custom-v2__step"
        :class="stepClass(step.value)"
      >
        <div class="cvm-create-custom-v2__step-main">
          <span class="cvm-create-custom-v2__step-badge">
            {{ index + 1 }}
          </span>
          <span class="cvm-create-custom-v2__step-label">
            {{ step.label }}
          </span>
        </div>
        <span v-if="index < steps.length - 1" class="cvm-create-custom-v2__step-line" />
      </div>
    </div>

    <ConfigA v-if="store.step === 'a'" />
    <ConfigB v-if="store.step === 'b'" />
    <ConfigC v-if="store.step === 'c'" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useIns } from '@/views/cvm/hooks/use-ins'
import ConfigA from './config-a/index.vue'
import ConfigB from './config-b/index.vue'
import ConfigC from '@/views/cvm/ins/create/components/custom/config-c/index.vue'

const { cvmInsCreateStore: store } = useIns()

const steps = computed(() => [
  { label: t('ins.custom.stepA'), value: 'a' },
  { label: t('ins.custom.stepB'), value: 'b' },
  { label: t('ins.custom.stepC'), value: 'c' },
])

const stepOrder = ['a', 'b', 'c']

const stepClass = (value: string) => {
  const currentIndex = stepOrder.indexOf(store.step)
  const stepIndex = stepOrder.indexOf(value)

  if (stepIndex < currentIndex) return 'is-complete'
  if (stepIndex === currentIndex) return 'is-active'
  return 'is-pending'
}
</script>

<style scoped lang="scss">
.cvm-create-custom-v2 {
  // padding-bottom: 156px;
}

.cvm-create-custom-v2__steps {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 840px;
  max-width: 100%;
  margin: 44px auto 48px;

  // padding: 24px 0;
}

.cvm-create-custom-v2__step {
  display: flex;
  flex: 1;
  align-items: flex-start;
  min-width: 0;
}

.cvm-create-custom-v2__step-main {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  min-width: 0;
}

.cvm-create-custom-v2__step-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-top: 1px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #fff;
  background: #bbc0ca;
  border-radius: 999px;
}

.cvm-create-custom-v2__step-label {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #828b9c;
  white-space: nowrap;
}

.cvm-create-custom-v2__step-line {
  position: relative;
  flex: 1;
  min-width: 24px;
  height: 24px;
  margin: 0 8px;
}

.cvm-create-custom-v2__step-line::before {
  position: absolute;
  top: 11px;
  right: 12px;
  left: 0;
  height: 1px;
  content: '';
  background-image: linear-gradient(to right, #d7dce5 50%, transparent 50%);
  background-repeat: repeat-x;
  background-size: 6px 1px;
}

.cvm-create-custom-v2__step-line::after {
  position: absolute;
  top: 8px;
  right: 0;
  width: 0;
  height: 0;
  content: '';
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-left: 5px solid #c8ced8;
}

.cvm-create-custom-v2__step.is-active {
  .cvm-create-custom-v2__step-badge {
    background: #06f;
  }

  .cvm-create-custom-v2__step-label {
    font-weight: 500;
    color: #06f;
  }
}

.cvm-create-custom-v2__step.is-complete {
  .cvm-create-custom-v2__step-badge {
    background: #06f;
  }

  .cvm-create-custom-v2__step-label {
    font-weight: 500;
    color: #06f;
  }

  .cvm-create-custom-v2__step-line::before {
    background-image: linear-gradient(to right, #06f 50%, transparent 50%);
  }

  .cvm-create-custom-v2__step-line::after {
    border-left-color: #06f;
  }
}

@media (width <= 1024px) {
  .cvm-create-custom-v2__steps {
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding: 0;
  }

  .cvm-create-custom-v2__step {
    width: 100%;
  }

  .cvm-create-custom-v2__step-line {
    display: none;
  }
}
</style>
