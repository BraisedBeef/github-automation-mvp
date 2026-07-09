<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('image.createIns.title')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('image.createIns.selectImage', [imageList.length])">
      <el-table :data="imageList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('image.createIns.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-primary text-over">
                {{ row.insId }}
              </div>
              <div class="text-over">
                {{ row.imageName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 类型 -->
        <el-table-column min-width="150" :label="t('image.createIns.type')">
          <template #default="{ row }">
            <div>{{ IMAGE_TYPE_MAP[row.imageType] }}</div>
          </template>
        </el-table-column>
        <!-- 容量 -->
        <el-table-column min-width="150" :label="t('image.createIns.size')">
          <template #default="{ row }">
            <div>{{ row.size }}GiB</div>
          </template>
        </el-table-column>
        <!-- 操作系统 -->
        <el-table-column min-width="200" :label="t('image.createIns.sys')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-over">
                {{ row.osName || row.platform || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <p class="mt20">
      <span class="comfirm-text">{{ t('image.createIns.desc') }}</span>
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { IMAGE_TYPE_MAP } from '@/views/cvm/image/config'

import { useIns } from '@/views/cvm/hooks/use-ins'
import { useCvmStore } from '@/store'
import { NoDefaultCreateType } from '@/views/cvm/ins/type'
import { pushRoute } from '@/utils/router-jump'

interface PropType {
  imageList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  imageList: () => [],
})

const { cvmInsCreateStore: store } = useIns()
const cvmStore = useCvmStore()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起

const cancel = () => {
  isCollapse.value = false
}

const confirmHandle = () => {
  const imageType = props.imageList[0].imageType
  const platform = props.imageList[0].platform
  const imageId = props.imageList[0].id

  pushRoute({
    name: 'ins_create',
    query: {
      isDefaultCreate: 'false',
      isInit: 'true',
      entry: 'imageCreateIns' as NoDefaultCreateType,
      imageType,
      platform,
      imageId,
    },
  })
}

// 弹窗打开
const open = () => {}

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
