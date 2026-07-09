<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="t('securitySetting.modifyDurationInactivityLogin')"
    width="600"
    class="mobile-dialog"
    @close="closeFn"
  >
    <el-form ref="keepTimeFormRef" require-asterisk-position="right" :model="form" :rules="rules">
      <el-form-item :label="t('securitySetting.durationInactivityLogin')" required prop="keepTime">
        <div>
          <span>
            <el-input-number
              v-model="form.keepTime"
              style="max-width: 600px"
              placeholder=""
              class="input-with-select"
              :min="15"
              :max="720"
            />
          </span>
          <span class="ml10">{{ t('securitySetting.minute') }}</span>
        </div>
      </el-form-item>
      <p class="form-item-info">
        {{ t('securitySetting.modifyDurationInactivityLoginTips') }}
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
  keepTime: number
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
  keepTime: number
}>({
  keepTime: 0,
})

const rules = reactive<FormRules<Form>>({
  keepTime: [{ required: true, message: t('securitySetting.durationInactivityLoginEmpty'), trigger: 'blur' }],
})

const submit = async () => {
  const res = await keepTimeFormRef.value.validate()
  const ress = await _updateTokenExpireTime(form.value)
  if (ress.code === 10000) {
    props.callback && props.callback()
    closeFn()
  }
}

const closeFn = () => {
  form.value = {
    keepTime: 0,
  }
  keepTimeFormRef.value.resetFields()
  dialogFormVisible.value = false
}

defineExpose({
  showDialog: value => {
    dialogFormVisible.value = true
    form.value.keepTime = value
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
