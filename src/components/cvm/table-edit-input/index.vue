<template>
  <div style="max-width: 100%">
    <template v-if="!show">
      <div style="width: 100%" class="df ac">
        <span :style="textStyle" class="value mr4 text-over display-inline" style="max-width: calc(100% - 18px)">{{
          modelValue
        }}</span>
        <SvgIcon :name="editIcon" style="cursor: pointer" @click="clickEdit" />
      </div>
    </template>
    <!-- 修改账号昵称 -->
    <template v-else>
      <div class="df ac" :class="props?.isTable ? 'isTable' : ''">
        <div class="edit-input mr20" :style="inputStyle">
          <el-form
            ref="formRef"
            require-asterisk-position="right"
            label-width="auto"
            :model="form"
            :rules="props.rules"
            label-position="left"
          >
            <el-form-item label="" prop="inputValue">
              <el-input
                v-model.trim="form.inputValue"
                :maxlength="props.maxLength"
                :placeholder="t('common.plsEnter')"
                @change="change"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="edit-btn-wrap">
          <span class="mr20 text-primary cursor-pointer" @click="confirm">{{ confirmText }}</span>
          <span class="text-primary cursor-pointer" @click="cancel">{{ cancelText }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

interface PropType {
  modelValue: string
  confirmText?: string
  cancelText?: string
  textStyle?: any
  editIcon?: string
  editFn?: (show: boolean) => void
  cancelFn?: () => void
  inputStyle?: string
  isTable?: boolean // 是否在表格中（样式修改）
  /**
     * 传入格式
        {
          inputValue: [ // 校验的字段名固定为inputValue
            {
              // 这是表单项的校验方法
            }
          ]
        }
     */
  rules?: any
  maxLength?: number
}

const props = withDefaults(defineProps<PropType>(), {
  modelValue: '',
  confirmText: t('common.save'),
  cancelText: t('common.cancel'),
  textStyle: () => ({}),
  editIcon: 'edit',
  rules: [],
  maxLength: 30,
  inputStyle: '',
  isTable: false,
})

const emits = defineEmits<{
  (event: 'changeValue', value: any): void
  (event: 'update:modelValue', value: any): void
  (event: 'confirm', value: any): void
  (event: 'cancel', value: any): void
  (event: 'editFn', value: boolean): void
}>()

const show = ref<boolean>(false) // 是否修改
const form = reactive<{
  inputValue: string
}>({
  inputValue: '',
})
const formRef = ref<any>()

const clickEdit = () => {
  form.inputValue = ''
  show.value = true
  emits('editFn', show.value)
}

const cancel = () => {
  show.value = false
  props.cancelFn && props.cancelFn()
}

const confirm = async () => {
  if (props.rules) {
    await formRef.value.validate()
  }
  emits('confirm', form.inputValue)
}

const change = () => {
  emits('update:modelValue', form.inputValue)
  emits('changeValue', form.inputValue)
}

// 定义方法修改 show
const setShow = (value: boolean) => {
  console.log('定义方法修改', value)
  show.value = value
}

defineExpose({
  show,
  setShow,
})
</script>

<style lang="scss" scoped>
.edit-input {
  max-width: 180px;
  height: 34px;
}

.isTable {
  .edit-input {
    height: 25px !important;
  }

  :deep(.el-input) {
    height: 25px !important;
    line-height: 25px !important;
  }

  :deep(.el-form-item__content) {
    height: 25px !important;
    line-height: 25px !important;
  }

  :deep(.el-input__wrapper) {
    height: 25px !important;
    line-height: 25px !important;
  }

  :deep(.el-input__wrapper .el-input__inner) {
    height: 25px !important;
    line-height: 25px !important;
  }
}

.display-inline {
  display: inline-block;
}
</style>
