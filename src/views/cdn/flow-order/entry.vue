<template>
  <div />
</template>

<script setup lang="ts">
import { pushRoute } from '@/utils/router-jump'

const route = useRoute()

const redirectToSharedPayment = () => {
  const type = String(route.query.type || 'cdn')
  const tradeNo = String(route.query.tradeNo || '')
  const serialNo = String(route.query.serialNo || '')

  if (tradeNo) {
    pushRoute({
      name: 'payment_product_order',
      params: {
        tradeNo,
      },
      query: {
        type,
      },
    })
    return
  }

  if (serialNo) {
    pushRoute({
      name: 'payment_pre_pay_order',
      params: {
        serialNo,
      },
      query: {
        type,
      },
    })
    return
  }

  pushRoute({
    name: 'cdn_buyFlow',
  })
}

onBeforeMount(() => {
  redirectToSharedPayment()
})
</script>
