<template>
  <div class="domain-list-detail">
    <CatTabs v-model="activeTab" :tabs="tabList" full-container />
    <component :is="page" class="mt20" />
  </div>
</template>

<script setup lang="ts">
import Base from './components/base.vue'
import Contacts from './components/contacts.vue'
import Log from './components/log.vue'
import t from '@/utils/i18n'

const tabList = reactive([
  { label: t('domain.list.detail.188397-0'), value: 0, component: shallowRef(Base) },
  { label: t('domain.list.detail.188397-1'), value: 1, component: shallowRef(Contacts) },
  { label: t('domain.list.detail.188397-2'), value: 2, component: shallowRef(Log) },
])
const activeTab = ref<number>(0)
const page = computed(() => tabList[activeTab.value]!.component)
</script>

<style lang="scss" scoped></style>
