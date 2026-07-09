<template>
  <div class="custom">
    <div class="step-wrap">
      <CatStep
        :step-item-style="{
          minWidth: '180px',
        }"
        class="df jc mt20"
        :model-value="store.step"
        :steps="steps"
        :v-change="false"
      />
    </div>

    <ConfigA v-if="store.step === 'a'" />
    <ConfigB v-if="store.step === 'b'" />
    <ConfigC v-if="store.step === 'c'" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import ConfigA from './config-a/index.vue'
import ConfigB from './config-b/index.vue'
import ConfigC from './config-c/index.vue'
import { useIns } from '@/views/cvm/hooks/use-ins'

const { cvmInsCreateStore: store } = useIns()
// const route = useRoute()

const steps = computed(() => [
  { label: t('ins.custom.stepA'), value: 'a' },
  { label: t('ins.custom.stepB'), value: 'b' },
  { label: t('ins.custom.stepC'), value: 'c' },
])
</script>

<style lang="scss" scoped>
.custom {
  padding-bottom: 130px;

  .step-wrap {
    margin-top: 40px;
    margin-bottom: 40px;
  }
}
</style>
