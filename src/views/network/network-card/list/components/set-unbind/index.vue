<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('networkCard.comfirmUnbindIns')"
    width="600px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <div>{{ t('networkCard.unbindInsTip') }}</div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { eniUnbindVm } from '@/apis/network/network-card'
import { message } from '@/utils/message'

const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const detail = ref<any>()
const comfirmLoading = ref<boolean>(false)

const confirmHandle = async () => {
  const params = { insId: detail.value?.resourceId, eniId: detail.value?.eniId }
  comfirmLoading.value = true
  try {
    const res = await eniUnbindVm(params)
    if (res.success) {
      message.success(t('networkCard.comfirmUnbindInsSuccess'))
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    comfirmLoading.value = false
  }
}
// 弹窗打开
const open = () => {}

defineExpose({
  show,
  detail,
})
</script>
<style scoped lang="scss"></style>
