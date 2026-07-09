<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('recovery.eip.setRelease.title')"
    width="950px"
    :loading="comfirmLoading"
    :disabled="!checked"
    :confirm-text="t('recovery.common.submitDestruction')"
    :cancel-text="t('recovery.common.close')"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <div class="msg mb20">
      {{ t('publicIp.confirmReleaseTip', [props.list.length]) }}
    </div>
    <el-table :data="props.list" class="mb20 table">
      <!-- ID/名称 -->
      <el-table-column min-width="200" :label="t('recovery.eip.setRelease.idName')">
        <template #default="{ row }">
          <div class="table-td_tooltip">
            <div class="text-primary">
              {{ row.eipUuid }}
            </div>
            <div class="editNameBox">
              {{ row.name }}
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- 计费模式 -->
      <el-table-column min-width="200" :label="t('recovery.eip.setRelease.costType')">
        <template #default="{ row }">
          <div class="changeTypeText">
            {{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}
          </div>
        </template>
      </el-table-column>
      <!-- 创建/到期时间 -->
      <el-table-column min-width="200" :label="t('recovery.eip.setRelease.time')">
        <template #header>
          <div class="df ac">
            <span>{{ t('recovery.eip.setRelease.time') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <div>
            {{ t('ins.list.createTime', [row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '']) }}
          </div>
          <div v-if="row.deadlineTime">
            {{ t('ins.list.expiresTime', [row.deadlineTime ? maoYunDayJs(row.deadlineTime).format(FORMAT_TIME) : '']) }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-checkbox v-model="checked">
      {{ t('recovery.common.releaseCheckboxDesc') }}
    </el-checkbox>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { useRefund } from '@/views/network/public-ip/hooks/use-refund'
import { chargeTypeList } from '@/views/network/public-ip/list/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

interface PropType {
  list: any[]
}

const props = withDefaults(defineProps<PropType>(), { list: () => [] })
const emits = defineEmits<{
  (event: 'success'): void
  (event: 'close'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const checked = ref<boolean>(false)
const { setBatchReleaseEip } = useRefund()

const tips = computed(() => [
  {
    main: t('recovery.eip.setRelease.tipsMain'),
    sub: [t('recovery.eip.setRelease.tipsSub1')],
  },
])

const confirmHandle = async () => {
  const ids = props.list.map(item => item.eipId)
  const refundReqParams = {
    idList: ids,
  }

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
}
// 弹窗打开
const open = () => {}

const closeFn = () => {
  comfirmLoading.value = false
  checked.value = false
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
