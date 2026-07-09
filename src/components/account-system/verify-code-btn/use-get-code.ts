interface ParamType {
  count: number
}

export const useGetCode = (
  params: ParamType = {
    count: 60,
  },
) => {
  const { count } = params

  const codeTimer = ref<ReturnType<typeof setInterval> | null>(null) // 验证码倒计时返回值id
  const codeCount = ref<number>(count) // 验证码倒计时

  // 是否开启定时器
  const isOpenTimer = computed(() => {
    return codeTimer.value ? true : false
  })

  // 清除定时器
  const resetTimer = () => {
    clearInterval(codeTimer.value!)
    codeTimer.value = null
    codeCount.value = 0
  }

  // 开启定时器
  const openTimer = () => {
    if (codeTimer.value) return

    codeTimer.value = setInterval(() => {
      codeCount.value--
      if (codeCount.value === 0) {
        clearInterval(codeTimer.value!)
        codeTimer.value = null
        codeCount.value = count
      }
    }, 1000)
  }

  onUnmounted(() => {
    resetTimer()
  })

  return {
    isOpenTimer,
    codeCount,
    resetTimer,
    openTimer,
  }
}
