<template>
  <CatDialog
    :title="t('myDomains.setLockPwd')"
    :dialog="dialog"
    :width="500"
    class="unlock-pwd-dialog"
    :disabled="!state.form.password || !state.form.re_password"
    @confirm="confirm"
    @update:dialog="(v: boolean) => !v && close()"
  >
    <div class="is-password-tip">
      <SvgIcon name="tip-error" />
      {{ t('myDomains.setLockPwdTip') }}
    </div>
    <div class="is-password">
      <el-form
        ref="form_ref"
        :model="state.form"
        :rules="state.rules"
        hide-required-asterisk
        label-position="left"
        label-width="auto"
        @validate="formValidate"
      >
        <el-form-item :label="t('myDomains.unlockPwd')" prop="password" class="error-icon">
          <el-input
            v-model.trim="state.form.password"
            show-password
            type="password"
            :max-length="20"
            style="height: 34px"
            :placeholder="t('myDomains.unlockPwdPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('myDomains.confirmPwd')" prop="re_password" class="error-icon">
          <el-input
            v-model.trim="state.form.re_password"
            show-password
            type="password"
            :max-length="20"
            :placeholder="t('myDomains.confirmPwdPlaceholder')"
          />
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import { _domainLock } from '@/apis/dns/domain'
import { _md5 } from '@/utils/md5'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
const props = withDefaults(
  defineProps<{
    dialog: boolean
    domainId: string
  }>(),
  {
    dialog: false,
  },
)
const emit = defineEmits<{
  (event: 'update:dialog', dialog: boolean): void
  (event: 'success'): void
}>()
const form_ref = ref()
const setPasswordValidate = (rule: any, value: string, callback: Function) => {
  if (value !== state.form.password) {
    callback(new Error(t('myDomains.samePwdValidate')))
  } else {
    callback()
  }
}
const state = reactive<{
  loading: boolean
  form: {
    password: string
    re_password: string
  }
  rules: {
    password: any[]
    re_password: any[]
  }
}>({
  loading: false,
  form: {
    password: '',
    re_password: '',
  },
  rules: {
    password: [],
    re_password: [{ validator: setPasswordValidate, trigger: 'blur' }],
  },
})

const validateErr = ref({
  password: true,
  re_password: true,
})

// 任一校验触发
const formValidate = (key: any, right: boolean): any => {
  validateErr.value[key] = right
}

const confirm = async () => {
  try {
    await (form_ref.value as any).validateField()
    try {
      state.loading = true
      const { code } = await _domainLock({
        type: 'lock',
        domainId: props.domainId,
        password: _md5(state.form.password),
      })
      state.loading = false
      if (code === 200) {
        message.success(t('common.operationSuccess'))
        emit('success')
        close()
      }
    } catch (error) {
      state.loading = false
    }
  } catch (error) {
    console.log('校验失败', error)
  }
}
const close = () => {
  form_ref.value.resetFields()
  validateErr.value.password = true
  validateErr.value.re_password = true
  emit('update:dialog', false)
}
</script>

<style scoped lang="scss">
.is-password-tip {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 20px;
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  color: var(--error-color);
  background-color: var(--error-box-bgc);
  border-radius: 4px;

  svg {
    flex-shrink: 0;
    align-self: baseline;
    width: 14px;
    height: 14px;
    margin-top: 2px;
    margin-right: 8px;
  }
}

.is-password {
  :deep(.el-form) {
    .el-form-item {
      .el-input {
        width: 280px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
