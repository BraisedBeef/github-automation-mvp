<template>
  <div class="df ac" :class="classNames">
    <div class="df ac" :class="currentPage <= 1 ? 'cursor-not-allowed' : ''" @click="prevClick">
      <el-icon><ArrowLeft /></el-icon>
    </div>
    <span class="ml14 mr14">{{ `${currentPage}/${totalPage}` }}</span>
    <div class="df ac" :class="currentPage >= totalPage ? 'cursor-not-allowed' : ''" @click="nextClick">
      <el-icon><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

interface PropsType {
  align: 'left' | 'center' | 'right'
  total: number
  page: number
  page_size: number
}

const props = withDefaults(defineProps<PropsType>(), { align: 'left', total: 1, page: 1, page_size: 6 })
const emits = defineEmits<{
  (event: 'change', currentPage: number, pageSize: number): void
}>()

const alignObj = {
  left: 'jfs',
  center: 'jc',
  right: 'jfe',
}

const paginationConfig = reactive<{
  currentPage: number
  pageSize: number
  totalPage: number
}>({
  currentPage: props.page,
  pageSize: props.page_size,
  totalPage: Math.ceil(props.total / props.page_size),
})

const { currentPage, pageSize, totalPage } = toRefs(paginationConfig)

const classNames = computed(() => {
  return alignObj[props.align]
})

watch(
  () => props.page,
  () => {
    initPaginationConfig()
  },
)

watch(
  () => props.page_size,
  () => {
    initPaginationConfig()
  },
)

watch(
  () => props.total,
  () => {
    initPaginationConfig()
  },
)

// 初始化
const initPaginationConfig = () => {
  paginationConfig.currentPage = props.page
  paginationConfig.pageSize = props.page_size
  paginationConfig.totalPage = Math.ceil(props.total / props.page_size)
}

//pageSize --
const prevClick = () => {
  if (currentPage.value > 1) {
    currentPage.value--

    emits('change', currentPage.value, pageSize.value)
  }
}

//pageSize ++
const nextClick = () => {
  if (currentPage.value < totalPage.value) {
    currentPage.value++

    emits('change', currentPage.value, pageSize.value)
  }
}
</script>

<style lang="scss" scoped></style>
