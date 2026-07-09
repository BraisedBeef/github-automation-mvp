<template>
  <div>
    <!-- info -->
    <el-row class="mb20" justify="space-between" :gutter="20">
      <el-col :span="12">
        <el-card shadow="never" class="page-box h200 info-l" :body-style="bodyStyle">
          <!-- name -->
          <div class="mb20">
            <span class="mr20 name">{{ user.email || user.userName }}</span
            ><el-tag>{{ user.accountType === 1 ? t('overview.mainUser') : t('overview.subUser') }}</el-tag>
          </div>
          <!-- 登录时间 -->
          <el-row class="mb20">
            <el-col :xs="11" :sm="11" :md="10" :lg="6" :xl="4">
              <span class="key">{{ t('overview.lastLoginTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="ml10" />
              </el-tooltip>
            </el-col>
            <el-col :xs="13" :sm="13" :md="14" :lg="18" :xl="20">
              <span class="value">{{
                user.lastLoginTime ? maoYunDayJs(user.lastLoginTime).format(FORMAT_TIME) : '-'
              }}</span>
            </el-col>
          </el-row>

          <!-- 登录IP -->
          <el-row class="mb20">
            <el-col :xs="11" :sm="11" :md="10" :lg="6" :xl="4">
              <span class="key">{{ t('overview.lastLoginIp') }}</span>
            </el-col>
            <el-col :xs="13" :sm="13" :md="14" :lg="18" :xl="20">
              <span class="value">{{ user.lastLoginIp }}</span>
            </el-col>
          </el-row>

          <!-- 身份安全 -->
          <el-row class="mb20">
            <el-col :xs="11" :sm="11" :md="10" :lg="6" :xl="4">
              <span class="key">{{ t('overview.identitySecurity') }}</span>
            </el-col>
            <el-col :xs="13" :sm="13" :md="14" :lg="18" :xl="20">
              <div class="df ac">
                <p style="margin-right: 15px">
                  <span class="value mr4">{{ t('overview.loginProtect') }}</span>
                  <SvgIcon :name="user.loginProtect === 1 ? 'user-safe-success' : 'user-safe-error'" />
                </p>
                <p>
                  <span class="value mr4">{{ t('overview.operateProtect') }}</span>
                  <SvgIcon :name="user.operateProtect === 1 ? 'user-safe-success' : 'user-safe-error'" />
                </p>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="page-box h200 info-r" :body-style="bodyStyle">
          <el-row class="h-full" :gutter="20">
            <el-col :span="12">
              <el-row class="h-full" justify="space-between">
                <el-space direction="vertical" :size="0" :fill="true" class="h-full">
                  <div class="df ac key">
                    {{ t('overview.user') }}
                  </div>
                  <div class="df ac value">
                    {{ user.userNum }}
                  </div>
                  <div class="df ac">
                    <el-button class="btn" type="primary" @click="toUserCerate">
                      {{ t('overview.createUser') }}
                    </el-button>
                  </div>
                </el-space>
                <el-divider direction="vertical" class="h-full" />
              </el-row>
            </el-col>

            <el-col :span="12">
              <el-space direction="vertical" :size="0" :fill="true" class="h-full">
                <div class="df ac key">
                  {{ t('overview.associateRole') }}
                </div>
                <div class="df ac value">
                  {{ user.roleNum }}
                </div>
                <div class="df ac">
                  <el-button class="btn" type="primary" @click="toRoleCerate">
                    {{ t('overview.createRole') }}
                  </el-button>
                </div>
              </el-space>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 敏感操作 -->
    <el-card shadow="never" class="page-box operate mb20" :body-style="bodyStyle">
      <div class="title mb20 df ac">
        <span class="mr4">{{ t('overview.sensitive') }}</span>
        <el-tooltip :content="t('overview.sensitiveTooltip')" placement="top" effect="light">
          <SvgIcon name="cat-cdn-warning" />
        </el-tooltip>
      </div>

      <PermissionList perm="userApi:selectSensitiveList" i18n-key="overview.getSensitivePerm">
        <el-table v-loading="loading" table-layout="auto" :data="sensitiveList" class="w-full">
          <el-table-column prop="id" :label="t('account.accountID')" />
          <el-table-column prop="userName" :label="t('overview.userName')">
            <template #default="{ row }">
              <span>{{ row.userName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="sensitive" :label="t('overview.sensitive')">
            <template #default="{ row }">
              <span class="text-primary">{{ row.sensitive || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="productName" :label="t('overview.productName')">
            <template #default="{ row }">
              <span>{{ row.productName || '-' }}</span>
            </template>
          </el-table-column>
          <!-- 操作时间 -->
          <el-table-column prop="operateTime" :label="t('overview.operateTime')">
            <template #header>
              <div class="df ac">
                <span>{{ t('overview.operateTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <span>{{ row.operateTime ? maoYunDayJs(row.operateTime).format(FORMAT_TIME) : '-' }}</span>
            </template>
          </el-table-column>
        </el-table>

        <CatPagination
          v-model:pagination="paginationConfig.pagination"
          :total="paginationConfig.total"
          @change="getSensitiveList"
        />
      </PermissionList>
    </el-card>

    <!-- 高权限角色 -->
    <el-card shadow="never" class="page-box role" :body-style="bodyStyle">
      <el-space direction="vertical" :size="15" :fill="true" class="w-full">
        <div class="title">
          {{ t('overview.highPermRole') }}
        </div>
        <el-row :gutter="20">
          <el-col :span="14">
            <span class="tip">{{ t('overview.highPermRoleDesc1') }}</span>
          </el-col>
          <el-col :span="10">
            <span class="tip">{{ t('overview.highPermRoleDesc2') }}</span>
          </el-col>
        </el-row>

        <el-row v-for="(item, index) in user.highRoleDTOList" :key="index" :gutter="20">
          <el-col :span="14">
            <span class="key">{{ item.roleName }} {{ item.description ? `(${item.description})` : '' }} </span>
          </el-col>
          <el-col :span="10">
            <div class="text-primary">
              {{ item.associationNum }}
            </div>
          </el-col>
        </el-row>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { _getSensitiveList } from '@/apis/account-system/access/user'
import { usePermission } from '@/hooks/permission/use-permission'
import PermissionList from '@/components/account-system/permission/list.vue'
import t from '@/utils/i18n'

import { IPagination } from '@/views/account-system/type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'

const insertVcUserPermission = usePermission('userApi:insertVcUser') // 创建子用户权限
const insertRolePermission = usePermission('roleApi:insertRole') // 创建角色权限

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const bodyStyle = { height: '100%' }
const sensitiveList = ref<any[]>([])
const loading = ref<boolean>(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

// 跳转创建角色
const toRoleCerate = () => {
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
      title: 'overview.overview',
      path: '/account-system/access/overview',
    },
  })
}

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
      title: 'overview.overview',
      path: '/account-system/access/overview',
    },
  })
}

// 获取敏感操作列表
const getSensitiveList = async () => {
  try {
    loading.value = true
    const res = await _getSensitiveList({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    })

    console.log(`getSensitiveList===>`, res)

    if (res.success) {
      sensitiveList.value = res.data?.list || []

      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  userStore.getUser()
  getSensitiveList()
})
</script>

<style lang="scss" scoped>
.info-l {
  .name {
    width: 227px;
    height: 33px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 24px;
    line-height: 33px;

    // font-weight: 500;
    color: var(--table-text);
  }

  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--common-text);
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--primary-text);
  }
}

.info-r {
  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    color: var(--common-text);
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 36px;
    line-height: 50px;

    // font-weight: 500;
    color: var(--primary-text);
  }
}

.operate {
  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 18px;
    line-height: 25px;

    // font-weight: 500;
    color: var(--table-text);
  }
}

.role {
  /* min-height: 230px; */

  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 18px;
    line-height: 25px;

    // font-weight: 500;
    color: var(--table-text);
  }

  .tip {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--common-text);
  }

  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--primary-text);
  }
}

.h200 {
  height: 200px;
}
</style>
