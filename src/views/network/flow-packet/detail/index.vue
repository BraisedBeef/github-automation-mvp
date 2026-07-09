<template>
  <div>
    <!-- <PageHeader :title="`（${route.query.name}-${route.query.uuid}）`" :back-title="t('securityGroup.securityGroup')"> -->
    <PageHeader :title="`${route.query.uuid}`" :back-title="t('flowPacket.flowPacket')">
      <template #right>
        <div />
      </template>
    </PageHeader>
    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="pageActive" class="tabs" :tabs="pageTabs" @change="changeTab" />
      </div>
    </div>

    <div>
      <BasicInfo v-if="pageActive === 1" />
      <Monitor v-else />
    </div>
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { useBaseStore, useTempStore } from '@/store'
import { pageTabs } from './config'
import BasicInfo from './components/basic-info/index.vue'
import Monitor from './components/monitor/index.vue'

const route = useRoute()

const pageActive = ref<number>(1)

const changeTab = () => {}

onMounted(async () => {
  useTempStore().setPageHeader(false)
  if (route.query?.tab) {
    pageActive.value = Number(route.query.tab)
  }
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>
<style lang="scss" scoped>
.tabs-wrap {
  /* margin-left: -20px; */

  /* width: calc(100% + 40px); */

  /* margin-top: -20px; */
  box-sizing: border-box;
  background: #fff;

  :deep(.cat-tabs__header) {
    /* padding-left: 8px; */
    border-color: transparent;
  }
}
</style>
