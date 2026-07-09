<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('payment.comfirmPayTit')"
    width="460px"
    destroy-on-close
    :confirm-text="t('payment.comfirmPayConfirmText')"
    :cancel-text="t('payment.comfirmPayCancelText')"
    @confirm="handleComfirmPay"
    @cancel="handleNoPay"
  >
    <p class="dialog-text">
      {{ t('payment.comfirmPayDesc') }}
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

const emits = defineEmits<{
  (event: 'comfirmPay'): void
  (event: 'noPay'): void
}>()

const show = ref<boolean>(false)

// 点击已成功支付
const handleComfirmPay = () => {
  show.value = false
  emits('comfirmPay')
}

// 点击未完成支付
const handleNoPay = () => {
  console.log(`点击未完成支付===>`)
  emits('noPay')
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.dialog-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--common-text);
}
</style>
