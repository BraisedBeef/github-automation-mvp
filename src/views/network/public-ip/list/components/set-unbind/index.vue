<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('publicIp.unbindPublicIp')"
    width="820px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <div class="msg mb20">
      {{ t('publicIp.unbindPublicIpTip') }}
    </div>
    <el-table :data="list">
      <!-- 弹性公网IP -->
      <el-table-column min-width="180" :label="t('publicIp.publicIp')">
        <template #default="{ row }">
          <Copy :text="row.eip" />
        </template>
      </el-table-column>
      <!-- 已绑定实例 -->
      <el-table-column min-width="200" :label="t('publicIp.alreadyBoundIns')">
        <template #default="{ row }">
          <!-- 实例 -->
          <div v-if="row.bindInstanceType === 1" class="text-primary">
            {{ row.insUuid }}
          </div>
          <!-- 弹性网卡 -->
          <div v-if="row.bindInstanceType === 2" class="text-primary">
            {{ row.insUuid }}
          </div>
          <div>{{ row.insName }}</div>
        </template>
      </el-table-column>
      <!-- 已绑定实例类型 -->
      <el-table-column min-width="220" :label="t('publicIp.alreadyBoundInsType')">
        <template #default="{ row }">
          <p>{{ bindInstanceTypeList.find(item => item.value === row.bindInstanceType)?.label }}</p>
        </template>
      </el-table-column>
    </el-table>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { bindInstanceTypeList } from '../../config'
import { disassociateEip } from '@/apis/network/public-ip'
import { message } from '@/utils/message'

// interface PropType {}

// const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const eipId = ref<number>()
const list = ref<any[]>([])

const confirmHandle = async () => {
  const params = { eipId: eipId.value as number }
  comfirmLoading.value = true
  try {
    const res = await disassociateEip(params)
    if (res.success) {
      message.success(t('publicIp.unbindPublicIpSuccess'))
      comfirmLoading.value = false
      show.value = false
      emits('success')
    } else {
      comfirmLoading.value = false
      message.warning(res.msg)
    }
  } catch (err) {
    comfirmLoading.value = false
    console.log('error', err)
  }
}
// 弹窗打开
const open = () => {}

defineExpose({
  show,
  eipId,
  list,
})
</script>
<style scoped lang="scss">
.msg {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #555;
}
</style>
