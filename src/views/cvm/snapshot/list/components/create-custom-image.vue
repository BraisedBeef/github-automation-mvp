<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('创建自定义镜像')"
    width="950px"
    :loading="comfirmLoading"
    confirm-text="创建镜像"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="`已选择${snapshotList.length || 0}个快照`">
      <el-table :data="snapshotList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ID/名称')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.snapshotId }}
            </div>
            <div>{{ row.name || '-' }}</div>
          </template>
        </el-table-column>
        <!-- 硬盘属性 -->
        <el-table-column min-width="200" :label="t('硬盘属性')">
          <template #default="{ row }">
            <div>{{ DISK_TYPE_MAP[row.diskType] }}</div>
            <div>{{ row.size || 0 }}GiB</div>
          </template>
        </el-table-column>
        <!-- 关联镜像 -->
        <el-table-column min-width="200" :label="t('关联硬盘')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.diskId }}
            </div>
            <div>{{ row.diskName || '-' }}</div>
          </template>
        </el-table-column>
        <!-- 硬盘挂载实例 -->
        <el-table-column min-width="200" :label="t('硬盘挂载实例')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ row.insUuid }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- 关联镜像 -->
        <el-table-column min-width="200" :label="t('关联镜像')">
          <template #default="{ row }">
            <div class="df ac">
              <span>关联镜像</span>
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
        <el-form-item :label="t('镜像名称')" prop="imageName">
          <el-input v-model.trim="form.imageName" :placeholder="t('请输入镜像名称')" />
        </el-form-item>
        <!-- 镜像描述 -->
        <el-form-item :label="t('镜像描述')" prop="description">
          <el-input v-model.trim="form.description" maxlength="256" type="textarea" :rows="5" :placeholder="''" />
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { IMAGE_NAME_REG } from '@/views/cvm/image/config'
import { FormInstance, FormRules } from 'element-plus/es'
import { _createImage } from '@/apis/cvm/image'
import { DISK_TYPE_MAP } from '@/views/cvm/disk/config'

interface Form {
  imageName: string
  description: string
}

interface PropType {
  snapshotList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  snapshotList: () => [],
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
  form.imageName = ''
  form.description = ''

  if (formEl) {
    formEl.clearValidate()
  }
}

// 创建镜像
const createImage = async () => {
  try {
    comfirmLoading.value = true
    const serverId = props.snapshotList[0]?.id

    const res = await _createImage({
      serverId, // 服务器ID
      imageName: form.imageName,
      description: form.description,
      createWholeImage: true,
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

<style lang="scss" scoped></style>
