<!--
  @deprecated 此组件已废弃，请使用 CatTabs.vue 代替
  迁移指南:
  - 主要差异为样式: CatTabs2 使用独立 line 元素且无 padding
  - 建议: 在 CatTabs 中通过添加 styleVariant prop 支持此样式变体
-->
<template>
  <div v-if="tabs[0]" class="cat-tabs" :class="[props.fullContainer ? 'cat-tabs-full' : '']">
    <div ref="cat_tabs_ref" class="cat-tabs__header">
      <!-- 标签 -->
      <div
        v-for="(item, index) in tabs"
        :key="item.value"
        class="cat-tab__item text-over"
        :class="{
          'is-active': isActive(item.value),
          'is-last': index === tabs.length - 1,
          'with-title': type === 2,
        }"
        @click="tabChange(item)"
      >
        {{ item.label }}
      </div>
      <!-- 蓝色条 -->
      <div
        v-if="activeIndex !== -1"
        class="cat-tab_bar"
        :style="{
          width: itemInfo?.[activeIndex]?.width + 'px',
          transform: `translateX(${itemInfo?.[activeIndex]?.left}px)`,
        }"
      />
      <!-- line -->
      <div class="cat-tab_line" />
    </div>
    <div ref="cat_tabs_content_ref" class="cat-tab_content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CatTab, CatTabInfo } from '../cat-tabs/type'
const props = withDefaults(
  defineProps<{
    tabs?: CatTab[]
    modelValue?: string | number
    fullContainer?: boolean
    type?: number
    disabled?: boolean
  }>(),
  {
    tabs: () => [],
    disabled: false,
    type: 1,
  },
)

const emit = defineEmits<{
  (event: 'change', item: CatTab)
  (event: 'update:modelValue', active: string | number)
}>()
const activeValue = ref() // 当前活跃项的value
const slots = useSlots() // 获取插槽内容
const itemInfo = ref<CatTabInfo[]>([]) // tabs的属性:宽度和距左距离
const isActive = (value: string | number) => String(value) === String(activeValue.value)
const tabChange = (tab: CatTab) => {
  if (tab.disabled) return
  if (props.disabled) return
  activeValue.value = tab.value
  showComponent() // 切换组件内容显示
  emit('update:modelValue', tab.value) // 双向绑定
  emit('change', tab) // 事件抛出
}
onMounted(() => {
  // 延迟一下
  nextTick(() => {
    computedItem() // 计算每个tab的属性
    showComponent() // 判断展示哪个组件
  })
})
const cat_tabs_ref = ref()
const cat_tabs_content_ref = ref()
// 计算每个tab
const computedItem = () => {
  itemInfo.value = []
  if (cat_tabs_ref.value) {
    const items = cat_tabs_ref.value.querySelectorAll('.cat-tab__item')
    if (items) {
      Array.from(items).forEach((el: HTMLElement) => {
        itemInfo.value.push({
          width: el.offsetWidth,
          left: el.offsetLeft - 20, // 减去父盒子的padding
        })
      })
    }
  }
}

// 判断显示哪个slot组件
const showComponent = () => {
  if (slots && slots.default) {
    // 存在插槽
    const children = (slots.default() as any[]).filter((c: any) => c?.children?.default)
    if (children.length > 0) {
      // 需要被CatTabPane包裹
      const nodes = cat_tabs_content_ref.value.querySelectorAll('.cat-tab__pane')
      const elements = Array.from(nodes)
      elements.forEach(el => {
        const htmlEl = el as HTMLElement
        // 获取绑定在CatTabPane上的value值
        const value = htmlEl.attributes?.getNamedItem('value')?.nodeValue
        // 跟active比对 相等的就显示
        htmlEl.style.display = value == activeValue.value ? 'block' : 'none'
      })
    }
  }
}
// 当前活跃项的index
const activeIndex = computed(() => props.tabs.findIndex(item => String(item.value) === String(activeValue.value)))

watch(
  () => props.modelValue,
  a => {
    activeValue.value = a as string | number // active默认值
    nextTick(() => {
      computedItem()
      showComponent()
    })
  },
  { immediate: true },
)

watch(
  () => props.tabs,
  () => {
    // 延迟一下
    nextTick(() => {
      computedItem() // 计算每个tab的属性
      showComponent() // 判断展示哪个组件
    })
  },
)
</script>

<style scoped lang="scss">
.cat-tabs {
  width: 100%;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .cat-tabs__header {
    position: relative;

    /* padding: 0 20px; */

    /* border-bottom: 1px solid #eeeeee; */
    display: flex;
    align-items: center;
    width: max-content;
    min-width: 100%;
    background-color: #fff;

    .cat-tab__item {
      max-width: 400px;

      /* padding: 12px 0; */
      padding: 12px 20px;
      font-family: 'PingFang SC-Regular', 'PingFang SC';
      font-size: 16px;
      font-weight: 400;
      line-height: 22px;
      color: var(--primary-text);

      /* margin-right: 40px; */
      white-space: nowrap;
      cursor: pointer;

      &.is-last {
        margin-right: 0 !important;
      }

      &.is-active {
        color: var(--primary-color);

        // font-weight: 500;
      }

      &.disabled {
        color: var(--regular-text) !important;
        cursor: not-allowed;
      }

      &:hover {
        color: var(--primary-color);

        // font-weight: 500;
      }

      &.disabled:hover {
        color: var(--regular-text);
      }

      &.with-title {
        padding: 12px 8px;
        margin-right: 26px;
      }
    }

    .cat-tab_bar {
      position: absolute;
      top: calc(100% - 2px);
      left: 20px; // 父盒子的padding
      z-index: 9;
      height: 2px;
      background-color: var(--primary-color);
      transition: transform 0.3s;
    }

    .cat-tab_line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: #eee;
    }
  }

  .cat-tab_content {
    position: relative;
    background-color: #fff;
  }
}

.cat-tabs-full {
  width: calc(100% + 40px);
  margin-top: -20px;
  margin-left: -20px;

  .cat-tabs__header {
    border: none;
  }
}
</style>
