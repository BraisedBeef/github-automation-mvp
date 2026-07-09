<template>
  <BuyOrder />
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore } from '@/store'
import { usePublicIp } from '@/views/network/public-ip/hooks/use-public-ip'
import { useNetworkStore } from '@/store'
import { message } from '@/utils/message'

const tempStore = useTempStore()
const route = useRoute()
const { loading, createPublicIp, adjustNetwork, renewNetwork } = usePublicIp()
const networkStore = useNetworkStore()

// const buy = () => {
//   const operate: string = route.query.operate as string
//   if (operate === 'create') {
//     //  创建
//     createPublicIp(networkStore.timeCostOrder.reqParams)
//   } else if (operate === 'adjust') {
//     // 调整网络
//     adjustNetwork(networkStore.timeCostOrder.reqParams)
//   } else if (operate === 'renew') {
//     // 续费
//     renewNetwork(networkStore.timeCostOrder.reqParams)
//   } else {
//     // 支付失败
//     message.warning(t('cvmCpm.payFail'))
//   }
// }

onBeforeMount(() => {
  console.log('onBeforeMount==>')
  tempStore.set('showSlider', false)
})
onBeforeUnmount(() => {
  // console.log('onBeforeUnmount==>')
  tempStore.set('showSlider', true)
})
onBeforeRouteLeave(() => {
  // console.log('onBeforeRouteLeave==>')
  tempStore.set('showSlider', true)
})
</script>

<style lang="scss" scoped></style>
