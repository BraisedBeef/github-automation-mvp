<template>
  <div class="security-setting-v2">
    <PageToolbar :title="t('securitySetting.securitySetting')" @doc="openHelpDoc" />

    <InfoNotice
      :prefix="noticePrefix"
      :action-text="t('securitySetting.securitySettingTipLink')"
      :suffix="t('securitySetting.securitySettingTipTwo')"
      @action="goAccessManage"
    />

    <section class="security-setting-v2__card">
      <h3 class="security-setting-v2__card-title">
        {{ t('securitySetting.basicInformation') }}
      </h3>
      <div class="security-setting-v2__list">
        <div class="security-setting-v2__row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.secureEmail') }}
          </div>
          <div class="security-setting-v2__meta">
            <div class="security-setting-v2__value">
              {{ t('securitySetting.secureEmailMsg') }}
            </div>
            <div v-if="userDetail.info?.contactEmail" class="security-setting-v2__extra">
              {{ userDetail.info.contactEmail }}
            </div>
          </div>
        </div>
        <div class="security-setting-v2__row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.securePhone') }}
          </div>
          <div class="security-setting-v2__meta">
            <div class="security-setting-v2__value">
              {{ t('securitySetting.securePhoneMsg') }}
            </div>
            <div v-if="mobileText" class="security-setting-v2__extra">
              {{ mobileText }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="security-setting-v2__card">
      <div class="security-setting-v2__heading">
        <h3 class="security-setting-v2__card-title">
          {{ t('securitySetting.accountProtection') }}
        </h3>
        <p class="security-setting-v2__description">
          {{ t('securitySetting.accountProtectionMsg') }}
        </p>
      </div>
      <div class="security-setting-v2__list">
        <div class="security-setting-v2__row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.loginProtection') }}
          </div>
          <div
            :class="[
              'security-setting-v2__value',
              { 'security-setting-v2__value--danger': !userDetail.info?.loginProtect },
            ]"
          >
            {{
              userDetail.info?.loginProtect
                ? t('securitySetting.openLoginProtection')
                : t('securitySetting.closeLoginProtection')
            }}
          </div>
        </div>
        <div class="security-setting-v2__row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.operationProtection') }}
          </div>
          <div class="security-setting-v2__value">
            {{
              userDetail.info?.operateProtect
                ? t('securitySetting.openOperationProtection')
                : t('securitySetting.closeOperationProtection')
            }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { _getDetail } from '@/apis/account-system/user'
import { fuzzyStr } from '@/utils/string-utils'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'

interface UserInfoType {
  mobile?: string
  contactEmail?: string
  loginProtect?: number
  operateProtect?: number
}

const userDetail = reactive<{
  info: UserInfoType
}>({
  info: {},
})

const noticePrefix = computed(() => {
  const tip = t('securitySetting.securitySettingTipOne')
  const link = t('securitySetting.securitySettingTipLink')
  const [prefix = tip] = tip.split(link)

  return prefix.trimEnd()
})

const mobileText = computed(() => {
  return userDetail.info?.mobile ? fuzzyStr(userDetail.info.mobile, 3) : ''
})

const getUserInfo = async () => {
  const { data: res } = await _getDetail()
  userDetail.info = res
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const goAccessManage = () => {
  pushRoute({
    name: 'access_overview',
  })
}

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped lang="scss">
.security-setting-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.security-setting-v2__card {
  background: #fff;
}

.security-setting-v2__card {
  padding: 20px;
}

.security-setting-v2__heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.security-setting-v2__card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.security-setting-v2__description {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.security-setting-v2__list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.security-setting-v2__row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.security-setting-v2__label {
  flex: 0 0 56px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.security-setting-v2__value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.security-setting-v2__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
}

.security-setting-v2__extra {
  font-size: 14px;
  line-height: 22px;
  color: #4e5969;
}

.security-setting-v2__value--danger {
  color: #e54839;
}

@media (width <= 768px) {
  .security-setting-v2 {
    gap: 12px;
    padding: 12px;
  }

  .security-setting-v2__row {
    flex-direction: column;
    gap: 6px;
  }

  .security-setting-v2__label {
    flex-basis: auto;
  }
}
</style>
