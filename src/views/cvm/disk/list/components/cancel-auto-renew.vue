<template>
  <CatDialog
    v-model:dialog="show"
    :title="title"
    width="550px"
    :confirm-text="t('disk.cancelAutoRenew.confirmText')"
    :loading="comfirmLoading"
    @confirm="confirmHandle()"
    @update:dialog="() => {}"
    @open="open"
  >
    <p class="desc">
      {{ t('disk.cancelAutoRenew.desc') }}
    </p>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _modifyRenewFlag } from '@/apis/cvm/disk'

interface PropType {
  disk: any
}

const props = withDefaults(defineProps<PropType>(), {
  disk: () => ({}),
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)

// title
const title = computed(() => {
  return t('disk.cancelAutoRenew.title', [props.disk.diskName])
})

const confirmHandle = () => {
  modifyRenewFlag()
}

// 取消自动续费
const modifyRenewFlag = async () => {
  try {
    comfirmLoading.value = true

    const res = await _modifyRenewFlag({
      id: props.disk.id, //硬盘id
      renewFlag: 2,
    })

    console.log(`_modifyRenewFlag===>`, res)

    if (res.success) {
      message.success(res.msg)

      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    comfirmLoading.value = false
  }
}

// 弹窗打开
const open = () => {}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.desc {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #000;
}
</style>
