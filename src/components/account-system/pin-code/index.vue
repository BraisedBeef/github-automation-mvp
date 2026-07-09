<template>
  <div class="verification-container">
    <input
      v-for="(_, index) in verificationCodes"
      :key="index"
      v-model="verificationCodes[index]"
      maxlength="1"
      class="verification-input"
      @input="handleInput(index, $event)"
      @keydown="handleKeyDown(index, $event)"
    />
  </div>
</template>
<script setup lang="ts">
interface PropsType {
  digits?: number
}

const props = withDefaults(defineProps<PropsType>(), {
  digits: 6, // 验证框数量
})

const emits = defineEmits<{
  (event: 'emailCode', codes: string): void
}>()

const verificationCodes = ref<string[]>(['', '', '', '', '', ''])

onMounted(() => {
  init()
})

// 初始化
const init = () => {
  if (props.digits !== 6) {
    verificationCodes.value = Array(props.digits).map(() => '')
  }
}

// 监听输入
const handleInput = (index: number, event: any) => {
  const value = event.target.value
  verificationCodes.value[index] = value

  // 判断是否输入完成
  if (verificationCodes.value.join('').length === props.digits) {
    emits('emailCode', verificationCodes.value.join(''))
  }

  // 自动跳到下一个输入框
  if (value && index < verificationCodes.value.length - 1) {
    const nextInput = event.target.nextElementSibling
    if (nextInput) {
      nextTick(() => {
        nextInput.focus()
      })
    }
  }
}
// 监听键盘
const handleKeyDown = (index: number, event: any) => {
  // 处理删除操作
  if (event.key === 'Backspace' && !event.target.value && index > 0) {
    const prevInput = event.target.previousElementSibling
    if (prevInput) {
      nextTick(() => {
        prevInput.focus()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.verification-container {
  display: flex;
  justify-content: space-between;
}

.verification-input {
  width: 50px;
  height: 50px;
  font-size: 20px;
  text-align: center;
  border: 1px solid var(--border-c);
  border-radius: 5px;
}

.verification-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 5px var(--primary-color);
}
</style>
