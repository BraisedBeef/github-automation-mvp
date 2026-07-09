<template>
  <div class="page">
    <!-- title -->
    <LoginTitle style="margin-bottom: 28px" :title="t('login.setNewPwd')" />
    <el-form ref="resetFormRef" :model="resetPwdForm" :rules="rules" label-position="left">
      <!-- 密码 -->
      <el-form-item prop="pwd" class="password-wrap">
        <el-input
          v-model.trim="resetPwdForm.pwd"
          type="password"
          :placeholder="t('domainSet2.pwdPlaceholder2')"
          :max-length="32"
          show-password
          @focus="() => (showPanel = true)"
          @blur="() => (showPanel = false)"
        />
        <PwdPanel v-show="showPanel" :value="resetPwdForm.pwd" class="pwd-panel" />
      </el-form-item>
      <!-- 确认密码 -->
      <el-form-item prop="re_pwd" style="margin-bottom: 25px">
        <el-input
          v-model.trim="resetPwdForm.re_pwd"
          type="password"
          :placeholder="t('login.confirmNewPwd')"
          :max-length="32"
          show-password
        />
      </el-form-item>
      <!-- 确认修改 -->
      <el-form-item>
        <el-button class="reset-pwd-btn w-full" type="primary" :loading="loading" @click="confirm(resetFormRef)">
          {{ t('login.confirmChange') }}
        </el-button>
      </el-form-item>

      <el-divider>
        {{ t('login.or') }}
      </el-divider>

      <!-- 返回登录 -->
      <el-form-item>
        <div class="default-btn cat-flex" @click="pushRoute({ name: 'Login' })">
          {{ t('login.backLogin') }}
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import LoginTitle from '../components/login-title.vue'
import PwdPanel from '../components/pwd-panel.vue'
import { PWD_REG } from '../config'
import { _resetPwd } from '@/apis/login'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { pushRoute } from '@/utils/router-jump'

interface ResetPwdForm {
  pwd: string
  re_pwd: string
}

const route = useRoute()
const resetFormRef = ref<FormInstance>()
// 校验密码
const checkPwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!PWD_REG.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}
// 校验二次密码
const checkRePwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  }
  if (value !== resetPwdForm.pwd) {
    callback(new Error(t('myDomains.samePwdValidate')))
  } else {
    callback()
  }
}

const loading = ref<boolean>(false)
const account = ref<string>('')
const code = ref<string>('')
const showPanel = ref<boolean>(false) // 密码强度显示面板

const resetPwdForm = reactive<ResetPwdForm>({
  pwd: '',
  re_pwd: '',
})

const rules = reactive<FormRules<ResetPwdForm>>({
  pwd: [{ validator: checkPwd, trigger: 'blur' }],
  re_pwd: [{ validator: checkRePwd, trigger: 'blur' }],
})

const phonePre = ref<string>('')

// 重置密码
const confirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      resetPwd()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 设置新密码
const resetPwd = async () => {
  try {
    const params: any = {
      email: account.value,
      code: code.value,
      newPassword: resetPwdForm.pwd,
    }

    loading.value = true
    const res = await _resetPwd(params)

    if (res.success) {
      pushRoute({ name: 'ResetSuccess' })
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  account.value = route.query.account as string
  phonePre.value = route.query.phonePre as string
  code.value = route.query.code as string
})
</script>

<style scoped lang="scss">
@use '../style/page';
@use '../style/btn';
@use '../style/form.scss' as form;
@use '../style/pwd-panel';
@include form.formStyles;
</style>
