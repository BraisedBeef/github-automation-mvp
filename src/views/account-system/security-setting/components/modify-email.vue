<template>
  <CatDialog
    v-model:dialog="dialogFormVisible"
    :title="t('securitySetting.modifyBoundEmail')"
    width="600px"
    destroy-on-close
    @update:dialog="closeFn"
  >
    <el-form
      ref="emailFormRef"
      :model="form"
      :rules="rules"
      class="multilingual_form"
      require-asterisk-position="right"
    >
      <el-form-item :label="t('securitySetting.bindNewEmail')" required prop="email">
        <el-input v-model="form.email" :placeholder="t('securitySetting.bindNewEmail')" class="input-with-select" />
      </el-form-item>
      <el-form-item :label="t('securitySetting.emailVerificationCode')" required prop="code" class="code-wrap">
        <div class="w100 h100 df ac">
          <el-input
            v-model="form.code"
            :placeholder="t('securitySetting.sixDigitVerificationCode')"
            :maxlength="6"
            class="code-input"
          />
          <!-- <el-button v-if="regionKey" type="primary" link class="primary_link-button" disabled>
                {{ t("securitySetting.resend") }}({{ regionNum }})
            </el-button>
            <el-button type="primary" link class="ml10 primary_link-button" v-else @click="getCode">
                {{ t("securitySetting.sendVerificationCode") }}
            </el-button> -->
          <VerifyCodeBtn :verify-fun="getCode" :active="emailCodeKey" :border="false" />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer cat-dialog-footer">
        <el-button type="primary" @click="submit">
          {{ t('securitySetting.determine') }}
        </el-button>
        <el-button @click="closeFn">
          {{ t('securitySetting.cancel') }}
        </el-button>
      </div>
    </template>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { FormRules } from 'element-plus/es'

import { message } from '@/utils/message'
import { _sendMail } from '@/apis/account-system/user'
import { _updateEmail } from '@/apis/account-system/access/user'
import { notify } from '@/utils/notification'
interface Form {
  email: string
  code: string
}

const props = withDefaults(
  defineProps<{
    uid: number
    email: string
    callback: () => void
  }>(),
  {
    uid: 0,
    email: '',
    callback: () => {},
  },
)

const emailFormRef = ref<any>()
const emailCodeKey = ref<boolean>(false)
const dialogFormVisible = ref<boolean>(false)
const form = ref<{
  email: string
  code: string
}>({
  email: '',
  code: '',
})
const regionKey = ref<boolean>(false)
const regionNum = ref<number>(60)
const timeout = ref<any>(null)

const eamilReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // 邮箱正则

// 校验邮箱
const checkEmail = (rule: any, value: any, callback: any) => {
  if (!value) {
    // return callback(new Error(t('login.emailEmpty')))
    emailCodeKey.value = false
    return callback(new Error(''))
  } else if (!eamilReg.test(value)) {
    emailCodeKey.value = false
    return callback(new Error(t('common.formatErr')))
  } else if (value === props.email) {
    emailCodeKey.value = false
    return callback(new Error(t('securitySetting.secureEmailRepeat')))
  } else {
    emailCodeKey.value = true
    callback()
  }
}

const rules = reactive<FormRules<Form>>({
  email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
  code: [{ required: true, message: '', trigger: 'blur' }],
  // code: [{ required: true, message: t('login.codeEmpty'), trigger: 'blur' }],
})

const sendTimeout = () => {
  timeout.value = setTimeout(() => {
    if (regionNum.value === 1) {
      clearTimeout(timeout.value)
      timeout.value = null
      regionKey.value = false
      regionNum.value = 60
    } else {
      regionNum.value -= 1
      sendTimeout()
    }
  }, 1000)
}

const getCode = async () => {
  await emailFormRef.value.validateField('email')
  const params = {
    email: form.value.email,
    type: 5,
  }
  const res = await _sendMail(params)
  if (res.success) {
    // 获取验证码
    // regionKey.value = true;
    // sendTimeout()
    message.success(t('common.codeSent'))
    return true
  } else {
    return false
  }
}

const submit = async () => {
  await emailFormRef.value.validate()
  const params = {
    uid: props.uid,
    ...form.value,
  }
  // 修改安全邮箱
  const ress = await _updateEmail(params)
  if (ress.code === 10000) {
    props.callback && props.callback()
    message.success('修改成功')
    closeFn()
  } else {
    notify.warning({
      message: ress.msg,
      offset: 100,
      duration: 3000,
    })
  }
}

const closeFn = () => {
  form.value = {
    email: '',
    code: '',
  }
  emailCodeKey.value = false
  emailFormRef.value.resetFields()
  dialogFormVisible.value = false
}

defineExpose({
  showDialog: () => {
    dialogFormVisible.value = true
  },
})
</script>
<style lang="scss" scoped>
:deep(.el-input-group__prepend) {
  background: #fff;
  box-shadow: none;
}

.dialog-footer {
  text-align: center;
}

:deep(.el-form-item__error) {
  .el-form-item__error {
    left: 0 !important;
  }
}

.ml10 {
  margin-left: 10px;
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

.code-input {
  width: 400px;
}
</style>
