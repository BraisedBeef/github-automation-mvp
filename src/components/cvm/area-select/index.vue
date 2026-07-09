<template>
  <!-- 地区 -->
  <el-select
    ref="select_area"
    :disabled="areaDisabled"
    class="ml20 select-area"
    :model-value="regionName"
    :placeholder="cvmStore.regionName || ''"
  >
    <template #prefix>
      <div class="df ac">
        <SvgIcon name="cs-area" />
      </div>
    </template>
    <template #empty>
      <!-- 显示区域 -->
      <div class="area-showBox">
        <div class="area-title">
          {{ t('cvmCpm.allArea') }}
        </div>
        <!-- 内容区域 -->
        <div class="area-content">
          <div class="list" :style="`grid-template-columns: repeat(${viewList.length > 4 ? 4 : viewList.length}, 1fr)`">
            <!-- 大区 -->
            <div
              v-for="(item, index) in viewList"
              :key="index"
              class="list-wrap"
              :style="{ 'grid-row-end': `span ${item.regionDTOS?.length || '0'}` }"
            >
              <div :title="item.location" class="list-title">
                {{ item.location }}
              </div>
              <!-- 区域 -->
              <div
                v-for="(regionItem, sort) in item.regionDTOS || []"
                :key="sort"
                class="list-items"
                @click.stop="changeArea(regionItem)"
              >
                <div
                  :title="regionItem.regionName"
                  class="list-item"
                  :class="modelValue.id === regionItem.id ? 'actived-area' : ''"
                >
                  <span> {{ regionItem.regionName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="area-wrap" v-loading="loading">
        <div
          class="item df"
          :class="cvmStore.areaSelect.locationId === item.id && 'actived'"
          v-for="(item, index) in viewList"
          :key="index"
        >
          <div class="lt">
            <p>{{ item.location }}</p>
            <div class="line"></div>
          </div>
          <div class="border-r" :class="cvmStore.areaSelect.locationId === item.id && 'actived-border-r'"></div>
          <div class="rt">
            <el-row style="display: gap; gap: 8px">
              <template v-for="(regionItem, index) in item.regionDTOS || []" :key="index">
                <el-col :span="4.8">
                  <div
                    :style="style"
                    @click="changeArea(regionItem)"
                    class="area cursor-pointer"
                    :class="modelValue.id === regionItem.id ? 'actived-area' : ''"
                  >
                    {{ regionItem.regionName }}
                  </div>
                </el-col>
              </template>
            </el-row>
          </div>
        </div>
      </div> -->
    </template>
  </el-select>

  <!-- 当前显示的区域name，用于ref获取内容宽度来动态设置select下拉框宽度（不要展示在可视区域内） -->
  <span ref="showNameRef" class="area-refBox">{{ showName }}</span>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import { AreaSelectType } from '@/store/cvm'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'

interface PropType {
  modelValue: AreaSelectType
  style?: {
    [x: string]: string
  }
  areaDisabled?: boolean
}

const select_area = ref<any>('')
// const handleVisibleChange = visible => {
//   if (!visible) {
//     nextTick(() => {
//       select_area.value?.toggleMenu() // 强制打开下拉菜单
//     })
//   }
// }
const props = withDefaults(defineProps<PropType>(), {
  modelValue: () => ({
    id: 0,
    locationId: 0,
    areaDisabled: false,
  }),
})
const emits = defineEmits<{
  (event: 'changeArea', value: AreaSelectType): void
  (event: 'update:modelValue', value: AreaSelectType): void
  (event: 'getRegionData', val: any[]): void
}>()

const cvmStore = useCvmStore()
const { getListWithRegionByWhitelist, loading } = useBaseConfig()

const showName = ref<string>('') // 当前显示区域
const showNameRef = ref<globalThis.Ref | null>(null)

const list = ref<any[]>([]) // 大区列表
// 数量
const zoneCount = computed(() => {
  // t('cvmCpm.zoneCount', [props.modelValue.zoneCount || 0])
})

// list
const viewList = computed(() => {
  return list.value.filter(el => el.regionDTOS?.length)
  // return list.value.filter(el => el.regionDTOS?.length).filter(el => el.regionDTOS.some(item => item.zoneCount > 0))
})

// 当前地区名称
const regionName = computed(() => {
  const areaEl = list.value.find(el => el.id === props.modelValue.locationId) || {}
  const regionList = areaEl.regionDTOS || []
  const area = regionList.find(el => el.id === props.modelValue.id) || {}
  if (area.regionName) handleChange(area.regionName)
  return area.regionName
})

const handleChange = (name?) => {
  showName.value = name || cvmStore.regionName || '未知区域'
  nextTick(() => {
    console.log(showNameRef.value?.offsetWidth, 'showNameRef')
    const inputElement = select_area.value.$el.querySelector('.el-input__inner')
    if (inputElement) {
      inputElement.style.width = `${showNameRef.value?.offsetWidth || 70}px`
    }
  })
}

// 切换地区
const changeArea = (item: any) => {
  // const getAreaSelect = item?.id ? item : { id: 0, locationId: 0 }
  emits('update:modelValue', item)
  emits('changeArea', item)
  cvmStore.setAreaSelect(item)

  nextTick(() => {
    cvmStore.setRegionName(regionName.value)
  })
}

// 获取大区列表及其地区
const getListWithRegionFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      list.value = res.data || []

      let areaSelect: any = {} // 选中地区
      let defaultArea: any = {} // 默认地区
      let allArea: any[] = [] // 所有地区
      for (const el of list.value) {
        const regionDTOS = el.regionDTOS || []
        allArea.push(...regionDTOS)
      }
      // 默认值
      const area = allArea.find(item => item.isDefault === 1)
      if (area) {
        defaultArea = area
      } else {
        defaultArea = allArea.filter(el => el.zoneCount > 0)[0]
      }

      if (!defaultArea) {
        defaultArea = { id: 0, locationId: 0 }
      }

      // cvmStore.areaSelect无值，则取默认值
      if (!cvmStore.areaSelect.locationId && !cvmStore.areaSelect.id) {
        areaSelect = defaultArea
      } else {
        // cvmStore.areaSelect 有值 且是否有效
        const verifyRes = allArea.some(item => cvmStore.areaSelect.id === item.id)
        if (!verifyRes) {
          areaSelect = defaultArea
        } else {
          areaSelect = cvmStore.areaSelect
        }
      }

      emits('update:modelValue', areaSelect)
      emits('getRegionData', res.data)
      emits('changeArea', areaSelect)

      cvmStore.setAreaSelect(areaSelect)
      cvmStore.setAreaList(list.value)

      nextTick(() => {
        console.log(regionName.value, 'regionName.value')
        cvmStore.setRegionName(regionName.value)
      })
    }
  }
  getListWithRegionByWhitelist(cb)
}

onMounted(() => {
  if (cvmStore.regionName) handleChange(cvmStore.regionName)
  getListWithRegionFn()
})
onUnmounted(() => {
  // console.log('onUnmounted')
})
</script>

<style lang="scss" scoped>
$menu-collapsed-h: 54px; // 收缩按钮的高度

.area-showBox {
  box-sizing: border-box;
  min-width: 150px;
  max-width: 630px;
  height: auto;
  padding: 25px 15px 15px;
  background-color: var(--el-color-white);

  .area-title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 16px;
    font-style: normal;
    font-weight: bold;
    line-height: 22px;
    text-align: left;
  }

  .area-content {
    width: 100%;
    height: auto;
    overflow: hidden;
    overflow-y: auto;

    // 内容区域
    .list {
      box-sizing: border-box;
      display: grid;
      column-gap: 0;
      max-height: 340px;
      margin-top: 20px;

      .list-wrap {
        width: 140px;
        margin-bottom: 40px;

        .list-title {
          position: relative;
          width: calc(100% - 15px);
          margin-bottom: 8px;
          margin-left: 15px;
          overflow: hidden;
          font-size: 14px;
          line-height: 20px;
          color: #999;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: initial;
        }

        .list-items {
          .list-item {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            padding: 7px 0 7px 15px;
            margin-bottom: 8px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              color: #000;
              background-color: #f9fafc;
            }

            span {
              display: inline-block;
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .actived-area {
            color: #0063ff;
            background: #f1f7ff;
          }
        }

        // 有子项
        .el-sub-menu {
          .el-sub-menu__title {
            position: relative;
            height: var(--menu-item-h);
            padding: 0;

            .menu-icon {
              left: var(--menu-icon-left);
              flex-shrink: 0;
            }

            .menu-title {
              left: var(--menu-title-left);
            }

            .el-sub-menu__icon-arrow {
              color: #555;
            }
          }

          .el-menu {
            .el-menu-item-group {
              .el-menu-item-group__title {
                display: none;
              }
            }
          }

          // 打开子项
          &.is-opened {
            .el-sub-menu__title {
              .menu-title {
                color: var(--primary-color);
              }

              .menu-icon {
                color: var(--primary-color);
              }

              .el-sub-menu__icon-arrow {
                color: var(--primary-color);
              }
            }
          }
        }

        // 收缩状态
        &.collapsed {
          width: var(--menu-w-collapsed);

          .menu-icon {
            top: 50%;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
          }

          .el-menu-item {
            background-color: #fff !important;

            &.is-active {
              background-color: var(--primary-color) !important;

              &::before {
                display: none;
              }

              .menu-icon {
                color: #fff;
              }
            }
          }

          .el-sub-menu {
            &.is-active {
              .el-sub-menu__title {
                background-color: var(--primary-color);
              }

              .menu-icon {
                color: #fff;
              }
            }
          }
        }

        &:nth-last-child(-n + 3) {
          margin-bottom: 0;
        }
      }
    }
  }
}

.select-area {
  display: inline !important;
  width: auto !important;
}

:deep(.select-trigger) {
  display: inline !important;
  flex-grow: 0 !important;
  width: auto !important;
}

:deep(.el-input) {
  flex-grow: 0 !important;
  width: auto !important;
}

:deep(.el-input__wrapper) {
  flex-grow: 0 !important;
  justify-content: flex-start !important;
  width: auto !important;
}

:deep(.el-input__inner) {
  display: inline !important;
  flex-grow: 0 !important;

  // width: 50px;
  // min-width: 50px;
}

.area-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #000;
}

.area-wrap {
  min-width: 300px;
  max-width: 709px;
  padding-top: 10px;
  background: #fff;

  /* min-height: 400px; */

  .item {
    margin-bottom: 8px;
    background-color: transparent;

    .lt {
      position: relative;
      width: 100px;
      text-align: center;

      p {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;

        /* height: 34px; */
        line-height: 34px !important;
        color: rgb(0 0 0 / 88%);
      }

      .line {
        position: absolute;
        top: 0;
        right: 0;
        width: 1px;
        height: calc(100% + 10px);
        background: var(--border-c);
      }
    }

    .border-r {
      width: 1px;
    }

    .rt {
      flex: 1;
      padding: 0 8px;

      .area {
        min-width: 120px;
        height: 34px;
        padding: 0 10px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        line-height: 34px;
        color: #222;
        text-align: center;
        background: #f9fafc;
      }
    }
  }

  .actived {
    .actived-border-r {
      z-index: 1;
      background: var(--primary-color) !important;
    }

    .actived-area {
      color: #0063ff !important;
      background: #f1f7ff !important;
    }
  }
}

.area-refBox {
  position: fixed;
  top: -99999999px;
  left: -9999999px;
  float: left;
  font-size: 14px;
  opacity: 0;
}
</style>
