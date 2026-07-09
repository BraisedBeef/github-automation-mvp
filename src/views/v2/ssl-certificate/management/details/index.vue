<template>
  <section class="ssl-details-v2">
    <div class="ssl-details-v2__header">
      <PageBreadcrumbToolbar :items="[pageTitle]" :show-doc="false" />

      <div class="ssl-details-v2__tabs">
        <button
          v-for="item in detailTabs"
          :key="item.value"
          class="ssl-details-v2__tab"
          :class="{ 'is-active': item.value === tabType }"
          type="button"
          @click="setTabType(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <section class="ssl-details-v2__panel">
      <keep-alive>
        <component :is="components[Number(tabType)]" :id="props.id" />
      </keep-alive>
    </section>
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import { SSL_CERTIFICATE_DETAILS_TAB } from '@/views/ssl-certificate/management/config'
import BaseInfo from './components/base-info.vue'
import DeploymentRecords from './components/deployment-records.vue'
import UpdateRecord from './components/update-record.vue'

const props = defineProps<{
  id: string
}>()

const route = useRoute()
const query = route.query as unknown as {
  cert_id?: string
}

const pageTitle = computed(() => `${query.cert_id || props.id}${t('ssl-certificate.management.deploy.835774-0')}`)

const detailTabs = [
  {
    label: t('ssl-certificate.management.details.083467-0'),
    value: '0',
  },
  {
    label: t('ssl-certificate.management.details.083467-1'),
    value: '1',
  },
  {
    label: t('ssl-certificate.management.details.083467-2'),
    value: '2',
  },
]

const tabTypeFromSession = _s_getItem(SSL_CERTIFICATE_DETAILS_TAB)
const tabType = ref(tabTypeFromSession?.toString() || '0')

const setTabType = (value: string) => {
  _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, value)
  tabType.value = value
}

const components = [BaseInfo, DeploymentRecords, UpdateRecord]
</script>

<style scoped lang="scss">
.ssl-details-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.ssl-details-v2__header {
  overflow: hidden;
  background: #fff;
}

.ssl-details-v2__tabs {
  display: flex;
  gap: 48px;
  align-items: center;
  padding: 0 28px;
  border-top: 1px solid #fff;
}

.ssl-details-v2__tab {
  position: relative;
  padding: 12px 0 13px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;

  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    content: '';
    background: transparent;
  }

  &.is-active {
    color: #06f;
  }

  &.is-active::after {
    background: #06f;
  }
}

.ssl-details-v2__panel {
  min-height: 0;
  padding: 24px;
  background: #fff;
}
</style>
