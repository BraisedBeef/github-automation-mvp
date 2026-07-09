<template>
  <el-row class="expand-wrap">
    <!-- 主账户 子用户类型-可访问资源并接收消息 -->
    <el-col :span="8">
      <div class="df ac h-full">
        <div class="info w-full pdr20 pdl20">
          <!-- line -->
          <div class="line" />
          <!-- 消息订阅 -->
          <el-row class="mb20">
            <el-col :span="12" class="pdl20">
              <span class="key">{{ t('user.subscribe') }}</span>
            </el-col>
            <el-col :span="12" class="pdl20">
              <template v-if="row.subscribe">
                <div class="text-over">
                  <span v-for="(item, index) in row.subscribe.split(',')" :key="item" class="value w-full">
                    <span>{{ SUBSCRIBE_MAP[item] }}</span
                    ><span class="ml4 mr4">{{ index + 1 !== row.subscribe.split(',').length ? ',' : '' }}</span>
                  </span>
                </div>
              </template>
              <template v-else>
                <span class="value">-</span>
              </template>
            </el-col>
          </el-row>
          <!-- 备注 -->
          <el-row>
            <el-col :span="12" class="pdl20">
              <span class="key">{{ t('user.remark') }}</span>
            </el-col>
            <el-col :span="12" class="pdl20 text-over">
              <span class="value">{{ row.remark || '-' }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-col>
    <el-col :span="8">
      <div class="df ac h-full">
        <div class="info w-full pdr20 pdl20">
          <!-- line -->
          <div class="line" />
          <!-- 登录保护 -->
          <el-row class="mb20">
            <el-col :span="12" class="pdl20">
              <span class="key">{{ t('overview.loginProtect') }}</span>
            </el-col>
            <el-col :span="12" class="pdl20">
              <span v-if="row.loginProtect == 1" class="value text-success">{{
                t('securitySetting.openLoginProtection')
              }}</span>
              <span v-else class="value text-error">{{ t('securitySetting.closeLoginProtection') }}</span>
            </el-col>
          </el-row>
          <!-- 操作保护 -->
          <el-row>
            <el-col :span="12" class="pdl20">
              <span class="key">{{ t('overview.operateProtect') }}</span>
            </el-col>
            <el-col :span="12" class="pdl20">
              <span v-if="row.operateProtect == 1" class="value text-success">{{
                t('securitySetting.openLoginProtection')
              }}</span>
              <span v-else class="value text-error">{{ t('securitySetting.closeLoginProtection') }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-col>
    <el-col :span="8">
      <div class="df ac h-full">
        <div class="info w-full pdr20 pdl20">
          <!-- 控制台访问 -->
          <el-row class="mb20 mt20">
            <el-col :span="12" class="pdl20">
              <span class="key">{{ t('user.access') }}</span>
            </el-col>
            <el-col :span="12" class="pdl20">
              <span v-if="row.accessMethod == 1" class="value text-success">{{ t('common.start') }}</span>
              <span v-else class="value text-error">{{ t('user.close') }}</span>
            </el-col>
          </el-row>
          <!-- 查看用户详情 -->
          <el-row>
            <el-col :span="12" class="pdl20">
              <span class="text-primary cursor-pointer" @click="toDetail(row)"
                >{{ t('user.userDetail') }}
                <SvgIcon style="margin-left: 10px" name="share" />
              </span>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

import { SUBSCRIBE_MAP } from '@/views/account-system/config'
import { pushRoute } from '@/utils/router-jump'

const props = withDefaults(
  defineProps<{
    row: any
  }>(),
  { row: () => {} },
)

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
</script>

<style lang="scss" scoped>
.expand-wrap {
  min-height: 100px;
  padding-left: 80px;

  .pdl20 {
    padding-left: 20px;
  }

  .pdr20 {
    padding-right: 20px;
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
    color: var(--table-text);
  }

  .border-r-1 {
    border-right: 1px solid var(--border-c);
  }

  .info {
    position: relative;

    .line {
      position: absolute;
      top: 50%;
      right: 0;
      width: 1px;
      height: 60px;
      background-color: var(--border-c);
      transform: translateY(-30px);
    }
  }
}
</style>
