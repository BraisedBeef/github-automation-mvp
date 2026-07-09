<template>
  <CatDialog
    :dialog="dialog"
    class="batch-result-dialog"
    :confirm-text="t('batchOperation.viewDetails')"
    :cancel-text="cancelT"
    @update:dialog="(v: boolean) => !v && close()"
    @confirm="handleConfirm"
  >
    <div class="cont">
      <SvgIcon name="dialog-success" />
      <div>
        <div class="cont-title">
          {{ t('batchOperation.resultTitle') }}
        </div>
        <div class="cont-text">
          {{ t('batchOperation.resultTip', { total: total }) }}
        </div>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import CatDialog from '@/components/common/cat-dialog/index.vue'

import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'
const props = withDefaults(
  defineProps<{
    dialog: boolean
    jobId: string
    total?: number
    cancelT: string
  }>(),
  {
    dialog: false,
    total: 0,
    cancelT: t('batchOperation.continueDomain'),
  },
)
const emit = defineEmits<{
  (event: 'update:dialog', dialog: boolean): void
}>()
const close = () => {
  emit('update:dialog', false)
}

const handleConfirm = () => {
  pushRoute({
    name: 'BatchOperationLog',
    query: {
      type: 2,
      jobId: props.jobId,
    },
  })
}
</script>

<style scoped lang="scss">
.cont {
  display: flex;

  svg {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }

  .cont-title {
    margin-bottom: 8px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    color: #000;
  }

  .cont-text {
    margin-bottom: 20px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}
</style>
