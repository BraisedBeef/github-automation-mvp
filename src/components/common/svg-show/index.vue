<template>
  <div class="svg-box">
    <div class="svg-box-title">
      <el-tooltip placement="right" :content="svgStr" popper-class="cat-tooltip-popper">
        <div>svg图标</div>
      </el-tooltip>

      <div class="svg-title-r">
        <el-tooltip content="在这里!" :visible="!show" placement="left" popper-class="cat-tooltip-popper">
          <el-switch v-model="show" class="handle-show" @change="showChange" />
        </el-tooltip>
        <span :style="{ color: show ? '#0FBE5B' : '#555555', 'margin-left': '8px' }">{{ show ? '展示' : '收起' }}</span>
      </div>
    </div>
    <template v-if="show">
      <br />
      <div class="handle">
        <el-checkbox-group v-model="checkList" class="handle-checkbox" @change="customSetChange" @click.stop>
          <el-checkbox label="深色背景" :disabled="!show" />
          <el-tooltip
            content="通过给svg添加类名: loading 或者绑定属性: loading=true"
            popper-class="cat-tooltip-popper"
            placement="top"
          >
            <el-checkbox label="loading动画" :disabled="!show" />
          </el-tooltip>
        </el-checkbox-group>

        <el-color-picker
          v-model="color"
          class="handle-color"
          show-alpha
          :disabled="!show"
          :predefine="predefineColors"
          @change="colorChange"
        />
        <el-tooltip
          content="部分svg图标支持自定义颜色（具体办法是把svg源码里的填充色全部改为'currentColor'）"
          popper-class="cat-tooltip-popper"
          placement="top-start"
        >
          <el-icon>
            <Flag style="margin-left: 20px" :style="{ color: color }" />
          </el-icon>
          <span class="tip">部分svg支持自定义颜色</span>
        </el-tooltip>

        <el-input v-model="searchValue" placeholder="搜索图标名称">
          <template #suffix>
            <SvgIcon name="dns-search" />
          </template>
        </el-input>
      </div>
      <div class="svg-box-wrap">
        <div
          v-for="(svg, i) in svgIcons.filter(item => item.includes(searchValue))"
          :key="i"
          class="svg-box"
          :class="{ hover: setHover }"
          :style="{ color: color }"
          @click="handleCopy(svg)"
        >
          <SvgIcon :name="svg" :class="{ loading: svgLoading }" />
          <div class="svg-name" :class="{ loading: svgLoading }">
            <el-tooltip placement="bottom" popper-class="cat-tooltip-popper">
              <template #content>
                {{ svg }}
              </template>
              {{ svg }}
            </el-tooltip>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import formatSvgIconNames from '@/utils/format-svg'
import { _deepClone } from '@/utils/collection-utils'
import { _throttle } from '@/utils/timing-utils'
import { handleCopyValue } from '@/utils/dom-utils'
import { Flag } from '@element-plus/icons-vue'
import { message } from '@/utils/message'
const svgIcons = formatSvgIconNames()
const show = ref(false)
const color = ref()
const setHover = ref(false)
const svgLoading = ref(false)
const searchValue = ref('')
const checkList = ref<string[]>([])
const svgStr = '<SvgIcon name="iconName"/>'
const customSetChange = () => {
  setHover.value = checkList.value.includes('深色背景')
  svgLoading.value = checkList.value.includes('loading动画')
}
const showChange = () => {
  svgLoading.value = false
  checkList.value = checkList.value.filter(item => item !== 'loading动画')
}
const colorChange = (_color: string | null) => {
  color.value = _color || void 0
}
const handleCopy = _throttle(async (name: string) => {
  await handleCopyValue(name)
  message.success('已复制')
}, 1000)

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
])
</script>

<style scoped lang="scss">
.svg-box {
  width: 100%;
  padding: 24px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 4px #ccc;

  .svg-box-title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 18px;

    .svg-title-r {
      display: flex;
      align-items: center;
      font-size: 16px;
    }

    .handle-show {
      margin-left: auto;
    }
  }

  .handle {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 20px;

    .handle-checkbox {
      margin-right: 20px;
    }

    .handle-color {
      margin-right: 12px;
    }

    .tip {
      font-size: 14px;
      color: var(--common-text);
    }

    .el-input {
      width: 200px;
      margin-left: auto;
    }
  }

  .svg-box-wrap {
    display: flex;
    flex-wrap: wrap;

    .svg-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 128px;
      height: 100px;
      padding: 12px;
      text-align: center;
      cursor: pointer;
      background-color: #fff;
      border: 1px solid #efe9e9;
      border-radius: 12px;
      transition: all 0.3s;

      &:not(.hover):hover {
        background-color: #f3f6fb;
        border-color: #f3f6fb;
      }

      &:hover {
        svg:not(.loading) {
          width: 32px;
          height: 32px;
        }

        .svg-name:not(.loading) {
          font-size: 12px;
        }
      }

      &.hover {
        background-color: #000;
        border-color: #f3f6fb;
      }

      svg {
        width: 24px;
        height: 24px;
        margin-bottom: 12px;
        transition: all 0.2s ease;
      }

      .svg-name {
        width: 100%;
        overflow: hidden;
        font-size: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
        user-select: none;
        transition: all 0.2s ease;
      }
    }
  }
}

.svg-copy {
  margin-left: 12px;
  color: rgb(56 237 177);
  cursor: pointer;

  &:hover {
    color: var(--success-color);
  }
}
</style>
