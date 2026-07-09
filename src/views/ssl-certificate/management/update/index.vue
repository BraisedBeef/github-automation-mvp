<template>
  <el-card shadow="never">
    <!-- <cat-step v-model="step.current" :steps="stepList" class="mt20 mb20" /> -->
    <component :is="components[step.current]" @switch-tab="switch_tab" />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import Update from './components/update.vue'
import State from './components/state.vue'

const components = [Update, State]
const stepList = [
  {
    label: t('ssl-certificate.management.update.516958-0'),
    value: 0,
  },
  {
    label: t('ssl-certificate.management.update.516958-1'),
    value: 1,
  },
]
/// step
const step = reactive({
  current: 0,
})
const switch_tab = (next: (typeof stepList)[0]) => {
  // 切换tab
  step.current = next.value
}
</script>

<style lang="scss" scoped></style>
