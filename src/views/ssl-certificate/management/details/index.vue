<template>
  <div class="tpl-container">
    <cat-tabs v-model="tabType" :tabs="detailTabs" full-container @change="setTabType" />
    <el-card class="mt20" shadow="never">
      <keep-alive>
        <component :is="components[tabType]" :id="props.id" />
      </keep-alive>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import BaseInfo from './components/base-info.vue'
import UpdateRecord from './components/update-record.vue'
import DeploymentRecords from './components/deployment-records.vue'
import { SSL_CERTIFICATE_DETAILS_TAB } from '../config'

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

// 证书id
const props = defineProps({
  id: String,
})

/// tab
// tabType
const tabTypeFromSession = _s_getItem(SSL_CERTIFICATE_DETAILS_TAB)
const tabType = ref(tabTypeFromSession?.toString() || '0')
const setTabType = tab => {
  _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, tab.value)
  tabType.value = tab.value
}
// 组件
const components = [BaseInfo, DeploymentRecords, UpdateRecord]
</script>

<style lang="scss" scoped></style>
