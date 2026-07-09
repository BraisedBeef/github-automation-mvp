<template>
  <el-card shadow="never" class="page-box" :body-style="bodyStyle">
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <div class="df ac jsb mb20">
      <el-button type="primary" @click="toUserCerate">
        {{ t('recipient.create') }}
      </el-button>
      <div class="search-wrap">
        <el-input v-model="condition" :placeholder="t('recipient.searchPlaceholder')" :suffix-icon="Search" />
      </div>
    </div>

    <el-table v-loading="loading" table-layout="auto" :data="list" @selection-change="handleRowSelectChange">
      <el-table-column prop="userName" :label="t('user.userName')">
        <template #default="{ row }">
          <span>{{ row.userName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('user.accountType')">
        <template #default="{ row }">
          <span v-if="row.accountType == 1">{{ t('overview.mainUser') }}</span>
          <span v-if="row.userType == 1">{{ t('overview.subUser') }}</span>
          <span v-if="row.userType == 2">{{ t('user.messageRecipient') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="id" :label="t('account.accountID')" />
      <el-table-column :label="t('user.phone')">
        <template #default="{ row }">
          {{ row.mobile || t('subscribe.noSet') }}
        </template>
      </el-table-column>
      <el-table-column :label="t('user.email')">
        <template #default="{ row }">
          {{ row.contactEmail || t('subscribe.noSet') }}
        </template>
      </el-table-column>
      <el-table-column :label="t('common.operation')">
        <template #default="{ row }">
          <div :class="optionsClass">
            <p class="text-primary cursor-pointer mr20" @click="toUserDetail(row)">
              {{ t('recipient.modify') }}
            </p>
            <p class="text-primary cursor-pointer" @click="handleMana(row)">
              {{ t('recipient.mana') }}
            </p>
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
  </el-card>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { _getUserList } from '@/apis/account-system/access/user'
import { usePermission } from '@/hooks/permission/use-permission'
import t from '@/utils/i18n'

import { IPagination } from '@/views/account-system/type'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'

const insertVcUserPermission = usePermission('userApi:insertVcUser') // 创建子用户权限
const updateVcUserPermission = usePermission('userApi:updateVcUser') // 修改用户权限

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const optionsClassMap = {
  [ja]: 'df ac',
  [en]: '',
  [zh]: 'df ac',
}

const optionsClass = useI18nStyle(optionsClassMap)

const bodyStyle = { height: '100%' }
const condition = ref<string>('') // 查询条件
const list = ref<any[]>([]) // 列表
const loading = ref<boolean>(false)
const selectList = ref<any>([]) // 选中的消息

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const tips = computed(() => [
  {
    main: t('subscribe.subscribeTip'),
  },
])

// 新建接收人
const toUserCerate = () => {
  if (!insertVcUserPermission.checkPermissionRes) {
    insertVcUserPermission.dialog({
      show: true,
      i18nKey: 'recipient.createPerm',
    })
    return
  }

  pushRoute({ name: 'access_user_list' })
}

// 跳转订阅管理
const handleMana = (row: any) => {
  const query = {
    title: 'recipient.recipient',
    path: '/account-system/news/recipient/list',
  }

  const uid = row.id
  pushRoute({
    name: 'news_recipient_mana',
    params: {
      uid,
    },
    query,
  })
}

// 跳转用户详情
const toUserDetail = (row: any) => {
  if (!updateVcUserPermission.checkPermissionRes) {
    updateVcUserPermission.dialog({
      show: true,
      i18nKey: 'recipient.changeUserPerm',
    })
    return
  }

  console.log(`toUserDetail===>`, row.accountType, row.userType)

  const query = {
    title: 'recipient.recipient',
    path: '/account-system/news/recipient/list',
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

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
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
.search-wrap {
  width: 360px;
}

.dialog {
  .info {
    .key-wrap {
      width: 110px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--common-text);
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--common-text);
    }
  }
}
</style>
