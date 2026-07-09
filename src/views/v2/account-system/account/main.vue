<template>
  <div class="account-info-v2">
    <PageToolbar :title="t('accountSystemRoutes.account')" @doc="openHelpDoc" />

    <section class="account-info-v2__card account-info-v2__card--basic">
      <h3 class="account-info-v2__title">
        {{ t('account.basicInfo') }}
      </h3>
      <div class="account-info-v2__basic-body">
        <el-upload
          class="account-info-v2__upload"
          action="#"
          :show-file-list="false"
          :on-change="handleAvatarChange"
          :auto-upload="false"
          accept="image/*"
        >
          <div class="account-info-v2__avatar-wrap">
            <el-avatar :size="64" :src="user.headImg || avatarUrl || HeaderAccountImg" />
            <div class="account-info-v2__avatar-edit">
              <SvgIcon name="edit" />
            </div>
          </div>
        </el-upload>

        <div class="account-info-v2__basic-grid">
          <div class="account-info-v2__column">
            <div class="account-info-v2__field">
              <div class="account-info-v2__label">
                {{ t('account.name') }}
              </div>
              <div class="account-info-v2__value-wrap">
                <template v-if="!showEiditUserName">
                  <span class="account-info-v2__value">{{ user.userName || user.email || '-' }}</span>
                  <button class="account-info-v2__icon-btn" type="button" @click="showEiditUserName = true">
                    <SvgIcon name="edit" />
                  </button>
                </template>
                <template v-else>
                  <div class="account-info-v2__inline-edit">
                    <el-input v-model.trim="userName" maxlength="30" />
                    <button class="account-info-v2__text-btn" type="button" @click="changeUserInfo">
                      {{ t('common.save') }}
                    </button>
                    <button class="account-info-v2__text-btn" type="button" @click="showEiditUserName = false">
                      {{ t('common.cancel') }}
                    </button>
                  </div>
                </template>
              </div>
            </div>

            <div class="account-info-v2__field">
              <div class="account-info-v2__label">
                {{ t('account.accountID') }}
              </div>
              <div class="account-info-v2__value-wrap">
                <span class="account-info-v2__value">{{ user.id || '-' }}</span>
                <button class="account-info-v2__icon-btn" type="button" @click="handleCopy(user.id)">
                  <SvgIcon name="copy" />
                </button>
              </div>
            </div>
          </div>

          <div class="account-info-v2__column">
            <div class="account-info-v2__field">
              <div class="account-info-v2__label account-info-v2__label--with-icon">
                <span>APP ID</span>
                <el-tooltip :content="t('account.appIDTooltip')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
              <div class="account-info-v2__value-wrap">
                <span class="account-info-v2__value">{{ user.appId || '-' }}</span>
                <button class="account-info-v2__icon-btn" type="button" @click="handleCopy(user.appId)">
                  <SvgIcon name="copy" />
                </button>
              </div>
            </div>

            <div class="account-info-v2__field">
              <div class="account-info-v2__label account-info-v2__label--with-icon">
                <span>{{ t('account.registerTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
              <div class="account-info-v2__value-wrap">
                <span class="account-info-v2__value">
                  {{ user.createDate ? maoYunDayJs(user.createDate).format(FORMAT_TIME) : '-' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="account-info-v2__card">
      <h3 class="account-info-v2__title">
        {{ t('account.loginMethod') }}
      </h3>
      <div class="account-info-v2__login-row">
        <span class="account-info-v2__label">{{ t('account.emailMethod') }}</span>
        <span class="account-info-v2__label">{{ t('account.support') }}</span>
        <span class="account-info-v2__value">{{ user.email || '-' }}</span>
        <button class="account-info-v2__text-btn" type="button" @click="openModifyLoginEmail">
          {{ t('common.change') }}
        </button>
        <button class="account-info-v2__text-btn" type="button" @click="openModifyPwd">
          {{ t('account.changePwd') }}
        </button>
      </div>
    </section>

    <section class="account-info-v2__card">
      <div class="account-info-v2__team-head">
        <h3 class="account-info-v2__title">
          {{ t('account.teamMana') }}
        </h3>
        <p class="account-info-v2__desc">
          {{ t('account.teamManaDesc') }}
        </p>
      </div>
      <div class="account-info-v2__team-row">
        <span class="account-info-v2__label">{{ t('account.subUsers') }}</span>
        <span class="account-info-v2__count">
          <span class="account-info-v2__count-num">{{ user.userNum || 0 }}</span>
          <span>{{ t('account.indivual') }}</span>
        </span>
        <button class="account-info-v2__text-btn" type="button" @click="createUser">
          {{ t('account.createUser') }}
        </button>
      </div>
    </section>

    <ModifyPwdDialog ref="ModifyPwdDialogRef" />

    <CatDialog
      v-model:dialog="modifyLoginEmail.show1"
      :title="t('account.changeLoginMethod')"
      width="460px"
      destroy-on-close
      no-cancel
      :confirm-text="t('account.changeEmail')"
      @confirm="
        () => {
          modifyLoginEmail.show2 = true
          modifyLoginEmail.show1 = false
        }
      "
    >
      <p>{{ t('account.changeLoginMethodDesc') }}</p>
    </CatDialog>

    <CatDialog
      v-model:dialog="modifyLoginEmail.show2"
      :title="t('account.changeLoginEmail')"
      width="600px"
      destroy-on-close
      :loading="updateLoginEmailLoading"
      @confirm="handleLoginEmailConfirm(emailFormRef)"
      @update:dialog="handleLoginEmailClose"
    >
      <el-form
        ref="emailFormRef"
        :model="modifyLoginEmail.emailForm"
        class="multilingual_form"
        :rules="emailFormRules"
        label-position="left"
        require-asterisk-position="right"
      >
        <el-form-item :label="t('account.newEmail')" prop="email" class="email">
          <el-input v-model.trim="modifyLoginEmail.emailForm.email" :placeholder="t('account.emailPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('account.emailCode')" prop="code" class="code-wrap">
          <div class="w-full h-full df ac">
            <el-input v-model.trim="modifyLoginEmail.emailForm.code" :placeholder="t('account.emailCodePlaceholder')" />
            <VerifyCodeBtn
              :verify-fun="getCode"
              :active="EMIAL_REG.test(modifyLoginEmail.emailForm.email)"
              :border="false"
            />
          </div>
        </el-form-item>
      </el-form>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import HeaderAccountImg from '@/assets/images/account-system/header-account.png'
import ModifyPwdDialog from '@/views/account-system/account/main-info/components/modify-pwd-dialog.vue'
import { documentUrl } from '@/config/base-config'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { _updateVcUser, _uploadHead, _updateLoginEmail } from '@/apis/account-system/user'
import { _sendMail } from '@/apis/account-system/user'
import type { FormInstance, FormRules } from 'element-plus/es'
import { usePermission } from '@/hooks/permission/use-permission'
import { EMIAL_REG } from '@/views/auth/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'

interface EmailForm {
  email: string
  code: string
}

const resetPasswordPermission = usePermission('userApi:resetPassword')
const updateLoginEmailPermission = usePermission('userApi:updateLoginEmail')
const insertVcUserPermission = usePermission('userApi:insertVcUser')

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const showEiditUserName = ref(false)
const updateLoginEmailLoading = ref(false)
const userName = ref('')
const avatarUrl = ref('')
const ModifyPwdDialogRef = ref<InstanceType<typeof ModifyPwdDialog> | null>(null)

const modifyLoginEmail = reactive<{
  show1: boolean
  show2: boolean
  emailForm: EmailForm
}>({
  show1: false,
  show2: false,
  emailForm: {
    code: '',
    email: '',
  },
})

const emailFormRef = ref<FormInstance>()

watch(
  () => user.value.userName,
  value => {
    userName.value = value || user.value.email || ''
  },
  { immediate: true },
)

const checkEmail = (rule: unknown, value: string, callback: (error?: Error | string) => void) => {
  if (!value) {
    return callback('')
  }
  if (!EMIAL_REG.test(value)) {
    return callback(new Error(t('common.formatErr')))
  }
  if (user.value.email === value) {
    return callback(new Error(t('account.emailCheckTip')))
  }
  callback()
}

const emailFormRules = reactive<FormRules<EmailForm>>({
  email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
  code: [{ required: true, message: '', trigger: 'blur' }],
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const openModifyLoginEmail = () => {
  if (updateLoginEmailPermission.checkPermissionRes) {
    modifyLoginEmail.show1 = true
    return
  }

  updateLoginEmailPermission.dialog({
    show: true,
    i18nKey: 'account.changeLoginEmailPerm',
  })
}

const createUser = () => {
  if (insertVcUserPermission.checkPermissionRes) {
    pushRoute({
      name: 'access_user_create',
      query: {
        title: 'account.personalCenter',
        path: '/account-system/account/info',
      },
    })
    return
  }

  insertVcUserPermission.dialog({
    show: true,
    i18nKey: 'account.createUserPerm',
  })
}

const openModifyPwd = () => {
  if (resetPasswordPermission.checkPermissionRes) {
    ModifyPwdDialogRef.value && (ModifyPwdDialogRef.value.show = true)
    return
  }

  resetPasswordPermission.dialog({
    show: true,
    i18nKey: 'account.changePwdPerm',
  })
}

const handleCopy = async (value: string) => {
  await handleCopyValue(value)
  message.success(t('domainSet2.copySuccess'))
}

const handleLoginEmailConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) {
    return
  }

  await formEl.validate(async valid => {
    if (!valid) {
      return
    }

    try {
      updateLoginEmailLoading.value = true
      const res = await _updateLoginEmail({
        email: modifyLoginEmail.emailForm.email,
        code: modifyLoginEmail.emailForm.code,
      })

      if (res.success) {
        modifyLoginEmail.show2 = false
        message.success(t('account.changeEmailSuccess'))
        userStore.logOut()
      } else {
        message.warning(res.msg)
      }
    } finally {
      updateLoginEmailLoading.value = false
    }
  })
}

const handleLoginEmailClose = () => {
  modifyLoginEmail.emailForm = {
    code: '',
    email: '',
  }
}

const getCode = async () => {
  const res = await _sendMail({
    email: modifyLoginEmail.emailForm.email,
    type: 8,
  })

  if (res.success) {
    message.success(t('common.codeSent'))
    return true
  }

  message.warning(res.msg)
  return false
}

const changeUserInfo = async () => {
  if (!userName.value) {
    message.warning(t('account.nameMsg'))
    return
  }

  const res = await _updateVcUser({
    id: '',
    userName: userName.value,
  })

  if (res.success) {
    message.success(t('account.changeSuccess'))
    showEiditUserName.value = false
    userStore.getUser()
  } else {
    message.warning(t('account.changeFail'))
  }
}

const handleAvatarChange: (uploadFile: any) => void = async uploadFile => {
  if (uploadFile.status !== 'ready') {
    return
  }

  avatarUrl.value = URL.createObjectURL(uploadFile.raw!)

  const res = await _uploadHead({
    file: uploadFile.raw,
  })

  if (res.success) {
    message.success(t('account.uploadSuccess'))
    userStore.getUser()
  } else {
    message.warning(t('account.uploadFail'))
  }
}

onMounted(() => {
  userStore.getUser()
})
</script>

<style scoped lang="scss">
.account-info-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.account-info-v2__toolbar,
.account-info-v2__card {
  background: #fff;
}

.account-info-v2__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 0 16px;
}

.account-info-v2__toolbar-left {
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

.account-info-v2__divider {
  width: 1px;
  height: 18px;
  background: #dcdfe6;
}

.account-info-v2__page-title,
.account-info-v2__title {
  color: #191c23;
}

.account-info-v2__page-title {
  font-size: 14px;
  line-height: 22px;
}

.account-info-v2__doc {
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

.account-info-v2__card {
  padding: 20px;
}

.account-info-v2__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}

.account-info-v2__card--basic {
  padding-bottom: 16px;
}

.account-info-v2__basic-body {
  display: flex;
  gap: 64px;
  align-items: center;
  margin-top: 24px;
}

.account-info-v2__upload {
  flex: none;
}

.account-info-v2__avatar-wrap {
  position: relative;
  width: 64px;
  height: 64px;
}

.account-info-v2__avatar-edit {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #fff;
  border: 1px solid #e8ecf3;
  border-radius: 12px;

  :deep(svg) {
    width: 12px;
    height: 12px;
  }
}

.account-info-v2__basic-grid {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 32px 100px;
}

.account-info-v2__column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.account-info-v2__field {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.account-info-v2__label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.account-info-v2__label--with-icon {
  display: inline-flex;
  gap: 2px;
  align-items: center;

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.account-info-v2__value-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.account-info-v2__value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-all;
}

.account-info-v2__icon-btn,
.account-info-v2__text-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.account-info-v2__icon-btn {
  color: #828b9c;

  &:hover {
    color: #06f;
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.account-info-v2__text-btn {
  font-size: 14px;
  line-height: 22px;
  color: #06f;
}

.account-info-v2__inline-edit {
  display: flex;
  gap: 20px;
  align-items: center;
  width: min(100%, 480px);

  :deep(.el-input) {
    width: 220px;
  }
}

.account-info-v2__login-row,
.account-info-v2__team-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;
  align-items: center;
  margin-top: 20px;
}

.account-info-v2__team-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-info-v2__desc {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.account-info-v2__count {
  display: inline-flex;
  gap: 0;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.account-info-v2__count-num {
  color: #e54839;
}

@media (width <= 900px) {
  .account-info-v2__toolbar {
    gap: 12px;
    align-items: flex-start;
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .account-info-v2__toolbar,
  .account-info-v2__toolbar-left,
  .account-info-v2__basic-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .account-info-v2__basic-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    width: 100%;
  }

  .account-info-v2__field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .account-info-v2__inline-edit {
    flex-wrap: wrap;
    width: 100%;
  }
}
</style>
