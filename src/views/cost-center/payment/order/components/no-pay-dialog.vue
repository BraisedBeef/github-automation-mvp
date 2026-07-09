<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('payment.noPayTit')"
    width="460px"
    destroy-on-close
    :confirm-text="t('payment.noPayConfirmText')"
    :no-cancel="true"
    @confirm="show = false"
  >
    <p class="dialog-text">
      {{ t('payment.noPayDesc') }}
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

const show = ref<boolean>(false)

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
