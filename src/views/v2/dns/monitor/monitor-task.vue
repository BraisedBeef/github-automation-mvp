<template>
  <div class="dns-monitor-task">
    <header class="dns-monitor-task__hero">
      <PageBreadcrumbToolbar :items="[t('routes.monitorTask')]" />
    </header>
    <div class="box">
      <CatTabs v-model="modelValue" :tabs="tabs" :type="2" @change="handleChange">
        <!-- <CatTabPane :value="0"> -->
        <MonitorList v-if="modelValue === 1" />
        <!-- </CatTabPane> -->
        <!-- <CatTabPane :value="1"> -->
        <MonitorLog v-else :keyword="logKeyword" />
        <!-- </CatTabPane> -->
      </CatTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CatTab } from '@/components/common/cat-tabs/type'
import MonitorList from './monitor-list/index.vue'
import MonitorLog from './monitor-log/index.vue'
import CatTabs from '@/components/common/cat-tabs/index.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import t from '@/utils/i18n'
const route = useRoute()
const tabs: CatTab[] = [
  { label: t('monitorList.monitorList'), value: 1 },
  { label: t('monitorList.monitorLog'), value: 2 },
]
const modelValue = ref(1)
const logKeyword = ref<string>('')

const handleChange = () => {
  logKeyword.value = ''
  const url = window.location.protocol + '//' + window.location.host + window.location.pathname
  window.history.replaceState({ path: url }, '', url)
}

onMounted(() => {
  const { active, keyword } = route.query
  console.log('moounted', route.query)
  if (active) {
    modelValue.value = Number(active)
  }
  if (keyword) {
    logKeyword.value = keyword as string
  }
})
</script>

<style lang="scss" scoped>
.dns-monitor-task {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  .box {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;

    :deep(.cat-tabs) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;

      .cat-tabs__header {
        min-height: 58px;
        border-bottom: 0;
      }

      .cat-tab_content {
        flex: 1;
        min-height: 0;
        padding: 0;
        background-color: #f2f4f8;
      }
    }
  }
}

.dns-monitor-task__hero {
  flex-shrink: 0;
}
</style>
