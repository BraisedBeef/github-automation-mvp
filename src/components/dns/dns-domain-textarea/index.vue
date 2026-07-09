<template>
  <div class="this-wrap">
    <div class="dns-domain-textarea" :class="{ error: state.isFormatError, disabled: disabled }">
      <!-- 域名输入 -->
      <el-input
        :model-value="domains"
        autosize
        type="textarea"
        :placeholder="placeholder"
        resize="none"
        :class="{ error: state.isFormatError }"
        clearable
        :disabled="disabled"
        @blur="addDomainsValidate"
        @input="input"
      />
      <!-- 数量展示 -->
      <div class="domain-counts" :class="{ disabled: disabled }">
        <span>{{ computeDomains.length }}/10</span>
        <!-- <el-link type="primary" @click="handleClear" :disabled="computeDomains.length === 0">{{
          t('batchOperation.clear')
        }}</el-link> -->
      </div>
    </div>
    <!-- 域名错误信息提示 -->
    <div class="domains-errors">
      <div v-for="(err, i) in state.domainsError" :key="i" class="error-msg"><SvgIcon name="tip-error" />{{ err }}</div>
    </div>
    <slot name="errors" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
const DOMAIN_REG = /^(?:(?!:\/\/)[a-zA-Z0-9\u4e00-\u9fa5_-]+\.)*[a-zA-Z0-9\u4e00-\u9fa5_-]+\.[a-zA-Z]{2,63}$/
const props = withDefaults(
  defineProps<{
    domains?: string
    placeholder: string
    disabled?: boolean
  }>(),
  {
    domains: '',
    disabled: false,
  },
)
const emit = defineEmits<{
  (event: 'update:domains', domains: string): void
}>()

const state = reactive<{
  domainsError: string[]
  isFormatError: boolean
}>({
  domainsError: [], // 错误信息
  isFormatError: false, // 是否存在格式错误, 格式错误的话边框和内容都会变红
})

// 为空校验
const emptyValidate = () => {
  if (computeDomains.value.length === 0) {
    state.domainsError.push(t('components.domainEmpty'))
  } else {
    return true
  }
}

// 校验
const addDomainsValidate = () => {
  state.domainsError = []
  //   为空
  // emptyValidate(); // blur不触发空校验
  // 数量
  if (computeDomains.value.length > 10) {
    state.domainsError.push(t('components.domainMax10'))
  }
  // 格式校验
  const isExsitError = computeDomains.value.filter((domain: string) => !DOMAIN_REG.test(domain))

  if (isExsitError[0]) {
    state.domainsError.push(t('components.domainFormatErr', { domains: isExsitError.join('、') }))
    state.isFormatError = true
  } else {
    state.isFormatError = false
  }
  return state.domainsError.length === 0
}

// 计算一共输入了几条域名
const computeDomains = computed(() => {
  if (!props.domains) return []
  return props.domains.split('\n').filter(item => item)
})

// 更新值
const input = (v: string) => {
  emit('update:domains', v)
}

const handleClear = () => {
  input('')
  state.domainsError = []
  state.isFormatError = false
}

const getDomains = () => {
  if (!props.domains) return []
  return props.domains.split('\n').filter(item => item)
}

const getValidateValue = () => {
  console.log('看看', addDomainsValidate(), emptyValidate())

  return addDomainsValidate() && emptyValidate() // 空校验只在外界准备提交的时候触发
}

defineExpose({
  getDomains,
  getValidateValue: getValidateValue,
})
</script>

<style scoped lang="scss">
.this-wrap {
  width: 100%;

  & > :deep(.el-button) {
    position: absolute;
    top: 0;
    left: 560px;
  }
}

.dns-domain-textarea {
  position: relative;
  display: inline-block;
  margin-bottom: 5px;

  :deep(.el-textarea) {
    width: 540px;
    height: 200px;
    padding-bottom: 20px;
    border: 1px solid var(--border-c);
    border-radius: 4px;

    .el-textarea__inner {
      width: 100%;
      height: 100% !important;
      box-shadow: none;

      &::placeholder {
        font-size: 14px;
        font-weight: 400;
        color: #ccc;
      }
    }
  }

  &.error {
    :deep(.el-textarea) {
      border-color: var(--error-color);

      .el-textarea__inner {
        color: var(--error-color);
      }
    }
  }

  &.disabled {
    background-color: #f5f7fa;
  }

  .domain-counts {
    position: absolute;
    top: 174px;
    left: 8px;
    display: flex;
    justify-content: space-between;
    width: calc(100% - 16px);
    font-family: PingFangSC-Regular, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #ccc;
    background-color: #fff;

    .el-link {
      margin-right: 4px;
    }

    &.disabled {
      background-color: #f5f7fa;
    }
  }
}

.error-msg {
  max-height: 180px;
  margin-bottom: 4px;
  overflow-y: auto;
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: var(--error-color);
  word-break: break-all;

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    width: 14px;
    height: 14px;
    margin-top: -2px;
    margin-right: 4px;
  }

  &.ipv4 {
    margin-top: 12px;
  }
}
</style>
