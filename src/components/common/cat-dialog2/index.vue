<!--
  @deprecated 此组件已废弃，请使用 CatDialog.vue 代替
  迁移指南:
  - iconColor prop: CatDialog 已支持
  - cancelDisabled prop: CatDialog 已支持
  - @close 事件: CatDialog 已支持
  - closeOnClickModal 默认值不同: CatDialog2 默认 false，CatDialog 默认 true，迁移时请显式设置
-->
<template>
  <el-dialog
    class="cat-dialog"
    :model-value="dialog"
    :destroy-on-close="destroyOnClose"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    @close="close"
  >
    <template #header>
      <div class="custom-header">
        <SvgIcon v-if="icon" :name="icon" :style="iconColor && { color: iconColor }" />
        <span class="text-over"> {{ title }}</span>
      </div>
      <SvgIcon v-show="!loading" pointer name="dialog-close" class="dialog-close" @click="close" />
    </template>
    <div class="dialog-body">
      <slot>
        <!-- 内容区域 -->
      </slot>
    </div>
    <slot name="footer">
      <div v-if="footer" class="cat-dialog-footer">
        <el-button type="primary" :loading="loading" :disabled="disabled" @click="confirm">
          {{ confirmText }}
        </el-button>
        <el-button v-if="!noCancel" plain :disabled="loading || cancelDisabled" @click="cancel">
          {{ cancelText }}
        </el-button>
      </div>
    </slot>
  </el-dialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _throttle } from '@/utils/timing-utils'
withDefaults(
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
    cancelDisabled?: boolean
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
    closeOnClickModal: false, // 参见element-plus
    width: 460,
    cancelDisabled: false,
  },
)

const emit = defineEmits<{
  (event: 'update:dialog', show: boolean): void
  (event: 'confirm'): void
  (event: 'cancel'): void
  (event: 'close'): void
}>()

const confirm = _throttle(() => {
  console.log('confirm')
  emit('confirm')
}, 300)
const cancel = () => {
  console.log('cancel')
  emit('cancel')
}

const close = () => {
  console.log('cloe')
  // emit('close')
  emit('update:dialog', false)
  emit('close')
}
</script>

<style lang="scss">
.cat-dialog {
  .el-dialog__header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 20px;
    margin-right: 0;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 16px;
    font-weight: 400;
    color: var(--primary-text);

    .custom-header {
      display: flex;
      align-items: center;
      width: 90%;
      word-break: break-all;

      svg {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }

      span {
        max-width: 90%;
        line-height: 1.5;
      }
    }

    .el-dialog__headerbtn {
      // position: absolute;
      // right: 21px;
      // top: 22px;
      // width: 16px;
      // height: 16px;
      // display: flex;
      // align-items: center;
      // justify-content: center;
      display: none;
    }
  }

  .el-dialog__body {
    padding: 0;
    background-color: #fff;

    .dialog-body {
      padding: 0 20px;
      font-family: 'PingFang SC-Regular', 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--primary-text);
    }

    .cat-dialog-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 20px 0;

      .el-button {
        width: auto !important;
        max-width: 40%;
        padding: 0 24px;

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
  top: 22px;
  right: 20px;
  font-size: 20px;

  &.loading {
    cursor: not-allowed;
  }
}
</style>
