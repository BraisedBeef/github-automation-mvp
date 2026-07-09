<template>
  <div class="page reset-pwd-page-v2">
    <!-- title -->
    <h1 v-if="isV2Theme" class="reset-pwd-page-v2__title">
      {{ t('login.setNewPwd') }}
    </h1>
    <LoginTitle v-else style="margin-bottom: 28px" :title="t('login.setNewPwd')" />
    <el-form ref="resetFormRef" :model="resetPwdForm" :rules="rules" label-position="left">
      <!-- 密码 -->
      <el-form-item prop="pwd" class="password-wrap">
        <el-input
          v-model.trim="resetPwdForm.pwd"
          :type="isV2Theme && passwordVisible ? 'text' : 'password'"
          :placeholder="isV2Theme ? t('login.newPasswordPlaceholder') : t('domainSet2.pwdPlaceholder2')"
          :max-length="32"
          :show-password="!isV2Theme"
          @focus="() => (showPanel = true)"
          @blur="() => (showPanel = false)"
        >
          <template v-if="isV2Theme" #suffix>
            <button
              class="password-visibility"
              type="button"
              :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
              @mousedown.prevent
              @click="passwordVisible = !passwordVisible"
            >
              <el-icon>
                <View v-if="passwordVisible" />
                <Hide v-else />
              </el-icon>
            </button>
          </template>
        </el-input>
        <PwdPanel v-show="showPanel" :value="resetPwdForm.pwd" class="pwd-panel" />
      </el-form-item>
      <!-- 确认密码 -->
      <el-form-item prop="re_pwd" style="margin-bottom: 25px">
        <el-input
          v-model.trim="resetPwdForm.re_pwd"
          :type="isV2Theme && confirmPasswordVisible ? 'text' : 'password'"
          :placeholder="isV2Theme ? t('login.repeatNewPasswordPlaceholder') : t('login.confirmNewPwd')"
          :max-length="32"
          :show-password="!isV2Theme"
        >
          <template v-if="isV2Theme" #suffix>
            <button
              class="password-visibility"
              type="button"
              :aria-label="confirmPasswordVisible ? 'Hide password' : 'Show password'"
              @click="confirmPasswordVisible = !confirmPasswordVisible"
            >
              <el-icon>
                <View v-if="confirmPasswordVisible" />
                <Hide v-else />
              </el-icon>
            </button>
          </template>
        </el-input>
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
import { useThemeVersion } from '@/hooks/use-theme-version'
import { Hide, View } from '@element-plus/icons-vue'

interface ResetPwdForm {
  pwd: string
  re_pwd: string
}

const route = useRoute()
const { isV2Theme } = useThemeVersion()
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
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)

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

<style lang="scss">
.theme-v2 .reset-pwd-page-v2 {
  position: relative;
  top: auto;
  left: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 640px;
  min-height: 0;
  padding: 48px;
  font-family: 'Noto Sans CJK SC', 'PingFang SC', sans-serif;
  background: #fff;
  border-radius: 0;
  box-shadow: 0 4px 10px rgb(0 0 0 / 10%);
  transform: none;

  &__title {
    width: 100%;
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    color: #191c23;
  }

  .el-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .el-form-item {
    height: 48px;
    margin: 0 !important;

    .el-form-item__content,
    .el-input {
      width: 100%;
      height: 48px !important;
      line-height: 24px;
    }

    .el-input__wrapper {
      height: 48px !important;
      padding: 12px 16px !important;
      border: 1px solid #dcdfe6;
      border-radius: 0;
      box-shadow: none !important;

      &:hover {
        border-color: #06f;
      }

      &.is-focus {
        border: 1px solid #06f !important;
      }
    }

    .el-input__inner {
      height: 24px;
      font-family: inherit;
      font-size: 16px;
      line-height: 24px;
      color: #191c23;

      &::placeholder {
        color: #828b9c;
      }
    }

    .el-input__suffix-inner svg {
      width: 20px;
      height: 20px;
      color: #828b9c;
    }

    &.is-error .el-input__wrapper {
      border: 1px solid var(--error-color) !important;
    }
  }

  .reset-pwd-btn {
    width: 100%;
    height: 48px !important;
    padding: 12px 16px;
    margin: 0;
    font-family: inherit;
    font-size: 16px;
    line-height: 24px;
    background: #06f;
    border-color: #06f;
    border-radius: 0 !important;
  }

  .password-visibility {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: #828b9c;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .password-wrap {
    z-index: 2;

    .pwd-panel {
      top: calc(100% + 10px);
      bottom: auto;
      left: 0;
      z-index: 10;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 360px;
      min-width: 360px;
      padding: 16px;
      font-family: inherit;
      background: #fff;
      border: 1px solid #e8ecf3;
      border-radius: 0;
      box-shadow: 0 4px 5px rgb(0 0 0 / 10%);
      transform: none;

      .safety-title {
        align-items: center;
        height: 20px;
        margin: 0;
        font-family: inherit;
        font-size: 12px;
        line-height: 20px;
        color: #191c23;

        .safety-pipe {
          gap: 2px;
          margin-left: 4px;

          .item {
            width: 28px;
            height: 6px;
            margin: 0;
            background: #dcdfe6;

            &.error.active {
              background: #e54839;
            }

            &.warning.active {
              background: #ff720d;
            }

            &.success.active {
              background: #01a66f;
            }
          }

          .desc {
            margin-left: 2px;
            font-size: 12px;
            font-weight: 500;
            line-height: 20px;
          }
        }
      }

      .safety-content {
        gap: 4px;

        .line {
          gap: 6px;
          align-items: center;
          min-height: 20px;
          margin: 0;
          font-family: inherit;
          font-size: 12px;
          line-height: 20px;
          color: #191c23;

          svg {
            width: 16px;
            height: 16px;
            margin: 0;
          }

          .rule-icon {
            position: relative;
            box-sizing: border-box;
            flex-shrink: 0;
            width: 14px;
            height: 14px;
            margin: 1px;
            border: 1px solid currentcolor;
            border-radius: 50%;

            &.success {
              color: #01a66f;

              &::after {
                position: absolute;
                top: 2px;
                left: 4px;
                width: 3px;
                height: 6px;
                content: '';
                border-right: 1px solid currentcolor;
                border-bottom: 1px solid currentcolor;
                transform: rotate(45deg);
              }
            }

            &.warning {
              color: #e54839;

              &::before {
                position: absolute;
                top: 2px;
                left: 5px;
                width: 1px;
                height: 5px;
                content: '';
                background: currentcolor;
              }

              &::after {
                position: absolute;
                bottom: 2px;
                left: 5px;
                width: 1px;
                height: 1px;
                content: '';
                background: currentcolor;
              }
            }
          }

          .text {
            line-height: 20px;
            white-space: nowrap;
          }
        }
      }

      .triangle-down {
        top: -8px;
        bottom: auto;
        left: 24px;
        box-sizing: border-box;
        width: 14px;
        height: 14px;
        background: #fff;
        border: 0;
        border-top: 1px solid #e8ecf3;
        border-left: 1px solid #e8ecf3;
        transform: rotate(45deg);
      }
    }
  }

  .el-divider {
    height: 14px;
    margin: 0;
    border-color: #dcdfe6;

    .el-divider__text {
      padding: 0 8px;
      font-family: inherit;
      font-size: 14px;
      line-height: 22px;
      color: #191c23;
    }
  }

  .default-btn {
    width: 100%;
    height: 48px;
    font-family: inherit;
    font-size: 16px;
    line-height: 24px;
    color: #191c23;
    border: 1px solid #dcdfe6;
    border-radius: 0 !important;
  }
}
</style>
