<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('publicIp.applyChange')"
    width="550px"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
  >
    <div class="pt67 pb44 text-center">
      <SvgIcon name="time-circle-pramary" style="width: 35px; height: 35px; color: var(--primary-color)" />
      <div class="content-box">
        {{ t('publicIp.applySubmitted') }}
      </div>
      <div class="tip-box">
        {{ t('publicIp.applySubmittedTip') }}
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer cat-dialog-footer">
        <el-button type="primary" @click="confirmHandle">
          {{ t('publicIp.confirm') }}
        </el-button>
      </div>
    </template>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'

const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示

const confirmHandle = () => {
  show.value = false
  emits('success')
}

defineExpose({
  show,
})
</script>
<style scoped lang="scss">
.pt67 {
  padding-top: 67px;
}

.pb44 {
  padding-bottom: 44px;
}

.text-center {
  text-align: center;
}

.content-box {
  margin-top: 14px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 18px;
  font-weight: bold;
  line-height: 24px;
  color: rgb(0 0 0 / 85%);
  text-align: center;
}

.tip-box {
  margin-top: 8px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #555;
  text-align: center;
}
</style>
