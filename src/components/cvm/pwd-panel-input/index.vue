<template>
  <div class="password-wrap">
    <el-input v-model.trim="pwd" :placeholder="ph" show-password @focus="focusFn" @blur="showPanel = false" />

    <!-- 密码强度弹窗 -->
    <div
      v-show="showPanel"
      :id="pwdPanelIdName"
      class="pwd-panel"
      :style="{
        top: `-${pwdPanelHeight}px`,
      }"
    >
      <!-- 安全程度 -->
      <div class="safety-title">
        <div>{{ t('components.save') }}:</div>
        <div class="safety-pipe">
          <div v-for="item in 3" :key="item" class="item" :class="[pwdStrengthConfig[pwdStrength].className]" />
          <div v-if="pwdStrength" class="desc" :class="pwdStrengthConfig[pwdStrength].className">
            {{ pwdStrengthConfig[pwdStrength].desc }}
          </div>
        </div>
      </div>
      <!-- item rule -->
      <div class="safety-content">
        <div v-for="(item, index) in pwdItemRules" :key="index" class="line df ac">
          <SvgIcon :name="pwdItemRes[index] ? 'pwd-success' : 'pwd-warning'" />
          <span class="text">{{ item.text }}</span>
        </div>
      </div>
      <!-- 三角形 -->
      <div class="triangle-down" />
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

/**
 * @desc 有2个校验集合，一个是密码强度，另一个是密码item校验
 */

interface PwdStrengthRulesType {
  pwdStrengthRules: (pwd: string) => boolean
}

interface PwdStrengthConfigType {
  [key: string]: {
    allowRulesLen: number
    desc: string
    className: string
  }
}

interface PwdItemRulesType {
  text: string
  verify: (pwd: string) => boolean
}

const props = withDefaults(
  defineProps<{
    ph?: string
    pwdStrengthRules: PwdStrengthRulesType[]
    pwdItemRules: PwdItemRulesType[]
  }>(),
  {
    ph: '',
    pwdStrengthRules: () => [], // 密码强度校验规则集合
    pwdItemRules: () => [], // 密码item校验规则集合
  },
)

const timestamp = maoYunDayJs().valueOf()

const pwdStrengthConfig = reactive<PwdStrengthConfigType>({
  no: {
    allowRulesLen: 0, // 无等级
    desc: '',
    className: '',
  },
  weak: {
    allowRulesLen: 1, // 弱密码通过验证规则的数量
    desc: t('login.weak'),
    className: 'error',
  },
  medium: {
    allowRulesLen: 2, // 中等密码通过验证规则的数量
    desc: t('login.middle'),
    className: 'warning',
  },
  strong: {
    allowRulesLen: 3, // 强密码通过验证规则的数量
    desc: t('login.complex'),
    className: 'success',
  },
})
const pwdItemRes = ref<boolean[]>([]) // 密码校验规则结果
const showPanel = ref<boolean>(false) // 密码强度显示面板
const pwdPanelHeight = ref<number>(0)
const pwd = ref<string>('')
const pwdStrength = ref<string>('no') // 密码强度等级 no无 weak弱密码 medium中等密码 strong强密码

const pwdPanelIdName = computed(() => `pwd-panel-${timestamp}`)

// 聚焦
const focusFn = () => {
  showPanel.value = true
  getPwdPanelDom()
}

// 获取密码强度提示dom
const getPwdPanelDom = () => {
  if (showPanel.value) {
    nextTick(() => {
      const pwdPanelDom = document.getElementById(pwdPanelIdName.value)
      pwdPanelHeight.value = (pwdPanelDom?.offsetHeight || 0) + 10
    })
  }
}

// 计算密码强度等级
const evaluatePwdStrength = (password: string) => {
  if (!password.length) {
    return 'no'
  }

  switch (props.pwdStrengthRules?.length) {
    case 6:
      pwdStrengthConfig.weak.allowRulesLen = 2
      pwdStrengthConfig.medium.allowRulesLen = 4
      pwdStrengthConfig.strong.allowRulesLen = 6
      break
    case 3:
      pwdStrengthConfig.weak.allowRulesLen = 1
      pwdStrengthConfig.medium.allowRulesLen = 2
      pwdStrengthConfig.strong.allowRulesLen = 3
      break
    default:
      pwdStrengthConfig.weak.allowRulesLen = 1
      pwdStrengthConfig.medium.allowRulesLen = 2
      pwdStrengthConfig.strong.allowRulesLen = 3
      break
  }

  const typesCount = props.pwdStrengthRules?.filter(Boolean).length

  if (typesCount >= pwdStrengthConfig.strong.allowRulesLen) {
    return 'strong'
  } else if (typesCount >= pwdStrengthConfig.medium.allowRulesLen) {
    return 'medium'
  } else if (typesCount >= pwdStrengthConfig.weak.allowRulesLen) {
    return 'weak'
  } else {
    return 'no'
  }
}

watch(pwd, v => {
  if (!v) {
    pwdItemRes.value = Object.keys(v).map(() => false)
    pwdStrength.value = 'no'
  } else {
    pwdStrength.value = evaluatePwdStrength(v)

    pwdItemRes.value = Object.keys(v).map((el, index) => {
      return props.pwdItemRules[index]?.verify(pwd.value)
    })
  }
})

watch(
  () => props.pwdItemRules,
  v => {
    if (v) {
      pwdItemRes.value = Object.keys(v).map(() => false)
    }
  },
  {
    immediate: true,
    deep: true,
  },
)
</script>

<style lang="scss" scoped>
.password-wrap {
  position: relative;
}

.pwd-panel {
  position: absolute;
  left: 50%;
  z-index: 9999;
  display: block;
  min-width: 100%;
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow:
    0 9px 28px 8px rgb(0 0 0 / 5%),
    0 6px 16px 0 rgb(0 0 0 / 8%),
    0 3px 6px -4px rgb(0 0 0 / 12%);

  /* top: 0px; */

  /* bottom: 50px; */
  transform: translateX(-50%);

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
        width: 32px;
        height: 8px;
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
        margin-left: 12px;

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
      margin-bottom: 8px;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #6b7a8e;
      word-break: break-all;
      white-space: nowrap;

      svg {
        flex-shrink: 0;
        width: 12px;
        height: 12px;
        margin-right: 10px;
      }

      .text {
        line-height: 1;
        word-break: normal;
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
