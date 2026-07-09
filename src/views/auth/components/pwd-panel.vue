<template>
  <div class="pwd-panel">
    <!-- 安全程度 -->
    <div class="safety-title">
      <div>{{ t('components.save') }}:</div>
      <div class="safety-pipe">
        <div
          v-for="(item, index) in state.arr"
          :key="index"
          class="item"
          :class="[{ active: item.id <= safeStrength }, state.arr[safeStrength || 1].className]"
        />
        <div v-if="safeStrength" class="desc" :class="state.arr[safeStrength || 1].className">
          {{ state.arr[safeStrength].desc }}
        </div>
      </div>
    </div>
    <!-- text -->
    <div class="safety-content">
      <div v-for="(item, index) in state.arr2" :key="index" class="line df">
        <span v-if="isV2Theme" class="rule-icon" :class="item.right ? 'success' : 'warning'" aria-hidden="true" />
        <SvgIcon v-else :name="item.right ? 'pwd-success' : 'pwd-warning'" />
        <div class="text">
          {{ item.text }}
        </div>
      </div>
    </div>
    <!-- 三角形 -->
    <div class="triangle-down" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { PWD_REG } from '../config'
import { useThemeVersion } from '@/hooks/use-theme-version'

const props = withDefaults(
  defineProps<{
    value?: string
  }>(),
  {},
)
const { isV2Theme } = useThemeVersion()
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
      desc: t('login.weak'),
      className: 'error',
    },
    2: {
      id: 2,
      desc: t('login.middle'),
      className: 'warning',
    },
    3: {
      id: 3,
      desc: t('login.complex'),
      className: 'success',
    },
  },
  arr2: [
    { text: t('login.pwdPanelRule1'), right: false },
    { text: t('login.pwdPanelRule2'), right: false },
  ],
})

const safeStrength = ref<number>(0) // 密码强度等级 0 1 2 3

// 计算密码强度等级
// 弱密码：长度较短（少于8个字符）、仅包含数字或字母、使用简单的模式或重复字符。
// 中等密码：长度达到8个字符以上，包含大写字母、小写字母、数字和特殊字符中的至少三种。
// 强密码：长度达到8个字符以上，包含大写字母、小写字母、数字和特殊字符中的所有种类。
const evaluatePasswordStrength = password => {
  if (!password.length) {
    return 0
  }

  if (password.length < 8) {
    return 1
  }

  const hasUpperCase = /[A-Z]/.test(password) // 密码中是否包含大写字母
  const hasLowerCase = /[a-z]/.test(password) // 密码中是否包含小写字母
  const hasDigit = /[0-9]/.test(password) // 密码中是否包含数字
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) // 密码中是否包含特殊字符

  const typesCount = [hasUpperCase, hasLowerCase, hasDigit, hasSpecialChar].filter(Boolean).length

  if (typesCount === 4) {
    return 3
  } else if (typesCount >= 3) {
    return 2
  } else {
    return 1
  }
}

watch(
  () => props.value,
  (v: string | undefined) => {
    safeStrength.value = evaluatePasswordStrength(v)

    if (!v) {
      state.arr2.forEach(item => (item.right = false))
      return
    }
    // 8-32位字符
    state.arr2[0].right = v.length >= 8 && v.length < 32
    // 包含大写字母，小写字母，数字，特殊字符（除空格）
    state.arr2[1].right = PWD_REG.test(v)
  },
)
</script>

<style scoped lang="scss">
.pwd-panel {
  position: absolute;

  /* min-width: 200px;
  max-width: 400px; */
  min-width: 310px;
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;

  /* box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25); */
  box-shadow:
    0 9px 28px 8px rgb(0 0 0 / 5%),
    0 6px 16px 0 rgb(0 0 0 / 8%),
    0 3px 6px -4px rgb(0 0 0 / 12%);

  .safety-title {
    display: flex;
    margin-bottom: 10px;
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
      width: 100%;

      /* align-items: center; */
      margin-bottom: 5px;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 1;
      color: #6b7a8e;
      word-break: break-all;
      white-space: nowrap;

      /* flex-wrap: wrap; */

      svg {
        /* align-self: baseline; */
        flex-shrink: 0;
        width: 12px;
        height: 12px;
        margin-top: 4px;
        margin-right: 10px;
      }

      .text {
        word-break: break-all;

        /* min-width: 340px;
        max-width: 360px; */
        white-space: normal;
      }

      &:last-child {
        // placeholder
      }
    }
  }

  .triangle-down {
    position: absolute;
    bottom: -10px;
    left: 50%;
    width: 0;
    height: 0;
    border-top: 10px solid #fff;
    border-right: 10px solid transparent;
    border-left: 10px solid transparent;
    transform: translateX(-50%);
  }
}
</style>
