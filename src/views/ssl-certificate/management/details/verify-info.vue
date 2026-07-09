<template>
  <el-card class="page-container" shadow="never">
    <component :is="component[verifyType - 1]" :verify-type="verifyType" @switch-verify-type="switch_tab" />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import Manual from './components/manual.vue'
import File from './components/file.vue'

const route = useRoute()
const { validate_type } = route.query as { validate_type?: number }

const component = [Manual, File, Manual]

// 验证类型
const verifyType = ref(Number(validate_type))

function switch_tab(index: string | number) {
  verifyType.value = Number(index)
}
</script>

<style lang="scss" scoped></style>
