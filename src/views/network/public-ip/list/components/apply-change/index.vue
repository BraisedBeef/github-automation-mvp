<template>
  <div>
    <CatDialog
      v-model:dialog="show"
      :title="t('publicIp.applyChange')"
      width="550px"
      :loading="comfirmLoading"
      :confirm-text="t('publicIp.submit')"
      @confirm="confirmHandle"
      @update:dialog="() => {}"
    >
      <div class="p-y-4 df">
        <div class="list-wrap-left mr20">
          <div class="key">
            {{ t('EIP ID') }}
          </div>
          <div class="key mt20">
            {{ t('publicIp.eipArea') }}
          </div>
          <div class="key mt20">
            {{ t('publicIp.chargeType') }}
          </div>
        </div>
        <div class="list-wrap-right">
          <div class="value">
            {{ detailData?.eipUuid }}
          </div>
          <div class="value mt20">
            {{ detailData?.eip }}
          </div>
          <div class="value mt20">
            {{ chargeTypeList.find(item => item.value === detailData?.chargeType)?.label }}
          </div>
        </div>
      </div>
      <div class="mt20">
        <div class="mb12 confirm-box">
          {{ t('publicIp.confirmApplyChange') }}
        </div>
        <!-- tip -->
        <Tip :text="tips" type="OneToOne" theme="warning" hide-margin-bottom />
      </div>
    </CatDialog>
    <ApplyChangeTwo ref="applyChangeTwoRef" @success="successFn" />
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { chargeTypeList } from '../../config'
import ApplyChangeTwo from '../apply-change-two/index.vue'
import { auditSubmit } from '@/apis/network/public-ip'

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('publicIp.applyChangeTip'),
  },
])

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const detailData = ref<any>({})

const applyChangeTwoRef = ref<any>()

const confirmHandle = async () => {
  const params = { eipId: detailData.value.eipId }
  try {
    comfirmLoading.value = true
    const res = await auditSubmit(params)
    if (res.success) {
      show.value = false
      applyChangeTwoRef.value.show = true
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('err', err)
  } finally {
    comfirmLoading.value = false
  }
}

const successFn = () => {
  emits('success')
}

defineExpose({
  show,
  detailData,
})
</script>
<style scoped lang="scss">
.mt17 {
  margin-top: 17px;
}

.mb10 {
  margin-bottom: 10px;
}

.mr20 {
  margin-right: 20px;
}

.key {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  color: #999;
  text-align: left;
}

.value {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  color: #000;
  text-align: left;
}

.p-y-4 {
  padding: 4px 0;
}

.ml10 {
  margin-left: 10px;
}

.confirm-box {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  color: var(--primary-color);
}

.mb12 {
  margin-bottom: 12px;
}
</style>
