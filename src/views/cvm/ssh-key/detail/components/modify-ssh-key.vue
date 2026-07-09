<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('sshKey.modifySshKey.title')"
    :width="dialogClass"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <div>
      <!-- form -->
      <div class="form-wrap mt20">
        <el-form
          ref="formRef"
          require-asterisk-position="right"
          label-width="auto"
          :model="form"
          :rules="rules"
          label-position="left"
        >
          <!-- 密钥名称 -->
          <el-form-item :label="t('sshKey.modifySshKey.name')" prop="keyName">
            <el-input
              v-model.trim="form.keyName"
              :placeholder="t('sshKey.modifySshKey.namePh')"
              :max-length="SSH_KEY_NAME_LEN_MAX"
            />
            <p class="name-text">
              {{ t('sshKey.modifySshKey.nameDesc') }}
            </p>
          </el-form-item>

          <!-- 密钥描述 -->
          <el-form-item :label="t('sshKey.modifySshKey.desc')" prop="newPassword">
            <el-input v-model.trim="form.description" :rows="5" type="textarea" placeholder="" />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { _updateInfo } from '@/apis/cvm/ssh-key'
import { SSH_KEY_NAME_REGEX, SSH_KEY_NAME_LEN_MAX } from '@/views/cvm/ssh-key/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '600px',
  [en]: '600px',
  [zh]: '550px',
}

const dialogClass = useI18nStyle(dialogMap)

interface PropType extends Form {
  id: number
}

interface Form {
  keyName: string
  description: string
}

const props = withDefaults(defineProps<PropType>(), {
  keyName: '',
  description: '',
  id: 0,
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

// 校验密钥名称
const checkKeyName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!SSH_KEY_NAME_REGEX.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const form = reactive<Form>({
  keyName: '',
  description: '',
}) // 修改密钥

const rules = reactive<FormRules<Form>>({
  keyName: [{ required: true, validator: checkKeyName, trigger: 'blur' }],
})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      updateInfo()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 弹窗打开
const open = () => {
  form.keyName = props.keyName
  form.description = props.description
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (!formEl) return

  formEl.resetFields()
}

// 绑定秘钥
const updateInfo = async () => {
  comfirmLoading.value = true

  const params = {
    ...form,
    id: props.id,
  }

  try {
    const res = await _updateInfo(params)

    console.log(`_updateInfo===>`, res)

    if (res.success) {
      message.success(res.msg)
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    comfirmLoading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.item {
  margin-bottom: 10px;
}

.name-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}
</style>
