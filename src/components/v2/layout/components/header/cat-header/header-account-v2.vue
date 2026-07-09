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
import { useUserStore } from '@/store'
import t from '@/utils/i18n'
import { handleCopyValue } from '@/utils/dom-utils'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'

const userStore = useUserStore()
const options = [
  { label: t('accountSystemRoutes.account'), value: 'account_system_account', icon: 'account-user-outlined' },
  {
    label: t('accountSystemRoutes.securitySet'),
    value: 'account_system_security_setting',
    icon: 'account-fileprotect-outlined',
  },
  { label: t('accountSystemRoutes.access'), value: 'access_overview', icon: 'account-link-outlined' },
  { label: t('accountSystemRoutes.news'), value: 'news_subscribe', icon: 'account-message-outlined' },
]

const handleClick = (name: string) => {
  pushRoute({ name })
}

const handleImg = () => {
  handleClick('account_system_account')
}

const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}

const logout = () => {
  userStore.logOut()
}
</script>

<style scoped lang="scss">
.header-account {
  display: flex;
  align-items: center;
  height: 56px;
}

.header-account-img {
  cursor: pointer;
  border: 1px solid #eef1f6;
}

.drop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  .header-account-svg,
  img {
    width: 32px;
    height: 32px;
  }
}
</style>
