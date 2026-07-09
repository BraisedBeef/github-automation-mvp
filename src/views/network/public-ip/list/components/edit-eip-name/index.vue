<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('publicIp.editNameTitle')"
    width="520px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <div class="">
      <div class="edit-input">
        <el-form ref="formRef" label-width="auto" :model="form" :rules="nameRules" label-position="left">
          <el-form-item :label="t('publicIp.editName')" prop="inputValue" class="df ac">
            <el-input
              v-model.trim="form.inputValue"
              clearable
              class="w370 mt25"
              :maxlength="50"
              :placeholder="t('common.plsEnter')"
            />
            <p class="tips">
              {{ t('publicIp.eidtEipNameReg') }}
            </p>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import { updateEipName } from '@/apis/network/public-ip'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { nameRules } from '@/views/network/private-network/list/config'

interface PropType {
  list: any[]
}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
  (event: 'close'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const form = reactive<{
  inputValue: string
}>({
  inputValue: '',
})
const formRef = ref<any>()

// 修改eip名称接口
const confirmHandle = async () => {
  await formRef.value?.validate()
  try {
    const params = {
      id: props.list[0]?.eipId,
      name: form.inputValue,
    } as { id: number; name: string }
    comfirmLoading.value = true
    const res = await updateEipName(params)
    if (res.success) {
      message.success(res.msg)
      closeFn()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log(err)
  } finally {
    comfirmLoading.value = false
  }
}

// 弹窗打开
const open = () => {}

const closeFn = () => {
  form.inputValue = ''
  formRef.value.resetFields()
  comfirmLoading.value = false
  show.value = false
  emits('close')
}

defineExpose({
  show,
})
</script>
<style scoped lang="scss">
.w370 {
  width: 370px;
  margin-top: 25px;
}

.mt25 {
  margin-top: 25px;
}

.tips {
  margin-top: 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 17px;
  color: #999;
  text-align: left;
}
</style>
