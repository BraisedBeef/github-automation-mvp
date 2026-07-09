<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('user.associateRole')"
    width="890px"
    :loading="associaeRoleLoading"
    @confirm="confirmHandle"
    @update:dialog="list = []"
    @open="open"
  >
    <el-row justify="space-between" :gutter="20">
      <!-- 选择角色 -->
      <el-col :span="12">
        <div class="title mb10">
          <span>{{ t('user.selectRole') }}</span> <span>({{ t('user.selectRoleNum', [list.length]) }})</span>
        </div>
        <div class="left-list-wrap">
          <div class="search-wrap">
            <el-input v-model.trim="condition" maxlength="30" :placeholder="t('user.rolesearchPlaceholder')" />
          </div>
          <!-- 不做分页，滚动展示 -->
          <el-table
            ref="tableLeftRef"
            v-loading="loading"
            max-height="320px"
            :data="list"
            header-row-class-name="header-row"
            :row-class-name="tableRowClassName"
            @selection-change="handleRowSelectChange"
          >
            <el-table-column type="selection" />
            <el-table-column prop="roleName" :label="t('role.roleName')" width="160" />
            <el-table-column prop="strategyNum" :label="t('role.strategyNum')" align="right">
              <template #default="{ row }">
                <span class="mr4">{{ row.strategyNum }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <!-- 已选择 -->
      <el-col :span="12">
        <div class="title mb10">
          <span>{{ t('role.alreadySelectStrategy', [selectList.length]) }}</span>
        </div>
        <div class="right-list-wrap">
          <el-table
            v-loading="loading"
            max-height="320px"
            :data="selectList"
            header-row-class-name="header-row"
            :row-class-name="'row'"
          >
            <el-table-column prop="roleName" :label="t('role.roleName')" width="160" />
            <el-table-column prop="strategyNum" :label="t('role.strategyNum')" width="178" />
            <!-- 操作 -->
            <el-table-column prop="number" align="right" width="48">
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
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { _getUserRoleList, _authUserRole } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'

interface PropType {
  id: number
}

const props = withDefaults(defineProps<PropType>(), { id: 0 })
const emits = defineEmits<{
  (event: 'success'): void
}>()

const loading = ref<boolean>(false)
const associaeRoleLoading = ref<boolean>(false)
const selectList = ref<any>([]) // 选中的角色列表
const show = ref<boolean>(false) // 弹窗显示
const list = ref<any[]>([]) // 角色列表
const condition = ref<string>('') // 查询条件
const tableLeftRef = ref<any>()

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
  return selectList.value.includes(row) ? 'select-row row' : 'row'
}

// 授权
const confirmHandle = () => {
  if (!selectList.value.length) {
    return message.warning(t('user.associateRoleWarn'))
  }
  authUserRole()
}

// 授权
const authUserRole = async () => {
  try {
    associaeRoleLoading.value = true
    const roleIds = selectList.value.map(el => el.id)

    const res = await _authUserRole({
      id: props.id,
      roleIds,
    })

    if (res.success) {
      emits('success')
      show.value = false
      message.success(t('user.authSuccess'))
    } else {
      message.warning(t('user.authFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    associaeRoleLoading.value = false
  }
}

// 弹窗打开
const open = () => {
  getUserRoleList()
}

// 获取角色列表
const getUserRoleList = async () => {
  try {
    loading.value = true
    const res = await _getUserRoleList({
      id: props.id,
      pageIndex: 1,
      pageSize: 9999,
      condition: condition.value,
    })
    if (res.success) {
      list.value = res.data?.list || []

      nextTick(() => {
        //table left勾选
        list.value.forEach(row => {
          if (row.isAssociationUser === 1) {
            tableLeftRef.value?.toggleRowSelection(row)
          }
        })
      })
    } else {
      list.value = []
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

watch(condition, () => {
  getUserRoleList()
})

defineExpose({
  show,
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
  width: 410px;
  height: 372px;
  padding: 11px;
  border: 1px solid var(--border-c);
  border-radius: 4px;
}

.mt15 {
  margin-top: 15px;
}
</style>
