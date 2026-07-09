<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="t('securitySetting.modifyMaximumLoginRetentionTime')"
    width="600"
    class="mobile-dialog"
    @close="closeFn"
  >
    <el-form ref="keepTimeFormRef" require-asterisk-position="right" :model="form" :rules="rules">
      <el-form-item :label="t('securitySetting.maximumLoginRetentionTime')" required prop="maxKeepTime">
        <div>
          <span>
            <el-input-number
              v-model="form.maxKeepTime"
              style="max-width: 600px"
              placeholder=""
              class="input-with-select"
              :min="1"
              :max="48"
            />
          </span>
          <span class="ml10">{{ t('securitySetting.hour') }}</span>
        </div>
      </el-form-item>
      <p class="form-item-info">
        {{ t('securitySetting.modifyMaximumLoginRetentionTimeTips') }}
      </p>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submit">
          {{ t('securitySetting.determine') }}
        </el-button>
        <el-button @click="closeFn">
          {{ t('securitySetting.cancel') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { FormInstance, FormRules } from 'element-plus/es'
import { _updateTokenExpireTime } from '@/apis/account-system/access/user'
interface Form {
  maxKeepTime: number
}

const props = withDefaults(
  defineProps<{
    callback: () => void
  }>(),
  {
    callback: () => {},
  },
)

const keepTimeFormRef = ref<any>()
const dialogFormVisible = ref<boolean>(false)
const form = ref<{
  maxKeepTime: number
}>({
  maxKeepTime: 0,
})

const rules = reactive<FormRules<Form>>({
  maxKeepTime: [{ required: true, message: t('securitySetting.maximumLoginRetentionTimeEmpty'), trigger: 'blur' }],
})

const submit = async () => {
  console.log('submit')
  const res = await keepTimeFormRef.value.validate()
  console.log('res', form.value)
  const ress = await _updateTokenExpireTime(form.value)
  if (ress.code === 10000) {
    props.callback && props.callback()
    closeFn()
  }
}

const closeFn = () => {
  form.value = {
    maxKeepTime: 0,
  }
  keepTimeFormRef.value.resetFields()
  dialogFormVisible.value = false
}

defineExpose({
  showDialog: value => {
    dialogFormVisible.value = true
    form.value.maxKeepTime = value
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

:deep(.el-form-item) {
  margin-bottom: 0 !important;
}

:deep(.el-form-item__content) {
  display: block !important;
  height: 56px;
}

:deep(.el-form-item__error) {
  .el-form-item__error {
    left: 0 !important;
  }
}

.form-item-info {
  color: #555;
}

.ml10 {
  margin-left: 10px;
}
</style>
