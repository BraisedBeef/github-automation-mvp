<template>
  <div class="wrap page-box df jc h-full">
    <!-- 充值业务 -->
    <div v-if="route.query.type === 'recharge'">
      <p class="text-center">
        <SvgIcon name="pay-fail" style="width: 44px; height: 44px" />
      </p>
      <p class="name text-center mb10">
        {{ t('payment.rechargeFail') }}
      </p>
      <div class="desc df ac text-center">
        <SvgIcon name="warn-primary" class="mr4" /><span> {{ t('payment.payFailDesc') }} </span
        ><span>{{ failMsg }}</span>
      </div>
      <p class="text-center">
        <el-button type="primary" @click="back">
          {{ t('common.back') }}
        </el-button>
      </p>
    </div>
    <!-- cdn/cvm/network/domain/order业务 -->
    <div v-else>
      <p class="text-center">
        <SvgIcon name="pay-fail" style="width: 44px; height: 44px" />
      </p>
      <p class="name text-center mb10">
        {{ t('payment.payFailTit') }}
      </p>
      <div class="desc df ac text-center">
        <SvgIcon name="warn-primary" class="mr4" /><span> {{ t('payment.payFailDesc') }} </span
        ><span>{{ failMsg }}</span>
      </div>
      <p class="text-center">
        <el-button type="primary" @click="back">
          {{ t('common.back') }}
        </el-button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { usePaymentRouteJump } from '@/views/cost-center/hooks/use-payment-route-jump'

const route = useRoute()
const { go } = usePaymentRouteJump()

const failMsg = computed(() => {
  return route.query.msg ? route.query.msg : t('payment.payFailDefaultDesc')
})

const back = () => {
  go()
}
</script>

<style lang="scss" scoped>
.wrap {
  box-sizing: border-box;
  padding-top: 80px;
  margin: 0 auto;
  background-color: #fff;

  .name {
    margin-top: 10px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 24px;
    color: var(--primary-text);
  }

  .desc {
    height: 34px;
    padding: 0 10px;
    margin-bottom: 40px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 34px;
    color: var(--active-text);
    background: var(--info-box-bgc);
    border-radius: 4px;
  }

  .text-center {
    text-align: center;
  }
}
</style>
