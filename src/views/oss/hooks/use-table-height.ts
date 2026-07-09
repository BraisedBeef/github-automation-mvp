export const useTableHeight = (tableRef: any, offset = 100) => {
  const tableHeight = ref<number>(0)

  const calculateTableHeight = () => {
    nextTick(() => {
      if (!tableRef.value) return

      // 兼容处理：优先使用 $el，如果没有则直接使用 tableRef.value
      const element = tableRef.value.$el || tableRef.value
      if (!element) return

      const offsetTop = element.getBoundingClientRect().top
      tableHeight.value = window.innerHeight - offsetTop - offset
    })
  }

  onMounted(() => {
    calculateTableHeight()
    window.addEventListener('resize', calculateTableHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', calculateTableHeight)
  })

  return {
    tableHeight,
    calculateTableHeight,
  }
}
