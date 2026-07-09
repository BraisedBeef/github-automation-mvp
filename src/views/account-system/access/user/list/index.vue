<template>
  <el-card shadow="never" class="page-box wrap" :body-style="bodyStyle">
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />
    <!-- search -->
    <el-row class="mb20 options-wrap" justify="space-between">
      <el-col :span="12">
        <el-button type="primary" @click="toUserCerate">
          {{ t('user.create') }}
        </el-button>
        <el-button :type="selectList.length ? 'primary' : ''" @click="handleBatchDelete">
          {{ t('common.delete') }}
        </el-button>
      </el-col>

      <el-col :span="12" class="df jfe">
        <div class="search-wrap">
          <el-input v-model="condition" :placeholder="t('user.searchPlaceholder')" :suffix-icon="Search" />
        </div>
        <el-button
          class="ml14 refresh"
          @click="
            () => {
              condition = ''
              getUserList()
            }
          "
        >
          <SvgIcon name="cat-cdn-refresh" />
        </el-button>
      </el-col>
    </el-row>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="viewList"
      class="mt20 table"
      @selection-change="handleRowSelectChange"
      @row-click="handleRowClick"
    >
      <!-- 展开行 -->
      <el-table-column type="expand" width="40">
        <template #default="{ row }">
          <ExpandRow :row="row" />
        </template>
      </el-table-column>
      <el-table-column type="selection" width="40" :selectable="row => row.accountType !== 1" />
      <!-- 用户名称 -->
      <el-table-column min-width="300" prop="userName" :label="t('user.userName')" sortable>
        <template #default="{ row }">
          <span class="text-primary cursor-pointer" @click="toDetail(row)">{{ row.userName || '-' }}</span>
        </template>
      </el-table-column>
      <!-- 用户类型 -->
      <el-table-column min-width="300">
        <template #header>
          <CatTableHeadFilter
            v-model="accountType"
            :label="t('user.accountType')"
            tip=""
            show-all
            :list="accountTypeOptions"
          />
        </template>
        <template #default="{ row }">
          <span v-if="row.accountType == 1">{{ t('overview.mainUser') }}</span>
          <span v-if="row.userType == 1">{{ t('overview.subUser') }}</span>
          <span v-if="row.userType == 2">{{ t('user.messageRecipient') }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="200" prop="id" :label="t('account.accountID')" />
      <!-- 创建时间 -->
      <el-table-column min-width="200" prop="createDate" :label="t('role.createDate')" sortable class="sortable">
        <template #header>
          <span>{{ t('role.createDate') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" class="ml10" />
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span>{{ row.createDate ? maoYunDayJs(row.createDate).format(FORMAT_TIME) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="200" :label="t('user.relateInfo')">
        <template #default="{ row }">
          <SvgIcon v-if="row.mobile" style="width: 23px; height: 23px; margin-right: 20px" name="contact-phone" />
          <SvgIcon v-if="row.contactEmail" style="width: 23px; height: 23px" name="contact-email" />
        </template>
      </el-table-column>
      <el-table-column fixed="right" min-width="260" :label="t('common.operation')">
        <template #default="{ row }">
          <div v-if="row.accountType !== 1" class="df ac">
            <!-- 授权 -->
            <span
              class="mr20 cursor-pointer"
              :class="row.userType !== 2 ? 'text-primary' : 'disabled'"
              @click.stop="openEmpower(associaeRoleDialogRef, row)"
            >
              {{ t('user.authorize') }} </span
            ><el-select
              :teleported="true"
              :style="selectStyle"
              class="select-tr"
              :placeholder="t('user.moreOperation')"
              @change="
                v => {
                  handleOperatechange(v, row)
                }
              "
            >
              <el-option v-for="item in operateOptions" :key="item.value" :value="item" :label="item.label" />
            </el-select>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <CatPagination
      v-model:pagination="paginationConfig.pagination"
      :total="paginationConfig.total"
      :custom-keys="['page', 'pageSize']"
      @change="paginationChange"
    />

    <!-- 授权 -->
    <AssociaeRoleDialog :id="empowerId" ref="associaeRoleDialogRef" @success="getUserList" />
    <!-- 删除 -->
    <DeleteUserDialog
      ref="deleteUserDialogRef"
      :list="deleteConfig.list"
      :ids="deleteConfig.ids"
      @success="getUserList"
    />
    <!-- 禁用 -->
    <DisableUserDialog
      :id="disableStatus.id"
      ref="disableUserDialogRef"
      :access-method="disableStatus.accessMethod"
      @success="getUserList"
    />
  </el-card>
</template>

<script setup lang="ts">
import { message } from '@/utils/message'
import { Search } from '@element-plus/icons-vue'
import AssociaeRoleDialog from './components/associae-role-dialog.vue'
import ExpandRow from './components/expand-row.vue'
import DeleteUserDialog from '../detail/components/delete-user-dialog.vue'
import DisableUserDialog from '../detail/components/disable-user-dialog.vue'
import { _getUserList } from '@/apis/account-system/access/user'
import { usePermission } from '@/hooks/permission/use-permission'
import t from '@/utils/i18n'

import { IPagination } from '@/views/account-system/type'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const selectStyleMap = {
  [ja]: {
    width: '140px',
  },
  [en]: {
    width: '180px',
  },
  [zh]: {
    width: '110px',
  },
}

const selectStyle = useI18nStyle(selectStyleMap)

const insertVcUserPermission = usePermission('userApi:insertVcUser') // 创建子用户权限
const authUserRolePermission = usePermission(['roleApi:UserRoleList', 'userApi:authUserRole']) // 授权权限
const setStatusPermission = usePermission('userApi:setStatus') // 删除用户权限
const updateSecuritySettingPermission = usePermission('userApi:updateSecuritySetting') // 禁用用户权限

const bodyStyle = { height: '100%' }
const loading = ref<boolean>(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const tableRef = ref<any>(null)
const associaeRoleDialogRef = ref<InstanceType<typeof AssociaeRoleDialog> | null>(null)
const deleteUserDialogRef = ref<InstanceType<typeof DeleteUserDialog> | null>(null)
const disableUserDialogRef = ref<InstanceType<typeof DisableUserDialog> | null>(null)
const operateOptions = [
  {
    value: 'disable',
    label: t('user.disable'),
  },
  {
    value: 'delete',
    label: t('common.delete'),
  },
]

const accountTypeOptions = [
  {
    value: 'main',
    label: t('overview.mainUser'),
  },
  {
    value: 'sub-all',
    label: t('account.subuser'),
  },
  {
    value: 'sub-news',
    label: t('user.messageRecipient'),
  },
]
const accountType = ref<string>('') // 用户类型
const condition = ref<string>('') // 查询条件
const list = ref<any[]>([]) // 用户列表
const selectList = ref<any>([]) // 选中list
const empowerId = ref<number>(0) // 授权id
// 删除config
const deleteConfig = reactive<{
  ids: number[]
  list: any[]
}>({
  ids: [],
  list: [],
})
// 禁用
const disableStatus = reactive<{
  id: number
  accessMethod: number
}>({
  id: 0,
  accessMethod: 1,
})

const tips = computed(() => [
  {
    main: t('user.tipMain'),
    sub: [t('user.tipSub')],
  },
])

// 跳转创建用户
const toUserCerate = () => {
  if (!insertVcUserPermission.checkPermissionRes) {
    insertVcUserPermission.dialog({
      show: true,
      i18nKey: 'account.createUserPerm',
    })
    return
  }

  pushRoute({
    name: 'access_user_create',
    query: {
      title: 'user.userList',
      path: '/account-system/access/user/list',
    },
  })
}

// 跳转用户详情
const toDetail = (row: any) => {
  console.log(`toDetail===>`, row.accountType, row.userType)

  const query = {
    title: 'user.userList',
    path: '/account-system/access/user/list',
  }

  const id = row.id
  // 主账户类型
  if (row.accountType == 1) {
    pushRoute({
      name: 'access_user_detail_main',
      params: {
        id,
      },
      query,
    })
  } else {
    // 子用户类型-可访问资源并接收消息
    if (row.userType == 1) {
      pushRoute({
        name: 'access_user_detail_sub_all',
        params: {
          id,
        },
        query,
      })
    }
    // 子用户类型-仅用于接收消息
    if (row.userType == 2) {
      pushRoute({
        name: 'access_user_detail_sub_news',
        params: {
          id,
        },
        query,
      })
    }
  }
}

// 用户列表
const viewList = computed(() => {
  console.log(`accountType===>`, accountType)
  // 全部
  if (!accountType.value) {
    return list.value
  }
  // 主账户
  if (accountType.value === 'main') {
    return list.value.filter(el => el.accountType == 1)
  }
  // 子用户类型-可访问资源并接收消息
  if (accountType.value === 'sub-all') {
    return list.value.filter(el => el.userType == 1)
  }
  // 子用户类型-仅用于接收消息
  if (accountType.value === 'sub-news') {
    return list.value.filter(el => el.userType == 2)
  }
})

// 展开
const handleRowClick = row => {
  tableRef.value?.toggleRowExpansion(row)
}

// 点击授权
const openEmpower = (ins: any, row: any) => {
  if (!authUserRolePermission.checkPermissionRes) {
    authUserRolePermission.dialog({
      show: true,
      i18nKey: 'user.authorizePerm',
    })
    return
  }

  console.log(`openEmpower===>`, row, row.id)
  if (row.userType == 2) return
  if (!ins) return
  empowerId.value = row.id
  ins.show = true
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// 操作
const handleOperatechange = (v: any, row: any) => {
  console.log(`handleOperatechange==>`, v, row)

  if (v.value === 'delete') {
    //单个删除
    if (!setStatusPermission.checkPermissionRes) {
      setStatusPermission.dialog({
        show: true,
        i18nKey: 'user.deleteUserPerm',
      })
      return
    }

    deleteConfig.ids = [row.id]
    deleteConfig.list = [row]

    if (deleteUserDialogRef.value) {
      deleteUserDialogRef.value.show = true
    }
  } else {
    // 禁用
    if (!updateSecuritySettingPermission.checkPermissionRes) {
      updateSecuritySettingPermission.dialog({
        show: true,
        i18nKey: 'user.disableUserPerm',
      })
      return
    }

    disableStatus.id = row.id
    disableStatus.accessMethod = row.accessMethod

    if (disableUserDialogRef.value) {
      disableUserDialogRef.value.show = true
    }
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    loading.value = true
    const res = await _getUserList({
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

// 批量删除 只能删除子用户
const handleBatchDelete = () => {
  if (!setStatusPermission.checkPermissionRes) {
    setStatusPermission.dialog({
      show: true,
      i18nKey: 'user.deleteUserPerm',
    })
    return
  }

  if (!selectList.value.length) {
    return message.warning(t('user.deleteUserWarn'))
  }

  // 子用户
  deleteConfig.list = selectList.value.filter(el => el.accountType !== 1)
  deleteConfig.ids = selectList.value.filter(el => el.accountType !== 1).map(el => el.id)

  if (!deleteConfig.ids.length) {
    return message.warning(t('user.deleteSubUserWarn'))
  }

  if (deleteUserDialogRef.value) {
    deleteUserDialogRef.value.show = true
  }
}

// 分页
const paginationChange = () => {
  getUserList()
}

// 条件
watch(condition, () => {
  getUserList()
})

onMounted(() => {
  getUserList()
})
</script>

<style lang="scss" scoped>
.wrap {
  .options-wrap {
    .refresh {
      width: 34px;
      height: 34px;
    }
  }

  .search-wrap {
    width: 360px;
    height: 34px;
    border-radius: 4px;
  }

  .table {
    .select-tr {
      margin-left: -12px;

      :deep(.el-input__wrapper) {
        background: transparent;
        box-shadow: none !important;

        .el-input__inner {
          &::placeholder {
            color: var(--primary-color) !important;
          }

          color: var(--primary-color) !important;
        }
      }
    }
  }

  .pl20 {
    padding-left: 20px;
  }

  .disabled {
    color: var(--sub-text);

    /* cursor: not-allowed; */
  }
}
</style>
