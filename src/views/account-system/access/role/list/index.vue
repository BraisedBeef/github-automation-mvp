<template>
  <el-card shadow="never" class="page-box operate" :body-style="bodyStyle">
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />
    <!-- search -->
    <el-row class="mb20 df jsb">
      <el-button class="btn" type="primary" @click="toRoleCreate">
        {{ t('role.createRole') }}
      </el-button>

      <div class="search-wrap">
        <el-input v-model="condition" :placeholder="t('role.searchPlaceholder')" :suffix-icon="Search" />
      </div>
    </el-row>

    <el-table v-loading="loading" :data="list" class="mt20">
      <el-table-column prop="roleName" :label="t('role.roleName')">
        <template #default="{ row }">
          <span class="text-primary cursor-pointer" @click="handleRowClick(row)">{{ row.roleName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="id" :label="t('role.roleID')" />
      <el-table-column prop="strategyNum" :label="t('role.strategyNum')" />
      <!-- 上次修改时间 -->
      <el-table-column prop="updateDate" :label="t('role.updateDate')">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('role.updateDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <span>{{ row.updateDate ? maoYunDayJs(row.updateDate).format(FORMAT_TIME) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('common.operation')">
        <template #default="{ row }">
          <span class="text-primary cursor-pointer" @click.stop="openDelete(row)">
            {{ t('common.delete') }}
          </span>
        </template>
      </el-table-column>
    </el-table>

    <CatPagination
      v-model:pagination="paginationConfig.pagination"
      :total="paginationConfig.total"
      @change="getRoleList"
    />

    <!-- 删除确认 -->
    <CatDialog
      v-model:dialog="show"
      class="dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :loading="removeLoading"
      @confirm="deleteRole"
    >
      <el-row class="main-text">
        {{ t('role.deleteRole') }}
      </el-row>
    </CatDialog>
  </el-card>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { _getRoleList, _deleteRole } from '@/apis/account-system/access/role'
import { message } from '@/utils/message'
import { usePermission } from '@/hooks/permission/use-permission'
import t from '@/utils/i18n'

import { IPagination } from '@/views/account-system/type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'

const insertRolePermission = usePermission('roleApi:insertRole') // 创建角色权限
const deleteRolePermission = usePermission('roleApi:deleteRole') // 删除角色权限

const bodyStyle = { height: '100%' }
const show = ref<boolean>(false) // 删除确认框
const list = ref<any[]>([]) // 角色列表
const loading = ref<boolean>(false)
const removeLoading = ref<boolean>(false)
const condition = ref<string>('') // 查询条件
const deleteId = ref<string>('') // 删除id
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const tips = computed(() => [
  {
    main: t('role.tipMain'),
    sub: [t('role.tipSub')],
  },
])

// 点击新建角色
const toRoleCreate = () => {
  if (!insertRolePermission.checkPermissionRes) {
    insertRolePermission.dialog({
      show: true,
      i18nKey: 'overview.createRolePerm',
    })
    return
  }

  pushRoute({
    name: 'access_role_create',
    query: {
      title: 'role.role',
      path: '/account-system/access/role/list',
    },
  })
}

// 获取角色列表
const getRoleList = async () => {
  try {
    loading.value = true
    const res = await _getRoleList({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      condition: condition.value,
    })

    console.log(`_getStrategyList===>`, res)

    if (res.success) {
      list.value = res.data?.list || []

      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 跳转详情页
const handleRowClick = (row: any) => {
  console.log(`handleRowClick===>`, row, row.id)

  pushRoute({
    name: 'access_role_detail',
    params: { id: row.id },
    query: {
      title: 'role.role',
      path: '/account-system/access/role/list',
    },
  })
}

// 点击删除
const openDelete = (row: any) => {
  if (!deleteRolePermission.checkPermissionRes) {
    deleteRolePermission.dialog({
      show: true,
      i18nKey: 'role.deleteRolePerm',
    })
    return
  }
  console.log(`openDelete===>`, row)

  show.value = true
  deleteId.value = row.id
}
// 删除角色
const deleteRole = async () => {
  try {
    removeLoading.value = true
    const res = await _deleteRole({ id: deleteId.value })

    console.log(`_deleteRole res===>`, res)

    if (res.success) {
      message.success(t('common.deleteSuccess'))
      getRoleList()
      show.value = false
    } else {
      message.warning(t('role.deleteFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    removeLoading.value = false
  }
}

// 条件
watch(condition, () => {
  getRoleList()
})

onMounted(() => {
  getRoleList()
})
</script>

<style lang="scss" scoped>
.search-wrap {
  width: 360px;
  height: 34px;
  border-radius: 4px;
}

.no-permission {
  height: 358px;

  .main-title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 16px;
    line-height: 22px;

    // font-weight: 500;
    color: var(--primary-text);
  }

  .sub-title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    line-height: 20px;

    // font-weight: 500;
    color: var(--primary-text);
  }

  .sub-desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--common-text);
  }
}

.dialog {
  .main-text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    line-height: 20px;

    // font-weight: 500;
    color: var(--primary-text);
  }

  .sub-text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    line-height: 20px;

    // font-weight: 500;
    color: var(--common-text);
  }
}

.pl20 {
  padding-left: 20px;
}
</style>
