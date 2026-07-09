<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('flowPacket.removeEipTwo')"
    width="1300px"
    :loading="state.comfirmLoading"
    :disabled="state.selectList.length === 0"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <div>
      <el-row v-loading="state.listLoading" justify="space-between" :gutter="20">
        <!-- 左边 - 待选择 -->
        <el-col :span="12">
          <div class="title">
            {{ t('flowPacket.removeEipDialogTitle', [detailData.pkgName]) }}
          </div>
          <div class="mt20">
            <FilterInput
              ref="filterInputRef"
              class="filter-box"
              :placeholder="t('flowPacket.searchEipIdorName')"
              :filter-list="insFilterList"
              @search="searchFn"
            />
          </div>
          <!-- 不做分页，滚动展示 -->
          <div class="table-box mt20">
            <el-table
              ref="tableLeftRef"
              max-height="320px"
              :data="state.eipList"
              header-row-class-name="header-row"
              :row-class-name="tableRowClassName"
              @selection-change="handleRowSelectChange"
            >
              <el-table-column type="selection" width="30" />
              <!-- ID/名称 -->
              <el-table-column prop="roleName" :label="t('flowPacket.idOrName')" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  <div class="table-td_tooltip">
                    <div class="text-primary">
                      {{ row.eipUuid }}
                    </div>
                    <div class="text-over">
                      {{ row.name }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <!-- 状态 -->
              <el-table-column prop="network" :label="t('flowPacket.state')" show-overflow-tooltip min-width="100">
                <template #default="{ row }">
                  {{ typeList.find(item => item.value === row.state)?.label }}
                </template>
              </el-table-column>
              <!-- 公网IP地址 -->
              <el-table-column prop="ipArea" :label="t('flowPacket.eipAddress')" show-overflow-tooltip min-width="120">
                <template #default="{ row }">
                  {{ row.eip }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
        <!-- 右边 - 已选择 -->
        <el-col :span="12">
          <div class="title">
            {{ t('flowPacket.selectedNumber', [state.selectList.length]) }}
          </div>
          <!-- 已选择 -->
          <div class="table-box mt20">
            <el-table
              class="mh165"
              max-height="354px"
              :data="state.selectList"
              header-row-class-name="header-row"
              :row-class-name="'row'"
            >
              <!-- ID/名称 -->
              <el-table-column prop="roleName" :label="t('flowPacket.idOrName')" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  <div class="table-td_tooltip">
                    <div class="text-primary">
                      {{ row.eipUuid }}
                    </div>
                    <div class="text-over">
                      {{ row.name }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <!-- 状态 -->
              <el-table-column prop="network" :label="t('flowPacket.state')" show-overflow-tooltip min-width="100">
                <template #default="{ row }">
                  {{ typeList.find(item => item.value === row.state)?.label }}
                </template>
              </el-table-column>
              <!-- 公网IP地址 -->
              <el-table-column prop="ipArea" :label="t('flowPacket.eipAddress')" show-overflow-tooltip min-width="140">
                <template #default="{ row }">
                  {{ row.eip }}
                </template>
              </el-table-column>
              <el-table-column prop="number" width="100" :label="t('flowPacket.operate')">
                <template #default="{ row }">
                  <!-- 删除 -->
                  <el-icon @click="deleteSelectRowList(row)">
                    <CircleCloseFilled />
                  </el-icon>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="mt20">
      <!-- tip -->
      <Tip :text="tips" type="OneToOne" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { message } from '@/utils/message'
import { shareTrafficPackageEipList, shareTrafficPackageRemoveEip } from '@/apis/network/flow-packet'
import { typeList } from '@/views/network/public-ip/list/config'

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('flowPacket.removeEipTip'),
  },
])

const show = ref<boolean>(false) // 弹窗显示
const detailData = ref<any>({}) // 流量包

const insFilterList = [
  { fieldName: t('flowPacket.name'), fieldKey: 'eipName' },
  { fieldName: 'ID', fieldKey: 'eipUuid' },
]

const state = reactive<{
  comfirmLoading: boolean
  listLoading: boolean // 获取列表loading
  eipList: any[] // eip列表
  selectList: any[] // 选中列表
}>({
  comfirmLoading: false,
  listLoading: false,
  eipList: [],
  selectList: [],
})

const tableLeftRef = ref<any>()

// 获取流量包中的eip列表 暂时不做分页处理
const getList = async (search = {}) => {
  const params = {
    pageIndex: 1,
    pageSize: 999,
    pkgId: detailData.value.id,
    ...search,
  }
  state.listLoading = true
  try {
    const res = await shareTrafficPackageEipList(params)
    if (res.success) {
      state.eipList = res.data?.list
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.listLoading = false
  }
}

// 条件筛选的方法
const searchFn = search => {
  getList(search)
}

// 根据行数据中的 isDisabled 字段决定是否禁用选择
//   const isRowSelectable = row => {
//     return !row.isDisabled
//   }

//   const isAllDisabled = computed(() => {
//     // 检查是否所有行都不可选
//     return state.exampleList.every(row => row.isDisabled)
//   })
// 设置row类名
const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  // if (row.isDisabled) return 'row-gray' // 禁用样式
  return state.selectList.includes(row) ? 'select-row row' : 'row'
}
// table left 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  state.selectList = selection
}

// table right 删除当前行   这里要注意一下搜索后之前的选中项移除的问题
const deleteSelectRowList = (row: any) => {
  console.log(`deleteSelectRowList===>`, row)

  const i = state.selectList.findIndex(el => el.id === row.id)

  console.log(`deleteSelectRowList===>`, i)

  // 删除右边勾选
  if (i !== -1) {
    // console.log(`i===>`, i);

    state.selectList.splice(i, 1)
  }
  // 删除table left 勾选
  tableLeftRef.value?.toggleRowSelection(row)
}

const confirmHandle = async () => {
  if (!state.selectList.length) return message.warning(t('flowPacket.selectToRemoveEip'))
  const params = {
    pkgId: detailData.value.id,
    eipIds: state.selectList.map(item => item.eipId),
  }
  state.comfirmLoading = true
  try {
    const res = await shareTrafficPackageRemoveEip(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('flowPacket.removeEipSuccess'))
      closeFn()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
}

// 关闭弹窗
const closeFn = () => {
  state.listLoading = false
  state.eipList = []
  state.selectList = []
  show.value = false
}

// 弹窗打开
const open = () => {
  getList()
}

defineExpose({
  show,
  detailData,
})
</script>
<style scoped lang="scss">
.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #000;
}

.filter-box {
  width: 100%;
}

.blur {
  color: var(--active-text);
}

// 选中row
.select-row {
  td {
    .cell {
      color: var(--primary-color);

      /* background: var(--el-table-current-row-bg-color); */
      background: var(--selected-bgc) !important;
    }
  }
}

.table-box {
  border: 1px solid #ddd;
  border-radius: 4px;
}

:deep(.el-table thead .el-table__cell .cell) {
  padding-left: 10px;
}

:deep(.el-table tbody .el-table__cell .cell) {
  padding-left: 10px;
}

:deep(.row-gray) {
  background-color: #f2f2f2;

  div {
    color: #a0a0a0 !important;
  }
}

.mh165 {
  min-height: 165px;
}

:deep(.el-table__inner-wrapper::before) {
  background-color: #fff;
}
</style>
