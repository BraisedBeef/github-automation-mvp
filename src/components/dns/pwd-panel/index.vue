<template>
  <div class="pwd-panel">
    <!-- 安全程度 -->
    <div class="safety-title">
      <div>{{ t('components.save') }}:</div>
      <div class="safety-pipe">
        <div
          v-for="item in state.arr"
          class="item"
          :class="[{ active: item.id <= safe }, state.arr[safe || 1].className]"
        />
        <div v-if="state.step" class="desc" :class="state.arr[state.step || 1].className">
          {{ state.arr[state.step].desc }}
        </div>
      </div>
    </div>
    <div class="safety-content">
      <div v-for="(item, index) in state.arr2" :key="index" class="line">
        <SvgIcon :name="item.right ? 'pwd-success' : 'pwd-warning'" />
        <div class="text">
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PWD_REG_WITHOUT_ALLOW, PWD_REG_WITH_ALLOW } from '@/utils/reg'
import t from '@/utils/i18n'
const props = withDefaults(
  defineProps<{
    value?: string
  }>(),
  {},
)
const state = reactive<{
  step: number
  desc: string
  arr: { [x: number]: any }
  arr2: any[]
}>({
  step: 0, // 密码符合度 1 ~ 3
  desc: '',
  arr: {
    1: {
      id: 1,
      desc: t('components.weak'),
      className: 'error',
    },
    2: {
      id: 2,
      desc: t('components.general'),
      className: 'warning',
    },
    3: {
      id: 3,
      desc: t('components.complex'),
      className: 'success',
    },
  },
  arr2: [
    { text: t('components.pwdPanel2'), right: false },
    { text: t('components.pwdPanel3'), right: false },
    { text: t('components.pwdPanel4'), right: false },
  ],
})

// 通过校验的数量
const safe = computed(() => {
  return state.arr2.filter(item => item.right).length
})

watch(
  () => props.value,
  (v: string | undefined) => {
    if (!v) {
      state.arr2.forEach(item => (item.right = false))
      return
    }
    state.step = 0
    // 6-20位字符
    state.arr2[0].right = v.length > 5 && v.length < 21
    // 只包含大小写字母 数字 标点符号(除空格)
    state.arr2[1].right = PWD_REG_WITHOUT_ALLOW.test(v)
    // 大写字母、小写字母、数字和标点符号至少包含2种
    state.arr2[2].right = PWD_REG_WITH_ALLOW.test(v)
    const r = state.arr2
    state.step = Number(r[0].right) + Number(r[1].right) + Number(r[2].right)
  },
  {
    immediate: true,
  },
)
</script>

<style scoped lang="scss">
.pwd-panel {
  position: absolute;
  min-width: 200px;
  max-width: 400px;
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 0 4px 0 rgb(0 0 0 / 25%);

  .safety-title {
    display: flex;
    margin-bottom: 12px;
    font-family: PingFangSC-Regular, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 1;
    color: #6b7a8e;

    .safety-pipe {
      display: flex;
      align-items: center;
      margin-left: 14px;

      .item {
        width: 2rem /* 32/16 */;
        height: 0.5rem /* 8/16 */;
        margin-right: 4px;
        background-color: #eee;

        &.error.active {
          background-color: var(--error-color);
        }

        &.warning.active {
          background-color: var(--warning-color);
        }

        &.success.active {
          background-color: var(--success-color);
        }
      }

      .desc {
        margin-left: 0.75rem /* 12/16 */;

        &.error {
          color: var(--error-color);
        }

        &.warning {
          color: var(--warning-color);
        }

        &.success {
          color: var(--success-color);
        }
      }
    }
  }

  .safety-content {
    display: flex;
    flex-direction: column;

    .line {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 8px;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 1;
      color: #6b7a8e;
      word-break: break-all;
      white-space: nowrap;

      svg {
        flex-shrink: 0;
        align-self: baseline;
        width: 12px;
        height: 12px;
        margin-right: 10px;
      }

      .text {
        min-width: 340px;
        max-width: 360px;
        white-space: normal;
      }

      &:last-child {
        // placeholder
      }
    }
  }
}
</style>
