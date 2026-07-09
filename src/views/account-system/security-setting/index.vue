<template>
  <div>
    <Tip
      :text="
        userStore.user.accountType == 1
          ? [{ main: t('securitySetting.securitySettingTip') }]
          : [{ main: t('securitySetting.securitySettingTipOne') }]
      "
      type="OneToOne"
    />
    <el-space direction="vertical" :size="20" class="w-full" :fill="true">
      <!-- 基本信息 -->
      <!-- <div class="page-alert">
        <el-icon size="16" class="page-alert_icon"><Warning /></el-icon>
        <span class="ml5" v-if="userStore.user.accountType == 1">{{ t('securitySetting.securitySettingTip') }}</span>
        <span class="ml5" v-else
          >{{ t('securitySetting.securitySettingTipOne')
          }}<el-button type="text" style="padding: 0 !important">
            {{ t('securitySetting.securitySettingTipLink') }} </el-button
          >{{ t('securitySetting.securitySettingTipTwo') }}</span
        >
      </div> -->
      <el-card shadow="never" class="page-box basic-info h160" :body-style="bodyStyle">
        <el-row class="mb20">
          <el-col>
            <span class="title">{{ t('securitySetting.basicInformation') }}</span>
          </el-col>
        </el-row>
        <el-divider />
        <div class="mb20">
          <span class="key mr40">{{ t('securitySetting.secureEmail') }}</span>
          <span class="msg mr40">{{ t('securitySetting.secureEmailMsg') }}</span>
          <span class="value">
            <span class="mr10">{{ userDetail.info?.contactEmail || '' }}</span>
            <el-icon v-if="userStore.user.accountType == 1" @click="getEmailMobile">
              <EditPen />
            </el-icon>
          </span>
        </div>
        <div class="mb20">
          <span class="key mr40">{{ t('securitySetting.securePhone') }}</span>
          <span class="msg mr40">{{ t('securitySetting.securePhoneMsg') }}</span>
          <span class="value">
            <span class="mr10">{{ userDetail.info?.mobile ? fuzzyStr(userDetail.info.mobile, 3) : '' }}</span>
            <el-icon v-if="userStore.user.accountType == 1" @click="getModifyMobile">
              <EditPen />
            </el-icon>
          </span>
        </div>
        <div v-if="userStore.user.accountType == 1" class="mb20">
          <span class="key mr40">{{ t('securitySetting.password') }}</span>
          <span class="msg mr40">{{ t('securitySetting.passwordMsg') }}</span>
          <span class="value">
            <span class="mr10">********</span>
            <el-icon @click="getModifyPassword">
              <EditPen />
            </el-icon>
          </span>
        </div>
      </el-card>
      <el-row justify="space-between" :gutter="20">
        <el-col :span="12">
          <el-card
            shadow="never"
            :class="`page-box basic-info h200 ${userStore.user.accountType == 1 ? 'card-item' : 'card-item-one'}`"
            :body-style="bodyStyle"
          >
            <el-row class="mb20">
              <el-col>
                <span class="title">{{ t('securitySetting.accountProtection') }}</span>
              </el-col>
            </el-row>
            <el-row class="mb20">
              <el-col>
                <span class="info">{{ t('securitySetting.accountProtectionMsg') }}</span>
              </el-col>
            </el-row>
            <div class="mb20">
              <span class="key mr40">{{ t('securitySetting.loginProtection') }}</span>
              <span :class="`mr10 ${!!userDetail.info?.loginProtect ? 'success-info' : 'error-info'}`">
                {{
                  !!userDetail.info?.loginProtect
                    ? t('securitySetting.openLoginProtection')
                    : t('securitySetting.closeLoginProtection')
                }}
              </span>
              <el-icon v-if="userStore.user.accountType == 1" @click="getLoginProtection">
                <EditPen />
              </el-icon>
            </div>
            <div class="mb20">
              <span class="key mr40">{{ t('securitySetting.operationProtection') }}</span>
              <span :class="`mr10 ${!!userDetail.info?.operateProtect ? 'success-info' : 'error-info'}`">
                {{
                  !!userDetail.info?.operateProtect
                    ? t('securitySetting.openOperationProtection')
                    : t('securitySetting.closeOperationProtection')
                }}
              </span>
              <el-icon v-if="userStore.user.accountType == 1" @click="getOperateProtect">
                <EditPen />
              </el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card
            v-if="userStore.user.accountType == 1"
            shadow="never"
            class="page-box basic-info h200 card-item"
            :body-style="bodyStyle"
          >
            <el-row class="mb20">
              <el-col>
                <span class="title">{{ t('securitySetting.remoteLoginProtection') }}</span>
              </el-col>
            </el-row>
            <el-row class="mb20">
              <el-col>
                <span class="info">{{ t('securitySetting.remoteLoginProtectionMsg') }}</span>
              </el-col>
            </el-row>
            <div class="mb20">
              <span class="key mr40">{{ t('securitySetting.remoteLoginVerification') }}</span>
              <el-switch
                v-model="value"
                :loading="remoteLoading"
                :active-value="1"
                :inactive-value="0"
                :before-change="getRemoteProtect"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row v-if="userStore.user.accountType == 1" justify="space-between" :gutter="20">
        <el-col :span="12">
          <el-card shadow="never" class="page-box basic-info h180 card-item" :body-style="bodyStyle">
            <el-row class="mb20">
              <el-col>
                <span class="title">{{ t('securitySetting.loginStatusManagement') }}</span>
              </el-col>
            </el-row>
            <el-row class="mb20">
              <el-col>
                <span class="info">{{ t('securitySetting.loginStatusManagementMsg') }}</span>
              </el-col>
            </el-row>
            <div class="mb20 flex-box">
              <span class="key mr40">{{ t('securitySetting.loginStatus') }}</span>
              <el-button type="primary" link class="primary_link-button" @click="getOfflineAll">
                {{ t('securitySetting.offlineAllLoginStatus') }}
              </el-button>
            </div>
            <div class="mb20 flex-box">
              <span class="key mr40">{{ t('securitySetting.maximumIdleTime') }}</span>
              <span class="value">{{ userDetail.info?.keepTime }}{{ t('securitySetting.minute') }}</span>
              <el-button type="primary" link class="primary_link-button" @click="getKeepTime">
                {{ t('securitySetting.modify') }}
              </el-button>
              <span class="key">{{ t('securitySetting.maximumIdleTimeDefaultValue') }}</span>
            </div>
            <div class="mb20 flex-box">
              <span class="key mr40">{{ t('securitySetting.maximumLoginTime') }}</span>
              <span class="value">{{ userDetail.info?.maxKeepTime }}{{ t('securitySetting.hour') }}</span>
              <el-button type="primary" link class="primary_link-button" @click="getMaxKeepTime">
                {{ t('securitySetting.modify') }}
              </el-button>
              <span class="key">{{ t('securitySetting.maximumLoginTimeDefaultValue') }}</span>
            </div>
          </el-card>
        </el-col>
        <!--   第二期需求 第一期不上  -->
        <!-- <el-card shadow="never" class="page-box basic-info h200 card-item" :body-style="bodyStyle">
          <el-row class="mb20">
            <el-col><span class="title">{{ t("securitySetting.accountCancellation") }}</span></el-col>
          </el-row>
          <el-row class="mb20">
            <el-col><span class="info">{{ t("securitySetting.accountCancellationMsg") }}</span></el-col>
          </el-row>
          <div class="mb20">
            <span class="key mr40">{{ t("securitySetting.cancellationAccount") }}</span>
            <span class="button primary" @click="getLoginout">{{ t("securitySetting.loginout") }}</span>
          </div>
        </el-card> -->
        <!-- 修改手机号 -->
        <modifyMobile
          ref="modifyMobileRef"
          :uid="userDetail.info.id"
          :phone="userDetail.info?.mobile"
          :callback="getUserInfo"
        />
        <!-- 修改邮箱 -->
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
        <!-- 最大空闲时间 -->
        <keepTime ref="keepTimeRef" :callback="getUserInfo" />
        <!-- 最大登录时间 -->
        <maxKeepTime ref="maxKeepTimeRef" :callback="getUserInfo" />
      </el-row>
    </el-space>
  </div>
</template>
<script setup lang="ts">
import { EditPen, Warning } from '@element-plus/icons-vue'
import { _getDetail } from '@/apis/account-system/user'
import { _updateSecuritySetting } from '@/apis/account-system/access/user'
import { fuzzyStr } from '@/utils/string-utils'
import t from '@/utils/i18n'
import modifyMobile from './components/modify-mobile.vue'
import modifyEmail from './components/modify-email.vue'
// import modifyPassword from './components/modify-password.vue';
import modifyPassword from '@/views/account-system/account/main-info/components/modify-pwd-dialog.vue'
import loginProtection from './components/login-protection.vue'
import operateProtect from './components/operate-protect.vue'
import offlineAll from './components/offline-all.vue'
import keepTime from './components/keep-time.vue'
import maxKeepTime from './components/max-keep-time.vue'
import { useUserStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

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

const userStore = useUserStore()
const router = useRouter()
const bodyStyle = { height: '100%' }
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
  console.log('res', res)
  userDetail.info = res
  value.value = res.remoteProtect
}

const getModifyMobile = () => {
  modifyMobileRef.value?.showDialog()
}

const getEmailMobile = () => {
  modifyEmailRef.value?.showDialog()
}

const getModifyPassword = () => {
  // modifyPasswordRef.value?.showDialog()
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

const getLoginout = () => {
  pushRoute({
    name: 'account_system_security_setting_logout',
  })
}

onMounted(() => {
  getUserInfo()
})
</script>
<style lang="scss" scoped>
.page-alert {
  display: flex;
  align-items: flex-start;
  padding-left: 14px;
  line-height: 34px;
  color: #394aff;
  background: #e5e8ff;
}

.page-alert_icon {
  position: relative;
  top: 9px;
}

.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 18px;
  line-height: 25px;

  // font-weight: 500;
  color: var(--table-text);
}

.flex-box {
  display: flex;
  align-items: center;
}

.key,
.msg {
  color: var(--common-text);
}

.value {
  color: var(--primary-text);
}

.info {
  color: var(--sub-text);
}

.mr40 {
  margin-right: 40px;
}

.mr10 {
  margin-right: 10px;
}

.ml5 {
  margin-left: 5px;
}

.mr20 {
  margin-right: 20px;
}

.h200 {
  height: 200px;
}

.card-box {
  display: flex;
  justify-content: space-between;

  /* .card-item {
    width: 48%;
  } */

  /* .card-item-one {
    width: 100%;
  } */
}

.button {
  cursor: pointer;
}

.primary {
  color: var(--primary-color);
}

.success-info {
  color: var(--success-color);
}

.error-info {
  color: var(--error-color);
}

:deep(.primary_link-button) {
  background: #fff !important;
  border-color: #fff !important;
}
</style>
