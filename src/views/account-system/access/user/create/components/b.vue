<template>
  <div class="b-wrap">
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <!-- 设置用户信息 -->
    <div class="user-info-wrap">
      <div class="title mb20">
        {{ t('user.setUserInfo') }}
      </div>

      <el-table :data="[{}]" :highlight-current-row="false">
        <!-- 用户名 在30个字符以内 -->
        <el-table-column prop="name" min-width="400">
          <template #header>
            <span>{{ t('user.userNames') }}</span> <span class="text-error">*</span>
          </template>
          <template #default>
            <el-input
              v-model.trim="createUserInfoForm.name"
              maxlength="30"
              autocomplete="off"
              @input="handleChangeName"
              @blur="handleName"
            />
          </template>
        </el-table-column>
        <!-- 备注 -->
        <el-table-column prop="remark" :label="t('user.remark')" min-width="400">
          <template #default>
            <el-input v-model.trim="createUserInfoForm.remark" maxlength="50" autocomplete="off" />
          </template>
        </el-table-column>
        <!-- 手机 -->
        <el-table-column prop="phone" :label="t('user.phone')" min-width="400">
          <template #default>
            <el-input
              v-model="createUserInfoForm.phone"
              :placeholder="''"
              autocomplete="off"
              class="phone"
              @blur="handlePhone"
              @input="handleChangePhone"
            >
              <template #prepend>
                <el-select v-model="phonePre" class="select">
                  <el-option :label="t('user.phonePreChinese')" value="+86" />
                </el-select>
              </template>
            </el-input>
          </template>
        </el-table-column>
        <!-- 邮箱 -->
        <el-table-column prop="email" min-width="400">
          <template #header>
            <span>{{ t('user.email') }}</span> <span class="text-error">*</span>
          </template>
          <template #default>
            <div style="margin-right: 15px">
              <el-input v-model.trim="createUserInfoForm.email" autocomplete="off" @blur="handleEmail" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- form -->
    <el-row v-if="type === 1" class="form-wrap">
      <!-- 访问方式 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('user.accessMehod') }}</span> <span class="text-error">*</span>
        </div>
        <div>
          <el-checkbox v-model="createUserOperateForm.accessType" :label="t('user.maoyunAccess')" name="type" />
          <p class="sub-text mt6">
            {{ t('user.accessMehodDesc') }}
          </p>
        </div>
      </el-col>
      <!-- 控制台密码 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('user.consolePwd') }}</span> <span class="text-error">*</span>
        </div>
        <div>
          <el-radio-group v-model="createUserOperateForm.pwdType" class="radio-group" @change="handlePwdType">
            <div class="mb20">
              <el-radio :label="1">
                {{ t('user.autoPwd') }}
              </el-radio>
            </div>
            <div>
              <el-radio :label="0">
                {{ t('user.customPwd') }}
              </el-radio>
            </div>
          </el-radio-group>
          <div class="mt10 c-pwd-wrap">
            <el-input
              v-model.trim="createUserOperateForm.pwd"
              style="width: 280px"
              autocomplete="off"
              @focus="showPwdPanel = true"
              @blur="showPwdPanel = false"
            />
            <!-- pwd-panel -->
            <transition name="el-zoom-in-top">
              <div v-show="showPwdPanel" class="pwd-panel">
                <p v-for="(item, index) in pwdText" :key="index" class="df">
                  <SvgIcon :name="item.right ? 'pwd-success' : 'pwd-warning'" class="mr4" /><span class="common-text">{{
                    item.desc
                  }}</span>
                </p>
              </div>
            </transition>
          </div>
          <!-- 下次登录时重置密码 -->
          <div class="mt6">
            <el-checkbox v-model="createUserOperateForm.nextResetPwd" :label="t('user.nextResetPwdDesc')" name="type" />
          </div>
        </div>
      </el-col>
      <!-- 登录保护 -->
      <el-col :span="24" class="df mb20">
        <div class="df ac" :class="labelWidthClass">
          <span class="key">{{ t('overview.loginProtect') }}</span> <span class="text-error mr4">*</span>
          <el-tooltip :content="t('user.loginSecureTooltip')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-warning" style="width: 17px; height: 17px" />
          </el-tooltip>
        </div>
        <el-switch v-model="createUserOperateForm.loginSecure" />
      </el-col>
      <!-- 操作保护 -->
      <el-col :span="24" class="df">
        <div class="df ac" :class="labelWidthClass">
          <span class="key mr4">{{ t('overview.operateProtect') }}</span
          ><el-tooltip :content="t('user.operateSecureTooltip')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-warning" style="width: 17px; height: 17px" />
          </el-tooltip>
        </div>
        <el-switch v-model="createUserOperateForm.operateSecure" />
      </el-col>
    </el-row>

    <div v-if="type === 1" class="btn-wrap">
      <el-button @click="emits('changeStep', 'a')">
        {{ t('user.prev') }}
      </el-button>
      <el-button type="primary" @click="next">
        {{ t('common.next') }}
      </el-button>
    </div>

    <div v-else class="btn-wrap">
      <el-button @click="emits('changeStep', 'a')">
        {{ t('user.prev') }}
      </el-button>
      <el-button :loading="loading" type="primary" @click="complete">
        {{ t('role.finish') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { useSubUserCreateStore } from '@/store'
import { storeToRefs } from 'pinia'
import { randomPassword, lower, upper, digits, symbols } from 'secure-random-password'
import { PWD_REG, EMIAL_REG } from '@/views/auth/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface CreateUserInfoForm {
  name: string
  remark: string
  phone: string
  email: string
}

interface CreateUserOperateForm {
  accessType: boolean
  pwdType: number
  pwd: string
  nextResetPwd: boolean
  loginSecure: boolean
  operateSecure: boolean
}

interface PropType {
  type: number
  loading: boolean
}

const accessUserStore = useSubUserCreateStore()
const props = withDefaults(defineProps<PropType>(), {
  type: 1,
  loading: false,
})

const { type } = toRefs(props)

const emits = defineEmits<{
  (event: 'changeStep', stepStatus: string): void
  (event: 'create', params: any): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w180px',
  [en]: 'key-wrap-w180px',
  [zh]: 'key-wrap-w110px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const phonePre = ref<string>('+86') // 手机号前缀
const showPwdPanel = ref<boolean>(false)
const phoneReg = /^1[3-9]\d{9}$/ // 手机正则 大陆+86

// 设置用户信息
const createUserInfoForm = reactive<CreateUserInfoForm>({
  name: '',
  remark: '',
  phone: '',
  email: '',
})

// 设置用户操作
const createUserOperateForm = reactive<CreateUserOperateForm>({
  accessType: false,
  pwdType: 0,
  pwd: '',
  nextResetPwd: false,
  loginSecure: false,
  operateSecure: false,
})
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const tips = computed(() => [
  {
    main: type.value === 1 ? t('user.createStep2Tip1') : t('user.createStep2Tip2'),
  },
])

const pwdText = ref<any[]>([
  {
    desc: t('user.createRule1'),
    right: false,
  },
  {
    desc: t('user.createRule2'),
    right: false,
  },
  {
    desc: t('user.createRule3'),
    right: false,
  },
  {
    desc: t('user.createRule4'),
    right: false,
  },
])

// 用户名失焦
const handleName = () => {
  if (createUserInfoForm.name && createUserOperateForm.pwd === createUserInfoForm.name) {
    return message.warning(t('user.userNameNotEqualPwdWarn'))
  }
}

// 手机失焦
const handlePhone = () => {
  // 验证手机格式
  if (createUserInfoForm.phone && !phoneReg.test(createUserInfoForm.phone)) {
    return message.warning(t('user.phoneFormatWarn'))
  }
}

// 邮箱失焦
const handleEmail = () => {
  // 验证邮箱格式
  if (createUserInfoForm.email && !EMIAL_REG.test(createUserInfoForm.email)) {
    return message.warning(t('user.emailFormatWarn'))
  }
  // 不能和登录邮箱一样
  if (createUserInfoForm.email && createUserInfoForm.email === user.value.email) {
    return message.warning(t('user.emailValueWarn'))
  }
}

// 用户名输入
const handleChangeName = (value: string) => {
  // 移除空格
  value = value.replace(/\s/g, '')

  // 长度为1-32个字符，使用字母数字和字符除去空格,不允许输入中文等语音
  const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/
  if (!regex.test(value)) {
    createUserInfoForm.name = value.replace(/[^\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '') // 将非法字符删除
  } else {
    createUserInfoForm.name = value
  }
}

// 手机输入
const handleChangePhone = (value: string) => {
  if (!/^\d*$/.test(value)) {
    createUserInfoForm.phone = value.replace(/\D/g, '')
  }
}

// 切换控制台密码类型
const handlePwdType = (pwdType: any) => {
  console.log(`handlePwdType===>`, pwdType)

  createUserOperateForm.pwd = ''

  if (pwdType === 1) {
    const password = generatePassword(createUserInfoForm.name)

    console.log(`password===>`, password)
    createUserOperateForm.pwd = password
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

// 下一步
const next = () => {
  if (!createUserInfoForm.name) {
    return message.warning(t('user.userNameWarn'))
  }
  if (!createUserInfoForm.email) {
    return message.warning(t('user.emailWarn'))
  }
  // 验证手机格式
  if (createUserInfoForm.phone && !phoneReg.test(createUserInfoForm.phone)) {
    return message.warning(t('user.phoneFormatWarn'))
  }
  // 验证邮箱格式
  if (!EMIAL_REG.test(createUserInfoForm.email)) {
    return message.warning(t('user.emailFormatWarn'))
  }
  if (!createUserOperateForm.pwd) {
    return message.warning(t('user.pwdWarn'))
  }
  console.log(`PWD_REG res===>`, PWD_REG.test(createUserOperateForm.pwd))
  // 验证密码格式
  if (!PWD_REG.test(createUserOperateForm.pwd)) {
    return message.warning(t('user.pwdFormatWarn'))
  }
  if (createUserOperateForm.pwd === createUserInfoForm.name) {
    return message.warning(t('user.pwdNotEqualUserNameWarn'))
  }
  accessUserStore.setCreateUserInfoForm(createUserInfoForm)
  accessUserStore.setCreateUserOperateForm(createUserOperateForm)
  emits('changeStep', 'c')
}

// 完成
const complete = () => {
  if (!createUserInfoForm.name) {
    return message.warning(t('user.userNameWarn'))
  }
  if (!createUserInfoForm.email) {
    return message.warning(t('user.emailWarn'))
  }
  // 验证邮箱格式
  if (!EMIAL_REG.test(createUserInfoForm.email)) {
    return message.warning(t('user.emailFormatWarn'))
  }

  const params = {
    parentId: user.value.id,
    userType: 2,
    userName: createUserInfoForm.name,
    mobile: createUserInfoForm.phone,
    contactEmail: createUserInfoForm.email,
    remark: createUserInfoForm.remark,
  }

  emits('create', params)
}

// pwd交互
watch(
  () => createUserOperateForm.pwd,
  (v: string | undefined) => {
    if (!v) {
      pwdText.value.forEach(item => (item.right = false))
      return
    }
    // 8-32位字符
    pwdText.value[0].right = v.length > 8 && v.length < 32
    // 包含大写字母，小写字母，数字，特殊字符（除空格）
    pwdText.value[1].right = PWD_REG.test(v)
    pwdText.value[3].right = PWD_REG.test(v)
    // 不能与当前用户名相同
    pwdText.value[2].right = createUserOperateForm.pwd !== createUserInfoForm.name
  },
)
</script>

<style lang="scss" scoped>
.b-wrap {
  .user-info-wrap {
    margin-bottom: 60px;

    .title {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      font-weight: 400;
      line-height: 22px;
      color: var(--common-text);
    }

    .phone {
      :deep(.el-input-group__prepend) {
        background: transparent;
      }
    }

    .select {
      // width: 160px;  英文下宽度不够
      width: 200px;
      height: 34px;
    }
  }

  .form-wrap {
    .radio-group {
      display: block !important;
    }

    .sub-text {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--sub-text);
    }

    .key-wrap-w110px {
      width: 110px;
    }

    .key-wrap-w180px {
      width: 180px;
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

    .c-pwd-wrap {
      position: relative;
      display: inline-block;

      .pwd-panel {
        position: absolute;
        top: 37px;
        z-index: 2;
        padding: 8px 20px 8px 8px;

        /* width: 280px; */
        // height: 132px;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 0 11px 0 rgb(165 196 239 / 52%);

        .common-text {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 12px;
          font-weight: 400;
          line-height: 17px;
          color: var(--common-text);
        }
      }
    }
  }
}

.btn-wrap {
  margin-top: 40px;
}

// 清除tablehover
:deep(.el-table) {
  --el-fill-color-light: transparent;

  /* .el-table__row {
    background: transparent;
  } */
}
</style>
