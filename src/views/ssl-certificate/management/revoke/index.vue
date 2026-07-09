<template>
  <el-card class="page-container" shadow="never">
    <cat-step v-model="step.current" :steps="stepList" class="mt20 mb20" />
    <component :is="components[step.current]" @switch-tab="switch_tab" />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import SubmitPage from './components/submit.vue'
import verifyPage from './components/verify.vue'
import RevokePage from './components/revoke.vue'

const components = [SubmitPage, verifyPage, RevokePage]
const stepList = [
  {
    label: '提交资料',
    value: 0,
  },
  {
    label: '验证域名',
    value: 1,
  },
  {
    label: '吊销证书',
    value: 2,
  },
]

/// step
const step = reactive({
  current: 2,
})
const switch_tab = (next: (typeof stepList)[0]) => {
  // 切换tab
  step.current = next?.value
}
</script>

<style lang="scss" scoped></style>
