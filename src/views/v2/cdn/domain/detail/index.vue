<template>
  <div class="cdn-domain-detail-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <section class="cdn-domain-detail-v2__hero">
      <div class="cdn-domain-detail-v2__tabs">
        <button
          v-for="item in tabItems"
          :key="item.value"
          class="cdn-domain-detail-v2__tab"
          :class="{ 'is-active': activeTab === item.value }"
          type="button"
          @click="activeTab = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <component :is="pageComponent" />
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import AccessTab from '@/views/v2/cdn/domain/detail/components/access.vue'
import BackTab from '@/views/v2/cdn/domain/detail/components/back.vue'
import BaseTab from '@/views/v2/cdn/domain/detail/components/base.vue'
import CacheTab from '@/views/v2/cdn/domain/detail/components/cache.vue'
import HttpsTab from '@/views/v2/cdn/domain/detail/components/https.vue'
import SeniorTab from '@/views/v2/cdn/domain/detail/components/senior.vue'

const route = useRoute()

const activeTab = ref(0)

const tabItems = [
  { label: t('baseConfig'), value: 0, component: markRaw(BaseTab) },
  { label: t('accessConfig'), value: 1, component: markRaw(AccessTab) },
  { label: t('cacheConfig'), value: 2, component: markRaw(CacheTab) },
  { label: t('backConfig'), value: 3, component: markRaw(BackTab) },
  { label: t('httpsConfig'), value: 4, component: markRaw(HttpsTab) },
  { label: t('seniorConfig'), value: 5, component: markRaw(SeniorTab) },
]

const breadcrumbItems = computed(() => [t('domainManage'), `${t('domainSetting')} ${route.query.domain || ''}`])
const pageComponent = computed(() => tabItems.find(item => item.value === activeTab.value)?.component || BaseTab)

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}
</script>

<style scoped lang="scss">
.cdn-domain-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-domain-detail-v2__hero {
  background: #fff;
}

.cdn-domain-detail-v2__tabs {
  display: flex;
  gap: 40px;
  align-items: center;
  padding: 0 24px;
  overflow-x: auto;
}

.cdn-domain-detail-v2__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 0;

  &.is-active {
    color: #06f;
  }

  &.is-active::after {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 100%;
    height: 2px;
    content: '';
    background: #06f;
    transform: translateX(-50%);
  }
}
</style>
