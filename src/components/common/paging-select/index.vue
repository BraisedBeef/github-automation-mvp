<template>
  <el-select
    v-model="props.modelValue"
    :disabled="props.disabled"
    :loading="props.loading"
    @change="
      v => {
        emit('change', v)
        emit('update:modelValue', v)
      }
    "
  >
    <slot name="start" />
    <el-option
      v-for="(itemv, itemi) in props.list"
      :key="itemv[props.labelKey] + itemi"
      :label="itemv[props.labelKey]"
      :value="itemv[props.valueKey]"
      :disabled="itemv.disabled"
    />
    <slot name="end" />
  </el-select>
</template>

<script setup lang="ts">
interface ListItem {
  label: string | number
  value: string | number
  disabled?: boolean
}
const props = withDefaults(
  defineProps<{
    list: ListItem[]
    labelKey?: string
    valueKey?: string
    modelValue: number | string
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    labelKey: 'label',
    valueKey: 'value',
    disabled: false,
    loading: false,
  },
)

// const modelValue = ref(props.modelValue);

const emit = defineEmits<{
  (event: 'change', params: any): void
  (event: 'update:modelValue', params: any): void
}>()

const pagingSelectRef = ref<any>()

const visibleChange = key => {
  if (key) {
    nextTick(() => {
      console.log('ref====>', pagingSelectRef.value)
    })
  }
}

onMounted(() => {})
</script>

<style lang="scss" scoped></style>
