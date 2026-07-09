<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('refund.confirmTitle')"
    width="550px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <div class="item df ac mb20">
      <div class="key">
        {{ t('refund.refundMethod') }}
      </div>
      <div class="value">
        {{ t('refund.refundMethodDesc') }}
      </div>
    </div>
    <div class="item df ac">
      <div class="key">
        {{ t('refund.price') }}
      </div>
      <div class="value">${{ refundPrice }}USD</div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

interface PropType {
  refundPrice: number | string
}

const props = withDefaults(defineProps<PropType>(), {
  refundPrice: 0,
})
const emits = defineEmits<{
  (event: 'refund'): void
}>()
const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)

const confirmHandle = () => {
  emits('refund')
}
// 弹窗打开
const open = () => {}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.key {
  width: 90px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.value {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #000;
}
</style>
