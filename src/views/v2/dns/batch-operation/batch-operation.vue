<template>
  <div class="batch-wrap">
    <PageHeader :title="t('routes.batchOperation')" style="border-bottom: 0" />
    <CatTabs v-model="state.activeTab" :tabs="tabs" :type="2" @change="handleTab" />
    <div class="dns-batch-operation">
      <div class="page-box" style="min-height: 100%">
        <div class="dns-batch-operation-content">
          <router-view v-slot="{ Component, route }" :key="route.path">
            <transition name="slide-fade">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CatTabs from '@/components/common/cat-tabs/index.vue'

import { tabs } from './config'
import { _throttle } from '@/utils/timing-utils'
import { useTempStore } from '@/store'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'
const route = useRoute()
const state = reactive<{
  activeTab: number
  tabH: number
}>({
  activeTab: 0,
  tabH: 0,
})

const tab = ref()
// 切换
const handleTab = _throttle((item: any) => {
  if (item.name) {
    pushRoute({
      name: item.name,
      query: {},
    })
  }
}, 300)

onMounted(() => {
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})

watch(
  () => route.path,
  (path: string) => {
    const current = tabs.find(tab => tab.path === path)
    if (current) {
      state.activeTab = current.value
    }
  },
  { immediate: true, deep: true },
)
</script>

<style scoped lang="scss">
.batch-wrap {
  :deep(.page-header) {
    .page-header-left {
      .page-title {
        color: #000;
      }
    }
  }
}

.dns-batch-operation {
  position: relative;
  padding: 20px 0;

  :deep(.dns-header) {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2000;
  }

  :deep(.batch-tabs) {
    overflow: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    .dns-tab-ul {
      .dns-tab-item {
        flex-shrink: 0;
      }
    }
  }

  .dns-batch-operation-content {
    width: 100%;
    padding: 20px;

    & > div {
      width: 100%;
      height: 100%;
      background-color: #fff;
    }
  }
}
</style>
