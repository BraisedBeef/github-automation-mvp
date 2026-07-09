<template>
  <div class="cat-collaspe-table" :class="{ arrow }">
    <!-- 可折叠的table -->

    <!-- 头部 -->
    <div class="collaspe-head-wrap">
      <div
        v-for="item in columns"
        :key="item.prop"
        class="collasped-head-item"
        :style="
          auto
            ? { width: (1 / columns.length) * 100 + '%' }
            : item.width
              ? { minWidth: item.width + 'px' }
              : { width: (1 / columns.length) * 100 + '%' }
        "
      >
        <slot name="header" :row="item">
          {{ item.label }}
        </slot>
      </div>
    </div>
    <!-- 身体 -->
    <el-collapse
      v-if="tableData[0]"
      v-model="state.active"
      class="collaspe-table"
      :class="{ arrow }"
      :style="auto ? { width: '100%' } : allWidth && { minWidth: w + 'px' }"
    >
      <!-- 每一行 -->
      <el-collapse-item v-for="(data, dataIndex) in tableData" :name="data[keyword]">
        <!-- 行内 -->
        <template #title>
          <div
            v-for="(item, index) in columns"
            :key="item.prop"
            class="collasped-row-item"
            :class="[{ arrow: data.children || openTable[0] }, { first: index === 0 }]"
            :style="
              customItemWidth[0]
                ? customItemWidth[index]
                : item.width
                  ? { width: item.width + 'px' }
                  : { width: (1 / columns.length) * 100 + '%' }
            "
          >
            <!-- <div
              class="tooltip-wrap text-over"
              @mouseenter="handleEnter($event.target)"
            > -->
            <SvgIcon
              v-if="index === 0 && arrow && ((data.children && data.children[0]) || openTable[0])"
              name="down-arrow"
              :class="{ active: state.active.includes(data.id) }"
            />
            <!--   -->
            <el-tooltip
              :disabled="!state.showTip"
              :content="data[item.prop] && data[item.prop].toString()"
              placement="top"
              popper-class="cat-tooltip-popper dark"
              style="width: 80%"
            >
              <slot :item="item" :i="index" :row="data">
                <span class="text" @mouseenter="handleTip($event.target)" @mouseleave="() => (state.showTip = false)">{{
                  data[item.prop]
                }}</span>
                <!-- 个数 -->
              </slot>
            </el-tooltip>
            <span
              v-if="index === 0 && showRecords && ((data.children && data.children[0]) || openTable[0])"
              class="counts"
              >{{
                t('batchOperation.records', {
                  total: childrenLen(data, index),
                })
              }}</span
            >
          </div>

          <!-- </div> -->
        </template>
        <!-- 展开 -->
        <slot name="open" :row="data" :i="dataIndex">
          <div
            v-for="openItem in isChildren ? data.children : openTable"
            :key="openItem"
            class="collasped-open-item-wrap"
          >
            <div
              v-for="(item, index) in columns"
              :key="item.prop"
              class="collasped-open-item"
              :style="
                auto
                  ? { width: (1 / columns.length) * 100 + '%' }
                  : item.width
                    ? { width: item.width + 'px' }
                    : { width: (1 / columns.length) * 100 + '%' }
              "
            >
              <el-tooltip
                :disabled="!state.showOpenTip"
                placement="top"
                :content="data[item.prop] && data[item.prop].toString()"
                popper-class="cat-tooltip-popper dark"
              >
                <template #content>
                  {{ openItem[item.prop] && openItem[item.prop].toString() }}
                </template>
                <div
                  class="tooltip-wrap"
                  @mouseenter="handleOpenTip($event.target)"
                  @mouseleave="() => (state.showOpenTip = false)"
                >
                  <slot name="open_item" :item="item" :i="index" :row="openItem">
                    {{ openItem[item.prop] }}
                  </slot>
                </div>
              </el-tooltip>
            </div>
          </div>
        </slot>
      </el-collapse-item>
    </el-collapse>
    <!-- 空 -->
    <div v-else class="collaspe-empty">
      {{ t('common.noData') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    tableData: any[]
    openTable?: any[]
    allWidth?: boolean // 是否计算容器宽度(必要前提 columns的每一项都有设置宽度)
    open?: boolean // 是否默认展开 注: active关键字默认是id
    keyword?: string // 变更关键字
    isChildren?: boolean // openTable的值放在tableData的children里时 启用这个值
    selection?: boolean // 开启选项
    arrow?: boolean // 显示箭头
    showRecords?: boolean // 显示计算children的条数
    customItemWidth?: number | string[] // 自定义item元素的宽度
    auto?: boolean // 自适应宽度
  }>(),
  {
    columns: () => [],
    tableData: () => [],
    openTable: () => [],
    allWidth: true,
    open: false,
    keyword: 'id',
    isChildren: false,
    selection: false,
    arrow: true,
    showRecords: true,
    customItemWidth: () => [],
    auto: false,
  },
)

const state = reactive<{
  active: string[]
  showTip: boolean
  showOpenTip: boolean
  multipleSelection: any[]
}>({
  active: [],
  showTip: false,
  showOpenTip: false,
  multipleSelection: [],
})

const handleTip = (target: any) => {
  // 判断是否开启tooltip功能
  if (target.scrollWidth > target.clientWidth) {
    state.showTip = true
  } else {
    state.showTip = false
  }
}
const handleOpenTip = (target: any) => {
  // 判断是否开启tooltip功能
  if (target.scrollWidth > target.clientWidth) {
    state.showOpenTip = true
  } else {
    state.showOpenTip = false
  }
}

const childrenLen = (data: any, i: number) => {
  if (data.children) {
    return data.children.length
  } else {
    return props.openTable.length
  }
}

// 计算总长
const w = computed(() => {
  if (props.allWidth) {
    let n: number = 0
    props.columns.forEach(item => (n += Number(item.width)))
    return n
  }
  return false
})

watch(
  () => props.open,
  (o: boolean) => {
    if (o) {
      state.active = props.tableData && props.tableData.map(item => item.id)
    }
  },
  { immediate: true },
)

// watch(
//   () => state.active,
//   (a: any) => {
//     console.log("aaaa", a);
//   }
// );
</script>

<style scoped lang="scss">
.cat-collaspe-table {
  width: 100%;
  height: 100%;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .collaspe-head-wrap {
    display: flex;
    width: 100%;
    background-color: #f9fafc;
    border: 0;

    .collasped-head-item {
      flex-shrink: 0 !important;
      padding: 14px 20px 15px;
      font-family: 'PingFang SC-Regular', 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
      color: var(--common-text);
      background-color: #f9fafc;
      border: 0;

      svg {
        color: #999;
      }
    }
  }

  &.arrow {
    .collaspe-head-wrap {
      .collasped-head-item {
        &:first-child {
          padding-left: 20px;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.collaspe-table {
  .el-collapse-item {
    border-bottom: 1px solid #eee;

    &:hover {
      .el-collapse-item__header {
        background-color: var(--selected-bgc);
      }
    }

    &.is-active {
      .el-collapse-item__wrap {
        .el-collapse-item__content {
          background-color: #f9fafc;

          .collasped-open-item-wrap {
            .collasped-open-item {
              flex-shrink: 0 !important;
              background-color: #f9fafc;
            }
          }
        }
      }
    }

    & > button {
      height: 100%;
      border-bottom: 1px solid var(--border-c);

      &.el-collapse-item__header {
        height: auto;
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--table-text);
        border: 0;

        .collasped-row-item {
          flex-shrink: 0 !important;
          height: 60px;
          padding: 20px 20px 19px;
          text-align: left;

          .el-tooltip__trigger {
            display: inline-block;
            max-width: 75%;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            white-space: nowrap;
          }

          .counts {
            flex-shrink: 0;
          }

          &:first-child {
            position: relative;
            display: flex;
            align-items: center;

            & > div {
              display: flex;
              align-items: center;
            }

            svg {
              /* position: absolute; */
              left: 20px;
              width: 16px;
              height: 16px;
              margin-right: 20px;
              color: #999;
              transition: transform 0.3s;
              transform: rotateZ(-90deg);

              &.active {
                transform: rotateZ(0deg);
              }
            }
          }

          .tooltip-wrap {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            white-space: nowrap;
          }
        }

        .arrow {
          // placeholder
        }

        .first.arrow {
          // width: auto !important;
          // flex: 1;
        }

        .el-collapse-item__arrow {
          display: none;
        }
      }
    }

    .el-collapse-item__wrap {
      border: 0;

      .el-collapse-item__content {
        padding-bottom: 0;
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 12px;
        font-weight: 400;
        color: var(--common-text);
        border: 0;

        .collasped-open-item-wrap {
          display: flex;
          width: 100%;
          height: 60px;
          border: 0;

          &:last-child {
            .collasped-open-item {
              border-bottom: 0;
            }
          }

          .collasped-open-item {
            display: flex;
            flex-shrink: 0 !important;
            align-items: center;
            height: 100%;
            padding-left: 20px;
            font-family: 'PingFang SC-Regular', 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: var(--table-text);

            .tooltip-wrap {
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-all;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }

  &.arrow {
    .el-collapse-item {
      & > div[role='tab'] {
        .el-collapse-item__header {
          .collasped-row-item {
            flex-shrink: 0 !important;

            &:first-child {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              padding-left: 48px;
            }
          }
        }
      }

      .el-collapse-item__wrap {
        .collasped-open-item-wrap {
          .collasped-open-item {
            flex-shrink: 0 !important;

            &:first-child {
              padding-left: 56px;
            }
          }
        }
      }
    }
  }
}

.collaspe-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--table-text);
  border-bottom: 1px solid #ddd;
}
</style>
