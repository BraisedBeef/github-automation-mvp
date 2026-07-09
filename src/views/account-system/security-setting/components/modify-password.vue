<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="t('securitySetting.changeLoginPassword')"
    width="460"
    class="mobile-dialog"
  >
    <el-form ref="emailFormRef" require-asterisk-position="right" :model="form">
      <el-form-item
        :label="t('securitySetting.newPassword')"
        required
        prop="newPassword"
        :rules="rules.newPassword"
        :label-width="formLabelWidth"
      >
        <el-input
          v-model="form.newPassword"
          style="max-width: 600px"
          :placeholder="t('securitySetting.pleaseEnterNewPassword')"
          class="input-with-select"
          type="password"
          minlength="8"
        />
      </el-form-item>
      <el-form-item
        :label="t('securitySetting.confirmNewPassword')"
        required
        prop="confirmPassword"
        :rules="rules.confirmPassword"
        :label-width="formLabelWidth"
      >
        <div>
          <el-input
            v-model="form.confirmPassword"
            style="width: 320px"
            :placeholder="t('securitySetting.pleaseConfirmNewPassword')"
            class="input-with-select"
            type="password"
            minlength="8"
          />
        </div>
        <p class="form-item-info">* {{ t('securitySetting.passwordFormatDescription') }}</p>
      </el-form-item>
      <el-form-item
        :label="t('securitySetting.emailVerificationCode')"
        required
        prop="code"
        :label-width="formLabelWidth"
      >
        <div class="form-region">
          <el-input
            v-model="form.code"
            style="width: 200px"
            :placeholder="t('securitySetting.sixDigitVerificationCode')"
            class="input-with-select"
            maxlength="6"
          />
          <el-button v-if="regionKey" type="text" disabled>
            {{ t('securitySetting.resend') }}({{ regionNum }})
          </el-button>
          <el-button v-else class="ml10" type="text" @click="send">
            {{ t('securitySetting.sendVerificationCode') }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ t('securitySetting.cancel') }}
        </el-button>
        <el-button type="primary" @click="submit">
          {{ t('securitySetting.determine') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
// import { PWD_REG } from '@/utils/reg'
import { useUserStore } from '@/store'
import t from '@/utils/i18n'
import { _sendMail, _resetPassword } from '@/apis/account-system/user'
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

// 密码正则
const specialCharacters = '!@#$%^&*()_+~`|}{[\\]:;?><,./-'
const regexString = `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[${specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}])[a-zA-Z0-9${specialCharacters}]{8,32}$`
const pwdReg = new RegExp(regexString)

// 校验密码
const checkPwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(t('login.pwdEmpty')))
  } else if (!pwdReg.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}
// 校验两次密码是否相同
const checkRePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error(t('login.reEnterPwd')))
  } else if (value !== form.value.newPassword) {
    return callback(new Error(t('myDomains.samePwdValidate')))
  } else {
    callback()
  }
}
const userStore = useUserStore()
const emailFormRef = ref<any>()
const formLabelWidth = '100px'
const dialogFormVisible = ref<boolean>(false)
const form = ref<{
  confirmPassword: string
  newPassword: string
  code: string
}>({
  confirmPassword: '',
  newPassword: '',
  code: '',
})
const rules = ref<{
  newPassword: any[]
  confirmPassword: any[]
}>({
  newPassword: [{ validator: checkPwd, trigger: 'blur' }],
  confirmPassword: [{ validator: checkRePassword, trigger: 'blur' }],
})
const regionKey = ref<boolean>(false)
const regionNum = ref<number>(60)
const timeout = ref<any>(null)

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

const send = async () => {
  const params = {
    uid: props.uid,
    email: props.email,
    type: 3,
  }
  await _sendMail(params)
  regionKey.value = true
  sendTimeout()
}

const submit = async () => {
  console.log('submit')
  const res = await emailFormRef.value.validate()
  console.log('res', form.value)
  const ress = await _resetPassword(form.value)
  if (ress.code === 10000) {
    form.value = {
      confirmPassword: '',
      newPassword: '',
      code: '',
    }
    props.callback && props.callback()
    dialogFormVisible.value = false
    userStore.logOut()
  }
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

.form-item-info {
  font-size: 12px;
  color: #555;
}

.ml10 {
  margin-left: 10px;
}
</style>
