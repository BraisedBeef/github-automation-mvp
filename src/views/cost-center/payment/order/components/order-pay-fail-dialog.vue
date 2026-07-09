<template>
  <CatDialog
    v-model:dialog="show"
    width="460px"
    destroy-on-close
    :no-cancel="true"
    class="payDialogBg"
    @confirm="show = false"
  >
    <div class="df ac jc">
      <el-image class="img" :src="payFail" />
    </div>
    <!-- 支付失败 -->
    <p class="dialog-desc mb10">
      {{ t('payment.payFailTit') }}
    </p>
    <p class="dialog-text">
      <span>{{ t('payment.payFailDesc') }}</span
      ><span>{{ text }}</span>
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import payFail from '@/assets/images/cost-center/payment/pay-fail.png'

const props = withDefaults(defineProps<{ text: string }>(), { text: '' })
const show = ref<boolean>(false)

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
