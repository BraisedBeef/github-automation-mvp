<template>
  <!-- <CatDialog :dialog="dialog" class="domain-transfer-dialog" :title="t('components.selectDomain')" @confirm="confirm"
    @update:dialog="(v: boolean) => !v && close()" :loading="state.loading"
    :disabled="state.multipleSelection.length === 0" width="780px"> -->
  <!-- 域名选择穿梭框 -->
  <div class="transfer">
    <!-- 头 -->
    <div class="transfer-header">
      <div class="transfer-header-left">
        <!-- 选择框 -->
        <!-- <el-select v-model="state.groupId" :disabled="state.loading" @change="getDomainList" clearable
            style="width: 120px; margin-right: 12px">
            <el-option v-for="item in state.groupList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select> -->
        <!-- 搜索 -->
        <el-input
          v-model.trim="state.searchValue"
          :placeholder="t('components.search')"
          :readonly="state.loading"
          style="width: 358px"
          @input="search"
        >
          <template #suffix>
            <SvgIcon name="dns-search" />
          </template>
        </el-input>
      </div>
      <div class="transfer-header-right">
        <!-- 已选择计数 -->
        <div class="transfer-counts">
          <span>{{ t('components.selected') }} </span>({{ state.multipleSelection.length }})
        </div>
        <!-- 清除所有 -->
        <el-button :disabled="state.multipleSelection.length === 0" @click="clearAll">
          {{ t('components.clearAll') }}
        </el-button>
      </div>
    </div>
    <!-- 身体 -->
    <div class="transfer-body">
      <!-- 左侧盒子 -->
      <div class="transfer-body-left transfer-body-box">
        <el-table
          ref="transfer_table"
          v-loading="state.loading"
          class="domain-transfer-table"
          :data="state.domainList"
          height="100%"
          :header-cell-class-name="cellClass"
          :row-class-name="rowClassName"
          :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
          row-key="id"
          @select="handleSelectionChange"
          @select-all="handleSelectionAll"
        >
          <el-table-column type="selection" width="52" />
          <el-table-column prop="domain" :label="t('batchOperation.allDomains')" show-overflow-tooltip />
        </el-table>
      </div>
      <div>
        <SvgIcon name="transfer-icon" :style="'font-size: 20px;color: #000'" />
      </div>
      <!-- 右侧盒子 TransferDelete-->
      <div class="transfer-body-right transfer-body-box">
        <div class="right-table-wrap">
          <div class="right-table-head">
            {{ t('batchOperation.selectedDomains') }}
          </div>
          <div class="right-table-list">
            <div v-for="item in state.multipleSelection" :key="item.id">
              <el-tooltip
                :disabled="state.showTip"
                :content="item.domain"
                placement="top"
                :offset="20"
                popper-class="cat-tooltip-popper dark"
              >
                <span class="text-over" @mouseenter="handleEnter($event.target)">{{ item.domain }}</span>
              </el-tooltip>
              <SvgIcon name="transfer-delete" @click="handleDelete(item)" />
            </div>
          </div>
          <div v-if="state.loading" class="el-loading-mark" />
        </div>
      </div>
    </div>
    <div v-if="error !== ''" class="domains-errors">
      <div class="error-msg"><SvgIcon name="tip-error" />{{ error }}</div>
    </div>
  </div>

  <!-- </CatDialog> -->
</template>

<script setup lang="ts">
import { _getDomainList } from '@/apis/dns/domain'
import { _getGroupList } from '@/apis/dns/group'
import { _debounce } from '@/utils/timing-utils'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
const props = withDefaults(
  defineProps<{
    selected: string
    error: string
  }>(),
  {},
)

const emit = defineEmits<{
  (event: 'confirm', domains: string): void
  (event: 'confirm-ids', ids: number[]): void
  (event: 'update:dialog', dialog: boolean): void
}>()

const transfer_table = ref()
const state = reactive<{
  searchValue: string // 搜索值
  groupId: any // 分组id
  domainList: any[]
  groupList: any[]
  loading: boolean
  multipleSelection: any[]
  showTip: boolean
}>({
  searchValue: '',
  groupId: void 0,
  domainList: [], // 域名列表
  groupList: [], // 组列表
  loading: true,
  multipleSelection: [],
  showTip: false,
})

// 多选
const handleSelectionChange = (val: any[], row: any) => {
  if (state.multipleSelection.findIndex(i => i.id === row.id) >= 0) {
    state.multipleSelection = state.multipleSelection.filter(i => i.id !== row.id)
  } else {
    if (val.length > 10) {
      transfer_table.value?.toggleRowSelection(row)
      return message.error(t('batchOperation.domainMax10'))
    }
    state.multipleSelection = Array.from(new Set([...state.multipleSelection, ...val]))
  }
  confirm()
}

// 全选
const handleSelectionAll = (val: any[]) => {
  state.multipleSelection = val
  confirm()
}

const cellClass = () => {
  return state.domainList.length > 10 ? 'disabled-cell' : ''
}

// const rowStyle = ({ row }) => {
//   const isActive = state.multipleSelection.findIndex(
//     (item) => item.id === row.id
//   );
//   if (isActive !== -1) {
//     return {
//       color: "#394aff !important",
//       backgroundColor: "var(--selected-bgc)",
//     };
//   }
// };

// 搜索
const search = _debounce(() => {
  console.log(state.searchValue)
  getDomainList()
})

// 清除所有
const clearAll = () => {
  transfer_table.value!.clearSelection()
  state.multipleSelection = []
  confirm()
}

// 清除单个
const handleDelete = (row: any) => {
  transfer_table.value.toggleRowSelection(row, false)
  state.multipleSelection = state.multipleSelection.filter(i => i.id !== row.id)
  confirm()
}

// 确认
const confirm = () => {
  const domains = state.multipleSelection.map(item => item.domain).join('\n')
  emit('confirm', domains)
  const ids = state.multipleSelection.map(item => item.domainId)
  emit('confirm-ids', ids)
}

const handleEnter = (target: any) => {
  // 判断是否开启tooltip功能
  if (target.scrollWidth > target.clientWidth) {
    state.showTip = false
  } else {
    state.showTip = true
  }
}

// 获取域名列表
const getDomainList = async () => {
  try {
    state.loading = true
    const { code, data } = await _getDomainList({
      page: 1,
      pageSize: 999,
      groupId: state.groupId,
      keyword: state.searchValue,
    })
    state.loading = false
    if (code === 200) {
      const { list } = data
      list &&
        list.forEach((item: any) => {
          item.id = item.domainId
        })
      state.domainList = list || []
      nextTick(() => {
        if (state.multipleSelection.length && state.domainList.length) {
          const arr = list.filter(value => state.multipleSelection.findIndex(i => i.id === value.id) >= 0)
          arr.forEach(item => {
            transfer_table.value.toggleRowSelection(item, true)
          })
        }
      })
      // if (props.selected) {
      //     // 清除所有选项
      //     clearAll()
      //     // 回显匹配上的选中项
      //     const selectDomains = props.selected.split('\n')
      //     state.domainList &&
      //       state.domainList.forEach(item => {
      //         selectDomains.includes(item.domain) && transfer_table.value.toggleRowSelection(item, true)
      //       })
      //   } else {
      //     // 清除所有选项
      //     clearAll()
      //   }
    }
  } catch (error) {
    state.loading = false
  }
}

const rowClassName = ({ row }) => {
  if (state.multipleSelection.find(item => item.id === row.id)) {
    return 'is-checked'
  } else {
    return ''
  }
}

// 获取分组列表
const getGroupList = async () => {
  try {
    state.loading = true
    const { code, data } = await _getGroupList()
    if (code === 200) {
      state.groupList =
        (data &&
          data.map((item: any) => ({
            label: item.name,
            value: item.groupId,
          }))) ||
        []
    }
    state.loading = false
  } catch (error) {
    state.loading = false
  }
}

onMounted(() => {
  getDomainList()
  getGroupList()
})
</script>

<style scoped lang="scss">
.transfer {
  position: relative;
  width: 100%;
  max-width: 780px;
  height: 100%;

  .transfer-header {
    display: flex;
    gap: 60px;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 12px;

    & > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }

    .transfer-header-left {
      flex: 1;
      min-width: 0;
    }

    .transfer-header-right {
      flex: 1;
      min-width: 0;
      height: var(--input-height);
      font-size: 14px;

      .transfer-counts {
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--table-text);

        span {
          margin-right: 4px;
        }
      }
    }
  }

  .transfer-body {
    display: flex;
    gap: 18px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 340px;

    .transfer-body-box {
      flex: 1;
      min-width: 0;
      height: 100%;
      overflow: hidden;
      border: 1px solid #e8ecf3;

      :deep(.domain-transfer-table) {
        height: 100% !important;

        .el-table__inner-wrapper::before,
        .el-table__border-left-patch {
          display: none;
        }

        .el-table__header tr,
        th.el-table__cell {
          height: 40px;
        }

        .el-table__body tr,
        td.el-table__cell {
          height: 48px;
        }

        th.el-table__cell {
          padding: 0 !important;
          font-size: 14px;
          font-weight: 500;
          color: #191c23;
          background-color: #f9fafc;
          border-bottom: 1px solid #e8ecf3;
        }

        td.el-table__cell {
          padding: 0 !important;
          font-size: 14px;
          color: #191c23;
          border-bottom: 1px solid #e8ecf3;
        }

        .el-table-column--selection {
          border-right: 1px solid #e8ecf3;
        }

        .el-table-column--selection .cell {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .cell {
          display: flex;
          align-items: center;
          height: 100%;
          min-height: 0;
          padding: 0 24px;
          line-height: 20px;
        }
      }
    }

    .transfer-body-left {
      height: 100%;

      // overflow: hidden;

      & > div {
        width: 100%;
        height: 100%;
      }
    }

    .transfer-body-right {
      height: 100%;

      .right-table-wrap {
        position: relative;
        width: 100%;
        height: 100%;

        .right-table-head {
          height: 40px;
          padding-left: 24px;
          font-family: 'PingFang SC-Regular', 'PingFang SC';
          font-size: 14px;
          font-weight: 500;
          line-height: 40px;
          color: #191c23;
          background-color: #f9fafc;
          border-bottom: 1px solid #e8ecf3;
        }

        .right-table-list {
          height: calc(100% - 40px);
          overflow: auto;

          div {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 48px;
            padding-right: 24px;
            padding-left: 24px;
            font-family: 'PingFang SC', 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: #191c23;
            border-bottom: 1px solid #e8ecf3;

            &:hover {
              background-color: var(--selected-bgc);
            }

            span:first-child {
              max-width: 90%;
            }

            svg {
              color: #999;
            }
          }
        }

        .el-loading-mark {
          position: absolute;
          inset: 0;
          z-index: 2000;
          margin: 0;
          cursor: not-allowed;
          background-color: rgb(255 255 255 / 90%);
        }
      }
    }
  }
}

.table-selected-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 40px;

  svg {
    width: 16px;
    height: 16px;
  }
}

:deep(.el-table .disabled-cell) {
  .cell .el-checkbox__inner,
  .cell .el-checkbox {
    position: relative;
    display: none;
  }

  &.el-table-column--selection {
    .cell::before {
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      content: '';
      background-color: #edf2fc;
      border: 1px solid #dcdfe6;
    }
  }
}

.error-msg {
  position: absolute;
  bottom: -20px;
  left: 0;
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: var(--error-color);
  word-break: break-all;

  svg {
    width: 14px;
    height: 14px;
    margin-top: -2px;
    margin-right: 4px;
  }

  &.ipv4 {
    margin-top: 12px;
  }
}
</style>
