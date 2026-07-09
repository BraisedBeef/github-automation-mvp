<template>
  <div class="add-domain">
    <div class="page-box step df jc">
      <CatStep v-model="step" :steps="stepList" class="mt20 mb20" />
    </div>
    <component :is="active_component" @switch-tab="switch_tab" />
  </div>
</template>

<script setup lang="ts">
import Add from './components/add.vue'
import Config from './components/config.vue'
import Cname from './components/cname.vue'
import t from '@/utils/i18n'
import { removeLocalItem } from '@/utils/storage'

const step = ref<number>(0)
const stepList = [
  { label: t('addDomain'), value: 0 },
  { label: t('recommendConfig'), value: 1 },
  { label: t('configCNAME'), value: 2 },
]

const tabList = reactive([
  { name: 0, component: shallowRef(Add) },
  { name: 1, component: shallowRef(Config) },
  { name: 2, component: shallowRef(Cname) },
])

const active_component = computed(() => tabList[step.value]!.component)

const switch_tab = (next: any) => {
  if (step.value > 3) return
  ;(next as boolean) ? step.value++ : step.value--
}

onBeforeUnmount(() => {
  removeLocalItem('CDN_DOMAIN')
  removeLocalItem('CDN_DOMAIN_ID')
  removeLocalItem('CDN_SERVICE_ID')
})
</script>

<style lang="scss" scoped>
@import '../index-domain';

.add-domain {
  .cat-step {
    width: auto;

    :deep(.cat-step-item) {
      width: auto;
      min-width: auto;
      margin-right: 0;
      margin-bottom: 0;

      .step-item-arrow {
        margin: 0 30px;
      }

      .step-item-text {
        max-width: none;
      }
    }
  }
}
</style>
