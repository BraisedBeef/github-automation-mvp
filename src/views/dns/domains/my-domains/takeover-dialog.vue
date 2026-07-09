<template>
  <CatDialog
    :dialog="dialog"
    title=" "
    :width="550"
    :disabled="disabled"
    :confirm-text="state.confirmText"
    :close-on-click-modal="false"
    @confirm="handleConfirm"
    @update:dialog="handleClose"
  >
    <template #confirm>
      <SvgIcon v-if="state.loading" name="confirm-loading" style="margin-right: 4px" :loading="state.loading" />
      {{ state.confirmText }}
    </template>
    <div class="cont">
      <div v-if="state.info && state.info.dnsStatus === 2" class="err-tip">
        <SvgIcon name="tip-error" />
        {{ t('myDomains.takeOverTip3') }}
      </div>
      <div class="first-words">
        {{ t('myDomains.takeOverTip4') }}
      </div>
      <div class="second-words">
        {{ t('myDomains.takeOverTip5') }}
      </div>
      <div class="third-words">
        {{ t('myDomains.takeOverTip6') }}
      </div>
      <el-form label-width="auto" label-position="left" class="the-form">
        <el-form-item :label="t('domainSet2.domain')" class="f">
          {{ state.loading ? t('common.loading') + '...' : state.info.domainName }}
        </el-form-item>
        <el-form-item :label="t('domainSet2.register')" class="ff">
          {{ state.loading ? t('common.loading') + '...' : state.info.domainRegistrar }}
        </el-form-item>
      </el-form>
      <div class="server">
        <!-- 当前 -->
        <div class="server-l">
          <div class="t">
            {{ t('myDomains.takeOverCurrent') }}
          </div>
          <div class="server-box">
            <div v-for="(item, index) in state.info.domainDnsServer" :key="index">
              {{ state.loading ? t('common.loading') + '...' : item }}
            </div>
          </div>
        </div>
        <div class="server-r">
          <div class="t">
            {{ t('myDomains.takeOverRight') }}
          </div>
          <div class="server-box">
            <div v-for="(item, index) in state.info.cloudDnsServer" :key="index">
              {{ state.loading ? t('common.loading') + '...' : item }}
              <SvgIcon name="dns-copy" pointer @click="handleCopy(item)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import { _refreshDomainStatus } from '@/apis/dns/domain'
import CatDialog from '@/components/common/cat-dialog/index.vue'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'
import { ElMessage } from 'element-plus'
const props = withDefaults(
  defineProps<{
    dialog: boolean
    info?: any
  }>(),
  {
    dialog: false,
    info: () => {},
  },
)
const emit = defineEmits<{
  (event: 'update:dialog', dialog: boolean): void
}>()

const state = reactive<{
  loading: boolean
  confirmText: string
  count: number
  timer: any
  info: any
}>({
  loading: false,
  confirmText: t('myDomains.takeOverConfirm'),
  count: 0,
  timer: null,
  info: {},
})

const disabled = computed(() => {
  return state.count !== 0
})

const handleClose = v => {
  // if (state.loading) {
  // ElMessage.warning('验证中')
  // return
  // }
  !v && close()
}

const close = () => {
  emit('update:dialog', false)
}

const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}

const handleConfirm = async () => {
  if (state.loading) return
  if (state.timer) return
  //   开始验证
  try {
    state.loading = true
    state.confirmText = t('common.loading') + '...'
    const { code, data } = await _refreshDomainStatus({
      domainId: state.info.domainId,
    })
    state.loading = false
    clearInterval(state.timer)
    state.count = 10
    state.timer = setInterval(() => {
      state.count--
      state.confirmText = t('myDomains.takeOverRetry', { s: state.count })
      if (state.count === 0) {
        clearInterval(state.timer)
        state.timer = null
        state.confirmText = t('myDomains.takeOverConfirm')
      }
    }, 1000)
    if (code === 200 && data) {
      state.info = { ...state.info, ...data[0] }
      console.log('更新', state.info)
    }
  } catch (error) {
    state.loading = false
  }
}

const clearTime = () => {
  state.count = 0
  clearInterval(state.timer)
  state.timer = null
  state.loading = false
}

watch(
  () => props.info,
  (info: any) => {
    state.info = { ...info }
  },
  { immediate: true, deep: true },
)

watch(
  () => props.dialog,
  (dialog: boolean) => {
    if (!dialog) {
      clearTime()
      state.confirmText = t('myDomains.takeOverConfirm')
    }
    clearTime()
    state.loading = false
  },
)
</script>

<style scoped lang="scss">
.cont {
  padding: 0 20px;

  div {
    font-family: 'PingFang SC', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }

  .err-tip {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    color: #000;

    svg {
      width: 22px;
      height: 22px;
      margin-right: 8px;
    }
  }

  .first-words,
  .second-words,
  .third-words {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: #999;
    word-break: break-all;
  }

  .third-words {
    margin-bottom: 20px;
  }

  :deep(.the-form) {
    .el-form-item {
      &.f {
        margin-bottom: 12px;
      }

      &.ff {
        margin-bottom: 20px;
      }

      .el-form-item__label-wrap {
        height: 20px;
      }

      .el-form-item__content {
        height: 20px;
        line-height: 20px;
      }
    }

    .el-form-item__content {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #000;
    }
  }

  .server {
    display: flex;
    width: 100%;

    .t {
      font-size: 14px;
      font-weight: 400;
      color: #000;
    }

    & > div {
      width: calc(50% - 8px);

      & > div:first-child {
        margin-bottom: 8px;
      }

      .server-box {
        flex-shrink: 0;
        padding: 12px;
        font-size: 14px;
        font-weight: 400;
        background-color: var(--table-head-bgc);

        div {
          word-break: break-all;

          svg {
            margin-left: 4px;
            color: #999;
          }
        }
      }
    }

    .server-l {
      margin-right: 20px;

      .server-box {
        div {
          /* color: var(--error-color); */
          color: #555;
        }
      }
    }

    .server-r {
      .server-box {
        div {
          color: var(--success-color);
        }
      }
    }
  }
}
</style>
