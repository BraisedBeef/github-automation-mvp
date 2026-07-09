<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.createCustomImage.title')"
    width="950px"
    :loading="comfirmLoading"
    :confirm-text="t('ins.createCustomImage.confirmText')"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('ins.createCustomImage.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.createCustomImage.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.createCustomImage.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="200" :label="t('ins.createCustomImage.insConfig')">
          <template #default="{ row }">
            <div style="padding: 14px 0">
              <p>
                <span class="mr10">{{ t('ins.createCustomImage.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p>{{ t('ins.createCustomImage.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p>{{ t('ins.createCustomImage.net') }}{{ handleRowVpcName(row) }}</p>
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
        <!-- 镜像名称 -->
        <el-form-item :label="t('ins.createCustomImage.imageName')" prop="imageName">
          <el-input v-model.trim="form.imageName" :placeholder="t('ins.createCustomImage.imageNamePh')" />
        </el-form-item>
        <!-- 镜像描述 -->
        <el-form-item :label="t('ins.createCustomImage.imageDesc')" prop="description">
          <el-input v-model.trim="form.description" maxlength="256" type="textarea" :rows="5" :placeholder="''" />
        </el-form-item>
        <!-- 创建前确认 -->
        <el-form-item :label="t('ins.createCustomImage.imageCreate')" prop="checked">
          <el-checkbox v-model="form.checked" size="large">
            <span v-html="t('ins.createCustomImage.imageCreateDesc')" />
          </el-checkbox>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { IMAGE_NAME_REG } from '@/views/cvm/image/config'
import { INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'
import { FormInstance, FormRules } from 'element-plus/es'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { _createImage } from '@/apis/cvm/image'

interface Form {
  imageName: string
  description: string
  checked: boolean
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
const checkImageName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!IMAGE_NAME_REG.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

// 校验勾选
const checkChecked = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(t('ins.createCustomImage.checkedWarning')))
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
  imageName: '',
  description: '',
  checked: false,
})

const rules = reactive<FormRules<Form>>({
  imageName: [{ required: true, validator: checkImageName, trigger: 'blur' }],
  description: [{ required: true, message: '', trigger: 'blur' }],
  checked: [{ required: true, validator: checkChecked, trigger: 'change' }],
})

const tips = computed(() => [
  {
    main: t('ins.createCustomImage.tipsMain'),
    sub: [
      t('ins.createCustomImage.tipsSub1'),
      t('ins.createCustomImage.tipsSub2'),
      t('ins.createCustomImage.tipsSub3'),
    ],
  },
])

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      createImage()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  isCollapse.value = false
  if (formEl) {
    formEl.resetFields()
  }
}

// 创建镜像
const createImage = async () => {
  try {
    comfirmLoading.value = true
    const serverId = props.insList[0]?.id

    const res = await _createImage({
      serverId, // 服务器ID
      imageName: form.imageName,
      description: form.description,
      createWholeImage: false,
      // createWholeImage: form.checked,
    })

    console.log(`_createImage===>`, res)

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
// :deep(.el-form-item__content) {
//   display: flex !important;
//   flex-direction: column;
//   justify-content: center;
//   align-items: flex-start;
// }
:deep(.el-checkbox) {
  height: var(--input-height) !important;
}

:deep(.el-dialog__body .dialog-body) {
  padding: 0 30px !important;
}

:deep(.el-form .el-form-item .el-form-item__content .el-form-item__error) {
  position: absolute;
}
</style>
