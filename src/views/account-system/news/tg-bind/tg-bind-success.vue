<template>
  <div class="tgBind page-box df ac jc h-full">
    <div>
      <p class="text-center">
        <SvgIcon name="pwd-success" style="width: 70px; height: 70px" />
      </p>
      <p class="name text-center mb10">
        {{ t('subscribe.bindSuccess') }}
      </p>
      <p class="desc text-center">
        {{ t('subscribe.tgBind') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore, useBaseStore } from '@/store'
const tempStore = useTempStore()
const baseStore = useBaseStore()

onBeforeMount(() => {
  // baseStore.routeModel = '/user'
  // baseStore.selectedKeys = 'tg_bind_success'
})

onBeforeMount(() => {
  // console.log('onBeforeMount==>')
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
<style lang="scss" scoped>
.tgBind {
  height: 100%;
  min-height: 100%;
}

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
</style>
