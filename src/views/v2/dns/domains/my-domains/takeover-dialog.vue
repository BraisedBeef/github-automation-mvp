<template>
  <CatDialog
    class="takeover-dialog-v2"
    :dialog="dialog"
    title="myDomains.takeOverTip3"
    :width="800"
    :disabled="disabled"
    :confirm-text="state.confirmText"
    :close-on-click-modal="false"
    @update:dialog="handleClose"
  >
    <div class="cont">
      <Tip class="takeover-dialog__tip" :text="takeoverTips" type="OneToOne" theme="warning" />

      <div class="takeover-dialog__info">
        <div class="takeover-dialog__info-row">
          <span class="takeover-dialog__label">{{ t('domainSet2.domain') }}</span>
          <span class="takeover-dialog__value">{{ displayValue(state.info.domainName) }}</span>
        </div>
        <div class="takeover-dialog__info-row">
          <span class="takeover-dialog__label">{{ t('domainSet2.register') }}</span>
          <span class="takeover-dialog__value">{{ displayValue(state.info.domainRegistrar) }}</span>
        </div>
      </div>

      <div class="takeover-dialog__table">
        <div class="takeover-dialog__table-head">
          <div>{{ t('myDomains.takeOverCurrent') }}</div>
          <div>{{ t('myDomains.takeOverRight') }}</div>
        </div>
        <div v-for="(row, index) in dnsServerRows" :key="index" class="takeover-dialog__table-row">
          <div>{{ displayValue(row.current) }}</div>
          <div class="takeover-dialog__right-server">
            <span>{{ displayValue(row.right) }}</span>
            <SvgIcon v-if="row.right" name="dns-copy" pointer @click="handleCopy(row.right)" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="takeover-dialog__footer">
        <el-button :disabled="state.loading" @click="close">
          {{ t('components.cancel') }}
        </el-button>
        <el-button type="primary" :loading="state.loading" :disabled="disabled" @click="handleConfirm">
          {{ state.confirmText }}
        </el-button>
      </div>
    </template>
  </CatDialog>
</template>

<script setup lang="ts">
import { _refreshDomainStatus } from '@/apis/dns/domain'
import CatDialog from '@/components/common/cat-dialog/index.vue'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'

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

const takeoverTips = computed(() => [
  {
    main: t('myDomains.takeOverWarning'),
  },
])

const dnsServerRows = computed(() => {
  const currentServers = Array.isArray(state.info.domainDnsServer) ? state.info.domainDnsServer : []
  const rightServers = Array.isArray(state.info.cloudDnsServer) ? state.info.cloudDnsServer : []
  const maxLength = Math.max(currentServers.length, rightServers.length, 1)

  return Array.from({ length: maxLength }, (_, index) => ({
    current: currentServers[index],
    right: rightServers[index],
  }))
})

const displayValue = (value?: string) => {
  if (state.loading) return `${t('common.loading')}...`
  return value || '--'
}

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
  padding: 0 6px;
  font-family: 'PingFang SC', 'PingFang SC';
  font-size: 14px;
  color: #191c23;
}

.takeover-dialog__info {
  margin-bottom: 28px;
}

.takeover-dialog__info-row {
  display: flex;
  align-items: center;
  min-height: 32px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.takeover-dialog__label {
  flex-shrink: 0;
  width: 84px;
  color: #8a94a6;
}

.takeover-dialog__value {
  color: #191c23;
}

.takeover-dialog__table {
  border: 1px solid #e8ecf3;
}

.takeover-dialog__table-head,
.takeover-dialog__table-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.takeover-dialog__table-head {
  font-weight: 500;
  color: #191c23;
  background: #f9fafc;
}

.takeover-dialog__table-head > div,
.takeover-dialog__table-row > div {
  min-height: 50px;
  padding: 14px 18px;
  line-height: 22px;
  word-break: break-all;
  border-right: 1px solid #e8ecf3;
  border-bottom: 1px solid #e8ecf3;

  &:last-child {
    border-right: 0;
  }
}

.takeover-dialog__table-row:last-child > div {
  border-bottom: 0;
}

.takeover-dialog__right-server {
  display: flex;
  align-items: center;
  color: #00a870;

  .svg-icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-left: 8px;
    color: #8a94a6;
  }
}

.takeover-dialog__footer {
  display: flex;
  justify-content: flex-end;
  padding: 22px 28px;
  margin: 28px -28px -28px;
  border-top: 1px solid #e8ecf3;
}
</style>

<style lang="scss">
.takeover-dialog-v2.cat-dialog {
  padding: 0;

  .el-dialog__header {
    padding: 24px 28px;
    border-bottom: 1px solid #e8ecf3;
  }

  .el-dialog__body {
    padding: 28px;
  }

  .dialog-close {
    top: 24px;
    right: 28px;
    color: #191c23;
  }

  .cat-dialog-footer {
    display: none;
  }
}
</style>
