<template>
  <div v-loading="pageLoading" class="page">
    <div class="title">
      {{ t('oss.buyPack.title') }}
    </div>
    <div class="mb20">
      <CatTabs2 v-model="tab" class="tabs" :tabs="config.tabs" />
    </div>
    <ComboPack v-if="tab === 1" />
    <DataAddOn v-else />
    <PriceFixed />
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { useTempStore } from '@/store'
import { useOss } from '../../hooks/use-oss'
import ComboPack from './components/combo-pack.vue'
import DataAddOn from './components/data-add-on.vue'
import PriceFixed from './components/price-fixed.vue'

const tempStore = useTempStore()

const { tab, config, pageLoading } = useOss()
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
.page {
  min-height: 100%;
  padding: 40px 120px;
  padding-bottom: 50px;
  background: #fff;

  .title {
    margin-bottom: 25px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 26px;
    color: #000;
  }
}
</style>
