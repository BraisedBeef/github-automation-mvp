<template>
  <div ref="dns_line" class="dns-line">
    <el-select
      ref="_select"
      :model-value="id"
      :popper-class="'dns-line-select ' + teleClass"
      :disabled="disabled"
      :visible="true"
      :placeholder="t('components.lineTypePlaceholder')"
      @visible-change="visChange"
    >
      <el-option v-for="item in flatOptions" :key="item.lineId" :label="item.lineName" :value="item.lineId" />
    </el-select>
    <Teleport :to="'.' + teleClass">
      <div ref="line_panel" class="line-panel">
        <div class="left" :style="{ maxHeight: maxHeight + 'px' }">
          <div
            v-for="opt in options"
            :key="opt.lineId"
            class="opt"
            :class="{ active: opt.lineId === activeLeft }"
            @mouseenter="optEnter(opt)"
            @click="optClick(opt)"
          >
            {{ opt.lineName }}
            <SvgIcon v-if="opt.childLine" name="down-arrow" />
          </div>
        </div>
        <div v-if="groupOptions[0]" class="right" :style="{ maxHeight: maxHeight + 'px' }">
          <div v-for="(group, groupIndex) in groupOptions" :key="group.lineId" class="group">
            <div class="group-title pointer" :class="{ active: id === group.lineId }" @click="handleClick(group)">
              {{ group.lineName }}
            </div>
            <div class="group-item-list">
              <div
                v-for="item in group?.childLine"
                :key="item.lineId"
                class="group-item"
                :class="{ active: id === item.lineId }"
                @click="handleClick(item)"
              >
                <span>·</span> {{ item.lineName }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _getElClient2 } from '@/utils/dom-utils'
const props = withDefaults(
  defineProps<{
    id?: string
    options?: any[]
    teleClass?: string
    disabled?: boolean
  }>(),
  {
    id: '',
    options: () => [],
    teleClass: 'dns-line-select',
  },
)
const emit = defineEmits<{
  (event: 'update:id', lineId: string)
  (event: 'change', item)
}>()

const dns_line = ref<any>(null)
const line_panel = ref<any>(null)
const _select = ref<any>(null)
const activeLeft = ref<string>('') // 活跃左

const maxHeight = ref(500)

// 当前组
const groupOptions = computed(() => {
  if (!activeLeft.value) return []
  return props.options.find(item => item.lineId === activeLeft.value)?.childLine || []
})

// 扁平化
const flatOptions: any[] = []

const flatFn = () => {
  // const defaultLine = props.options.find(item => item.isDefault) || { lineId: "xxx" }
  // if (props.id === defaultLine.lineId) {
  //     // activeLeft.value = defaultLine.lineId
  //     optClick(defaultLine)
  // }
  props.options.forEach(item => {
    const first: any = {
      lineId: item.lineId,
      lineName: item.lineName,
      status: item.status,
      lineValue: item.lineValue,
    }
    // 有些特殊的 可以直接选择第一级
    if (!item.childLine) {
      first.optional = true
      item.optional = true
    }
    flatOptions.push(first)
    item.childLine?.forEach(citem => {
      flatOptions.push({
        lineId: citem.lineId,
        lineName: citem.lineName,
        lineValue: citem.lineValue,
        status: item.status,
        parent: item.lineId,
      })
      citem.childLine?.forEach(ccitem => {
        flatOptions.push({
          lineId: ccitem.lineId,
          lineName: ccitem.lineName,
          lineValue: ccitem.lineValue,
          status: item.status,
          parent: item.lineId,
        })
      })
    })
  })
}

// hover
const optEnter = opt => {
  activeLeft.value = opt.lineId
}
// 可以点击的一级选项
const optClick = opt => {
  if (!opt.optional) return
  emit('update:id', opt.lineId)
  emit('change', opt)
  close()
}

// 展开下拉框
const visChange = (v: boolean) => {
  setPanelMaxHeight()
  if (v) {
    const activeItem = flatOptions.find(item => item.lineId === props.id)
    activeLeft.value = activeItem?.parent || ''
  }
}

// 点击元素
const handleClick = item => {
  emit('update:id', item.lineId)
  emit('change', item)
  close()
}

// 处理panel高度
const setPanelMaxHeight = () => {
  if (!dns_line.value) return
  const bodyHeight = document.body.offsetHeight // 页面高度
  const { top } = _getElClient2(dns_line.value)
  const diff = bodyHeight - top - dns_line.value!.offsetHeight
  //  panel的最大高度是500
  if (diff < 500) {
    maxHeight.value = roundDownToTens(diff)
  } else {
    maxHeight.value = 500
  }
  console.log('maxHeight', maxHeight.value)
}

function roundDownToTens(n: number) {
  if (n < 100) {
    return n
  }
  return Math.floor(n / 10) * 10
}

const close = () => {
  _select.value?.handleClose()
}

onMounted(() => {})

watch(
  () => props.options,
  () => {
    flatFn()
  },
  { deep: true, immediate: true },
)
watch(
  () => props.id,
  o => {},
  { deep: true, immediate: true },
)

onUnmounted(() => {
  close()
})
</script>

<style lang="scss">
.dns-line-select {
  position: relative;

  .el-select-dropdown {
    display: none !important;
  }
}
</style>

<style scoped lang="scss">
.dns-line {
  position: relative;
  width: 200px;

  :deep(.el-select) {
    width: 100%;
  }
}

.line-panel {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3000;
  display: flex;
  background-color: #fff;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow:
    0 9px 28px 8px rgb(0 0 0 / 5%),
    0 6px 16px 0 rgb(0 0 0 / 8%),
    0 3px 6px -4px rgb(0 0 0 / 12%);

  .left {
    padding: 8px;
    overflow-y: auto;

    .opt {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 144px;
      height: var(--input-height);
      padding: 7px 8px;
      margin-bottom: 4px;
      font-size: 14px;
      font-weight: 400;
      color: #000;
      cursor: pointer;

      svg {
        transform: rotateZ(-90deg);
      }

      &.active {
        color: var(--primary-color);
        background-color: #f1f7ff;
      }

      &:hover {
        color: var(--primary-color);
        background-color: #f1f7ff;
      }
    }
  }

  .right {
    width: 443px;
    overflow-y: auto;
    border-left: 1px solid #eee;

    .group {
      width: 100%;
      padding: 8px;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: 0;
      }

      .group-title {
        margin-bottom: 8px;

        // font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        color: #555;

        &.active {
          color: var(--primary-color);
        }

        &:hover {
          color: var(--primary-color);
        }
      }

      .group-item-list {
        display: flex;
        flex-wrap: wrap;
        width: 100%;

        .group-item {
          position: relative;
          margin-right: 8px;
          margin-bottom: 2px;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #555;
          cursor: pointer;

          &.active {
            color: var(--primary-color);
          }

          &:hover {
            color: var(--primary-color);
          }
        }
      }
    }
  }
}
</style>
