<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('securityGroup.deleteSecurityGroup')"
    width="550px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
  >
    <div>{{ t('securityGroup.confirmDeleteSecurityGroup', [name]) }}</div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { getDelSecurityGroup } from '@/apis/network/security-group'

interface PropType {
  regionId: number
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const ids = ref<{ groupUuid: number; name: string; id: number }[]>()
const name = computed(() => {
  return ids.value?.map(item => `${item.name}(${item.groupUuid})`).join(',')
})
const comfirmLoading = ref<boolean>(false)

const confirmHandle = async () => {
  const list = ids.value?.map(item => item.id)
  const params = {
    ids: list as number[],
    regionId: props.regionId as number,
  }
  comfirmLoading.value = true
  try {
    const res = await getDelSecurityGroup(params)
    comfirmLoading.value = false
    if (res.success) {
      message.success(t('securityGroup.deleteSuccess'))
      emits('success')
      show.value = false
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log('error', error)
    comfirmLoading.value = false
  }
}

defineExpose({
  show,
  ids,
})
</script>
<style scoped lang="scss"></style>
