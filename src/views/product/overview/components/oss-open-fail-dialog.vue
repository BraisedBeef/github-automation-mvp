<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('productOverview.openFail')"
    width="550px"
    destroy-on-close
    icon="dialog-warning"
    @confirm="confirm"
    @cancel="cancel"
  >
    <p class="dialog-text">
      <span>{{ t('productOverview.ossAccountBalanceDesc', [50]) }}</span>
      <span class="link pointer" @click="goRecharge">{{ t('productOverview.goRecharge') }}</span>
    </p>
    <p class="dialog-desc">
      {{ t('productOverview.openOssDesc') }}
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

const emits = defineEmits<{
  (event: 'goRecharge'): void
}>()

const show = ref<boolean>(true)

const confirm = () => {
  show.value = false
}

const cancel = () => {
  console.log(`cancel===>`)
}

const goRecharge = () => {
  emits('goRecharge')
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.dialog-text {
  margin-bottom: 8px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #000;
}

.link {
  color: var(--primary-color);
}

.dialog-desc {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #999;
}
</style>
