<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('image.modifyImage.title')"
    :width="dialogClass"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('image.modifyImage.selectImage', [imageList.length])">
      <el-table :data="imageList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('image.modifyImage.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insId }}
            </div>
            <div>{{ row.imageName }}</div>
          </template>
        </el-table-column>
        <!-- 类型 -->
        <el-table-column min-width="120" :label="t('image.modifyImage.type')">
          <template #default="{ row }">
            <div>{{ IMAGE_TYPE_MAP[row.imageType] }}</div>
          </template>
        </el-table-column>
        <!-- 容量 -->
        <el-table-column min-width="150" :label="t('image.modifyImage.size')">
          <template #default="{ row }">
            <div>{{ row.size }}GiB</div>
          </template>
        </el-table-column>
        <!-- 操作系统 -->
        <el-table-column min-width="200" :label="t('image.modifyImage.sys')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div>{{ row.osName }}</div>
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
        <el-form-item :label="t('image.modifyImage.imageName')" prop="imageName">
          <el-input v-model.trim="form.imageName" maxlength="60" :placeholder="t('image.modifyImage.imageNamePh')" />
          <div class="name-desc">
            {{ t('image.modifyImage.imageNameDesc') }}
          </div>
        </el-form-item>
        <!-- 镜像描述 -->
        <el-form-item :label="t('image.modifyImage.imageDesc')" prop="description">
          <el-input
            v-model.trim="form.description"
            :maxlength="imageDescLen"
            type="textarea"
            :rows="5"
            :placeholder="''"
          />
          <div class="image-desc">
            {{ t('image.modifyImage.imageDescMax', [imageDescLen - form.description.length]) }}
          </div>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { IMAGE_NAME_REG, IMAGE_TYPE_MAP, imageDescLen } from '@/views/cvm/image/config'
import { FormInstance, FormRules } from 'element-plus/es'
import { _updateImageInfo } from '@/apis/cvm/image'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '800px',
  [en]: '820px',
  [zh]: '740px',
}

const dialogClass = useI18nStyle(dialogMap)

interface Form {
  imageName: string
  description: string
  imageId: string | number
}

interface PropType {
  imageList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  imageList: () => [{}],
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

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const form = reactive<Form>({
  imageName: '',
  description: '',
  imageId: '',
})
const rules = reactive<FormRules<Form>>({
  imageName: [{ required: true, validator: checkImageName, trigger: 'blur' }],
  description: [{ required: true, message: '', trigger: 'blur' }],
})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      updateImageInfo()
    } else {
      console.log('error submit!', fields)
    }
  })
}
// 弹窗打开
const open = () => {
  form.imageId = props.imageList[0]?.id
  form.imageName = props.imageList[0]?.imageName
  form.description = props.imageList[0]?.description
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (formEl) {
    formEl.resetFields()
  }
}

// 更新镜像信息
const updateImageInfo = async () => {
  try {
    comfirmLoading.value = true

    const res = await _updateImageInfo({
      imageId: form.imageId as number, // 服务器ID
      imageName: form.imageName,
      description: form.description,
    })

    console.log(`_updateImageInfo===>`, res)

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
.name-desc {
  margin-top: 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.image-desc {
  margin-top: 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}
</style>
