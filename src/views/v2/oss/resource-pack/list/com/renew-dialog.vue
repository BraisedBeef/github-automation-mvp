<template>
  <CatDialog
    v-if="show"
    v-model:dialog="dialogVisible"
    :loading="loading"
    :title="$t('该资源包不支持续费')"
    icon="dialog-warning"
    width="550px"
    @update:dialog="cancel"
    @open="open"
    @confirm="confirm"
  >
    <p style="color: #999">该资源包已设置自动续费，无法进行续费操作。若要进行续费操作，请先设置为手动续费。</p>
  </CatDialog>
</template>

<script lang="ts" setup>
const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['update:show', 'success'])
const dialogVisible = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
})

const loading = ref<boolean>(false)

// 弹窗打开
const open = async () => {
  emit('update:show', true)
}

// 弹窗关闭
const cancel = () => {
  emit('update:show', false)
}

const confirm = () => {
  cancel()
}
</script>
