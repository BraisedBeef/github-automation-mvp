<template>
  <div class="header-account">
    <el-dropdown trigger="hover" popper-class="account-dropdown" placement="bottom-end" :teleported="false">
      <div class="drop">
        <el-avatar
          v-if="userStore.user.headImg"
          :src="userStore.user.headImg"
          :size="30"
          class="header-account-img"
          @click.stop="handleImg"
        />
        <SvgIcon v-else pointer name="cat-header-account" class="header-account-svg" />
      </div>
      <template #dropdown>
        <div class="header-account-info">
          <div class="username">
            <div class="name text-over" :title="userStore.user.userName || '-'">
              {{ userStore.user.userName || '-' }}
            </div>
            <SvgIcon pointer name="dns-copy" @click.stop="handleCopy(userStore.user.userName)" />
            <div class="user-type">
              {{ userStore.user.accountType === 1 ? t('overview.mainUser') : t('overview.subUser') }}
            </div>
          </div>
          <div class="id">
            <span class="la">{{ t('common.accountId') }}</span>
            <span class="i text-over">{{ userStore.user.id }}</span>
            <SvgIcon name="dns-copy" pointer @click="handleCopy(userStore.user.id)" />
          </div>
        </div>
        <div
          v-for="item in options"
          :key="item.label"
          :command="item.value"
          class="dropdown-menu-box"
          @click="handleClick(item.value)"
        >
          <SvgIcon :name="item.icon" />
          <div>{{ item.label }}</div>
        </div>
        <div class="header-account-logout" @click="logout">
          {{ t('common.logout') }}
        </div>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useBaseStore, useUserStore } from '@/store'
import t from '@/utils/i18n'
import { HeaderItem } from './header-sites.vue'
import { handleCopyValue } from '@/utils/dom-utils'
import { message } from '@/utils/message'

import { pushRoute } from '@/utils/router-jump'

const userStore = useUserStore()
const options = [
  { label: t('accountSystemRoutes.account'), value: 'account_system_account', icon: 'account-user-outlined' }, // 账号信息
  {
    label: t('accountSystemRoutes.securitySet'),
    value: 'account_system_security_setting',
    icon: 'account-fileprotect-outlined',
  }, // 安全设置
  { label: t('accountSystemRoutes.access'), value: 'access_overview', icon: 'account-link-outlined' }, // 访问管理
  { label: t('accountSystemRoutes.news'), value: 'news_subscribe', icon: 'account-message-outlined' }, // 消息订阅
]

const handleClick = (name: string) => {
  // useBaseStore().routeModel = '/user'
  // useBaseStore().selectedKeys = name;
  pushRoute({
    name: name,
  })
}

const handleImg = () => {
  handleClick('account_system_account')
}

const handleCopy = async v => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}

const logout = () => {
  userStore.logOut()
}
</script>

<style scoped lang="scss">
.header-account {
  width: 100%;
  height: 100%;
}

.header-account-img {
  cursor: pointer;
}

.drop {
  .header-account-svg {
    width: 30px;
    height: 30px;
  }

  img {
    width: 30px;
    height: 30px;
  }
}
</style>

<style lang="scss">
.el-popper.is-light.account-dropdown {
  top: calc(var(--header-h) - 1px) !important;
  right: 20px !important;
  width: 300px !important;

  .header-account-info {
    margin-bottom: 16px;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-text);
    word-break: break-all;

    /* padding: 0 8px; */

    svg {
      width: 12px;
      height: 12px;
    }

    .username {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      padding: 20px 20px 0;

      .name {
        flex: 1;
        flex-shrink: 0;
        font-family: 'PingFang SC', 'PingFang SC';
        font-size: 16px;

        // font-weight: 400;
        font-weight: bold;
        line-height: 22px;
        color: #000;

        // max-width: 114px;
      }

      svg {
        width: 14px;
        height: 14px;
        margin-right: 8px;
        margin-left: 8px;
        color: #999;
      }

      .user-type {
        display: inline-block;
        flex-shrink: 0;
        height: 20px;
        padding: 0 8px;
        font-family: 'PingFang SC', 'PingFang SC';
        font-size: 12px;
        font-weight: bold;
        line-height: 20px;
        color: var(--active-text);
        background-color: #e3edff;
        border-radius: 4px;
      }
    }

    .id {
      display: flex;
      align-items: center;
      padding: 12px 20px 20px;
      font-family: 'PingFang SC', 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #000;
      border-bottom: 1px solid #eee;

      .la {
        margin-right: 8px;
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }

      .i {
        flex-shrink: 0;
        max-width: 160px;
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }

      svg {
        width: 14px;
        height: 14px;
        margin-left: 8px;
        color: #999;
      }
    }
  }

  .dropdown-menu-box {
    display: flex;
    align-items: center;
    height: var(--input-height);
    padding: 0 12px;
    margin: 0 8px 8px !important;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-text);
    cursor: pointer;

    svg {
      width: 20px;
      height: 20px;
      margin-right: 8px;
      color: #666;
    }

    &:hover {
      color: var(--primary-color);
      background-color: var(--selected-bgc);

      svg {
        color: var(--primary-color);
      }
    }
  }

  .header-account-logout {
    display: flex;
    align-items: center;
    width: 100%;
    height: 60px;
    padding-left: 20px;
    margin-top: 16px;
    font-family: 'PingFang SC-Regular', 'PingFang SC';

    // justify-content: center;
    font-size: 14px;
    font-weight: 400;
    color: #000;
    cursor: pointer;
    border-top: 1px solid #eee;

    &:hover {
      // font-weight: 500;
    }
  }
}
</style>
