<template>
  <div class="domain-batch">
    <CatTabs v-model="activeTab" :tabs="tabList" full-container @change="changeActiveTab" />
    <component :is="page" class="mt20" />
  </div>
</template>

<script setup lang="ts">
import Register from './components/register.vue'
import Renew from './components/renew.vue'
import Dns from './components/dns.vue'
import Info from './components/info.vue'
import Lock from './components/lock.vue'
import Log from './components/log.vue'
import t from '@/utils/i18n'

const tabList = reactive([
  { label: t('domain.batch-operate.739379-0'), value: 0, component: shallowRef(Register) },
  { label: t('domain.batch-operate.739379-1'), value: 1, component: shallowRef(Renew) },
  { label: t('domain.batch-operate.739379-2'), value: 2, component: shallowRef(Dns) },
  { label: t('domain.batch-operate.739379-3'), value: 3, component: shallowRef(Info) },
  { label: t('domain.batch-operate.739379-4'), value: 4, component: shallowRef(Lock) },
  { label: t('domain.batch-operate.739379-5'), value: 5, component: shallowRef(Log) },
])

const activeTab = ref<number>(+sessionStorage.batch_tab || 0)
const changeActiveTab = v => {
  sessionStorage.batch_tab = v.value
}
const page = computed(() => tabList[activeTab.value]!.component)
</script>

<style lang="scss" scoped></style>
