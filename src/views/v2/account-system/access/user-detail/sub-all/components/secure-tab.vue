<template>
  <section class="user-detail-secure-tab">
    <div class="user-detail-secure-tab__card">
      <h3 class="user-detail-secure-tab__title">
        {{ t('user.consoleLoginSet') }}
      </h3>

      <div class="user-detail-secure-tab__stack">
        <div class="user-detail-secure-tab__row">
          <div class="user-detail-secure-tab__label">
            {{ t('user.access') }}
          </div>
          <div class="user-detail-secure-tab__content">
            <el-switch :model-value="detail.accessMethod == 1" :before-change="beforeAccessMethodChange" />
          </div>
        </div>

        <div class="user-detail-secure-tab__row">
          <div class="user-detail-secure-tab__label">
            {{ t('user.loginPwd') }}
          </div>
          <div class="user-detail-secure-tab__content">
            <span class="user-detail-secure-tab__text">{{ t('user.using') }}</span>
            <button type="button" class="user-detail-secure-tab__link" @click="openPwdDialog">
              {{ t('user.resetPwd') }}
            </button>
          </div>
        </div>

        <div class="user-detail-secure-tab__row">
          <div class="user-detail-secure-tab__label">
            {{ t('user.nextPwd') }}
          </div>
          <div class="user-detail-secure-tab__content">
            <el-switch :model-value="detail.resetPassword == 1" :before-change="beforeResetPasswordChange" />
            <span class="user-detail-secure-tab__switch-text">
              {{ t('user.nextResetPwdDesc') }}
            </span>
          </div>
        </div>

        <div class="user-detail-secure-tab__row">
          <div class="user-detail-secure-tab__label">
            <span>{{ t('user.lastLoginInfo') }}</span>
          </div>
          <div class="user-detail-secure-tab__content">
            <span class="user-detail-secure-tab__text">
              {{ detail.lastLoginTime ? maoYunDayJs(detail.lastLoginTime).format(FORMAT_TIME) : '-' }}
              <template v-if="detail.lastLoginIp">（{{ detail.lastLoginIp }}）</template>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="user-detail-secure-tab__card">
      <h3 class="user-detail-secure-tab__title">
        {{ t('securitySetting.securitySetting') }}
      </h3>

      <div class="user-detail-secure-tab__stack">
        <div class="user-detail-secure-tab__row">
          <div class="user-detail-secure-tab__label">
            {{ t('overview.loginProtect') }}
          </div>
          <div class="user-detail-secure-tab__content">
            <el-switch :model-value="detail.loginProtect == 1" :before-change="beforeLoginProtectionChange" />
            <span class="user-detail-secure-tab__switch-text">{{
              t('securitySetting.enableEmailVerificationCode')
            }}</span>
          </div>
        </div>

        <div class="user-detail-secure-tab__row">
          <div class="user-detail-secure-tab__label">
            {{ t('overview.operateProtect') }}
          </div>
          <div class="user-detail-secure-tab__content">
            <el-switch :model-value="detail.operateProtect == 1" :before-change="beforeOperateProtectionChange" />
            <span class="user-detail-secure-tab__switch-text">{{
              t('securitySetting.enableEmailVerificationCode')
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <CatDialog
      v-model:dialog="pwd.show"
      class="user-detail-secure-tab__dialog"
      :title="t('user.resetPwd')"
      width="620px"
      destroy-on-close
      :loading="pwd.loading"
      @confirm="confirmHandlePwd"
      @update:dialog="pwd.value = ''"
    >
      <div class="user-detail-secure-tab__pwd-type">
        <span class="user-detail-secure-tab__dialog-label">{{ t('user.accessPwd') }}</span>
        <el-radio-group v-model="pwd.check" @change="handlePwdType">
          <el-radio :label="1">
            {{ t('user.accessPwdMethod1') }}
          </el-radio>
          <el-radio :label="2">
            {{ t('user.accessPwdMethod2') }}
          </el-radio>
          <el-radio :label="3">
            {{ t('user.accessPwdMethod3') }}
          </el-radio>
        </el-radio-group>
      </div>

      <div v-if="pwd.check !== 1" class="user-detail-secure-tab__pwd-input">
        <el-input v-model.trim="pwd.value" show-password autocomplete="off" />
      </div>
    </CatDialog>

    <loginProtection ref="loginProtectionRef" :uid="detail.id" :callback="handleRefresh" />
    <operateProtect ref="operateProtectionRef" :uid="detail.id" :callback="handleRefresh" />
  </section>
</template>

<script setup lang="ts">
import { randomPassword, lower, upper, digits, symbols } from 'secure-random-password'
import { _updateSecuritySetting } from '@/apis/account-system/access/user'
import { _updateVcUser } from '@/apis/account-system/user'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { PWD_REG } from '@/views/auth/config'
import loginProtection from '@/views/account-system/security-setting/components/login-protection.vue'
import operateProtect from '@/views/account-system/security-setting/components/operate-protect.vue'

const props = defineProps<{
  detail: any
}>()

const emit = defineEmits<{
  (event: 'success'): void
}>()

const loginProtectionRef = ref<any>()
const operateProtectionRef = ref<any>()
const pwd = reactive<{
  show: boolean
  check: number
  value: string
  loading: boolean
}>({
  show: false,
  check: 1,
  value: '',
  loading: false,
})

const handleRefresh = () => {
  emit('success')
}

const updateSecuritySetting = async (info: Record<string, any>) => {
  const res = await _updateSecuritySetting({
    uid: props.detail.id,
    ...info,
  })

  if (res.success || res.code === 10000) {
    message.success(t('account.changeSuccess'))
    handleRefresh()
    return true
  }

  message.warning(t('account.changeFail'))
  return false
}

const beforeAccessMethodChange = async () => {
  return updateSecuritySetting({
    accessMethod: props.detail.accessMethod == 1 ? 0 : 1,
  })
}

const beforeResetPasswordChange = async () => {
  return updateSecuritySetting({
    resetPassword: props.detail.resetPassword == 1 ? 0 : 1,
  })
}

const beforeLoginProtectionChange = async () => {
  loginProtectionRef.value?.showDialog(props.detail.loginProtect || 0)
  return false
}

const beforeOperateProtectionChange = async () => {
  operateProtectionRef.value?.showDialog(props.detail.operateProtect || 0)
  return false
}

const openPwdDialog = () => {
  pwd.show = true
}

const generatePassword = (username: string) => {
  let password = randomPassword({
    length: 8 + Math.floor(Math.random() * 25),
    characters: lower + upper + digits + symbols,
  })

  if (password === username || !PWD_REG.test(password)) {
    password = generatePassword(username)
  }

  return password
}

const handlePwdType = (pwdType: number) => {
  pwd.value = ''
  if (pwdType === 2) {
    pwd.value = generatePassword(props.detail.userName)
  }
}

const confirmHandlePwd = async () => {
  if ([2, 3].includes(pwd.check)) {
    if (!pwd.value) {
      return message.warning(t('user.pwdWarn'))
    }

    if (!PWD_REG.test(pwd.value)) {
      return message.warning(t('user.pwdFormatWarn'))
    }

    try {
      pwd.loading = true
      const res = await _updateVcUser({
        id: props.detail.id,
        password: pwd.value,
      })

      if (res.success) {
        pwd.show = false
        message.success(t('account.changeSuccess'))
        handleRefresh()
      } else {
        message.warning(t('account.changeFail'))
      }
    } catch (error) {
      console.log(error)
    } finally {
      pwd.loading = false
    }
    return
  }

  pwd.show = false
}
</script>

<style scoped lang="scss">
.user-detail-secure-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-detail-secure-tab__card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;
}

.user-detail-secure-tab__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.user-detail-secure-tab__stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-detail-secure-tab__row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.user-detail-secure-tab__label {
  flex: 0 0 128px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.user-detail-secure-tab__content {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  min-width: 0;
}

.user-detail-secure-tab__text,
.user-detail-secure-tab__switch-text {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.user-detail-secure-tab__link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.user-detail-secure-tab__pwd-type {
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
}

.user-detail-secure-tab__dialog-label {
  flex: 0 0 auto;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.user-detail-secure-tab__pwd-input {
  width: 280px;
  margin: 0 auto;
}

:deep(.el-switch) {
  --el-switch-on-color: #06f;
  --el-switch-off-color: #bbc0ca;
}

:deep(.el-switch__core) {
  min-width: 34px;
  height: 20px;
  border-radius: 12px;
}

:deep(.el-switch__action) {
  width: 16px;
  height: 16px;
}

:deep(.el-switch.is-checked .el-switch__action) {
  left: calc(100% - 17px);
}

@media (width <= 768px) {
  .user-detail-secure-tab__row,
  .user-detail-secure-tab__pwd-type {
    flex-direction: column;
  }

  .user-detail-secure-tab__label {
    flex-basis: auto;
  }

  .user-detail-secure-tab__pwd-input {
    width: 100%;
  }
}
</style>
