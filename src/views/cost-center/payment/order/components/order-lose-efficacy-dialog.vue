<template>
  <CatDialog
    v-model:dialog="show"
    width="460px"
    destroy-on-close
    :no-cancel="true"
    class="payDialogBg"
    @confirm="handleConfirm"
  >
    <div class="df ac jc">
      <el-image class="img" :src="payLoseEfficacy" />
    </div>
    <!-- 订单失效 -->
    <p class="dialog-desc mb10">
      {{ t('payment.orderLoseEfficacyTit') }}
    </p>
    <p class="dialog-text">
      {{ t('payment.orderLoseEfficacyDesc') }}
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { usePaymentRouteJump } from '@/views/cost-center/hooks/use-payment-route-jump'
import payLoseEfficacy from '@/assets/images/cost-center/payment/pay-lose-efficacy.png'

const { handleTo } = usePaymentRouteJump()

const show = ref<boolean>(false)

const handleConfirm = async () => {
  show.value = false
  // 先统一跳转到订单页面
  handleTo('/cost', 'order')
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
