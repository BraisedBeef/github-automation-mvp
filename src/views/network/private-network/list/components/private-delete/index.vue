<template>
  <CatDialog
    v-model:dialog="show"
    :title="dialogTitle"
    :width="dialogWidth"
    :loading="confirmLoading"
    @confirm="confirmHandle"
    @close="closeFn"
  >
    <template v-if="isBlockedDelete">
      <!-- tip -->
      <Tip :text="tips" theme="warning" type="OneToOne" />
      <el-table :data="resourceList" border class="mt20">
        <el-table-column :label="t('privateNetwork.deleteVpcResourceName')" prop="label" />
        <el-table-column :label="t('privateNetwork.deleteVpcResourceCount')" prop="count" />
        <el-table-column :label="t('privateNetwork.deleteVpcResourceOperate')">
          <template #default="{ row: resourceRow }">
            <span class="text-primary cursor-pointer" @click="goRelease(resourceRow.type)">
              {{ t('privateNetwork.goRelease') }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <template v-else>
      <div class="delete-tip">
        {{ t('privateNetwork.confirmDeleteVpc', [rowData?.vpcName || '']) }}
      </div>
      <div class="delete-desc">
        {{ t('privateNetwork.deleteVpcDesc') }}
      </div>
    </template>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { directDeleteVpc } from '@/apis/network/private-network'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface VpcRowType {
  id: number
  vpcUuid: string
  vpcName: string
  subnetNum: number
  insNum: number
}

interface ResourceItemType {
  type: 'subnet' | 'server'
  label: string
  count: number
}

const emits = defineEmits<{
  (event: 'success'): void
  (event: 'go-subnet', vpcUuid: string): void
  (event: 'go-server'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '680px',
  [en]: '680px',
  [zh]: '620px',
}

const tips = computed(() => [
  {
    main: t('privateNetwork.deleteVpcBlockedTip'),
  },
])

const dialogWidth = useI18nStyle(dialogMap)
const show = ref(false)
const confirmLoading = ref(false)
const rowData = ref<VpcRowType>()

const isBlockedDelete = computed(() => {
  return (rowData.value?.subnetNum || 0) > 0 || (rowData.value?.insNum || 0) > 0
})

const dialogTitle = computed(() => {
  return isBlockedDelete.value ? t('privateNetwork.deleteVpcBlockedTitle') : t('privateNetwork.deleteVpcTitle')
})

const resourceList = computed<ResourceItemType[]>(() => {
  const list: ResourceItemType[] = []
  if ((rowData.value?.subnetNum || 0) > 0) {
    list.push({
      type: 'subnet',
      label: t('privateNetwork.subnet'),
      count: rowData.value?.subnetNum || 0,
    })
  }
  if ((rowData.value?.insNum || 0) > 0) {
    list.push({
      type: 'server',
      label: t('privateNetwork.server'),
      count: rowData.value?.insNum || 0,
    })
  }
  return list
})

const closeFn = () => {
  show.value = false
  confirmLoading.value = false
}

const goRelease = (type: ResourceItemType['type']) => {
  const vpcUuid = rowData.value?.vpcUuid || ''
  closeFn()
  if (type === 'subnet') {
    emits('go-subnet', vpcUuid)
  } else {
    emits('go-server')
  }
}

const confirmHandle = async () => {
  if (isBlockedDelete.value) {
    closeFn()
    return
  }

  const params = {
    id: rowData.value?.id as number,
  }
  confirmLoading.value = true
  try {
    const res = await directDeleteVpc(params)
    if (res.success) {
      message.success(res.msg || t('privateNetwork.deleteVpcSuccess'))
      closeFn()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log('delete vpc error', error)
  } finally {
    confirmLoading.value = false
  }
}

defineExpose({
  show,
  rowData,
})
</script>

<style scoped lang="scss">
.warning-box {
  padding: 12px 16px;
  line-height: 20px;
  color: #a66a00;
  background: #fff7e6;
}

.delete-tip {
  font-size: 16px;
  line-height: 24px;
  color: #333;
}

.delete-desc {
  margin-top: 12px;
  line-height: 20px;
  color: #666;
}

.mt20 {
  margin-top: 20px;
}
</style>
