<template>
  <div class="wrap page-box df ac jc h-full">
    <div>
      <p class="text-center">
        <SvgIcon name="pwd-success" style="width: 70px; height: 70px" />
      </p>
      <p class="name text-center mb10">
        {{ t('refund.refundSuccess') }}
      </p>
      <p class="desc text-center">
        {{ t('refund.refundSuccessDesc') }}
      </p>
      <div class="btn-wrap df ac jc">
        <el-button class="ml10" @click="goOrder">
          {{ t('payment.seeOrder') }}
        </el-button>
        <el-button type="primary" @click="goConsole">
          {{ t('payment.goConsole') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { usePaymentRouteJump } from '@/views/cost-center/hooks/use-payment-route-jump'

const { go, handleTo } = usePaymentRouteJump()

// 进入控制台
const goConsole = () => {
  go()
}

// 查看我的订单
const goOrder = () => {
  handleTo('/cost', 'order')
}
</script>

<style lang="scss" scoped>
.wrap {
  box-sizing: border-box;
  margin: 0 auto;
  background-color: #fff;

  .name {
    margin-top: 30px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 24px;
    font-style: normal;
    line-height: 32px;
    color: var(--primary-text);
    text-align: center;
  }

  .desc {
    margin-bottom: 25px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
    color: var(--sub-text);
    text-align: center;
  }

  .btn-wrap {
    .ml10 {
      margin-left: 10px !important;
    }
  }

  .text-center {
    text-align: center;
  }
}
</style>
