<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('sensity.operateTit')"
    width="600px"
    destroy-on-close
    @confirm="confirmHandle(formRef)"
    @update:dialog="v => !v && closeHandle()"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="left"
      label-width="110px"
      hide-required-asterisk
    >
      <!-- 验证方式 -->
      <el-form-item :label="t('sensity.validateMethod')">
        <span>{{ t('sensity.emailValidate') }}</span>
      </el-form-item>
      <!-- 安全手机 -->
      <el-form-item :label="t('sensity.securePhone')">
        <span>{{ user.mobile || '-' }}</span>
      </el-form-item>
      <!-- 邮箱验证码 -->
      <el-form-item :label="t('sensity.emailCode')" prop="code" class="code-wrap">
        <div class="w-full h-full df ac">
          <el-input v-model.trim="form.code" :placeholder="t('sensity.emailCodePlaceholder')" />
          <VerifyCodeBtn :verify-fun="getCode" :active="user.email ? true : false" :border="false" />
        </div>
      </el-form-item>
    </el-form>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { _sendMail } from '@/apis/account-system/user'
import { _sensitiveVerifyEmailCode } from '@/apis/account-system/sensity'
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

interface Form {
  code: string
}

const props = withDefaults(
  defineProps<{
    onHandleClose: any
    onHandleConfirm: any
    perms?: string
  }>(),
  {
    onHandleClose: () => {},
    onHandleConfirm: () => {},
  },
)

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const rules = reactive<FormRules<Form>>({
  code: [{ required: true, message: '', trigger: 'blur' }],
})

const formRef = ref<FormInstance>()
const isConfirmToClose = ref<boolean>(false) // 是否为点击确认后触发关闭
const show = ref<boolean>(true) // 弹窗显示
const form = reactive<Form>({
  code: '',
})

// 验证敏感操作验证码
const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')

      const res = await _sensitiveVerifyEmailCode({
        email: user.value.contactEmail, // 此字段是联系邮箱
        type: 4,
        code: form.code,
        perms: props.perms as string,
      })

      if (res.success) {
        props.onHandleConfirm({
          success: true,
        })
        show.value = false
        isConfirmToClose.value = true
      } else {
        message.warning(res.msg)
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

const closeHandle = () => {
  // console.log(`组件closeHandle触发===>`)

  !isConfirmToClose.value &&
    props.onHandleClose({
      success: false,
    })
}

// 获取验证码
const getCode = async () => {
  console.log(`获取验证码===>`)

  const res = await _sendMail({
    email: user.value.contactEmail,
    type: 4,
  })

  if (res.success) {
    message.success(t('common.codeSent'))
    return true
  } else {
    message.warning(res.msg)
    return false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.el-form-item {
  height: 34px;
  margin-bottom: 20px;
}

.tip {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: var(--common-text);
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

  :deep(.el-form-item__error) {
    left: 0 !important;
  }
}
</style>
