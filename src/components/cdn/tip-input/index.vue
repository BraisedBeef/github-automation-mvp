<template>
  <el-popover
    :visible="(errorType === 1 && showTip) || (errorType === 2 && showTip)"
    :teleported="props.teleported"
    :placement="props.placement"
  >
    <template #reference>
      <el-input
        v-if="props.type === 'text'"
        v-model="props.modelValue"
        :placeholder="t(props.placeholder)"
        :disabled="props.disabled"
        @input="changeInput"
        @focus="focusInput"
        @blur="showTip = false"
      />
      <el-input
        v-if="props.type === 'textarea'"
        v-model="props.modelValue"
        :placeholder="t(props.placeholder)"
        type="textarea"
        resize="none"
        rows="5"
        :disabled="props.disabled"
        @input="changeInput"
        @focus="focusInput"
        @blur="showTip = false"
      />
    </template>
    <CdnError>{{ t(errorText) }}</CdnError>
  </el-popover>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    rule: any
    placeholder?: string
    errorText: string
    teleported?: boolean
    placement?: 'top' | 'right'
    type?: 'text' | 'textarea' | 'number'
    disabled?: boolean
    allowEmpty?: boolean
  }>(),
  {
    placeholder: '',
    teleported: false,
    placement: 'right',
    type: 'text',
    disabled: false,
    allowEmpty: true,
  },
)

const emits = defineEmits(['update:modelValue', 'change'])

const errorType = ref<number>(0)
const errorText = ref<string>('')
const changeInput = value => {
  emits('update:modelValue', value)
  emits('change', value)
}

const updateErrorState = () => {
  if (props.modelValue === '' && props.allowEmpty) {
    //允许为空
    errorType.value = 0
  } else if (props.modelValue === '' && !props.allowEmpty) {
    //不允许为空
    errorType.value = 1
    errorText.value = 'inputNotNull'
  } else if (!props.rule) {
    errorType.value = 2
    errorText.value = props.errorText
  } else {
    errorType.value = 0
  }
}

const showTip = ref<boolean>(false)
const focusInput = () => {
  showTip.value = true
}

watch(
  () => props.modelValue,
  () => {
    updateErrorState()
  },
)
</script>

<style land="scss" scoped></style>
