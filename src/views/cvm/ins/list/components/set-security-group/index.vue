<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('securityGroup.configSecurityGroup')"
    width="1080px"
    :loading="confirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <el-row justify="space-between" :gutter="20">
      <!-- 选择安全组 -->
      <el-col :span="12">
        <div class="title mb20">
          <span>{{ t('securityGroup.selectSecurityGroup') }}</span>
        </div>
        <!-- 左边 待选择-->
        <div class="left-list-wrap">
          <div class="search-wrap mb10">
            <el-input
              v-model.trim="condition"
              maxlength="30"
              :placeholder="t('securityGroup.searchSecurityGroupIdOrName')"
              @input="searchFn"
            />
          </div>

          <!-- 不做分页，滚动展示 -->
          <el-table
            ref="tableLeftRef"
            v-loading="loading"
            max-height="375px"
            :data="showList"
            class="row-table"
            header-row-class-name="header-row"
            :row-class-name="tableRowClassName"
            @selection-change="handleRowSelectChange"
          >
            <el-table-column type="selection" min-width="30" :selectable="isRowSelectable" />
            <el-table-column prop="roleName" :label="t('securityGroup.idOrName')" min-width="200">
              <template #default="{ row }">
                <div class="py6">
                  <div class="text-primary">
                    <Copy :text="row.groupUuid" />
                  </div>
                  <div><Copy :text="row.name" /></div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="strategyNum" :label="t('securityGroup.remark')" min-width="110">
              <template #default="{ row }">
                <span class="mr4">{{ row?.description || row.description !== '' ? row.description : '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <!-- 右边 - 已选择 -->
      <el-col :span="12">
        <div class="title mb20 df ac jsb">
          <span>{{ t('role.alreadySelectStrategy', [selectList.length]) }}</span>
          <span class="text-primary cursor-pointer" @click="clearAll(tableLeftRef)">{{ t('components.clear') }}</span>
        </div>
        <div class="right-list-wrap">
          <el-table
            v-loading="loading"
            max-height="320px"
            class="row-table"
            :data="selectList"
            header-row-class-name="header-row"
            :row-class-name="'row'"
          >
            <el-table-column prop="roleName" :label="t('securityGroup.idOrName')" min-width="180">
              <template #default="{ row }">
                <div class="py6">
                  <div class="text-primary">
                    {{ row.groupUuid }}
                  </div>
                  <div>{{ row.name }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="strategyNum" :label="t('securityGroup.remark')" min-width="110">
              <template #default="{ row }">
                <span class="mr4">{{ row?.description || row.description !== '' ? row.description : '-' }}</span>
              </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column prop="number" align="right" min-width="50">
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
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { useCvmStore } from '@/store'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { _getUserRoleList, _authUserRole } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'
import { getListSecurityGroup } from '@/apis/network/security-group'
import { eniUpdateSg } from '@/apis/network/network-card'
import { _debounce } from '@/utils/timing-utils'

interface PropType {
  initSelectList: any
}

const props = withDefaults(defineProps<PropType>(), { initSelectList: [] })

const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()

const eniId = ref<number>(NaN)
const loading = ref<boolean>(false)
const confirmLoading = ref<boolean>(false)
const selectList = ref<any>([]) // 选中的角色列表
const show = ref<boolean>(false) // 弹窗显示
const list = ref<any[]>([]) // 角色列表
const showList = ref<any[]>([]) // 筛选的角色列表
const condition = ref<string>('') // 查询条件
const tableLeftRef = ref<any>()
const regionId = cvmStore.areaSelect.id

// 获取安全组列表数据
const getList = async () => {
  const params = { pageIndex: 1, pageSize: 9999, regionId: regionId }
  loading.value = true
  try {
    const res = await getListSecurityGroup(params)
    loading.value = false
    if (res.success) {
      list.value = res.data?.list || []
      showList.value = (res.data?.list || []).map(item => {
        const isDisabled = props.initSelectList.findIndex(i => Number(i) === item.id) >= 0 ? true : false
        return { ...item, isDisabled }
      })
      selectList.value = showList.value.filter(item => props.initSelectList.findIndex(i => Number(i) === item.id) >= 0)
      nextTick(() => {
        //table left勾选
        selectList.value.forEach(row => {
          tableLeftRef.value?.toggleRowSelection(row)
        })
      })
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    loading.value = false
    console.log('error', err)
  }
}

// 根据行数据中的 isDisabled 字段决定是否禁用选择
const isRowSelectable = row => {
  return true
  // return !row.isDisabled
}

const isAllDisabled = computed(() => {
  // 检查是否所有行都不可选
  return showList.value.every(row => row.isDisabled)
})

// 搜索的方法 --------------目前安全组接口没有条件搜索  暂时只是前端本地筛选 --------------
// const searchFn = _debounce(getList)
const searchFn = _debounce(() => {
  showList.value =
    condition.value === ''
      ? [...list.value]
      : list.value.filter(
          item => item.name.indexOf(condition.value) >= 0 || item.groupUuid?.toString() === condition.value,
        )
  const selectArr = showList.value.filter(item => selectList.value.findIndex(i => i.groupUuid === item.groupUuid) >= 0)
  nextTick(() => {
    //table left勾选
    selectArr.forEach(row => {
      tableLeftRef.value?.toggleRowSelection(row)
    })
  })
}, 500)

// 清空
const clearAll = ins => {
  ins.clearSelection()
}

// table left 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// table right 删除当前行
const deleteSelectRowList = (row: any) => {
  console.log(`deleteSelectRowList===>`, row)

  const i = selectList.value.findIndex(el => el.id === row.id)

  console.log(`deleteSelectRowList===>`, i)

  // 删除右边勾选
  if (i !== -1) {
    // console.log(`i===>`, i);

    selectList.value.splice(i, 1)
    console.log(selectList.value)
  }
  // 删除table left 勾选
  tableLeftRef.value?.toggleRowSelection(row)
}

// 设置row类名
const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  // if (row.isDisabled) return 'row-gray' // 禁用样式
  return selectList.value.includes(row) ? 'select-row row' : 'row'
}

// 授权
const confirmHandle = () => {
  console.log(selectList.value?.length === 0)
  if (!selectList.value.length) {
    return message.warning(t('securityGroup.placeSelectSecurityGroup'))
  }
  authUserRole()
}

// 配置安全组
const authUserRole = async () => {
  const params = {
    eniId: eniId.value,
    sgIds: selectList.value.map(item => item.id) as number[],
  }
  confirmLoading.value = true
  try {
    const res = await eniUpdateSg(params)
    confirmLoading.value = false
    if (res.success) {
      message.success(t('securityGroup.configSecurityGroupSuccess'))
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    confirmLoading.value = false
    console.log('error', err)
  }
}

// 弹窗打开
const open = () => {
  getList()
}

const closeFn = () => {
  selectList.value = []
  list.value = []
  showList.value = []
  condition.value = ''
}

defineExpose({
  show,
  eniId,
})
</script>

<style lang="scss" scoped>
:deep(.el-table) {
  --el-table-row-hover-bg-color: var(--selected-bgc);

  .el-table__inner-wrapper::before {
    background: transparent !important;
  }

  .header-row {
    background-color: #fff;

    .el-table__cell {
      /* border-width: 0px; */
      background-color: #fff !important;
    }
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

  .row {
    height: 38px;

    &:hover {
      background: var(--selected-bgc) !important;
    }

    .el-table__cell {
      height: 34px;
      border-width: 0;

      .cell {
        width: 100% !important;
        height: 34px;
        line-height: 34px !important;
      }
    }
  }
}

.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--primary-text);
}

.left-list-wrap,
.right-list-wrap {
  box-sizing: border-box;
  width: 100%;
  height: 438px;
  padding: 11px;
  border: 1px solid var(--border-c);
  border-radius: 4px;
}

.mt15 {
  margin-top: 15px;
}

.row-table {
  :deep(.el-table-column--selection .cell) {
    padding-left: 8px;
  }

  :deep(.el-table__row) {
    height: 52px;
    margin-bottom: 4px;
  }

  :deep(.row .el-table__cell) {
    height: 52px;
  }

  :deep(.row .el-table__cell .cell) {
    height: 52px;
    line-height: 52px !important;
  }

  .py6 {
    padding: 6px 0;
  }

  :deep(.select-row td .cell) {
    color: #222;
  }
}

:deep(.row-gray) {
  background-color: #f2f2f2;

  div {
    color: #a0a0a0 !important;
  }
}
</style>
