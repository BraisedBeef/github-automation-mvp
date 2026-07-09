<template>
  <div>
    <CatDialog
      v-model:dialog="show"
      :title="t('subnet.deleteSubnet')"
      width="550px"
      :loading="comfirmLoading"
      @confirm="confirmHandle"
      @update:dialog="() => {}"
    >
      <div>{{ t('subnet.comfirmDelete', [detail?.subnetName]) }}</div>
    </CatDialog>
    <CatDialog
      v-model:dialog="unShow"
      :no-cancel="true"
      :confirm-text="t('subnet.close')"
      width="550px"
      :title="t('subnet.deleteSubnet')"
      @confirm="cancelConfirm"
      @update:dialog="cancelConfirm"
    >
      <div>
        <div class="mb13">
          {{ t('subnet.cannotDeleteTip') }}
        </div>
        <div>
          {{ t('subnet.cannotDeleteTextOne', [detail?.subnetName]) }}<span class="red-text"> {{ ipNum }} </span
          >{{ t('subnet.cannotDeleteTextTwo', [ipNum]) }}
        </div>
      </div>
    </CatDialog>
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { getDelSubnet } from '@/apis/network/subnet'
import { QuerySubnetPageType } from '../../type'
import { message } from '@/utils/message'

const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const unShow = ref<boolean>(false) // 无法删除弹窗
const detail = ref<QuerySubnetPageType>() // 子网详情
const comfirmLoading = ref<boolean>(false)

const ipNum = computed(() => {
  return (detail.value?.totalIpCount || 0) - (detail.value?.usableIpCount || 0)
})

// 删除请求
const deleteSubnetFn = async () => {
  comfirmLoading.value = true
  try {
    const res = await getDelSubnet({ subnetId: detail.value?.id as number })
    comfirmLoading.value = false
    if (res.success) {
      detail.value = {}
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    comfirmLoading.value = false
    console.log('error', err)
  }
}

const confirmHandle = () => {
  if (ipNum.value > 0) {
    show.value = false
    unShow.value = true
  } else {
    deleteSubnetFn()
  }
}

const cancelConfirm = () => {
  detail.value = {}
  unShow.value = false
}

defineExpose({
  show,
  detail,
})
</script>
<style scoped lang="scss">
.mb13 {
  margin-bottom: 13px;
}

.red-text {
  color: #fe4d4f;
}
</style>
