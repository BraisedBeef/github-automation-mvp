<template>
  <CatDialog :dialog="dialog" class="export-feedback-dialog" :width="500" @update:dialog="close">
    <div class="cont">
      <SvgIcon :name="success ? 'dialog-success' : 'dialog-failed'" />
      <div class="desc">
        <div class="desc-title">
          {{ t('batchOperation.exportRecordTitle') }}
        </div>
        <div class="desc-text">
          {{ success ? t('batchOperation.exportRecordSuccess') : `${t('batchOperation.exportRecordFail')}${errorMsg}` }}
        </div>
      </div>
    </div>
    <template #footer>
      <div class="cat-dialog-footer">
        <el-button v-if="success" type="primary" class="to-download" @click="toDownload">
          {{ t('batchOperation.exportRecordConfirm') }}
        </el-button>
        <el-button v-else type="primary" class="confirm-fail" @click="close">
          {{ t('common.confirm') }}
        </el-button>
      </div>
    </template>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import CatDialog from '@/components/common/cat-dialog/index.vue'
import { pushRoute } from '@/utils/router-jump'
const props = withDefaults(
  defineProps<{
    dialog: boolean
    success?: boolean
    errorMsg: string
  }>(),
  {
    dialog: false,
    success: false,
  },
)
const emit = defineEmits<{
  (event: 'update:dialog', dialog: boolean): void
}>()
const close = () => {
  emit('update:dialog', false)
}
const toDownload = () => {
  pushRoute({
    name: 'BatchDownloadList',
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

  .desc {
    .desc-title {
      margin-bottom: 8px;

      // font-weight: 500;
      font-size: 16px;
      line-height: 22px;
      color: #000;
    }

    .desc-text {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
    }
  }
}

.cat-dialog-footer {
  .el-button {
    padding: 10px 24px;
  }
}
</style>
