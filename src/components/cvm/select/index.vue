<template>
  <el-select
    id="select"
    ref="selectRef"
    :class="noBorder && 'select-no-border'"
    placement="bottom-end"
    :suffix-icon="noBorder ? '' : suffixIcon || ArrowDown"
    :model-value="''"
    :placeholder="ph"
    :style="{ width: `${selectWidth}px` }"
    @visible-change="visibleChange"
  >
    <template #empty>
      <div class="ins-opts-wrap df">
        <!-- 第一层 -->
        <div class="one-menu" :class="`one-menu-${timestamp}`" :style="oneMenuStyle">
          <div
            v-for="(item, index) in list"
            :key="index"
            class="item-one cursor-pointer"
            :class="[item.value === curOpt.key && `actived-one-${timestamp}`]"
            @click="handleOptClick(item, 'one')"
            @mouseenter="handleMouseenter(item, 'one')"
          >
            <!-- tooltip -->
            <el-tooltip
              v-if="tooltipVisible || item.tooltipVisible"
              effect="light"
              :content="item.tooltipContent"
              placement="top"
            >
              <div
                class="w-full h-full df jsb ac content"
                :class="[item.value === curOpt.key && 'actived', item.disabled ? 'disabled' : '']"
              >
                <span>{{ item.label }}</span>
                <el-icon v-if="item.children">
                  <CaretRight />
                </el-icon>
              </div>
            </el-tooltip>
            <!-- no tooltip -->
            <div
              v-else
              class="w-full h-full df jsb ac content"
              :class="[item.value === curOpt.key && 'actived', item.disabled ? 'disabled' : '']"
            >
              <span>{{ item.label }}</span>
              <el-icon v-if="item.children">
                <CaretRight />
              </el-icon>
            </div>
            <!-- 第二层 -->
            <div
              v-if="curOpt.show && curOpt.key === item.value"
              class="two-menu"
              :style="twoMenuPosition"
              :class="`two-menu-${timestamp}`"
              @mouseleave="handleMouseleave('two')"
            >
              <div
                v-for="(item2, index2) in curOpt.children"
                :key="index2"
                class="item-two cursor-pointer"
                @click="handleOptClick(item2, 'two')"
                @mouseenter="handleMouseenter(item2, 'two')"
              >
                <!-- tooltip -->
                <el-tooltip
                  v-if="tooltipVisible || item2.tooltipVisible"
                  effect="light"
                  :content="item2.tooltipContent"
                  placement="top"
                >
                  <div
                    class="w-full h-full df ac content"
                    :class="[item2.value === curOpt.childrenKey && 'actived', item2.disabled ? 'disabled' : '']"
                  >
                    {{ item2.label }}
                  </div>
                </el-tooltip>
                <div
                  v-else
                  class="w-full h-full df ac content"
                  :class="[item2.value === curOpt.childrenKey && 'actived', item2.disabled ? 'disabled' : '']"
                >
                  {{ item2.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { CaretRight, ArrowDown } from '@element-plus/icons-vue'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

interface ItemType {
  value: string
  label: string
  disabled?: boolean
  tooltipVisible?: boolean
  tooltipEffect?: 'dark' | 'light'
  tooltipContent?: string
  tooltipPlacement?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'
  children?: ItemType[]
}

interface PropType {
  list: ItemType[]
  ph?: string
  suffixIcon?: any
  twoMenuAlign?: 'lt' | 'rt'
  oneMenuStyle?: any
  twoMenuStyle?: any
  tooltipVisible?: boolean
  noBorder?: boolean
  selectWidth?: number
  oneMenuWidth?: number
}

const props = withDefaults(defineProps<PropType>(), {
  list: () => [],
  ph: '',
  suffixIcon: '',
  twoMenuAlign: 'rt',
  tooltipVisible: false,
  noBorder: false,
  selectWidth: 200,
  oneMenuWidth: 200,
})

const emits = defineEmits<{
  (event: 'optClick', item: ItemType): void
  (event: 'visibleChange', v: boolean): void
}>()

const timestamp = maoYunDayJs().valueOf()

// 当前操作
const curOpt = reactive<{
  key: string
  show: boolean
  children: any[]
  childrenKey: string
}>({
  key: '',
  show: false,
  children: [],
  childrenKey: '',
})
const twoMenuPosition = ref({}) // 第二层菜单位置

const selectRef = ref<any>()

// 第一层菜单样式
const oneMenuStyle = computed(() => {
  return {
    minWidth: `${props.oneMenuWidth}px`,
  }
})

// 第二层菜单样式
const twoMenuStyle = computed(() => {
  return props.twoMenuAlign === 'rt'
    ? {
        left: `${props.oneMenuWidth}px`,
      }
    : {
        left: `-${props.oneMenuWidth}px`,
      }
})

// 鼠标移入
const handleMouseenter = (item: any, type: 'one' | 'two') => {
  // 触碰第一层
  if (type === 'one') {
    if (curOpt.show && item.disabled) {
      curOpt.key = item.value
      curOpt.show = false
      curOpt.children = []
      curOpt.childrenKey = ''
    } else {
      if (item.children) {
        curOpt.key = item.value
        curOpt.show = true
        curOpt.children = item.children
      } else {
        curOpt.key = item.value
        curOpt.show = false
        curOpt.children = []
      }

      nextTick(() => {
        calculateTwoMenuPosition()
      })
    }
  } else {
    // 触碰第二层
    curOpt.childrenKey = item.value
  }
}

// 鼠标移出
const handleMouseleave = (type: 'one' | 'two') => {
  // 移出第二层
  if (type === 'two') {
    curOpt.key = ''
    curOpt.show = false
    curOpt.children = []
    curOpt.childrenKey = ''
  }
}

// 下拉显示隐藏
const visibleChange = (v: boolean) => {
  if (v) {
    curOpt.key = ''
    curOpt.show = false
    curOpt.children = []
    curOpt.childrenKey = ''
  }
  emits('visibleChange', v)
}

// 点击
const handleOptClick = (item: any, type: 'one' | 'two') => {
  if (item.disabled) return

  // 点击第一层
  if (type === 'one') {
    if (item.children) {
      curOpt.key = item.value
      curOpt.show = true
      curOpt.children = item.children
    } else {
      curOpt.key = item.value
      curOpt.show = false
      curOpt.children = []

      emits('optClick', item)
      selectRef.value.blur()
    }
  } else {
    // 点击第二层
    curOpt.childrenKey = item.value
    emits('optClick', item)
    selectRef.value.blur()
  }
}

// 计算第二层菜单位置
const calculateTwoMenuPosition = () => {
  const activeOneElement = document.querySelector(`.actived-one-${timestamp}`) as HTMLElement // 当前高亮项
  const oneMenuElement = document.querySelector(`.one-menu-${timestamp}`) as HTMLElement // 第一层菜单
  const twoMenuElement = document.querySelector(`.two-menu-${timestamp}`) as HTMLElement // 第二层菜单

  if (activeOneElement && oneMenuElement && twoMenuElement) {
    const twoMenuHeight = twoMenuElement.getBoundingClientRect().height
    const twoMenuWidth = twoMenuElement.getBoundingClientRect().width
    const activeOneHeight = activeOneElement.getBoundingClientRect().height

    const nextElements: HTMLElement[] = []
    let nextSibling = activeOneElement.nextElementSibling

    while (nextSibling) {
      if (nextSibling instanceof HTMLElement) {
        nextElements.push(nextSibling)
      }
      nextSibling = nextSibling.nextElementSibling
    }

    // 计算当前高亮项之后所有菜单项的高度总和
    const belowItemsHeight = nextElements.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0)
    const totalHeight = activeOneHeight + belowItemsHeight

    // 比较高度并设置定位
    const left = props.twoMenuAlign === 'rt' ? `${props.oneMenuWidth}px` : `-${twoMenuWidth}px`
    if (twoMenuHeight > totalHeight) {
      twoMenuPosition.value = { bottom: '-8px', left }
    } else {
      twoMenuPosition.value = { top: '-8px', left }
    }
  }
}

onMounted(() => {})
defineExpose({
  selectRef,
})
</script>

<style lang="scss" scoped>
$padding: 8px;
$width: 200px;

.disabled-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999 !important;
}

.ins-opts-wrap {
  position: relative;

  .one-menu {
    position: relative;
    padding: $padding 0;
    background-color: #fff;

    .item-one {
      position: relative;
      height: 34px;
      padding: 0 $padding;
      line-height: 34px;
      color: #555;

      .content {
        padding: 0 $padding;
      }
    }

    .disabled {
      cursor: not-allowed;

      @extend .disabled-text;
    }

    .actived {
      color: var(--primary-color);
      background: #f1f7ff;
    }
  }

  .two-menu {
    /* transition: 0.3s; */
    position: absolute;
    min-width: $width;
    padding: $padding 0;
    background-color: #fff;
    box-shadow:
      0 9px 28px 8px rgb(0 0 0 / 5%),
      0 6px 16px 0 rgb(0 0 0 / 8%),
      0 3px 6px -4px rgb(0 0 0 / 12%) !important;

    .item-two {
      height: 34px;
      padding: 0 $padding;
      line-height: 34px;
      color: #555;

      .content {
        padding: 0 $padding;
      }
    }

    .disabled {
      cursor: not-allowed;

      @extend .disabled-text;
    }

    .actived {
      color: var(--primary-color);
      background: #f1f7ff;
    }
  }

  .border-l-1 {
    border-left: 1px solid var(--border-c);
  }

  .border-r-l {
    border-right: 1px solid var(--border-c);
  }
}

.el-select.select-no-border {
  :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;

    .el-input__inner {
      &::placeholder {
        color: var(--primary-color) !important;
      }

      color: var(--primary-color) !important;
    }
  }
}
</style>
