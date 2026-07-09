<template>
  <div>
    <CatTabs v-model="activeTab" :tabs="tabList" full-container />
    <component :is="page" class="mt20" />
  </div>
</template>

<script lang="ts" setup>
import Base from './components/base.vue'
import Access from './components/access.vue'
import Back from './components/back.vue'
import Cache from './components/cache.vue'
import Https from './components/https.vue'
import Senior from './components/senior.vue'
import t from '@/utils/i18n'

const tabList = reactive([
  { label: t('baseConfig'), value: 0, component: shallowRef(Base) },
  { label: t('accessConfig'), value: 1, component: shallowRef(Access) },
  { label: t('cacheConfig'), value: 2, component: shallowRef(Cache) },
  { label: t('backConfig'), value: 3, component: shallowRef(Back) },
  { label: t('httpsConfig'), value: 4, component: shallowRef(Https) },
  { label: t('seniorConfig'), value: 5, component: shallowRef(Senior) },
])

const activeTab = ref<number>(0)

const page = computed(() => tabList[activeTab.value]!.component)
</script>

<style lang="scss" scoped></style>
