<template>
  <CatDialog
    v-model:dialog="dialogFormVisible"
    class="dialog"
    :title="t('securitySetting.securitySetting')"
    width="460px"
    destroy-on-close
  >
    <el-form ref="mobileFormRef" require-asterisk-position="right" :model="form">
      <el-form-item label="" required prop="operateProtect" :label-width="formLabelWidth" class="dialog-form-item">
        <p class="form-item-info">
          {{ t('securitySetting.operationProtectionInstructions') }}
        </p>
        <div class="form-item-radio">
          <el-radio-group v-model="form.operateProtect">
            <div>
              <el-radio :label="0">
                {{ t('securitySetting.notTurnedOn') }}
              </el-radio>
              <el-radio :label="1">
                {{ t('securitySetting.enableEmailVerificationCode') }}
              </el-radio>
            </div>
          </el-radio-group>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer cat-dialog-footer">
        <el-button type="primary" @click="submit">
          {{ t('securitySetting.determine') }}
        </el-button>
        <el-button @click="dialogFormVisible = false">
          {{ t('securitySetting.cancel') }}
        </el-button>
      </div>
    </template>
  </CatDialog>
  <!-- </el-dialog> -->
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { _updateSecuritySetting } from '@/apis/account-system/access/user'
const props = withDefaults(
  defineProps<{
    uid: number
    callback: () => void
  }>(),
  {
    uid: 0,
    callback: () => {},
  },
)

const mobileFormRef = ref<any>()
const formLabelWidth = '0px'
const dialogFormVisible = ref<boolean>(false)
const form = ref<{
  operateProtect: number
}>({
  operateProtect: 0,
})

const submit = async () => {
  console.log('submit')
  const res = await mobileFormRef.value.validate()
  const params = {
    uid: props.uid,
    ...form.value,
  }
  const ress = await _updateSecuritySetting(params)
  console.log('res', form.value)
  if (ress.code === 10000) {
    props.callback && props.callback()
    dialogFormVisible.value = false
  }
}

defineExpose({
  showDialog: (val: number) => {
    dialogFormVisible.value = true
    form.value.operateProtect = val
  },
})
</script>
<style lang="scss" scoped>
:deep(.el-input-group__prepend) {
  background: #fff;
  box-shadow: none;
}

.dialog-form-item {
  margin-bottom: 10px !important;
}

:deep(.el-form-item__error) {
  .el-form-item__error {
    left: 0 !important;
  }
}

:deep(.el-radio) {
  display: flex;
}

.form-item-info {
  line-height: 20px;
  color: #555;
}

.ml10 {
  margin-left: 10px;
}

.form-item-radio {
  margin-top: 20px;
}

.dialog-footer {
  padding-bottom: 20px;
  text-align: center;
}
</style>
