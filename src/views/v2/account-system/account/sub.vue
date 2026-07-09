<template>
  <div class="account-sub-v2">
    <PageToolbar :title="t('accountSystemRoutes.account')" @doc="openHelpDoc" />

    <section class="account-sub-v2__card">
      <h3 class="account-sub-v2__title">
        {{ t('account.basicInfo') }}
      </h3>
      <div class="account-sub-v2__list">
        <div class="account-sub-v2__row">
          <span class="account-sub-v2__label">{{ t('account.accountID') }}</span>
          <div class="account-sub-v2__value-wrap">
            <span class="account-sub-v2__value">{{ user.id || '-' }}</span>
            <button class="account-sub-v2__icon-btn" type="button" @click="handleCopy(user.id)">
              <SvgIcon name="copy" />
            </button>
          </div>
        </div>
        <div class="account-sub-v2__row">
          <span class="account-sub-v2__label">APP ID</span>
          <div class="account-sub-v2__value-wrap">
            <span class="account-sub-v2__value">{{ user.appId || '-' }}</span>
            <button class="account-sub-v2__icon-btn" type="button" @click="handleCopy(user.appId)">
              <SvgIcon name="copy" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="account-sub-v2__card">
      <h3 class="account-sub-v2__title">
        {{ t('account.accountPerm') }}
      </h3>
      <div class="account-sub-v2__list">
        <div class="account-sub-v2__row">
          <span class="account-sub-v2__label">{{ t('account.accountIdentity') }}</span>
          <span class="account-sub-v2__value">{{ t('account.subuser') }}</span>
        </div>
        <div class="account-sub-v2__row">
          <span class="account-sub-v2__label">{{ t('account.mainAccountBelongs') }}</span>
          <span class="account-sub-v2__value">{{ user.parentId || '-' }}</span>
        </div>
      </div>
    </section>

    <section class="account-sub-v2__card">
      <h3 class="account-sub-v2__title">
        {{ t('account.mainAccount') }}
      </h3>
      <div class="account-sub-v2__list">
        <div class="account-sub-v2__row">
          <span class="account-sub-v2__label">{{ t('account.name') }}</span>
          <span class="account-sub-v2__value">{{ user.mainAccountName || '-' }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'
import { backRoute, forwardRoute } from '@/utils/router-jump'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const handleCopy = async (value: string) => {
  await handleCopyValue(value)
  message.success(t('domainSet2.copySuccess'))
}

onMounted(() => {
  userStore.getUser()
})
</script>

<style scoped lang="scss">
.account-sub-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.account-sub-v2__toolbar,
.account-sub-v2__card {
  background: #fff;
}

.account-sub-v2__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 0 16px;
}

.account-sub-v2__toolbar-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.toolbar-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: #b7c0cd;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:hover {
    color: #06f;
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.toolbar-nav-btn--forward {
  transform: rotate(180deg);
}

.account-sub-v2__divider {
  width: 1px;
  height: 18px;
  background: #dcdfe6;
}

.account-sub-v2__page-title {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.account-sub-v2__doc {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.account-sub-v2__card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
}

.account-sub-v2__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.account-sub-v2__list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.account-sub-v2__row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.account-sub-v2__label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.account-sub-v2__value-wrap {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.account-sub-v2__value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-all;
}

.account-sub-v2__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #828b9c;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:hover {
    color: #06f;
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

@media (width <= 900px) {
  .account-sub-v2__toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .account-sub-v2__row {
    flex-wrap: wrap;
  }
}
</style>
