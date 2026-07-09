<template>
  <div v-loading="pageLoading" class="oss-resource-pack-create-v2">
    <header class="oss-resource-pack-create-v2__header">
      <h1>{{ t('oss.buyPack.title') }}</h1>
    </header>
    <div class="oss-resource-pack-create-v2__tabs">
      <CatTabs2 v-model="tab" class="oss-resource-pack-create-v2__tabs-inner" :tabs="config.tabs" />
    </div>
    <div class="oss-resource-pack-create-v2__content">
      <ComboPack v-if="tab === 1" />
      <DataAddOn v-else />
    </div>
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
.oss-resource-pack-create-v2 {
  min-height: 100%;
  background: #fff;
}

.oss-resource-pack-create-v2__header {
  display: flex;
  align-items: center;
  min-height: 60px;
  padding: 16px 56px;
  border-top: 1px solid #e8ecf3;

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;
    color: #191c23;
  }
}

.oss-resource-pack-create-v2__tabs {
  padding: 0 56px;
}

.oss-resource-pack-create-v2__content {
  padding: 20px 56px 160px;
}

.oss-resource-pack-create-v2__tabs-inner {
  border-bottom: 1px solid #e8ecf3;

  :deep(.cat-tabs__header) {
    gap: 32px;
  }

  :deep(.cat-tab__item) {
    padding: 10px 0;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
  }

  :deep(.cat-tab__item.is-active) {
    font-weight: 500;
    color: #06f;
  }

  :deep(.cat-tab_bar) {
    left: 0;
    height: 2px;
  }

  :deep(.cat-tab_line) {
    background: transparent;
  }
}
</style>
