<template>
  <CatDialog
    :dialog="dialog"
    :title="t('domainSet2.resetLockPwd', { domainName })"
    :width="550"
    class="forget-pwd-dialog"
    :loading="loading"
    :disabled="!form.code"
    @update:dialog="(v: boolean) => !v && close()"
    @confirm="() => submit(pwdFormRef)"
  >
    <div class="reset-pwd">
      <el-form
        ref="pwdFormRef"
        :model="form"
        :rules="rules"
        label-position="left"
        label-width="auto"
        @validate="formValidate"
      >
        <el-form-item :label="t('domainSet2.forgetlabel1')" prop="pwd" class="error-icon">
          <el-input
            v-model.trim="form.pwd"
            type="password"
            autocomplete="off"
            :placeholder="t('domainSet2.forgetPlaceholder1')"
          />
        </el-form-item>
        <el-form-item :label="t('domainSet2.forgetLabel2')" prop="re_pwd" class="error-icon">
          <el-input
            v-model.trim="form.re_pwd"
            type="password"
            :placeholder="t('domainSet2.forgetPlaceholder2')"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          :label="baseStore.projectType === '1' ? t('domainSet2.forgetLabel3') : t('domainSet2.forgetLabel4')"
          class="co"
          prop="code"
        >
          <el-input
            v-model.number="form.code"
            :max-length="6"
            :placeholder="t('domainSet2.forgetPlaceholder3')"
            autocomplete="off"
          />
          <el-link type="primary" class="get-code" :disabled="loading || !form.pwd || count > 0" @click="getCode">
            {{ count > 0 ? t('common.codeThen', { time: count }) : t('common.getCode') }}
          </el-link>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _md5 } from '@/utils/md5'
import { useBaseStore } from '@/store'
import { _resetDomainPassword, _sendDomainPasswordCode } from '@/apis/dns/domain'
import { message } from '@/utils/message'
import type { FormInstance } from 'element-plus'
const baseStore = useBaseStore()
const props = withDefaults(
  defineProps<{
    dialog: boolean
    domainId: string
    domainName: string
  }>(),
  {
    dialog: false,
  },
)

const emit = defineEmits<{
  (event: 'update:dialog', dialog: boolean): void
  (event: 'success'): void
}>()

const checkPwd = (rule: any, value: any, callback: any) => {
  callback()
}
const checkRePwd = (rule: any, value: any, callback: any) => {
  if (value !== form.value.pwd) {
    callback(new Error(t('domainSet2.pwdSamleValidate')))
  } else {
    callback()
  }
}

let timer = ref<any>(null)
let count = ref(0)
let loading = ref(false)

const form = ref({
  pwd: '',
  re_pwd: '',
  code: '',
})
const rules = ref({
  pwd: [{ validator: checkPwd, trigger: 'blur' }],
  re_pwd: [{ validator: checkRePwd, trigger: 'blur' }],
})

const pwdFormRef = ref()

const validateErr = ref({
  pwd: true,
  re_pwd: true,
})

// 任一校验触发
const formValidate = (key: any, right: boolean): any => {
  validateErr.value[key] = right
}

const submit = formEl => {
  if (!formEl) return
  formEl.validate(async valid => {
    if (valid) {
      try {
        loading.value = true
        const { code } = await _resetDomainPassword({
          domainId: Number(props.domainId),
          password: _md5(form.value.pwd),
          type: baseStore.projectType == '2' ? 'email' : 'sms',
          code: form.value.code + '',
        })
        loading.value = false
        if (code === 200) {
          message.success(t('common.changeSuccess'))
          formEl.resetFields()
          emit('update:dialog', false)
          emit('success')
          timer.value = null
          count.value = 0
        }
      } catch (error) {
        loading.value = false
      }
    } else {
      console.log('error submit!')
      loading.value = false
      return false
    }
  })
}
const getCode = async () => {
  if (timer.value) {
    return
  } else {
    try {
      loading.value = true
      const { code } = await _sendDomainPasswordCode({
        type: baseStore.projectType == '2' ? 'email' : 'sms',
      })
      loading.value = false
      if (code === 200) {
        message.success(t('common.codeSent'))
        clearInterval(timer.value)
        count.value = 60
        timer.value = setInterval(() => {
          count.value--
          if (count.value === 0) {
            clearInterval(timer.value)
            timer.value = null
          }
        }, 1000)
      }
    } catch (error) {
      loading.value = false
      timer.value = null
      count.value = 0
    }
  }
}

const close = () => {
  pwdFormRef.value.resetFields()
  count.value = 0
  loading.value = false
  timer.value = null
  validateErr.value.pwd = true
  validateErr.value.re_pwd = true
  emit('update:dialog', false)
}
</script>

<style scoped lang="scss">
.reset-pwd {
  :deep(.el-form) {
    .el-form-item {
      .el-form-item__content {
        position: relative;

        .el-input {
          width: 360px;
        }

        .get-code {
          position: absolute;
          top: 50%;
          right: 68px;
          transform: translateY(-50%);
        }
      }

      &.co {
        margin-bottom: 0;
      }
    }
  }
}
</style>
