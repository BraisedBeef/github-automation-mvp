<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('image.createCustomImage.title')"
    :width="dialogClass"
    :loading="comfirmLoading"
    :confirm-text="t('image.createCustomImage.confirmText')"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <!-- form -->
    <div class="form-wrap mt20">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        :label-width="formLabelWidth"
        :model="form"
        :rules="rules"
        label-position="left"
      >
        <!-- 选择实例 -->
        <el-form-item :label="t('image.createCustomImage.selectIns')" prop="serverId" class="mb20">
          <el-select
            v-model="form.serverId"
            class="select-opts w-full"
            :placeholder="t('image.createCustomImage.selectInsPh')"
          >
            <el-option v-for="item in insList" :key="item.id" :label="item.instanceName" :value="item.id" />
          </el-select>
          <div v-if="isShowDesc" class="text-warning mt10">
            {{ t('image.createCustomImage.selectInsDesc') }}
          </div>
        </el-form-item>
        <!-- 镜像名称 -->
        <el-form-item :label="t('image.createCustomImage.imageName')" prop="imageName" class="mb20">
          <el-input
            v-model.trim="form.imageName"
            maxlength="60"
            :placeholder="t('image.createCustomImage.imageNamePh')"
          />
          <div class="image-name-desc">
            {{ t('image.createCustomImage.imageNameDesc') }}
          </div>
        </el-form-item>
        <!-- 镜像描述 -->
        <el-form-item :label="t('image.createCustomImage.imageDesc')" prop="description" class="mb0">
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
import { IMAGE_NAME_REG, imageDescLen } from '@/views/cvm/image/config'
import { isCreateCustomImage } from '@/views/cvm/ins/config'
import { isDataDisk } from '@/views/cvm/disk/config'
import { FormInstance, FormRules } from 'element-plus/es'
import { useCvmStore } from '@/store'
import { _createImage } from '@/apis/cvm/image'
import { useIns } from '@/views/cvm/hooks/use-ins'
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

const formLabelWidthMap = {
  [ja]: '180px',
  [en]: '160px',
  [zh]: '100px',
}

const dialogClass = useI18nStyle(dialogMap)
const formLabelWidth = useI18nStyle(formLabelWidthMap)

interface Form {
  imageName: string
  description: string
  serverId: string | number
}

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
    callback('')
  } else {
    callback()
  }
}

const cvmStore = useCvmStore()
const { listInstance } = useIns()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const insList = ref<any[]>([]) // 实例列表
const form = reactive<Form>({
  imageName: '',
  description: '',
  serverId: '',
})
const rules = reactive<FormRules<Form>>({
  imageName: [{ required: true, validator: checkImageName, trigger: 'blur' }],
  description: [{ required: true, message: '', trigger: 'blur' }],
  serverId: [{ required: true, validator: checkChecked, trigger: 'change' }],
})

const formRef = ref<FormInstance>()

// 该实例如果有数据盘则显示
const isShowDesc = computed(() => {
  const res = insList.value.find(el => el.id === form.serverId)
  if (res) {
    const diskInfos = res.diskInfos || []
    return diskInfos.some(item => isDataDisk(item.type))
  } else {
    return false
  }
})

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
const open = () => {
  listInstanceFn()
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (formEl) {
    formEl.resetFields()
  }
}

// 分页查询服务器列表
const listInstanceFn = async () => {
  const params = {
    pageIndex: 1,
    pageSize: 999,
    regionId: cvmStore.areaSelect.id,
  }

  const cb = (res: any) => {
    if (res.success) {
      insList.value = res.data?.list?.filter(el => isCreateCustomImage(el.state)) || []
    }
  }

  listInstance(params, cb)
}

// 创建镜像
const createImage = async () => {
  try {
    comfirmLoading.value = true
    const params: any = {
      serverId: form.serverId as number, // 服务器ID
      imageName: form.imageName,
      description: form.description,
      createWholeImage: false,
    }
    const res = await _createImage(params)

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
.form-wrap {
  /* width: 55%; */
}

.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }
}

.image-name-desc {
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

.mb0 {
  margin-bottom: 0 !important;
}
</style>
