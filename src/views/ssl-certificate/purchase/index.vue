<template>
  <div class="page-container">
    <div class="title-group">
      <div class="title">
        {{ t('ssl-certificate.purchase.index.977416-0') }}
      </div>
      <div class="mb20">
        <CatTabs2 v-model="tab.current" class="tabs" :tabs="tabList" />
      </div>
    </div>
    <component :is="components[tab.current]" @switch-tab="switch_tab" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore } from '@/store'
import CustomPage from './components/custom.vue'
const tempStore = useTempStore()

const components = [CustomPage]
const tabList = [
  {
    label: t('ssl-certificate.purchase.index.977416-1'),
    value: 0,
  },
]

/// tab
const tab = reactive({
  current: 0,
})
const switch_tab = (next: (typeof tabList)[0]) => {
  // 切换tab
  tab.current = next?.value
}

onBeforeMount(() => {
  tempStore.set('showSlider', false)
})
onBeforeUnmount(() => {
  tempStore.set('showSlider', true)
})
onBeforeRouteLeave(() => {
  tempStore.set('showSlider', true)
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 40px 120px;
  background: #fff;

  .title {
    margin-bottom: 25px;
    font-size: 26px;
    color: #000;
  }
}
</style>
