<template>
  <div>
    <!-- 初始化 -->
    <el-progress v-if="row.status === 0" :percentage="percentage" :indeterminate="false" />
    <!-- 文件已生成 -->
    <span v-if="row.status === 1" class="text-success"> {{ t('export.fileGenerateSuccess') }} </span>
    <!-- 文件生成失败 -->
    <span v-if="row.status === 2" class="text-error"> {{ t('export.fileGenerateFail') }} </span>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

const props = withDefaults(
  defineProps<{
    row: any
  }>(),
  { row: () => {} },
)

const percentage = ref(0)

onMounted(() => {
  setInterval(() => {
    percentage.value = percentage.value >= 90 ? 99 : (percentage.value % 100) + 10
  }, 500)
})
</script>

<style lang="scss" scoped></style>
