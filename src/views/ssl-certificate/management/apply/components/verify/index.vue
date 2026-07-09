<template>
  <component :is="component[verifyType - 1]" :verify-type="verifyType" @switch-verify-type="switch_tab" />
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import { SSL_CERTIFICATE_VERIFY_TYPE } from '@/views/ssl-certificate/management/config'
import Auto from './auto.vue'
import Manual from './manual.vue'
import File from './file.vue'

const component = [Manual, File, Auto]

// 验证类型
const s_verifyType = _s_getItem(SSL_CERTIFICATE_VERIFY_TYPE)
const verifyType = ref(Number(s_verifyType))

function switch_tab(index: string | number) {
  verifyType.value = Number(index)
  _s_setItem(SSL_CERTIFICATE_VERIFY_TYPE, verifyType.value)
}
</script>

<style lang="scss" scoped></style>
