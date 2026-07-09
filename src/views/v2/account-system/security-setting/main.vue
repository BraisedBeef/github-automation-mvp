<template>
  <div class="security-setting-v2">
    <PageToolbar :title="t('securitySetting.securitySetting')" @doc="openHelpDoc" />

    <InfoNotice :text="t('securitySetting.securitySettingTip')" />

    <section class="security-setting-v2__card">
      <h3 class="security-setting-v2__card-title">
        {{ t('securitySetting.securitySetting') }}
      </h3>
      <div class="security-setting-v2__stack">
        <div class="security-setting-v2__info-row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.securePhone') }}
          </div>
          <div class="security-setting-v2__content">
            <div class="security-setting-v2__content-main">
              <span class="security-setting-v2__primary">
                {{ userDetail.info?.mobile ? fuzzyStr(userDetail.info.mobile, 3) : '' }}
              </span>
              <button class="security-setting-v2__edit" type="button" @click="getModifyMobile">
                <SvgIcon name="edit" />
              </button>
              <span class="security-setting-v2__hint">{{ t('securitySetting.securePhoneMsg') }}</span>
            </div>
          </div>
        </div>

        <div class="security-setting-v2__info-row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.secureEmail') }}
          </div>
          <div class="security-setting-v2__content">
            <div class="security-setting-v2__content-main">
              <span class="security-setting-v2__primary">{{ userDetail.info?.contactEmail || '' }}</span>
              <button class="security-setting-v2__edit" type="button" @click="getEmailMobile">
                <SvgIcon name="edit" />
              </button>
              <span class="security-setting-v2__hint">{{ t('securitySetting.secureEmailMsg') }}</span>
            </div>
          </div>
        </div>

        <div class="security-setting-v2__info-row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.password') }}
          </div>
          <div class="security-setting-v2__content">
            <div class="security-setting-v2__content-main">
              <span class="security-setting-v2__primary">********</span>
              <button class="security-setting-v2__edit" type="button" @click="getModifyPassword">
                <SvgIcon name="edit" />
              </button>
              <span class="security-setting-v2__hint">{{ t('securitySetting.passwordMsg') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="security-setting-v2__card">
      <div class="security-setting-v2__card-heading">
        <h3 class="security-setting-v2__card-title">
          {{ t('securitySetting.accountProtection') }}
        </h3>
        <p class="security-setting-v2__card-desc">
          {{ t('securitySetting.accountProtectionMsg') }}
        </p>
      </div>
      <div class="security-setting-v2__stack">
        <div class="security-setting-v2__switch-row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.loginProtection') }}
          </div>
          <div class="security-setting-v2__switch-content">
            <el-switch :model-value="!!userDetail.info?.loginProtect" :before-change="beforeLoginProtectionChange" />
            <span class="security-setting-v2__switch-text">{{ t('securitySetting.enableEmailVerificationCode') }}</span>
          </div>
        </div>
        <div class="security-setting-v2__switch-row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.operationProtection') }}
          </div>
          <div class="security-setting-v2__switch-content">
            <el-switch
              :model-value="!!userDetail.info?.operateProtect"
              :before-change="beforeOperateProtectionChange"
            />
            <span class="security-setting-v2__switch-text">{{ t('securitySetting.enableEmailVerificationCode') }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="security-setting-v2__card">
      <div class="security-setting-v2__card-heading">
        <h3 class="security-setting-v2__card-title">
          {{ t('securitySetting.remoteLoginProtection') }}
        </h3>
        <p class="security-setting-v2__card-desc">
          {{ t('securitySetting.remoteLoginProtectionMsg') }}
        </p>
      </div>
      <div class="security-setting-v2__stack">
        <div class="security-setting-v2__switch-row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.remoteLoginVerification') }}
          </div>
          <div class="security-setting-v2__switch-content">
            <el-switch
              v-model="value"
              :loading="remoteLoading"
              :active-value="1"
              :inactive-value="0"
              :before-change="getRemoteProtect"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="security-setting-v2__card">
      <div class="security-setting-v2__card-heading">
        <h3 class="security-setting-v2__card-title">
          {{ t('securitySetting.loginStatusManagement') }}
        </h3>
        <p class="security-setting-v2__card-desc">
          {{ t('securitySetting.loginStatusManagementMsg') }}
        </p>
      </div>
      <div class="security-setting-v2__stack">
        <div class="security-setting-v2__info-row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.loginStatus') }}
          </div>
          <div class="security-setting-v2__content">
            <button class="security-setting-v2__link" type="button" @click="getOfflineAll">
              {{ t('securitySetting.offlineAllLoginStatus') }}
            </button>
          </div>
        </div>

        <div class="security-setting-v2__info-row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.maximumIdleTime') }}
          </div>
          <div class="security-setting-v2__content">
            <div class="security-setting-v2__content-main">
              <span class="security-setting-v2__primary"
                >{{ userDetail.info?.keepTime }}{{ t('securitySetting.minute') }}</span
              >
              <button class="security-setting-v2__link" type="button" @click="getKeepTime">
                {{ t('securitySetting.modify') }}
              </button>
              <span class="security-setting-v2__hint">{{ t('securitySetting.maximumIdleTimeDefaultValue') }}</span>
            </div>
          </div>
        </div>

        <div class="security-setting-v2__info-row">
          <div class="security-setting-v2__label">
            {{ t('securitySetting.maximumLoginTime') }}
          </div>
          <div class="security-setting-v2__content">
            <div class="security-setting-v2__content-main">
              <span class="security-setting-v2__primary"
                >{{ userDetail.info?.maxKeepTime }}{{ t('securitySetting.hour') }}</span
              >
              <button class="security-setting-v2__link" type="button" @click="getMaxKeepTime">
                {{ t('securitySetting.modify') }}
              </button>
              <span class="security-setting-v2__hint">{{ t('securitySetting.maximumLoginTimeDefaultValue') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <modifyMobile
      ref="modifyMobileRef"
      :uid="userDetail.info.id"
      :phone="userDetail.info?.mobile"
      :callback="getUserInfo"
    />
    <modifyEmail
      ref="modifyEmailRef"
      :uid="userDetail.info.id"
      :email="userDetail.info.contactEmail"
      :callback="getUserInfo"
    />
    <modifyPassword
      ref="modifyPasswordRef"
      :uid="userDetail.info.id"
      :email="userDetail.info.contactEmail"
      :callback="getUserInfo"
    />
    <loginProtection ref="loginProtectionRef" :uid="userDetail.info.id" :callback="getUserInfo" />
    <operateProtect ref="operateProtectionRef" :uid="userDetail.info.id" :callback="getUserInfo" />
    <offlineAll ref="offlineAllRef" />
    <keepTime ref="keepTimeRef" :callback="getUserInfo" />
    <maxKeepTime ref="maxKeepTimeRef" :callback="getUserInfo" />
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { _getDetail } from '@/apis/account-system/user'
import { _updateSecuritySetting } from '@/apis/account-system/access/user'
import { fuzzyStr } from '@/utils/string-utils'
import t from '@/utils/i18n'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'
import modifyMobile from '@/views/account-system/security-setting/components/modify-mobile.vue'
import modifyEmail from '@/views/account-system/security-setting/components/modify-email.vue'
import modifyPassword from '@/views/account-system/account/main-info/components/modify-pwd-dialog.vue'
import loginProtection from '@/views/account-system/security-setting/components/login-protection.vue'
import operateProtect from '@/views/account-system/security-setting/components/operate-protect.vue'
import offlineAll from '@/views/account-system/security-setting/components/offline-all.vue'
import keepTime from '@/views/account-system/security-setting/components/keep-time.vue'
import maxKeepTime from '@/views/account-system/security-setting/components/max-keep-time.vue'

interface UserInfoType {
  mobile?: string
  contactEmail?: string
  loginProtect?: number
  operateProtect?: number
  remoteProtect?: boolean
  keepTime?: number
  maxKeepTime?: number
  id?: number
}

const value = ref<number>(0)
const remoteLoading = ref<boolean>(false)
const modifyMobileRef = ref<any>()
const modifyEmailRef = ref<any>()
const modifyPasswordRef = ref<any>()
const loginProtectionRef = ref<any>()
const operateProtectionRef = ref<any>()
const offlineAllRef = ref<any>()
const keepTimeRef = ref<any>()
const maxKeepTimeRef = ref<any>()
const userDetail = reactive<{
  info: UserInfoType
}>({
  info: {},
})

const getUserInfo = async () => {
  const { data: res } = await _getDetail()
  userDetail.info = res
  value.value = res.remoteProtect
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const getModifyMobile = () => {
  modifyMobileRef.value?.showDialog()
}

const getEmailMobile = () => {
  modifyEmailRef.value?.showDialog()
}

const getModifyPassword = () => {
  if (modifyPasswordRef.value) {
    modifyPasswordRef.value.show = true
  }
}

const getLoginProtection = () => {
  loginProtectionRef.value?.showDialog(userDetail.info?.loginProtect || 0)
}

const getOperateProtect = () => {
  operateProtectionRef.value?.showDialog(userDetail.info?.operateProtect || 0)
}

const beforeLoginProtectionChange = async () => {
  getLoginProtection()
  return false
}

const beforeOperateProtectionChange = async () => {
  getOperateProtect()
  return false
}

const getRemoteProtect = async () => {
  const params = {
    uid: userDetail.info.id as number,
    remoteProtect: value.value ? 0 : 1,
  }
  remoteLoading.value = true
  const res = await _updateSecuritySetting(params)
  remoteLoading.value = false
  if (res.code === 10000) {
    return true
  }
  return false
}

const getOfflineAll = () => {
  offlineAllRef.value?.showDialog()
}

const getKeepTime = () => {
  keepTimeRef.value?.showDialog(userDetail.info?.keepTime || 0)
}

const getMaxKeepTime = () => {
  maxKeepTimeRef.value?.showDialog(userDetail.info?.maxKeepTime || 0)
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
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;
}

.security-setting-v2__card-heading {
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

.security-setting-v2__card-desc {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.security-setting-v2__stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-setting-v2__info-row,
.security-setting-v2__switch-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.security-setting-v2__label {
  flex: 0 0 96px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.security-setting-v2__content,
.security-setting-v2__switch-content {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.security-setting-v2__switch-text {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.security-setting-v2__content-main {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}

.security-setting-v2__primary {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.security-setting-v2__primary--danger {
  color: #e54839;
}

.security-setting-v2__hint {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.security-setting-v2__edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  color: #8a93a6;
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

.security-setting-v2__switch-content {
  gap: 8px;
}

.security-setting-v2__link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

:deep(.el-switch) {
  --el-switch-on-color: #06f;
  --el-switch-off-color: #bbc0ca;
}

@media (width <= 768px) {
  .security-setting-v2 {
    padding: 12px;
  }

  .security-setting-v2__info-row,
  .security-setting-v2__switch-row {
    flex-wrap: wrap;
  }

  .security-setting-v2__label {
    flex-basis: 100%;
  }
}
</style>
