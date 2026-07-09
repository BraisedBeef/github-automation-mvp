<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('publicIp.confirmRelease')"
    width="660px"
    :loading="comfirmLoading"
    :disabled="!ack"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <div class="msg mb20">
      {{ t('publicIp.confirmReleaseTip', [props.list.length]) }}
    </div>
    <el-table :data="props.list" class="mb20 table">
      <!-- 序号 -->
      <el-table-column min-width="200" :label="t('publicIp.serialNumber')">
        <template #default="{ $index }">
          <div>{{ $index + 1 }}</div>
        </template>
      </el-table-column>
      <!-- IP -->
      <el-table-column min-width="200" :label="t('IP')">
        <template #default="{ row }">
          <Copy :text="row.eip" />
        </template>
      </el-table-column>
    </el-table>
    <el-checkbox v-model="ack">
      {{ t('publicIp.confirmReleaseMsg') }}
    </el-checkbox>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { batchReleaseEip } from '@/apis/network/public-ip'
import { message } from '@/utils/message'
import { queryRefundEipPrice } from '@/apis/network/public-ip'
import { useRefund } from '@/views/network/public-ip/hooks/use-refund'

interface PropType {
  list: any[]
}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
  (event: 'close'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const ack = ref<boolean>(false)
const { setRefundOrder, setBatchReleaseEip } = useRefund()

const confirmHandle = async () => {
  const ids = props.list.map(item => item.eipId)
  const refundReqParams = {
    idList: ids,
  }
  if (props.list[0].chargeType === 1 || props.list[0].chargeType === 3) {
    // 按量计费
    comfirmLoading.value = true
    const cb = (res: any) => {
      if (res.success) {
        message.success(t('publicIp.releaseSuccess'))
        // 这里数据更新有延迟 所以5秒后再获取数据
        comfirmLoading.value = false
        closeFn()
        emits('success')
      } else {
        comfirmLoading.value = false
        message.warning(res.msg)
      }
    }
    setBatchReleaseEip(refundReqParams, cb)
  } else if (props.list[0].chargeType === 2) {
    // 包年包月
    const inquiryReqParams = {
      eipIds: ids,
    }
    setRefundOrder(inquiryReqParams, refundReqParams, 'network_refund_order', 'eip', 'destruction')
  }
}
// 弹窗打开
const open = () => {}

const closeFn = () => {
  comfirmLoading.value = false
  ack.value = false
  show.value = false
  emits('close')
}

defineExpose({
  show,
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

.mb9 {
  margin-bottom: 9px;
}

.mb18 {
  margin-bottom: 18px;
}

.jsc {
  justify-content: center;
}

.px20 {
  padding: 20px 0;
}

:deep(.el-button.el-button--primary.is-disabled) {
  color: #fff;
  background-color: #0063ff;
  border: 1px solid #0063ff;
  opacity: 0.5;
}

.w80 {
  width: 80px;
}
</style>
