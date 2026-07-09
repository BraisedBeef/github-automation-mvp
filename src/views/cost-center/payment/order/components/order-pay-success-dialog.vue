<template>
  <CatDialog
    v-model:dialog="show"
    width="460px"
    destroy-on-close
    :no-cancel="true"
    class="payDialogBg"
    @confirm="handleConfirm"
    @update:dialog="closeHandle"
  >
    <div class="df ac jc">
      <el-image class="img" :src="paySuccess" />
    </div>
    <!-- 支付成功 -->
    <p class="dialog-desc mb10">
      {{ t('payment.paySuccessTit') }}
    </p>
    <p class="dialog-text">
      {{ t('payment.paySuccessDesc') }}
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { usePaymentRouteJump } from '@/views/cost-center/hooks/use-payment-route-jump'
import paySuccess from '@/assets/images/cost-center/payment/pay-success.png'

const { go } = usePaymentRouteJump()

const show = ref<boolean>(false)

const closeHandle = () => {
  handleConfirm()
}

const handleConfirm = async () => {
  show.value = false
  go()
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
@use '@/views/cost-center/payment/style/pay-dialog';
</style>

<style lang="scss">
@use '@/views/cost-center/payment/style/pay-dialog-bg';
</style>
