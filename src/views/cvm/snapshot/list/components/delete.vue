<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('snapshot.delete.title')"
    width="950px"
    :loading="comfirmLoading"
    :disabled="!checked"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" theme="danger" />

    <Collapse v-model="isCollapse" :text="t('snapshot.delete.selectSnapshot', [snapshotList.length])">
      <el-table :data="snapshotList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="300" :label="t('snapshot.delete.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.snapshotId }}
            </div>
            <div>{{ row.name || '-' }}</div>
          </template>
        </el-table-column>
        <!-- 硬盘属性 -->
        <el-table-column min-width="200" :label="t('snapshot.delete.diskType')">
          <template #default="{ row }">
            <div>{{ DISK_TYPE_MAP[row.diskType] }}</div>
            <div>{{ row.diskSize || 0 }}GiB</div>
          </template>
        </el-table-column>
        <!-- 关联硬盘 -->
        <el-table-column min-width="200" :label="t('snapshot.delete.bindDisk')">
          <template #default="{ row }">
            <div v-if="handleBindDisk(row).show" class="text-primary">
              {{ row.serviceDiskId }}
            </div>
            <div v-if="handleBindDisk(row).show">
              {{ row.diskName }}
            </div>
            <div v-if="!handleBindDisk(row).show">-</div>
          </template>
        </el-table-column>
        <!-- 硬盘挂载实例 -->
        <el-table-column min-width="200" :label="t('snapshot.delete.diskMountIns')">
          <template #default="{ row }">
            <div v-if="handleDiskMountIns(row).show">
              {{ row.insUuid }}
            </div>
            <div v-if="handleDiskMountIns(row).show">
              {{ row.instanceName }}
            </div>
            <div v-if="!handleDiskMountIns(row).show">-</div>
          </template>
        </el-table-column>
        <!-- 关联镜像 -->
        <!-- <el-table-column min-width="200" :label="t('关联镜像')">
            <template #default="{ row }">
              <p>关联镜像</p>
            </template>
          </el-table-column> -->
      </el-table>
    </Collapse>

    <p class="mt20 mb20 confirm-text">
      {{ t('snapshot.delete.desc') }}
    </p>

    <p class="mt20 df ac">
      <el-checkbox v-model="checked">
        {{ t('snapshot.delete.deleteChecked') }}
      </el-checkbox>
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { DISK_TYPE_MAP } from '@/views/cvm/disk/config'
import { _deleteSnapshot } from '@/apis/cvm/snapshot'

interface PropType {
  snapshotList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  snapshotList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const checked = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('snapshot.delete.tipsMain'),
  },
])

// 关联硬盘
const handleBindDisk = (row: any) => {
  const config: any = {
    show: false,
  }
  config.show = row.serviceDiskId || row.diskName ? true : false
  config.serviceDiskId = row.serviceDiskId
  config.diskName = row.diskName

  return config
}

// 硬盘挂载实例
const handleDiskMountIns = (row: any) => {
  const config: any = {
    show: false,
  }
  config.show = row.insUuid || row.instanceName ? true : false
  config.insUuid = row.insUuid
  config.instanceName = row.instanceName

  return config
}

const confirmHandle = () => {
  if (!checked.value) {
    return message.warning(t('snapshot.delete.checkWarning'))
  }

  deleteSnapshot()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = () => {
  checked.value = false
  isCollapse.value = false
}

// 删除快照
const deleteSnapshot = async () => {
  try {
    comfirmLoading.value = true

    const ids = props.snapshotList.map(el => el.id)

    const res = await _deleteSnapshot({
      ids, // 快照id
    })

    console.log(`_deleteSnapshot===>`, res)

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
.confirm-text {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 14px;
  color: #000;
}
</style>
