<template>
  <div class="text-wrap">
    <p v-if="!expanded">
      <span :style="textStyle">{{ truncatedText }}</span>
      <span v-if="isTruncated">...</span>
      <span v-if="isTruncated" class="toggle text-primary cursor-pointer" :style="toggleStyle" @click="toggleExpanded"
        >{{ t('cvmCommon.expand') }}
      </span>
      <span><SvgIcon class="ml4 pointer" name="copy" @click="handleCopy(text)" /></span>
    </p>
    <p v-else class="text">
      <span :style="textStyle" class="mr4">{{ text }}</span>
      <span class="toggle text-primary cursor-pointer" :style="toggleStyle" @click="toggleExpanded"
        >{{ t('cvmCommon.collapse') }} </span
      ><span><SvgIcon class="ml4 pointer" name="copy" @click="handleCopy(text)" /></span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { handleCopyValue } from '@/utils/dom-utils'
import t from '@/utils/i18n'
import { message } from '@/utils/message'

interface PropType {
  text: string
  maxLength: number
  textStyle?: any
  toggleStyle?: any
}

const props = withDefaults(defineProps<PropType>(), {
  text: '', // 文本
  maxLength: 10, // 最大长度
  textStyle: {},
  toggleStyle: {},
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const expanded = ref<boolean>(false) // 展开和收起

// 获取截断的文本
const truncatedText = computed(() => {
  if (props.text.length > props.maxLength) {
    return props.text.slice(0, props.maxLength)
  }
  return props.text
})

// 是否超出指定长度
const isTruncated = computed(() => {
  return props.text.length > props.maxLength
})

// 切换 expanded 状态
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

// 复制
const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}
</script>

<style lang="scss" scoped>
.text-wrap {
  width: 100%;
  font-family: PingFangSC, 'PingFang SC';
}

.text {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
