<template>
  <div :class="stateClassNameMap[state]" class="text-over">
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'

interface PropType {
  costType: number
  destructionTime: string | number | Date
  expiresTime: string | number | Date
  showDetailed?: boolean // 新增属性：是否显示详细时间
}

const props = withDefaults(defineProps<PropType>(), {
  costType: 0,
  destructionTime: '',
  expiresTime: '',
  showDetailed: false, // 默认不显示详细时间
})

// 状态对应的 CSS 类名映射表
const stateClassNameMap = {
  0: '', // 默认状态：无特殊样式
  1: 'text-warning', // 警告状态：显示黄色文本
  2: 'text-error', // 错误状态：显示红色文本
}

const state = ref<number>(0) // 当前状态标识 0-正常 1-警告 2-错误
const text = ref<string>('') // 显示文本内容

/**
 * 格式化毫秒为详细时间字符串（X天X时X分X秒）
 * @param diffMs 时间差（毫秒）
 * @returns 格式化后的时间字符串
 */
const formatDetailedTime = (diffMs: number): string => {
  if (diffMs <= 0) return ''

  const seconds = Math.floor(diffMs / 1000)
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return [
    days > 0 ? `${days}${t('recovery.common.day')}` : '',
    hours > 0 ? `${hours}${t('recovery.common.hour')}` : '',
    minutes > 0 ? `${minutes}${t('recovery.common.minute')}` : '',
    `${remainingSeconds}${t('recovery.common.second')}`,
  ]
    .filter(Boolean)
    .join('')
}

/**
 * 根据时间参数计算显示文本和状态
 * @returns {Object} 包含 text 和 state 的对象
 */
const calculateRecoveryTime = () => {
  const now = maoYunDayJs().valueOf()
  // destructionTime为空，时间戳为0
  const destruction = props.destructionTime ? maoYunDayJs(props.destructionTime).valueOf() : 0
  let resultText = ''
  let newState = 0

  // 处理详细显示模式
  if (props.showDetailed) {
    if (destruction > now) {
      const timeDiff = destruction - now
      resultText = formatDetailedTime(timeDiff)
      newState = 0
    } else {
      resultText = ''
      newState = 0
    }
    return { text: resultText, state: newState }
  } else {
    const getHours = (diff: number) => Math.ceil(diff / (3600 * 1000))

    // 处理包年包月类型的资源
    if (props.costType === 2) {
      // 一天以内
      const oneDayMs = 24 * 3600 * 1000
      // expiresTime为空，时间戳为0
      const expires = props.expiresTime ? maoYunDayJs(props.expiresTime).valueOf() : 0

      // 已过期但未销毁的特殊状态
      if (now >= expires && destruction > now) {
        const timeDiff = destruction - now

        // 1天内显示小时级倒计时
        if (timeDiff <= oneDayMs) {
          newState = 2
          resultText = t('recovery.common.releaseFormate', [getHours(timeDiff)])
        }
        // 超过1天显示过期天数
        else {
          const daysPassed = Math.ceil((now - expires) / oneDayMs)
          newState = 1
          resultText = t('recovery.common.expiresFormate', [daysPassed])
        }
      } else {
        newState = 0
        resultText = ''
      }
    }
    // 处理按量计费类型的资源
    else {
      if (destruction > now) {
        // 5小时以内
        const fiveHourMs = 5 * 3600 * 1000
        const timeDiff = destruction - now
        if (timeDiff <= fiveHourMs) {
          newState = 2
          resultText = t('recovery.common.releaseFormate', [getHours(timeDiff)])
        } else {
          newState = 2
          resultText = t('recovery.common.insufficieBalance')
        }
      } else {
        newState = 0
        resultText = ''
      }
    }

    return { text: resultText, state: newState }
  }
}

onMounted(() => {
  const updateDisplay = () => {
    const { text: newText, state: newState } = calculateRecoveryTime()

    text.value = newText
    state.value = newState
  }

  updateDisplay()
  const interval = setInterval(updateDisplay, 1000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>
