<template>
  <div ref="cat_tab_box_ref" class="cat-tab-box">
    <div
      v-for="(item, index) in list"
      :key="item.value"
      class="cat-tab-box-item"
      :class="[{ active: act === item.value }, { first: index === 0 }, { last: index === list.length - 1 }]"
      @click="handleChange(item)"
    >
      {{ item.label }}
    </div>
    <div
      class="active-mask"
      :class="[{ first: activeIndex === 0 }, { last: activeIndex === list.length - 1 }]"
      :style="{
        width: mask.w + 'px',
        transform: `translate(${mask.left}px, ${mask.top}px)`,
      }"
    >
      {{ list[activeIndex] && list[activeIndex].label }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface CatTabBoxItem {
  label: string
  value: number | string
}
const props = withDefaults(
  defineProps<{
    list?: CatTabBoxItem[]
  }>(),
  {
    list: () => [],
  },
)

const emit = defineEmits<{
  (event: 'change', item: CatTabBoxItem): void
  (event: 'update:modelValue', active: number | string): void
}>()
const attrs = useAttrs()
const act = ref<number | string>(0)
// 每个元素的信息
let itemsInfo: { w: number; left: number; top: number }[] = []
// mask的宽度和位置
const mask = ref<{ w: number; left: number; top: number }>({
  w: 0,
  left: -9999,
  top: 0,
})
// 获取所有item的宽度
const cat_tab_box_ref = ref()
const computeItemsWidth = () => {
  const els = cat_tab_box_ref.value.querySelectorAll('.cat-tab-box-item')
  els &&
    els.forEach((el: any) => {
      itemsInfo.push({
        w: el.offsetWidth,
        left: el.offsetLeft,
        top: el.offsetTop,
      })
    })
  console.log('els--', itemsInfo)
}
const activeIndex = computed(() => props.list.findIndex(item => item.value === act.value))
const setMask = () => {
  const index = activeIndex.value
  console.log('index--', index, itemsInfo, itemsInfo[0])
  if (index !== -1 && itemsInfo[0]) {
    mask.value.left = itemsInfo[index].left
    mask.value.w = itemsInfo[index].w
    mask.value.top = itemsInfo[index].top
  } else {
    mask.value.left = -9999
    mask.value.w = 0
    mask.value.top = 0
  }
  console.log('mask', mask.value)
}
// 切换
const handleChange = (item: CatTabBoxItem) => {
  if (attrs.modelValue + '') {
    emit('update:modelValue', item.value)
  }
  emit('change', item)
}

onMounted(() => {
  // 初始化
  nextTick(() => {
    computeItemsWidth()
    setMask()
  })
})

watch(
  () => attrs.modelValue,
  m => {
    act.value = m as string | number
    setMask()
  },
  // { immediate: true }
)
</script>

<style scoped lang="scss">
.cat-tab-box {
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  overflow: hidden;
  border-left: 1px solid var(--placeholder);
  border-radius: 4px;

  .cat-tab-box-item {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    min-width: 100px; // 宽度自适应
    height: var(--input-height);
    padding: 0 15px;
    cursor: pointer;
    background-color: #fff;
    border-top: 1px solid var(--placeholder);
    border-right: 1px solid var(--placeholder);
    border-bottom: 1px solid var(--placeholder);

    &:last-child {
      border-right: 0;
    }
  }

  .active-mask {
    position: absolute;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--input-height);
    font-family: 'PingFang SC', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;

    // transition: transform 0.2s ease-out;
    color: var(--primary-color);
    white-space: nowrap;
    cursor: pointer;
    background-color: #f2f3fe;
    border: 1px solid var(--primary-color);
  }
}

.first {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.last {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
