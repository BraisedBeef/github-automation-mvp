<template>
  <div class="copy-wrap" :class="{ 'no-break': !props.break }">
    <div
      v-if="!props.hideText"
      :class="{ 'line-break': props.break, 'text-group': true }"
      @click="() => handleClick(props.text)"
    >
      <slot>
        {{ props.text }}
      </slot>
    </div>
    <SvgIcon name="dns-copy" class="pointer ml4 copy-icon" @click="handleCopy(props.text)" />
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
    hideText?: boolean
    break?: boolean
  }>(),
  {
    text: '',
    svgName: 'dns-copy',
    copySuccessText: t('domainSet2.copySuccess'),
    hideText: false,
    break: false,
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
.copy-wrap {
  display: inline-block;
  width: 100%;
  vertical-align: bottom;

  &.no-break {
    display: flex;
    align-items: center;
  }

  .text-group {
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;

    &.line-break {
      /* 允许长单词换行 */
      overflow-wrap: break-word; /* 允许长单词换行 */
      white-space: normal; /* 允许文本换行 */
    }
  }

  .copy-icon {
    margin-left: 4px;
    color: #999;

    &:hover {
      color: var(--primary-color) !important;
    }
  }
}
</style>
