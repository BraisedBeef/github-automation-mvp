<template>
  <CatDialog
    v-model:dialog="show"
    :title="title"
    :width="dialogClass"
    :loading="comfirmLoading"
    @confirm="confirmHandle()"
    @update:dialog="() => {}"
    @open="open"
  >
    <p class="desc">
      {{ t('disk.setAutoRenew.desc') }}
    </p>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _modifyRenewFlag } from '@/apis/cvm/disk'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '650px',
  [en]: '680px',
  [zh]: '550px',
}

const dialogClass = useI18nStyle(dialogMap)

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
  return t('disk.setAutoRenew.title', [props.disk.diskName])
})

const confirmHandle = () => {
  modifyRenewFlag()
}

// 弹窗打开
const open = () => {}

// 自动续费
const modifyRenewFlag = async () => {
  try {
    comfirmLoading.value = true

    const res = await _modifyRenewFlag({
      id: props.disk.id, //硬盘id
      renewFlag: 1,
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
