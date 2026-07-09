<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('securityGroup.oneClickRelease')"
    width="550px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <div class="text">
      {{ t('securityGroup.belowRuleRelease') }}
    </div>
    <div class="mt17 df">
      <div class="left-box mr20">
        <div class="label">
          {{ t('securityGroup.source') }}
        </div>
        <div class="mt20 label">
          {{ t('securityGroup.protocolPort') }}
        </div>
      </div>
      <div class="right-box">
        <div class="text">0.0.0.0/0；::/0</div>
        <div class="mt20 text">TCP：20，21，22，3389，80，443；ICMP，ICMPv6</div>
      </div>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { addSecurityGroupRule } from '@/apis/network/security-group'
import { message } from '@/utils/message'

interface PropType {
  regionId: number
  detailId: number
  ruleactive: string
}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)

const confirmHandle = async () => {
  const params = {
    regionId: props.regionId,
    groupId: props.detailId,
    rules: [
      {
        type: 1,
        description: '',
        direction: props.ruleactive,
        protocol: 'all',
        multiport: 'all',
        action: 'allow',
        remoteIpPrefix: '0.0.0.0/0',
        remoteGroupId: null,
        remoteAddressGroupId: null,
      },
      {
        type: 1,
        description: '',
        direction: props.ruleactive,
        protocol: 'all',
        multiport: 'all',
        action: 'allow',
        remoteIpPrefix: '::/0',
        remoteGroupId: null,
        remoteAddressGroupId: null,
      },
    ],
  }
  comfirmLoading.value = true
  try {
    const res = await addSecurityGroupRule(params)
    comfirmLoading.value = false
    if (res.success) {
      message.success(t('securityGroup.increaseSuccess'))
      emits('success')
      show.value = false
    } else {
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
})
</script>
<style scoped lang="scss">
.w76 {
  width: 76px;
}

.mt17 {
  margin-top: 17px;
}

.mr20 {
  margin-right: 20px;
}

.label {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #999;
}

.text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #000;
}
</style>
