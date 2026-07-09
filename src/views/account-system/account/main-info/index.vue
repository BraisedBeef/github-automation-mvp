<template>
  <el-space direction="vertical" :size="20" class="w-full" :fill="true">
    <!-- 基本信息 -->
    <el-card shadow="never" class="page-box basic-info h160" :body-style="bodyStyle">
      <el-row class="mb20">
        <el-col>
          <span class="title">{{ t('account.basicInfo') }}</span>
        </el-col>
      </el-row>

      <div class="df">
        <div class="upload-wrap">
          <!-- 头像上传 -->
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            :auto-upload="false"
            accept="image/*"
          >
            <div class="df avatar-wrap">
              <el-avatar :size="60" :src="user.headImg || avatarUrl || HeaderAccountImg" />
              <div class="edit-wrap df jc ac">
                <SvgIcon name="edit" />
              </div>
            </div>
          </el-upload>
        </div>

        <el-row align="top" class="info-wrap">
          <el-col :span="12">
            <div class="df">
              <div class="info-wrap-left">
                <!-- 账号昵称 -->
                <div class="item mb20">
                  <p class="key-wrap">
                    <span class="key">{{ t('account.name') }}</span>
                  </p>
                </div>
                <!-- 账号ID -->
                <div class="item">
                  <p class="key-wrap">
                    <span class="key">{{ t('account.accountID') }}</span>
                  </p>
                </div>
              </div>
              <div class="info-wrap-right">
                <div class="item" :class="showEiditUserName ? 'mb13 mt-negative-6' : 'mb20'">
                  <div>
                    <template v-if="!showEiditUserName">
                      <div>
                        <span class="value mr4">{{ user.userName || user.email || '-' }}</span>
                        <SvgIcon name="edit" @click="showEiditUserName = true" />
                      </div>
                    </template>
                    <!-- 修改账号昵称 -->
                    <template v-else>
                      <div class="df ac">
                        <div class="edit-userName-input mr20">
                          <el-input v-model.trim="userName" maxlength="30" />
                        </div>
                        <div class="edit-userName-btn-wrap">
                          <span class="mr20 text-primary cursor-pointer" @click="changeUserInfo">{{
                            t('common.save')
                          }}</span>
                          <span class="text-primary cursor-pointer" @click="showEiditUserName = false">{{
                            t('common.cancel')
                          }}</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                <div class="item">
                  <p class="df ac">
                    <span class="value mr4">{{ user.id || '-' }}</span>
                    <SvgIcon class="pointer" name="copy" @click="handleCopy(user.id)" />
                  </p>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="df">
              <div class="info-wrap-left">
                <!-- APP ID -->
                <div class="item mb20">
                  <div class="key-wrap df ac">
                    <span class="key">APP ID</span>
                    <el-tooltip :content="t('account.appIDTooltip')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" class="ml10" />
                    </el-tooltip>
                  </div>
                </div>
                <!-- 注册时间 -->
                <div class="item">
                  <p class="key-wrap df ac">
                    <span class="key">{{ t('account.registerTime') }}</span>
                    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" class="ml10" />
                    </el-tooltip>
                  </p>
                </div>
              </div>
              <!-- 注册时间 -->
              <div class="info-wrap-right">
                <div class="item mb20">
                  <p class="df ac">
                    <span class="value mr4">{{ user.appId || '-' }}</span>
                    <SvgIcon class="pointer" name="copy" @click="handleCopy(user.appId)" />
                  </p>
                </div>
                <div class="item">
                  <p>
                    <span class="value">{{
                      user.createDate ? maoYunDayJs(user.createDate).format(FORMAT_TIME) : '-'
                    }}</span>
                  </p>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <!-- 登录方式 -->
    <el-card shadow="never" class="page-box login-way h120" :body-style="bodyStyle">
      <div class="mb20">
        <span class="title">{{ t('account.loginMethod') }}</span>
      </div>
      <div>
        <span class="key mr40">{{ t('account.emailMethod') }}</span>
        <span class="key mr40">{{ t('account.support') }}</span>
        <span class="value ml20 mr20">{{ user.email || '-' }}</span>
        <span class="text-primary cursor-pointer mr20" @click="openModifyLoginEmail">{{ t('common.change') }}</span>
        <span class="text-primary cursor-pointer" @click="openModifyPwd">{{ t('account.changePwd') }}</span>
      </div>
    </el-card>
    <!-- 团队管理 -->
    <el-card shadow="never" class="page-box h160" :body-style="bodyStyle">
      <el-row class="mb20">
        <el-col>
          <span class="title">{{ t('account.teamMana') }}</span>
        </el-col>
      </el-row>

      <el-row class="mb20">
        <el-col>
          <span class="sub-title">{{ t('account.teamManaDesc') }}</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <span class="key mr20">{{ t('account.subUsers') }}</span>
          <span class="value ml20 text-error">{{ user.userNum || 0 }}</span>
          <span class="value mr20">{{ t('account.indivual') }}</span>
          <span class="text-primary cursor-pointer" @click="createUser">{{ t('account.createUser') }}</span>
        </el-col>
      </el-row>
    </el-card>

    <!-- 修改密码 -->
    <ModifyPwdDialog ref="ModifyPwdDialogRef" />
    <!-- 修改登录邮箱第一步 -->
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

    <!-- 修改登录邮箱第二步 -->
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
        <!-- 验证码 -->
        <el-form-item :label="t('account.emailCode')" prop="code" class="code-wrap">
          <div class="w-full h-full df ac">
            <el-input v-model.trim="modifyLoginEmail.emailForm.code" :placeholder="t('account.emailCodePlaceholder')" />
            <VerifyCodeBtn
              :verify-fun="getCode"
              :active="EMIAL_REG.test(modifyLoginEmail.emailForm.email) ? true : false"
              :border="false"
            />
          </div>
        </el-form-item>
      </el-form>
    </CatDialog>
  </el-space>
</template>

<script setup lang="ts">
import HeaderAccountImg from '@/assets/images/account-system/header-account.png'
import ModifyPwdDialog from './components/modify-pwd-dialog.vue'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { _updateVcUser, _uploadHead, _updateLoginEmail } from '@/apis/account-system/user'
import { _sendMail } from '@/apis/account-system/user'
import { FormInstance, FormRules } from 'element-plus/es'
import { usePermission } from '@/hooks/permission/use-permission'
import { EMIAL_REG } from '@/views/auth/config'

import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'

interface EmailForm {
  email: string
  code: string
}

const resetPasswordPermission = usePermission('userApi:resetPassword') // 修改密码权限
const updateLoginEmailPermission = usePermission('userApi:updateLoginEmail') // 修改登录邮箱权限
const insertVcUserPermission = usePermission('userApi:insertVcUser') // 创建子用户权限

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const showEiditUserName = ref<boolean>(false) // 是否修改用户昵称
const updateLoginEmailLoading = ref<boolean>(false)
const userName = ref<string>('') // 修改用户昵称
const avatarUrl = ref('')
const ModifyPwdDialogRef = ref<InstanceType<typeof ModifyPwdDialog> | null>(null)
const bodyStyle = { height: '100%' }
// 修改登录邮箱
const modifyLoginEmail = reactive<{
  show1: boolean // 第一步
  show2: boolean // 第二步
  emailForm: {
    code: string
    email: string
  } // 修改邮箱验证码
}>({
  show1: false,
  show2: false,
  emailForm: {
    code: '',
    email: '',
  },
})
const emailFormRef = ref<FormInstance>()

// 校验邮箱
const checkEmail = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback('')
  } else if (!EMIAL_REG.test(value)) {
    return callback(new Error(t('common.formatErr')))
  } else if (user.value.email === value) {
    // 不能设置相同登录密码
    return callback(new Error(t('account.emailCheckTip')))
  } else {
    callback()
  }
}

const emailFormRules = reactive<FormRules<EmailForm>>({
  email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
  code: [{ required: true, message: '', trigger: 'blur' }],
})

// 显示修改登录邮箱
const openModifyLoginEmail = () => {
  if (updateLoginEmailPermission.checkPermissionRes) {
    modifyLoginEmail.show1 = true
  } else {
    updateLoginEmailPermission.dialog({
      show: true,
      i18nKey: 'account.changeLoginEmailPerm',
    })
  }
}

// 跳转创建用户
const createUser = () => {
  if (insertVcUserPermission.checkPermissionRes) {
    pushRoute({
      name: 'access_user_create',
      query: {
        title: 'account.personalCenter',
        path: '/account-system/account/info',
      },
    })
  } else {
    insertVcUserPermission.dialog({
      show: true,
      i18nKey: 'account.createUserPerm',
    })
  }
}

// 显示修改密码弹窗
const openModifyPwd = () => {
  if (resetPasswordPermission.checkPermissionRes) {
    if (ModifyPwdDialogRef.value) {
      ModifyPwdDialogRef.value.show = true
    }
  } else {
    resetPasswordPermission.dialog({
      show: true,
      i18nKey: 'account.changePwdPerm',
    })
  }
}

// 复制
const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}

// 修改登录邮箱
const handleLoginEmailConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')
      try {
        updateLoginEmailLoading.value = true
        const res = await _updateLoginEmail({
          email: modifyLoginEmail.emailForm.email, // 邮箱
          code: modifyLoginEmail.emailForm.code, // 验证码
        })

        if (res.success) {
          modifyLoginEmail.show2 = false
          message.success(t('account.changeEmailSuccess'))
          userStore.logOut()
        } else {
          message.warning(res.msg)
        }
      } catch (error) {
        console.log(error)
      } finally {
        updateLoginEmailLoading.value = false
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

const handleLoginEmailClose = () => {
  modifyLoginEmail.emailForm = {
    code: '',
    email: '',
  }
}

// 获取验证码==>登录邮箱
const getCode = async () => {
  console.log(`获取验证码===>`)

  const res = await _sendMail({
    email: modifyLoginEmail.emailForm.email,
    type: 8,
  })

  if (res.success) {
    message.success(t('common.codeSent'))
    return true
  } else {
    message.warning(res.msg)
    return false
  }
}

// 修改用户信息
const changeUserInfo = async () => {
  if (!userName.value) {
    return message.warning(t('account.nameMsg'))
  }

  const res = await _updateVcUser({
    id: '', // 登录用户不用传id
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

// 上传头像
const handleAvatarChange: (uploadFile: any) => void = async uploadFile => {
  console.log(`handleAvatarChange===>`, uploadFile)

  // 添加图片
  if (uploadFile.status === 'ready') {
    avatarUrl.value = URL.createObjectURL(uploadFile.raw!)

    const res = await _uploadHead({
      file: uploadFile.raw,
    })
    console.log(`_uploadHead===>`, res)

    if (res.success) {
      message.success(t('account.uploadSuccess'))
      userStore.getUser()
    } else {
      message.warning(t('account.uploadFail'))
    }
  }
}

onMounted(() => {
  userStore.getUser()
})
</script>

<style lang="scss" scoped>
.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 18px;
  line-height: 25px;

  // font-weight: 500;
  color: var(--table-text);
}

.sub-title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--common-text);
}

.basic-info,
.login-way {
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

.basic-info {
  .upload-wrap {
    width: 60px;
    height: 60px;
    margin-right: 80px;

    .avatar-wrap {
      position: relative;

      .edit-wrap {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 24px;
        height: 24px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 2px 4px 0 rgb(0 0 0 / 8%);
      }
    }
  }

  .info-wrap {
    width: 100%;

    .info-wrap-left {
      margin-right: 20px;
    }

    // .item {
    //   .key-wrap {
    //     // min-width: 60px;
    //     margin-right: 40px;
    //   }
    // }

    .mb13 {
      margin-bottom: 13px;
    }

    .mt-negative-6 {
      margin-top: -6.5px;
    }
  }

  .edit-userName-input {
    max-width: 180px;
    height: 34px;
  }
}

.code-wrap {
  .el-form-item__content {
    width: 100%;

    /* display: flex;
    flex-wrap: nowrap; */

    .el-input {
      flex: 1;
      flex-shrink: 0;
    }
  }
}

.login-way {
  .mr40 {
    margin-right: 40px;
  }
}

.h120 {
  height: 120px;
}

.h160 {
  height: 160px;
}
</style>
