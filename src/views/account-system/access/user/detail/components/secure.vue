<template>
  <div class="wrap">
    <!-- form -->
    <el-row class="form-wrap mb20">
      <el-col :span="24" class="title">
        {{ t('user.consoleLoginSet') }}
      </el-col>
      <el-divider class="divider" />
      <!-- 控制台访问 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('user.access') }}</span>
        </div>
        <div>
          <span class="mr4" :class="detail.accessMethod == 1 ? 'text-success' : 'text-error'">{{
            detail.accessMethod == 1 ? t('common.start') : t('user.close')
          }}</span>
          <SvgIcon name="edit" @click="openAccessDialog" />
        </div>
      </el-col>
      <!-- 登录密码 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('user.loginPwd') }}</span>
        </div>
        <div>
          <span class="value mr14">{{ t('user.using') }}</span
          ><span class="text-primary cursor-pointer" @click="openPwdDialog">{{ t('user.resetPwd') }}</span>
        </div>
      </el-col>
      <!-- 下次登录重置密码 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('user.nextPwd') }}</span>
        </div>
        <div>
          <span class="value mr4">{{ detail.resetPassword == 1 ? t('user.yes') : t('user.no') }}</span>
          <SvgIcon name="edit" @click="openNextPwdDialog" />
        </div>
      </el-col>

      <!-- 上次登录信息 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <div class="key df ac">
            <span>{{ t('user.lastLoginInfo') }}</span
            ><el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </div>
        <div>
          <span class="value"
            >{{ detail.lastLoginTime ? maoYunDayJs(detail.lastLoginTime).format(FORMAT_TIME) : '' }}（{{
              detail.lastLoginIp
            }}
            ）</span
          >
        </div>
      </el-col>
    </el-row>

    <el-row class="form-wrap">
      <el-col :span="24">
        <span class="title mr20">{{ t('securitySetting.securitySetting') }}</span
        ><span class="text-primary cursor-pointer" @click="openIdentityDialog">{{ t('user.mana') }}</span>
      </el-col>
      <el-divider class="divider" />
      <!-- 登录保护 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('overview.loginProtect') }}</span>
        </div>
        <div>
          <span class="mr4" :class="detail.loginProtect == 1 ? 'text-success' : 'text-error'">{{
            detail.loginProtect == 1 ? t('user.openProtect') : t('user.closeProtect')
          }}</span>
        </div>
      </el-col>
      <!-- 操作保护 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('overview.operateProtect') }}</span>
        </div>
        <div>
          <span :class="detail.operateProtect == 1 ? 'text-success' : 'text-error'">{{
            detail.operateProtect == 1 ? t('user.openProtect') : t('user.closeProtect')
          }}</span>
        </div>
      </el-col>
    </el-row>

    <!-- 管理控制台访问 -->
    <CatDialog
      v-model:dialog="access.show"
      :title="t('user.manaAccess')"
      width="600px"
      destroy-on-close
      class="access-dialog"
      :loading="setLoading"
      @confirm="confirmHandleAccess"
    >
      <div class="df ac">
        <span class="common-text mr20">{{ t('user.access') }}</span>
        <el-radio-group v-model="access.check" class="radio-group">
          <el-radio :label="1">
            {{ t('user.start') }}
          </el-radio>
          <el-radio :label="0">
            {{ t('user.disable') }}
          </el-radio>
        </el-radio-group>
      </div>
    </CatDialog>

    <!-- 安全设置 -->
    <CatDialog
      v-model:dialog="identity.show"
      :title="t('overview.identitySecurity')"
      width="520px"
      destroy-on-close
      class="identity-dialog"
      :loading="setLoading"
      @confirm="confirmHandleIdentity"
    >
      <!-- 登录保护 -->
      <div class="df mb20">
        <div class="w110">
          <span class="common-text">{{ t('overview.loginProtect') }}</span>
        </div>
        <div>
          <el-radio-group v-model="identity.checkLogin" class="radio-group">
            <div class="mb20 df ac">
              <el-radio :label="1">
                {{ t('user.openLoginProtect') }} </el-radio
              ><span class="text-primary">{{ t('user.iptEmail') }}</span>
            </div>
            <div>
              <el-radio :label="0">
                {{ t('user.closed') }}
              </el-radio>
            </div>
          </el-radio-group>
        </div>
      </div>

      <!-- 操作保护 -->
      <div class="df">
        <div class="w110">
          <span class="common-text">{{ t('overview.operateProtect') }}</span>
        </div>
        <div>
          <el-radio-group v-model="identity.checkOperate" class="radio-group">
            <div class="mb20 df ac">
              <el-radio :label="1">
                {{ t('user.openLoginProtect') }}
              </el-radio>
              <span class="text-primary">{{ t('user.iptEmail') }}</span>
            </div>
            <div>
              <el-radio :label="0">
                {{ t('user.closed') }}
              </el-radio>
            </div>
          </el-radio-group>
        </div>
      </div>
    </CatDialog>

    <!-- 下次登录重置密码 -->
    <CatDialog
      v-model:dialog="nextPwd.show"
      :title="t('user.nextPwd')"
      width="520px"
      destroy-on-close
      class="nextPwd-dialog"
      :loading="setLoading"
      @confirm="confirmHandleNextPwd"
    >
      <div class="df ac flw">
        <span class="common-text mr20">{{ t('user.nextResetPwd') }}</span>
        <el-checkbox v-model="nextPwd.check" :label="t('user.nextResetPwdDesc')" name="type" />
      </div>
    </CatDialog>

    <!-- 重置密码 -->
    <CatDialog
      v-model:dialog="pwd.show"
      :title="t('user.resetPwd')"
      width="620px"
      destroy-on-close
      class="pwd-dialog"
      :loading="pwd.loading"
      @confirm="confirmHandlePwd"
      @update:dialog="pwd.value = ''"
    >
      <div class="df ac mb20">
        <span style="margin-right: 40px">{{ t('user.accessPwd') }}</span>
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
      <div v-if="pwd.check !== 1" class="df ac jc">
        <el-input v-model.trim="pwd.value" show-password style="width: 280px" autocomplete="off" />
      </div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { randomPassword, lower, upper, digits, symbols } from 'secure-random-password'
import { message } from '@/utils/message'
import { _updateSecuritySetting } from '@/apis/account-system/access/user'
import { _updateVcUser } from '@/apis/account-system/user'
import t from '@/utils/i18n'
import { PWD_REG } from '@/views/auth/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), { detail: () => ({}) })

const emits = defineEmits<{
  (event: 'success'): void
}>()

const route = useRoute()
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w280px',
  [en]: 'key-wrap-w210px',
  [zh]: 'key-wrap-w150px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

// 控制台访问弹窗
const access = reactive<{
  show: boolean
  check: number
}>({
  show: false,
  check: 1,
})

// 安全设置
const identity = reactive<{
  show: boolean
  checkLogin: number
  checkOperate: number
}>({
  show: false,
  checkLogin: 1,
  checkOperate: 1,
})

// 下次登录重置密码
const nextPwd = reactive<{
  show: boolean
  check: boolean
}>({
  show: false,
  check: false,
})

// 重置密码
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

const setLoading = ref<boolean>(false)

// 显示控制台访问弹窗
const openAccessDialog = () => {
  access.show = true
}

// 显示重置密码弹窗
const openPwdDialog = () => {
  pwd.show = true
}

// 显示下次登录重置密码弹窗
const openNextPwdDialog = () => {
  nextPwd.show = true
}

// 显示安全设置弹窗
const openIdentityDialog = () => {
  identity.show = true
}

// 切换控制台密码类型
const handlePwdType = (pwdType: any) => {
  console.log(`handlePwdType===>`, pwdType)

  pwd.value = ''

  if (pwdType === 2) {
    const password = generatePassword(props.detail.userName)

    console.log(`password===>`, password)
    pwd.value = password
  }
}

// 生成密码函数
const generatePassword = username => {
  // 随机生成一个密码
  let password = randomPassword({
    length: 8 + Math.floor(Math.random() * 25),
    characters: lower + upper + digits + symbols,
  })

  // 检查密码是否与用户名相同
  if (password === username) {
    // 如果相同，则重新生成密码，直到不同为止
    password = generatePassword(username)
  }

  // 检查密码是否符合
  if (!PWD_REG.test(password)) {
    // 如果相同，则重新生成密码，直到不同为止
    password = generatePassword(username)
  }

  // 返回生成的密码
  return password
}

// 控制台访问确认
const confirmHandleAccess = () => {
  const cb = () => {
    access.show = false
  }

  updateSecuritySetting(
    {
      accessMethod: access.check,
    },
    cb,
  )
}

// 下次登录重置密码确认
const confirmHandleNextPwd = () => {
  const cb = () => {
    nextPwd.show = false
  }

  updateSecuritySetting(
    {
      resetPassword: nextPwd.check ? 1 : 0,
    },
    cb,
  )
}

// 重置密码确认
const confirmHandlePwd = () => {
  if ([2, 3].includes(pwd.check)) {
    if (!pwd.value) {
      return message.warning(t('user.pwdWarn'))
    }
    // 验证密码格式
    if (!PWD_REG.test(pwd.value)) {
      return message.warning(t('user.pwdFormatWarn'))
    }

    changeUserInfo()
  } else {
    pwd.show = false
  }
}

// 安全设置确认
const confirmHandleIdentity = () => {
  const cb = () => {
    identity.show = false
  }

  updateSecuritySetting(
    {
      loginProtect: identity.checkLogin,
      operateProtect: identity.checkOperate,
    },
    cb,
  )
}

// 安全设置
const updateSecuritySetting = async (info, cb) => {
  try {
    setLoading.value = true
    const res = await _updateSecuritySetting({ uid: Number(route.params.id) as number, ...info })

    if (res.success) {
      emits('success')
      message.success(t('account.changeSuccess'))
      cb && cb()
    } else {
      message.warning(t('account.changeFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    setLoading.value = false
  }
}

// 修改用户信息
const changeUserInfo = async () => {
  try {
    pwd.loading = true
    const res = await _updateVcUser({
      id: Number(route.params.id) as number,
      password: pwd.value,
    })

    if (res.success) {
      pwd.show = false
      emits('success')
      message.success(t('account.changeSuccess'))
    } else {
      message.warning(t('account.changeFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    pwd.loading = false
  }
}

watch(
  () => props.detail,
  v => {
    access.check = v.accessMethod
    identity.checkLogin = v.loginProtect
    identity.checkOperate = v.operateProtect
    nextPwd.check = v.resetPassword == 1 ? true : false
  },
)
</script>

<style lang="scss" scoped>
.wrap {
  padding-top: 20px;

  .divider {
    margin-top: 12px;
    margin-bottom: 20px;
  }

  .form-wrap {
    .title {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      line-height: 22px;

      // font-weight: 500;
      color: var(--primary-text);
    }

    .sub-text {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--sub-text);
    }

    .key-wrap-w150px {
      width: 150px;
    }

    .key-wrap-w210px {
      width: 210px;
    }

    .key-wrap-w280px {
      width: 280px;
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
      color: var(--primary-text);
    }
  }
}

.access-dialog,
.nextPwd-dialog,
.identity-dialog {
  .common-text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--common-text);
  }
}

.identity-dialog {
  .w110 {
    width: 110px;
  }

  .radio-group {
    display: block !important;
  }
}

.flw {
  flex-wrap: wrap;
}

.nextPwd-dialog .common-text {
  line-height: 30px;
}
</style>
