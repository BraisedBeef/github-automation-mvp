<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.unBindNetworkCard.title')"
    width="550px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <div>
      <div class="desc-wrap df">
        <div class="desc-wrap-left">
          <div class="item mb20">
            <div class="key">
              {{ t('ins.unBindNetworkCard.idName') }}
            </div>
          </div>
          <div class="item mb20">
            <div class="key">
              {{ t('ins.unBindNetworkCard.insId') }}
            </div>
          </div>
        </div>
        <div class="desc-wrap-right">
          <div class="item mb20">
            <div class="value">{{ networkinfo.eniId }}/{{ networkinfo.eniName }}</div>
          </div>
          <div class="item mb20">
            <div class="value">
              {{ networkinfo.instanceId }}
            </div>
          </div>
        </div>
      </div>
      <!-- tip -->
      <Tip :text="tips" type="OneToOne" hide-margin-bottom />
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { eniUnbindVm } from '@/apis/network/network-card'

interface PropType {
  networkinfo: any
}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('ins.unBindNetworkCard.tipsMain'),
  },
])

const confirmHandle = async () => {
  const params = { insId: props.networkinfo.instanceId, eniId: props.networkinfo.eniId }
  comfirmLoading.value = true
  try {
    const res = await eniUnbindVm(params)
    if (res.success) {
      message.success(res.msg)
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    comfirmLoading.value = false
  }
}
// 弹窗打开
const open = () => {}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.desc-wrap {
  .desc-wrap-left {
    margin-right: 20px;
  }

  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }
}
</style>
