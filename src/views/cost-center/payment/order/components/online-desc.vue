<template>
  <i18n-t keypath="payment.onlineDesc">
    <SvgIcon v-for="(item, index) in payList" :key="index" class="bank-img cursor-pointer" :name="item.name" />
  </i18n-t>
</template>

<script setup lang="ts">
const payList = computed(() => {
  return [
    {
      name: 'pay-union',
    },
    // {
    //   name: 'pay-wechat',
    // },
    {
      name: 'pay-alipay',
    },
    {
      name: 'pay-usdt',
    },
  ]
})
</script>

<style lang="scss" scoped>
.desc {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--common-text);
}

.bank-img {
  width: 18px;
  height: 18px;
}
</style>
