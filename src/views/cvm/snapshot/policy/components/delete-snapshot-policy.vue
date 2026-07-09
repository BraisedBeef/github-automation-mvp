<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('snapshot.deletePolicy.title')"
    width="950px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('snapshot.deletePolicy.selectSnapshot', [snapshotList.length])">
      <el-table :data="snapshotList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('snapshot.policy.name')">
          <template #default="{ row }">
            <div>{{ row.name }}</div>
          </template>
        </el-table-column>
        <!-- 关联硬盘 -->
        <el-table-column min-width="200" :label="t('snapshot.delete.bindDisk')">
          <template #default="{ row }">
            <div>{{ row.diskIdList ? row.diskIdList?.join(',') : '-' }}</div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <p class="mt20 mb20 confirm-text">
      {{ t('snapshot.deletePolicy.confirm') }}
    </p>
    <p class="confirm-text">
      {{ t('snapshot.deletePolicy.confirmDesc') }}
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _deleteSnapshotPolicy } from '@/apis/cvm/snapshot'

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

const confirmHandle = () => {
  deleteSnapshotPolicy()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = () => {
  checked.value = false
  isCollapse.value = false
}

// 删除定期策略
const deleteSnapshotPolicy = async () => {
  try {
    comfirmLoading.value = true
    const res = await _deleteSnapshotPolicy({
      ids: props.snapshotList.map(el => el.id),
    })

    console.log(`_deleteSnapshotPolicy===>`, res)

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
