<template>
  <el-card class="page-container" shadow="never">
    <cat-step v-model="step.current" :steps="stepList" class="mt20 mb20" />
    <component :is="components[step.current]" @switch-tab="switch_tab" />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import SubmitPage from './components/submit.vue'
import verifyPage from './components/verify/index.vue'
import { SSL_CERTIFICATE_APPLY_TAB } from '../config'
const components = [SubmitPage, verifyPage]
const stepList = [
  {
    label: t('ssl-certificate.management.apply.760402-0'),
    value: 0,
  },
  {
    label: t('ssl-certificate.management.apply.760402-1'),
    value: 1,
  },
]

const defStep = _s_getItem(SSL_CERTIFICATE_APPLY_TAB) || 0

/// step
const step = reactive({
  current: defStep,
})
const switch_tab = (next: (typeof stepList)[0]) => {
  // 切换tab
  step.current = next?.value
  // 保存tab
  _s_setItem(SSL_CERTIFICATE_APPLY_TAB, next?.value)
}

onUnmounted(() => {
  _s_setItem(SSL_CERTIFICATE_APPLY_TAB, 0)
})
</script>

<style lang="scss" scoped></style>
