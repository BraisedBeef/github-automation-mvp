<template>
  <div class="dns-monitor-task">
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
  margin: -20px;

  .box {
    :deep(.cat-tabs) {
      .cat-tab_content {
        padding: 20px;
        background-color: #f2f4f8;
      }
    }
  }
}
</style>
