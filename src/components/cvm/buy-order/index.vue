<template>
  <!-- 升配 -->
  <UpgradeConfig v-if="upgrade" />
  <!-- 降配 -->
  <ReduceConfig v-else :loading="loading" @buy="emits('buy', false)" />
</template>

<script setup lang="ts">
import ReduceConfig from './reduce-config.vue'
import UpgradeConfig from './upgrade-config.vue'

/**
 * @desc 购买产品类型区分升配和降配
 */

interface PropType {
  loading?: false
  upgrade?: boolean
}

const props = withDefaults(defineProps<PropType>(), {
  loading: false,
  upgrade: true, // 是否为升配
})
const emits = defineEmits<{
  (event: 'buy', upgrade: boolean): void
}>()
</script>

<style lang="scss" scoped></style>
