<template>
  <el-dialog
    class="cat-dialog"
    :model-value="dialog"
    :destroy-on-close="destroyOnClose"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    @close="close"
    @open="open"
  >
    <template #header>
      <div class="custom-header" :title="t(title)">
        <SvgIcon v-if="icon" :name="icon" :style="iconColor && { color: iconColor }" />
        <span class="text-over">{{ t(title) }}</span>
      </div>
      <SvgIcon v-show="!loading" v-if="showClose" pointer name="dialog-close" class="dialog-close" @click="close" />
    </template>
    <div class="dialog-body">
      <slot />
    </div>
    <slot name="footer">
      <div v-if="footer" class="cat-dialog-footer" :class="`cat-dialog-footer--${resolvedFooterAlign}`">
        <el-button type="primary" :loading="loading" :disabled="disabled" @click="confirm">
          <slot name="confirm">
            {{ confirmText }}
          </slot>
        </el-button>
        <el-button v-if="!noCancel" plain :disabled="loading || cancelDisabled" class="cancel" @click="cancel">
          {{ cancelText }}
        </el-button>
      </div>
    </slot>
  </el-dialog>
</template>

<script setup lang="ts">
import { useThemeVersion } from '@/hooks/use-theme-version'
import t from '@/utils/i18n'
import { _throttle } from '@/utils/timing-utils'

type FooterAlign = 'start' | 'center' | 'end'

const props = withDefaults(
  defineProps<{
    dialog: boolean
    title?: string
    icon?: string
    iconColor?: string
    loading?: boolean
    disabled?: boolean
    confirmText?: string
    cancelText?: string
    footer?: boolean
    closeOnClickModal?: boolean
    width?: number | string
    noCancel?: boolean
    destroyOnClose?: boolean
    showClose?: boolean
    cancelDisabled?: boolean
    footerAlign?: FooterAlign
  }>(),
  {
    dialog: false,
    title: '',
    icon: '',
    iconColor: '',
    loading: false,
    disabled: false, // 禁止confirm按钮点击
    confirmText: t('components.confirm'),
    cancelText: t('components.cancel'),
    footer: true, // 是否显示footer内容
    closeOnClickModal: true, // 参见element-plus
    width: 460,
    showClose: true,
    cancelDisabled: false,
    footerAlign: undefined,
  },
)

const { isV2Theme } = useThemeVersion()

const resolvedFooterAlign = computed<FooterAlign>(() => {
  if (props.footerAlign) return props.footerAlign
  return isV2Theme.value ? 'end' : 'center'
})

const emit = defineEmits<{
  (event: 'update:dialog', show: boolean): void
  (event: 'confirm'): void
  (event: 'cancel'): void
  (event: 'open'): void
  (event: 'close'): void
}>()

const confirm = _throttle(() => {
  console.log('confirm==>')
  emit('confirm')
}, 300)
const cancel = () => {
  console.log('cancel===>')
  emit('update:dialog', false)
  emit('cancel')
}

const close = () => {
  emit('update:dialog', false)
  emit('close')
}

const open = () => {
  console.log('open==>')
  emit('open')
}
</script>

<style lang="scss">
.cat-dialog {
  padding: 20px;

  .el-dialog__header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 0 20px;
    margin-right: 0;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 16px;
    color: #000;

    .custom-header {
      display: flex;
      align-items: center;
      width: 90%;
      word-break: break-all;

      svg {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }

      span {
        max-width: 90%;
        line-height: 1.5;
      }
    }

    .el-dialog__headerbtn {
      display: none;
    }
  }

  .el-dialog__body {
    padding: 0;
    background-color: #fff;

    .dialog-body {
      font-family: 'PingFang SC-Regular', 'PingFang SC';

      /* padding: 0 20px 20px; */
      // padding: 0 30px 20px;
      font-size: 14px;
      font-weight: 400;
      color: var(--primary-text);
    }

    .cat-dialog-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 40px 0 0;

      &--start {
        justify-content: flex-start;
      }

      &--center {
        justify-content: center;
      }

      &--end {
        justify-content: flex-end;
      }

      .el-button {
        width: auto !important;
        max-width: max-content;
        height: var(--input-height);
        padding: 0 24px !important;

        span {
          flex-shrink: 0;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

.dialog-close {
  position: absolute;
  top: 0;
  right: 0;
  width: 16px !important;
  height: 16px !important;
  font-size: 20px;
  color: #999;
}
</style>
