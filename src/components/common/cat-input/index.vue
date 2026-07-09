<template>
  <el-tooltip
    effect="dark"
    :content="errorMessage"
    :placement="errorTooltip || 'top'"
    :visible="!!errorTooltip && isError"
    popper-class="cat-input-error-tooltip"
  >
    <div class="cat-input-wrap">
      <div class="cat-input" :class="{ 'is-focus': isFocus, disabled, loading, 'is-error': isError }" :style="style">
        <div v-if="prefixIcon" class="cat-input__prefix">
          <SvgIcon :name="prefixIcon" @click="prefixIconClick" />
        </div>
        <input
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :maxlength="max"
          :class="{ loading: true }"
          :style="{ width: inputWidth }"
          :autofocus="autofocus"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="inputChange"
        />
        <div v-if="suffixIcon" class="cat-input__suffix">
          <SvgIcon :name="loading ? 'cat-input-loading' : suffixIcon" :loading="loading" @click="suffixIconClick" />
        </div>
        <!-- 展示在右边的反馈图标 -->
        <div v-if="errorIcon && modelValue" class="feedback-icon">
          <SvgIcon :name="isError ? 'file-failed' : 'file-success'" />
        </div>
      </div>
      <!-- 默认展示在输入框下面的错误信息 -->
      <div v-if="isError && !errorTooltip" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
export interface InputValidate {
  validator: (rule: any[], value: string, callback: (errMessage: Error | undefined) => void) => void
  trigger?: 'blur' | 'change'
}
const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    loading?: boolean
    disabled?: boolean
    suffixIcon?: string // 右边icon
    prefixIcon?: string // 左边icon
    autofocus?: boolean
    rules?: InputValidate[]
    // 校验规则: 跟element-plus的rule写法一样
    verifyEmpty?: {
      message: string
      trigger?: 'blur' | 'change'
    } // 快速校验: 是否为空(只需要校验非空的话用这个, rules适合复杂校验)
    max?: number // 长度限制
    justNumber?: boolean // 限制输入数字
    style?: any // 可以传入的style
    errorTooltip?: any // 错误信息可以像tooltip一样弹出来 // 值是弹出的方向
    errorIcon?: boolean // 错误信息用会有图标反馈
  }>(),
  {
    modelValue: '',
    style: () => ({}),
    errorTooltip: '',
    errorIcon: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'prefix-icon-click'): void
  (event: 'suffix-icon-click'): void
}>()

const isFocus = ref(false) // 是否聚焦
const isError = ref(false) // 是否校验失败
const errorMessage = ref('') // 校验失败提示信息

// 输入框变化
const inputChange = (e: Event) => {
  //   if (props.loading || props.disabled) return
  if (props.justNumber) {
    // 数字输入框
    ;(e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  }
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  if (props.verifyEmpty && props.verifyEmpty.trigger === 'change') {
    emptyValidate()
  } else {
    customValidate('change', (e.target as HTMLInputElement).value)
  }
}
// 聚焦
const handleFocus = () => {
  isFocus.value = true
}
// 失焦
const handleBlur = () => {
  if (props.verifyEmpty && props.verifyEmpty.trigger !== 'change') {
    emptyValidate()
  } else {
    customValidate('blur', props.modelValue)
  }
  isFocus.value = false
}

// 非空校验
const emptyValidate = () => {
  nextTick(() => {
    isError.value = !props.modelValue
    errorMessage.value = props.verifyEmpty!.message
  })
}

// 自定义校验
const customValidate = (trigger: 'blur' | 'change', value: string) => {
  // 自定义校验
  validateTypes.value[trigger || 'blur']?.forEach(r => {
    r.validator([], value, rulesCallback)
  })
}

// 校验规则的回调函数
const rulesCallback = (errMessage: Error | undefined) => {
  errorMessage.value = errMessage ? errMessage.message : ''
  isError.value = !!errMessage
}

// 分辨校验触发方式
const validateTypes = computed(() => {
  const _blur: InputValidate[] = [],
    _change: InputValidate[] = []
  props.rules?.forEach(item => {
    if (item.trigger === 'change') {
      _change.push(item)
    } else {
      _blur.push(item)
    }
  })
  return {
    blur: _blur,
    change: _change,
  }
})

// 首部图标点击
const prefixIconClick = () => {
  emit('prefix-icon-click')
}

// 尾部图标点击
const suffixIconClick = () => {
  emit('suffix-icon-click')
}

// input的宽度
const inputWidth = computed(() => {
  let left = 10,
    right = 10
  if (props.prefixIcon) {
    left += 22
  }
  if (props.suffixIcon) {
    right += 22
  }
  return `calc(100% - ${left}px - ${right}px)`
})
</script>

<style scoped lang="scss">
$disabled-color: #f3f6f9;

.cat-input {
  position: relative;
  display: inline-flex;
  height: var(--input-height);
  padding: 0 10px;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 0 1px 1px #d3d4d5 inset;
  transition: all 0.25s;

  @include flex(space-between);

  &.is-focus {
    box-shadow: 0 0 1px 1px var(--primary-color) inset;
  }

  /* 禁止点击的状态 */
  &.disabled {
    cursor: not-allowed;
    background-color: $disabled-color;

    input {
      cursor: not-allowed;
    }

    .cat-input__suffix {
      svg {
        cursor: not-allowed;
      }
    }
  }

  &.loading {
    cursor: progress;

    input {
      cursor: progress;
    }

    .cat-input__suffix {
      svg {
        cursor: progress;
      }
    }
  }

  &.is-error {
    box-shadow: 0 0 1px 1px var(--error-color) inset;
  }

  /* 输入框 */
  input {
    display: block;
    flex: 1;
    height: calc(100% - 2px);
    background: none;
    border: 0;
    border-color: #ccc;
  }

  /* 右边icon */
  .cat-input__suffix {
    flex-shrink: 0;
    width: 22px;
    height: calc(100% - 2px);
    white-space: nowrap;

    @include flex(flex-end);

    svg {
      width: 14px;
      height: 14px;
    }

    .cat-input-loading {
      color: #aaa;
    }
  }

  /* 左边icon */
  .cat-input__prefix {
    flex-shrink: 0;
    width: 22px;
    height: calc(100% - 2px);
    white-space: nowrap;

    @include flex(flex-start);

    svg {
      width: 14px;
      height: 14px;
    }
  }
}

.error-message {
  display: inline-block;
  margin-top: 4px;
  font-size: 14px;
  color: var(--error-color);
}

.feedback-icon {
  /* display: inline-block;
  position: absolute;
  left: calc(100% + 4px);
  top: 50%;
  transform: translateY(-50%); */

  svg {
    width: 16px;
    height: 16px;
  }
}

.cat-input-wrap {
  display: inline-block;
}
</style>
