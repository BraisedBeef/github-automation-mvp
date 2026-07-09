<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.setName.title')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('ins.setName.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.setName.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.setName.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="300" :label="t('ins.setName.insConfig')">
          <template #default="{ row }">
            <div style="padding: 14px 0">
              <p>
                <span class="mr10">{{ t('ins.setName.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p>{{ t('ins.setName.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p>{{ t('ins.setName.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

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
        <!-- 新名称 -->
        <el-form-item :label="t('ins.setName.newName')" prop="name">
          <el-input v-model.trim="form.name" placeholder="" />
        </el-form-item>
      </el-form>
    </div>

    <div class="confirm-text">
      {{ t('ins.setName.desc') }}
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { _updateInstanceName } from '@/apis/cvm/ins'
import { INS_NAME_REG, INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'

interface Form {
  name: string
}

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

// 校验名称
const checkName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!INS_NAME_REG.test(value)) {
    callback(new Error(t('ins.custom.insNameDesc')))
  } else {
    callback()
  }
}

const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const form = reactive<Form>({
  name: '',
})

const rules = reactive<FormRules<Form>>({
  name: [{ required: true, validator: checkName, trigger: 'blur' }],
})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      updateInstanceName()
    } else {
      console.log('error submit!', fields)
    }
  })
}
// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  // form.name = ''
  if (!formEl) return
  formEl.resetFields()
}

// 修改服务器信息
const updateInstanceName = async () => {
  try {
    comfirmLoading.value = true
    const serverIds = props.insList.map(el => el.id)

    const res = await _updateInstanceName({
      serverIds, // 服务器ID
      instanceName: form.name,
    })

    console.log(`_updateInstanceName===>`, res)

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
.form-wrap {
  width: 60%;
}

.confirm-text {
  margin-top: 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 17px;
  color: #999;
  text-align: left;
}
</style>
