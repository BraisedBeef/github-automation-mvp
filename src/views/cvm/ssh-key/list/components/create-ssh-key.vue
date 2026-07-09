<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('sshKey.createSshKey.title')"
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
          <!-- 创建方式 -->
          <el-form-item :label="t('sshKey.createSshKey.createType')" prop="type" class="login-type-wrap">
            <div class="df jsb ac w-full">
              <BtnsGroup v-model="createType" :list="btnsGroupList" :style="{ width: btnsGroupClass }" />
            </div>
          </el-form-item>

          <!-- 密钥名称 -->
          <el-form-item :label="t('sshKey.createSshKey.name')" prop="keyName">
            <el-input
              v-model.trim="form.keyName"
              :placeholder="t('sshKey.createSshKey.namePh')"
              :max-length="SSH_KEY_NAME_LEN_MAX"
            />
            <p class="name-text">
              {{ t('sshKey.createSshKey.sshKeyNameDesc') }}
            </p>
          </el-form-item>

          <template v-if="createType.value === 2">
            <!-- 公钥 -->
            <el-form-item :label="t('sshKey.createSshKey.publicSshKey')" prop="publicKey">
              <el-input
                v-model.trim="form.publicKey"
                :rows="5"
                type="textarea"
                :placeholder="t('sshKey.createSshKey.publicSshKeyPh')"
              />
              <p class="key-text">
                {{ t('sshKey.createSshKey.publicSshKeyDesc') }}
              </p>
            </el-form-item>
          </template>
        </el-form>

        <!-- tip -->
        <div v-if="createType.value === 1" class="mt20">
          <Tip :text="tips" type="OneToOne" hide-margin-bottom />
        </div>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { _createKeyPair, _downloadKeyPair } from '@/apis/cvm/ssh-key'
import { useCvmStore } from '@/store'
import { SSH_KEY_NAME_REGEX, SSH_KEY_NAME_LEN_MAX } from '@/views/cvm/ssh-key/config'
import { downloadExportFiles } from '@/utils/download'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const btnsGroupMap = {
  [ja]: '180px',
  [en]: '200px',
  [zh]: '130px',
}

const dialogMap = {
  [ja]: '550px',
  [en]: '600px',
  [zh]: '600px',
}

const btnsGroupClass = useI18nStyle(btnsGroupMap)
const dialogClass = useI18nStyle(dialogMap)

interface Form {
  keyName: string
  publicKey: string
}

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

const btnsGroupList = [
  {
    label: t('sshKey.createSshKey.create'),
    value: 1,
  },
  {
    label: t('sshKey.createSshKey.import'),
    value: 2,
  },
]

const cvmStore = useCvmStore()

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const form = reactive<Form>({
  keyName: '',
  publicKey: '',
})

const createType = ref<any>({
  label: t('sshKey.createSshKey.create'),
  value: 1,
})

const rules = reactive<FormRules<Form>>({
  keyName: [{ required: true, validator: checkKeyName, trigger: 'blur' }],
  publicKey: [{ required: true, message: '', trigger: 'blur' }],
})

const tips = computed(() => [
  {
    main: t('sshKey.createSshKey.tipsMain'),
  },
])

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      createKeyPair()
    } else {
      console.log('error submit!', fields)
    }
  })
}
// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (!formEl) return

  createType.value = {
    label: t('sshKey.createSshKey.create'),
    value: 1,
  }
  formEl.resetFields()
}

// 创建导入秘钥
const createKeyPair = async () => {
  const params: any = {
    regionId: cvmStore.areaSelect.id,
    keyName: form.keyName,
  }
  if (createType.value.value === 2) {
    params.publicKey = form.publicKey
  }

  comfirmLoading.value = true
  try {
    const res = await _createKeyPair(params)

    console.log(`_createKeyPair===>`, res)

    if (res.success) {
      // 创建新密钥对，下载秘钥
      if (createType.value.value === 1) {
        downloadKeyPair(
          {
            insId: res.data,
          },
          form.keyName,
        )
      }

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

// 下载秘钥
const downloadKeyPair = async (params: any, keyName: string) => {
  try {
    const res = await _downloadKeyPair(params)
    console.log(`downloadKeyPair===>`, res)

    if (!res.code) {
      const fileName = `${keyName}.pem`
      downloadExportFiles(res, fileName)
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
.form-wrap {
  /* width: 55%; */
}

.item {
  margin-bottom: 10px;
}

.name-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.key-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #ccc;
}
</style>
