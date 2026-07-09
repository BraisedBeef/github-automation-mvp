<template>
  <el-table
    table-layout="auto"
    v-bind="attrs"
    class="mt20"
    @selection-change="
      v => {
        emit('selection-change', v)
      }
    "
  >
    <slot />
  </el-table>
</template>

<script setup lang="ts">
const attrs = getCurrentInstance()?.attrs

const emit = defineEmits(['selection-change'])

const table = ref<any>(null)

const reset_table = () => {
  nextTick(() => {
    const table_row = document.querySelectorAll('.el-table .el-table__body')[0]
    const table_fixed = document.querySelectorAll('.el-table__body .el-table-fixed-column--right')
    if (table_row.clientWidth > table.value.clientWidth) {
      table_fixed.forEach(v => {
        v.classList.remove('cdn-table-shadow-hidden')
        v.classList.add('cdn-table-shadow-show')
      })
    } else {
      table_fixed.forEach(v => {
        v.classList.remove('cdn-table-shadow-show')
        v.classList.add('cdn-table-shadow-hidden')
      })
    }
  })
}

const resizeObserver = new ResizeObserver(params => {
  reset_table()
})

onMounted(() => {
  table.value = document.querySelector('.el-table')
  resizeObserver.observe(table.value)
})

onUpdated(() => {
  reset_table()
})

onBeforeUnmount(() => {
  resizeObserver.unobserve(table.value)
})
</script>

<style lang="scss" scoped>
:deep(.el-table.is-scrolling-none .el-table-fixed-column--right.is-first-column::before) {
  width: 0;
}

:deep(.cdn-table-shadow-hidden::before) {
  width: 0;
}

:deep(.cdn-table-shadow-show::before) {
  position: absolute;
  top: 0;
  bottom: -1px;
  left: -10px;
  width: 10px !important;
  overflow: hidden;
  pointer-events: none;
  touch-action: none;
  content: '';
  box-shadow: var(--el-table-fixed-right-column) !important;
}
</style>
