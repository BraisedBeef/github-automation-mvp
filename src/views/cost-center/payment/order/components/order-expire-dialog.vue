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
      <el-image class="img" :src="payExpire" />
    </div>
    <!-- 订单已过期 -->
    <p class="dialog-desc mb10">
      {{ t('payment.expiredTit') }}
    </p>
    <p class="dialog-text">
      {{ t('payment.expiredDesc') }}
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { usePaymentRouteJump } from '@/views/cost-center/hooks/use-payment-route-jump'
import payExpire from '@/assets/images/cost-center/payment/pay-expire.png'

const { go } = usePaymentRouteJump()

const show = ref<boolean>(false)

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
