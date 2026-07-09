export const usePolling = (cb?: () => void, immediately?: boolean, time?: number) => {
  const timeId = ref<any>(null) // 定时器
  const pollingNum = ref<number>(0) // 轮询次数

  if (typeof cb !== 'function') {
    cb = () => {}
  }

  if (typeof immediately !== 'boolean') {
    immediately = true
  }

  if (typeof time !== 'number') {
    time = 3 * 1000
  }

  // 重置轮询
  const reset = () => {
    pollingNum.value = 0
    clearInterval(timeId.value)
    openPolling()
  }

  const openPolling = () => {
    if (immediately) {
      cb()
      pollingNum.value++
    }
    // 轮询
    timeId.value = setInterval(() => {
      if (immediately) {
        pollingNum.value++
      }

      cb()
    }, time)
  }

  onMounted(() => {
    openPolling()
  })

  onBeforeUnmount(() => {
    clearInterval(timeId.value)
  })

  return {
    pollingNum,
    reset,
  }
}
