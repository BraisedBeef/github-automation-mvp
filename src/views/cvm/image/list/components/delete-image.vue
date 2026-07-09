<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('image.deleteImage.title')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('image.deleteImage.selectImage', [imageList.length])">
      <el-table :data="imageList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('image.deleteImage.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insId }}
            </div>
            <div>{{ row.imageName }}</div>
          </template>
        </el-table-column>
        <!-- 类型 -->
        <el-table-column min-width="200" :label="t('image.deleteImage.type')">
          <template #default="{ row }">
            <div>{{ IMAGE_TYPE_MAP[row.imageType] }}</div>
          </template>
        </el-table-column>
        <!-- 容量 -->
        <el-table-column min-width="200" :label="t('image.deleteImage.size')">
          <template #default="{ row }">
            <div>{{ row.size }}GiB</div>
          </template>
        </el-table-column>
        <!-- 操作系统 -->
        <el-table-column min-width="200" :label="t('image.deleteImage.sys')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-over">
                {{ row.osName }}
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <!-- 删除关联的快照 -->
    <!-- <el-checkbox class="mt20" v-model="checked" size="large"> <span>删除关联的快照</span></el-checkbox> -->

    <p class="mt20">
      <span class="comfirm-text">{{ t('image.deleteImage.desc') }}</span>
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _deleteImage } from '@/apis/cvm/image'
import { IMAGE_TYPE_MAP } from '@/views/cvm/image/config'

interface PropType {
  imageList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  imageList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起

const confirmHandle = () => {
  deleteImage()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = () => {
  isCollapse.value = false
}

// 删除快照
const deleteImage = async () => {
  try {
    comfirmLoading.value = true

    const imageIds = props.imageList.map(el => el.id)

    const res = await _deleteImage({
      imageIds, // 镜像主键ID
    })

    console.log(`_deleteImage===>`, res)

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
.comfirm-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #222;
}
</style>
