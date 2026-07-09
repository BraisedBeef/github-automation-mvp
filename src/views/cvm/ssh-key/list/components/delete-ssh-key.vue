<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('sshKey.deleteSshKey.title')"
    width="660px"
    :loading="comfirmLoading"
    :disabled="disabled"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('sshKey.deleteSshKey.selectSshKey', [sshKeyList.length])">
      <el-table :data="sshKeyList" class="mt20 table mb20">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('sshKey.deleteSshKey.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.sshInsId }}
            </div>
            <div>{{ row.sshName }}</div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column min-width="200" :label="t('sshKey.deleteSshKey.opts')">
          <template #default="{ row }">
            <div v-if="row.bandInstanceCount > 0 || row.bandImageCount > 0" class="text-error">
              <span>{{ t('sshKey.deleteSshKey.noDelete') }}</span>
            </div>
            <div v-else class="text-success">
              <span>{{ t('sshKey.deleteSshKey.delete') }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <p class="mt20 confirm-key">
      {{ t('sshKey.deleteSshKey.deleteDesc1') }}
    </p>
    <p class="mt10 confirm-value">
      {{ t('sshKey.deleteSshKey.deleteDesc2') }}
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _deleteKeypair } from '@/apis/cvm/ssh-key'

interface PropType {
  sshKeyList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  sshKeyList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起

const disabled = computed(() => {
  return props.sshKeyList.some(el => el.bandInstanceCount > 0 || el.bandImageCount > 0)
})

const confirmHandle = () => {
  if (!disabled.value) deleteKeypair()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = () => {
  isCollapse.value = false
}

// 删除秘钥
const deleteKeypair = async () => {
  const params = {
    keyIds: props.sshKeyList.map(el => el.id),
  }
  comfirmLoading.value = true
  try {
    const res = await _deleteKeypair(params)

    console.log(`_deleteKeypair===>`, res)

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
.confirm-key {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 14px;
  color: #000;
}

.confirm-value {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #000;
}
</style>
