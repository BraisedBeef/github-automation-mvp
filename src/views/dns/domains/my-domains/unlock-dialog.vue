<template>
  <CatDialog
    :dialog="dialog"
    :title="t('myDomains.domainUnlock')"
    class="unlock-dialog"
    @cancel="close"
    @update:dialog="(v: boolean) => !v && close()"
  >
    <el-form
      ref="lockFormRef"
      :model="state.form"
      :rules="state.rules"
      label-position="left"
      label-width="auto"
      @validate="formValidate"
    >
      <el-form-item :label="t('myDomains.unlockPwd')" prop="password" class="error-icon">
        <el-input
          v-model.trim="state.form.password"
          type="password"
          :placeholder="t('myDomains.unlockPwdPlaceholder')"
          show-password
          style="width: 280px"
          :max-length="20"
          @keydown.enter="handleEnter"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="cat-dialog-footer">
        <el-button type="primary" :disabled="!state.form.password" :loading="state.loading" @click="confirm">
          {{ t('common.confirm') }}
        </el-button>
        <el-button :disabled="state.loading" @click="close">
          {{ t('common.cancel') }}
        </el-button>
      </div>
    </template>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _domainLock } from '@/apis/dns/domain'
import { _md5 } from '@/utils/md5'
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
const lockFormRef = ref()
const lockPasswordValidate = (rule: any, value: string, callback: Function) => {
  callback()
}
const state = reactive<{
  loading: boolean
  form: { password: string }
  rules: { password: any[] }
}>({
  loading: false,
  form: { password: '' },
  rules: { password: [{ validator: lockPasswordValidate, trigger: 'blur' }] },
})

const validateErr = ref({
  password: true,
})

// 要阻止默认行为  不然回车会刷新当前页面
const handleEnter = event => {
  event.preventDefault()
}

// 任一校验触发
const formValidate = (key: any, right: boolean): any => {
  validateErr.value[key] = right
  console.log('formValidate', validateErr.value)
}

const confirm = async () => {
  try {
    await (lockFormRef.value as any).validateField()
    state.loading = true
    const { code } = await _domainLock({
      type: 'unlock',
      domainId: props.domainId,
      password: _md5(state.form.password),
    })
    state.loading = false
    if (code === 200) {
      emit('success')
      message.success(t('common.operationSuccess'))
    }
    close()
  } catch (error) {
    state.loading = false
    console.log('校验失败')
  }
}
const close = () => {
  lockFormRef.value.resetFields()
  validateErr.value.password = true
  emit('update:dialog', false)
}
</script>

<style scoped lang="scss">
.cat-dialog-footer {
  justify-content: center !important;
}
</style>

<style>
.unlock-dialog {
  width: 500px;
}
</style>
