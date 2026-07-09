<template>
  <!-- 子订单详情 -->
  <CatDialog v-model:dialog="show" :title="t('payment.subOrderDetail')" width="460px" destroy-on-close :footer="false">
    <div class="order-detail">
      <!-- 订单信息 -->
      <p class="mb10 title">
        {{ t('payment.subOrderInfo') }}
      </p>
      <!-- 订单号 -->
      <div class="df mb10">
        <p class="key-wrap" :class="labelWidthClass">
          <span class="key">{{ t('payment.tradeNo') }}</span>
        </p>
        <span class="value">{{ detail.publicInfo.tradeNo }}</span>
      </div>
      <!-- 子订单号 -->
      <div class="df mb10">
        <p class="key-wrap" :class="labelWidthClass">
          <span class="key">{{ t('payment.subTradeNo') }}</span>
        </p>
        <span class="value">{{ detail.subTradeNo }}</span>
      </div>
      <!-- 产品名称 -->
      <div class="df mb10">
        <p class="key-wrap" :class="labelWidthClass">
          <span class="key">{{ t('payment.productSymbol') }}</span>
        </p>
        <span class="value">{{ detail.productDesc }}</span>
      </div>
      <!-- 类型 -->
      <div class="df mb10">
        <p class="key-wrap" :class="labelWidthClass">
          <span class="key">{{ t('payment.publicInfoType') }}</span>
        </p>
        <span class="value"> {{ ORDER_TYPE_MAP[detail.publicInfo.type] }}</span>
      </div>
      <!-- 单价 -->
      <div class="df mb10">
        <p class="key-wrap" :class="labelWidthClass">
          <span class="key">{{ t('payment.prices') }}</span>
        </p>
        <span class="value">{{ detail.price }}</span>
      </div>
      <!-- 时长 -->
      <div class="df mb10">
        <p class="key-wrap" :class="labelWidthClass">
          <span class="key">{{ t('payment.durations') }}</span>
        </p>
        <span class="value">{{ t('payment.durationNum', [detail.duration]) }}</span>
      </div>
      <!-- 应付金额 -->
      <div class="df mb40">
        <p class="key-wrap" :class="labelWidthClass">
          <span class="key">{{ t('payment.amounts') }}</span>
        </p>
        <span class="value text-warning">${{ detail.amount }} USD</span>
      </div>
      <!-- 配置信息 -->
      <p class="mb10 title">
        {{ t('payment.configurateInfo') }}
      </p>
      <div v-for="(item, index) in detail.configs" :key="index" class="df mb10">
        <p class="key-wrap" :class="labelWidthClass">
          <span class="key">{{ item.key }}</span>
        </p>
        <span class="value">{{ item.value || '-' }}</span>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { ORDER_TYPE_MAP } from '@/views/cost-center/order/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), { detail: () => ({}) })

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w180px',
  [en]: 'key-wrap-w180px',
  [zh]: 'key-wrap-w85px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const show = ref<boolean>(false)

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.order-detail {
  .mb40 {
    margin-bottom: 40px;
  }

  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    line-height: 20px;

    // font-weight: 500;
    color: var(--primary-text);
  }

  .key-wrap {
    width: 85px;

    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--common-text);
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
    }
  }

  .key-wrap-w85px {
    flex-shrink: 0;
    width: 85px;
  }

  .key-wrap-w110px {
    flex-shrink: 0;
    width: 110px;
  }

  .key-wrap-w180px {
    flex-shrink: 0;
    width: 180px;
  }

  .key-wrap-w150px {
    flex-shrink: 0;
    width: 150px;
  }
}
</style>
