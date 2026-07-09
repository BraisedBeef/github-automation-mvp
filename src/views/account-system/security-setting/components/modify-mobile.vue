<template>
  <CatDialog
    v-model:dialog="dialogFormVisible"
    :title="t('securitySetting.modifyingSecurePhones')"
    width="600px"
    destroy-on-close
    @update:dialog="closeFn"
  >
    <el-form
      ref="mobileFormRef"
      require-asterisk-position="right"
      :model="form"
      :rules="rules"
      class="multilingual_form"
    >
      <el-form-item :label="t('securitySetting.bindNewPhone')" required prop="mobile">
        <el-input
          v-model="form.mobile"
          style="max-width: 600px"
          :placeholder="t('securitySetting.pleaseEnterYourPhoneNumber')"
          class="input-with-select"
        >
          <template #prepend>
            <el-select v-model="form.prefix" style="width: 160px">
              <el-option label="中国大陆（+86）" value="+86" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('securitySetting.mobileVerificationCode')" required prop="region" class="code-wrap">
        <div class="w100 h100 df ac">
          <el-input
            v-model="form.region"
            :placeholder="t('securitySetting.sixDigitVerificationCode')"
            class="input-with-select code-input"
          />
          <VerifyCodeBtn :verify-fun="getCode" :active="phoneCodeKey" :border="false" />
          <!-- <el-button v-if="regionKey" type="primary" link class="primary_link-button" disabled>
            {{ t('securitySetting.resend') }}({{ regionNum }})
          </el-button>
          <el-button type="primary" link class="primary_link-button ml10" v-else @click="getCode">
            {{ t('securitySetting.sendVerificationCode') }}
          </el-button> -->
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
import { FormInstance, FormRules } from 'element-plus/es'
import { message } from '@/utils/message'

import { _sendUpdatePhoneSms, _verifySms } from '@/apis/account-system/access/user'
import { notify } from '@/utils/notification'

interface Form {
  mobile: string
  region: string
}

const props = withDefaults(
  defineProps<{
    uid: number
    phone: string | undefined
    callback: () => void
  }>(),
  {
    uid: 0,
    callback: () => {},
  },
)

const mobileFormRef = ref<any>()
const phoneCodeKey = ref<boolean>(false)
const dialogFormVisible = ref<boolean>(false)
const form = ref<{
  prefix: string
  mobile: string
  region: string
}>({
  prefix: '+86',
  mobile: '',
  region: '',
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

const phoneReg = /^1[3-9]\d{9}$/ // 手机正则 大陆+86

// 校验手机号
const checkPhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    phoneCodeKey.value = false
    return callback('')
  } else if (!phoneReg.test(value)) {
    phoneCodeKey.value = false
    return callback(new Error(t('common.formatErr')))
  } else if (props.phone === value) {
    phoneCodeKey.value = false
    return callback(new Error(t('user.phoneWarn')))
  } else {
    phoneCodeKey.value = true
    callback()
  }
}

const rules = reactive<FormRules<Form>>({
  mobile: [{ required: true, validator: checkPhone, trigger: 'blur' }],
  region: [{ required: true, message: '', trigger: 'blur' }],
})

const getCode = async () => {
  // 获取验证码
  const res = await _sendUpdatePhoneSms({
    phone: form.value.mobile, // 该字段取新手机
    uid: Number(props.uid) as number, //用户id
  })
  if (res.code === 10000) {
    message.success(t('common.codeSent'))
    // regionKey.value = true
    // sendTimeout()
    return true
  } else {
    message.warning(res.msg)
    return false
  }
}

const submit = async () => {
  console.log('submit')
  const res = await mobileFormRef.value.validate()
  console.log('res', form.value)
  // 修改安全手机
  const ress = await _verifySms({
    uid: props.uid as number,
    phone: form.value.mobile,
    code: form.value.region,
  })
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
    prefix: '+86',
    mobile: '',
    region: '',
  }
  phoneCodeKey.value = false
  mobileFormRef.value.resetFields()
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
