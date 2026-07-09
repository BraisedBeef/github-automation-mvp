<template>
  <div
    class="get-code"
    :class="{ active: isOpenTimer ? false : active }"
    :style="{
      borderWidth: border ? '1px' : 0,
    }"
    @click="handleClick"
  >
    {{ isOpenTimer ? t('common.codeThen', { time: codeCount }) : t('common.getCode') }}
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useGetCode } from '@/components/account-system/verify-code-btn/use-get-code'

interface PropsType {
  active?: boolean
  border?: boolean
  count?: number
  verify?: boolean
  verifyFun?: () => boolean | Promise<boolean>
}

const props = withDefaults(defineProps<PropsType>(), {
  active: false, // 是否可点击
  border: true,
  count: 60,
  verify: true, // 点击后是否验证
  verifyFun: () => false,
})

const emits = defineEmits<{
  (event: 'click'): void
}>()

const { isOpenTimer, codeCount, resetTimer, openTimer } = useGetCode({
  count: props.count,
})

// 点击
const handleClick = async () => {
  if (!props.active) return
  if (isOpenTimer.value) return

  emits('click')
  if (props.verify) {
    const res = await props.verifyFun()

    res && openTimer()
  } else {
    openTimer()
  }
}

defineExpose({
  openTimer,
})
</script>

<style lang="scss" scoped>
.get-code {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 12px;
  margin-left: 10px;
  font-family: PingFangSC-Regular, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: rgb(122 140 166 / 50%);
  cursor: not-allowed;
  user-select: none;
  border: 1px solid rgb(122 140 166 / 50%);
  border-radius: 5px;

  &.active {
    color: var(--primary-color);
    cursor: pointer;
    border-color: var(--primary-color);
  }
}
</style>
