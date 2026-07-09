export const useDomClick = (domName: string, callback: (key: boolean) => void, onhideDomName?: string) => {
  const isTargetDom = ref<boolean>(false)

  const clickFn = (event: Event) => {
    const targetDom = document.querySelector(domName) as any
    if (onhideDomName) {
      const onHideDom = document.querySelector(onhideDomName) as any
      isTargetDom.value = targetDom.contains(event.target) || onHideDom.contains(event.target)
    } else {
      isTargetDom.value = targetDom.contains(event.target)
    }
    callback(isTargetDom.value)
  }

  onMounted(() => {
    document.addEventListener('click', clickFn)
  })

  onUnmounted(() => {
    document.removeEventListener('click', clickFn)
  })

  return {
    isTargetDom,
  }
}
