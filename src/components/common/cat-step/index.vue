<template>
  <div class="cat-step">
    <div
      v-for="(item, index) in steps"
      :key="item.value"
      class="cat-step-item"
      :class="{
        // active: index === steped,
        active: defaultHighlight ? true : index === steped,
        will: defaultHighlight ? false : index > steped,
        // pass: index < steped,
        pass: defaultHighlight ? true : index < steped,
      }"
      :style="stepItemStyle"
      @click="handleStep(item)"
    >
      <div class="step-item-left">
        <!-- 序号 -->
        <span v-if="index < steped" class="step-item-sort cat-flex">
          <!-- √图标: pass -->
          <SvgIcon name="step-right" />
        </span>
        <!-- 显示序号: active & will -->
        <span v-else class="step-item-sort cat-flex">
          {{ index + 1 }}
        </span>
        <!-- 文本 -->
        <el-tooltip
          :content="item.label"
          :disabled="showTip"
          placement="bottom-start"
          popper-class="cat-tooltip-popper"
        >
          <span
            class="step-item-text text-over"
            @mouseenter="handleTip($event.target)"
            @mouseleave="() => (showTip = false)"
            >{{ item.label }}</span
          >
        </el-tooltip>
      </div>
      <!-- 箭头 -->
      <span v-if="index != steps.length - 1" class="step-item-arrow">
        <SvgIcon name="sub-back" pointer />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    defaultHighlight?: boolean // 默认是否全部高亮
    steps?: { label: string; value: string | number }[]
    vChange?: boolean
    stepItemStyle?: {
      [key: string]: string
    }
  }>(),
  {
    defaultHighlight: false,
    steps: () => [],
    stepItemStyle: () => ({}),
  },
)
const emit = defineEmits<{
  (event: 'change', step: { label: string; value: string | number })
  (event: 'update:modelValue', active: number | string): void
}>()
const attrs = useAttrs()
const showTip = ref(false)

const handleTip = (target: any) => {
  // 判断是否开启tooltip功能
  if (target.scrollWidth > target.clientWidth) {
    showTip.value = false
  } else {
    showTip.value = true
  }
}

const handleStep = (item: { label: string; value: string | number }) => {
  if (attrs.modelValue + '') {
    props.vChange && emit('update:modelValue', item.value)
    emit('change', item)
  }
}

//
const steped = computed(() => {
  if (!(attrs.modelValue + '')) {
    return -1
  }
  const index = props.steps.findIndex(item => item.value === attrs.modelValue)
  return index
})
</script>

<style scoped lang="scss">
.cat-step {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  .cat-step-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    margin-bottom: 20px;

    .step-item-left {
      display: flex;
      align-items: center;
      cursor: pointer;

      .step-item-sort {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
        margin-right: 12px;
        font-family: 'PingFang SC', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: var(--common-text);
        user-select: none;
        background-color: #f9fafc;
        border-radius: 50%;

        svg {
          width: 14px;
          height: 14px;
        }
      }

      .step-item-text {
        font-family: 'PingFang SC', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #555;
        user-select: none;

        &:hover {
          color: var(--primary-text);
        }
      }
    }

    .step-item-arrow {
      margin-right: 32px;
      margin-left: 32px;

      svg {
        width: 24px;
        height: 24px;
        color: #ccc;
        transform: rotateZ(180deg);
      }
    }

    &.pass {
      .step-item-left {
        .step-item-sort {
          color: #fff;
          background-color: var(--primary-color);
        }

        .step-item-text {
          color: var(--primary-text);
        }
      }
    }

    &.active {
      .step-item-left {
        .step-item-sort {
          color: #fff;
          background-color: var(--primary-color);
        }
      }

      .step-item-text {
        color: #000;
      }
    }

    &.will {
      .step-item-left {
        .step-item-sort {
          color: var(--common-text);
          background-color: #f9fafc;
        }
      }
    }
  }
}
</style>
