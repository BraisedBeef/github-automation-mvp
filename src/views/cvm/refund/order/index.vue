<template>
  <V2AccountPageShell v-if="isV2Theme">
    <RefundOrderV2
      :product="product"
      :loading="loading"
      :inquiry-req-params="cvmStore.refundOrder.inquiryReqParams"
      @refund="refund"
    />
  </V2AccountPageShell>
  <RefundOrder
    v-else
    :product="product"
    :loading="loading"
    :inquiry-req-params="cvmStore.refundOrder.inquiryReqParams"
    @refund="refund"
  />
</template>

<script setup lang="ts">
import RefundOrderV2 from '@/components/v2/refund/refund-order.vue'
import RefundOrder from '@/components/cvm/refund/refund-order.vue'
import V2AccountPageShell from '@/views/v2/account-system/components/page-shell.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'
import t from '@/utils/i18n'
import { useCvmStore, useTempStore } from '@/store'
import { message } from '@/utils/message'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useDisk } from '@/views/cvm/hooks/use-disk'

import { useUserStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

/**
 * @desc cvm退款
 */
const route = useRoute()
const cvmStore = useCvmStore()
const tempStore = useTempStore()
const { isV2Theme, syncThemeVersion } = useThemeVersion()
const { refundInstance, loading: insLoading } = useIns()
const { terminateDisks, loading: diskLoading } = useDisk()
const userStore = useUserStore()

const product = ref<string>(route.query.product as string)

const loading = computed(() => {
  const product: string = route.query.product as string
  if (product === 'ins') {
    return insLoading.value
  } else if (product === 'disk') {
    return diskLoading.value
  } else {
    return false
  }
})

// 退款
const refund = () => {
  const product: string = route.query.product as string
  const operate: string = route.query.operate as string

  // 实例
  if (product === 'ins') {
    const cb = () => {
      userStore.getUser()
      pushRoute({ name: 'cvm_refund_success', query: { type: 'cvm' } })
    }
    // 销毁退还
    if (operate === 'destruction') {
      refundInstance(true, cvmStore.refundOrder.refundReqParams, cb)
    }
  }
  // 硬盘
  if (product === 'disk') {
    const cb = () => {
      userStore.getUser()
      pushRoute({ name: 'cvm_refund_success', query: { type: 'cbs' } })
    }
    // 销毁退还
    if (operate === 'destruction') {
      terminateDisks(cvmStore.refundOrder.refundReqParams, cb)
    }
  }

  if (!product || !operate) {
    // 退款失败
    message.warning(t('refund.refundFail'))
  }
}

onBeforeMount(() => {
  syncThemeVersion()
  tempStore.setPageHeader(!isV2Theme.value)
})

watch(
  () => isV2Theme.value,
  value => {
    tempStore.setPageHeader(!value)
  },
)

onBeforeUnmount(() => {
  tempStore.setPageHeader(true)
})

onBeforeRouteLeave(() => {
  tempStore.setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.page {
  min-height: calc(100vh - 40px - 40px);
  padding: 40px 120px;
  background: #fff;

  .title {
    margin-bottom: 25px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 26px;
    color: #000;
  }

  .tit-wrap {
    .reat {
      width: 3px;
      height: 16px;
      margin-right: 10px;
      background: #0063ff;
    }

    .text {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: #000;
    }
  }

  .lt {
    flex: 1;
    margin-right: 40px;
  }

  .rt {
    width: 300px;
  }

  .list-wrap {
    .desc {
      margin-bottom: 15px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: #000;
    }

    .info {
      box-sizing: border-box;
      padding: 20px 20px 40px;

      /* height: 240px; */
      background: #f9fafc;

      .tit {
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 14px;
        color: #000;
      }

      .item {
        margin-bottom: 10px;

        .key {
          width: 140px;
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
    }
  }

  .detail-wrap {
    .item {
      .key {
        width: 140px;
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

    .line {
      height: 1px;
      margin-top: 10px;
      margin-bottom: 20px;
      background-color: #eee;
    }

    .price {
      .key {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        color: #000;
      }

      .value {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 24px;
      }
    }
  }
}

.mb40 {
  margin-bottom: 40px;
}
</style>
