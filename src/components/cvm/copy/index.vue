<template>
  <div v-if="text" class="copy-wrap df ac">
    <span v-if="!hideText" class="line-break" @click="handleClick(text)">{{ text }}</span>
    <slot />
    <SvgIcon
      v-if="!['-', '--', '', 0, undefined, null, false, NaN].includes(text)"
      class="pointer ml4 copy-vertical"
      :name="svgName"
      @click="handleCopy(text)"
    />
  </div>
</template>

<script setup lang="ts">
import { handleCopyValue } from '@/utils/dom-utils'
import { message } from '@/utils/message'
import t from '@/utils/i18n'

const props = withDefaults(
  defineProps<{
    text?: string
    svgName?: string
    copySuccessText?: string
    hideText?: boolean // 是否只显示图标
  }>(),
  {
    text: '',
    svgName: 'dns-copy',
    copySuccessText: t('domainSet2.copySuccess'),
    hideText: false,
  },
)

const emit = defineEmits<{
  (event: 'click')
  (event: 'handleClick', params: string): void // 点击文字时触发
}>()

// 点击文字
const handleClick = (v?: string) => {
  emit('handleClick', v || '')
}

// 复制
const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(props.copySuccessText)
  emit('click')
}
</script>

<style scoped lang="scss">
.copy-vertical {
  color: var(--primary-text);
  vertical-align: baseline;

  &:hover {
    color: var(--primary-color) !important;
  }
}
</style>
