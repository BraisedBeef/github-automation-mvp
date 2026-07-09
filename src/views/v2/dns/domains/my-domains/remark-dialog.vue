<template>
  <CatDialog
    :dialog="dialog"
    :title="t('domainSet2.remarkTitle')"
    :loading="loading"
    :disabled="!remark"
    @confirm="remarkConfirm"
    @update:dialog="(v: boolean) => !v && close()"
  >
    <div class="remark-cont">
      <el-input
        v-model="remark"
        maxlength="200"
        :placeholder="t('domainSet2.remarkPlaceholder')"
        resize="none"
        type="textarea"
      />
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import { _changeDomainInfo } from '@/apis/dns/domain'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
const props = withDefaults(
  defineProps<{
    dialog: boolean
    info?: any
  }>(),
  {
    dialog: false,
    info: () => {},
  },
)
const emit = defineEmits<{
  (event: 'update:dialog', dialog: boolean): void
  (event: 'success'): void
}>()

const remark = ref('')
const loading = ref(false)

const remarkConfirm = async () => {
  console.log('info', props.info)
  if (!props.info) return
  try {
    loading.value = true
    const { code } = await _changeDomainInfo({
      domainId: Number(props.info.domainId),
      ttl: props.info.ttl,
      status: props.info.status,
      remark: remark.value,
    })
    loading.value = false
    if (code === 200) {
      message.success(t('common.changeSuccess'))
      emit('update:dialog', false)
      emit('success')
    }
  } catch (error) {
    loading.value = false
  }
}

const close = () => {
  emit('update:dialog', false)
}

watch(
  () => props.info,
  (info: any) => {
    remark.value = info && info.remark
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.remark-cont {
  /* padding: 16px 50px 20px 50px; */
  :deep(.el-textarea) {
    .el-textarea__inner {
      min-height: 120px !important;
    }
  }
}
</style>
