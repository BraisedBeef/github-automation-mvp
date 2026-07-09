<template>
  <div class="domains-set">
    <!-- tab -->
    <div class="domains-set-tab">
      <CatTabsBox
        v-model="state.activeTab"
        :list="[
          { label: t('domainSet2.basicInfo'), value: 0 },
          { label: t('domainSet2.funcSet'), value: 1 },
        ]"
      />
    </div>

    <div class="domains-set-content">
      <BasicInfo v-if="state.activeTab === 0" :info="domainInfo" @refresh="getData" />
      <FuncSet v-else :id="state.domainId" :info="domainInfo" @refresh="getData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BasicInfoData } from './config'
import BasicInfo from './basic-info.vue'
import FuncSet from './func-set.vue'
import { _getDomainInfo } from '@/apis/dns/domain'
import { events } from '@/utils/mitt'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import CatTabsBox from '@/components/common/cat-tabs-box/index.vue'
const emit = defineEmits<{
  (event: 'show-error-box', show: boolean)
}>()
const route = useRoute()
const state = reactive<{
  activeTab: number
  domainId: any
  loading: boolean
}>({
  activeTab: 0,
  domainId: void 0,
  loading: false,
})

const domainInfo = ref<BasicInfoData>()

const tab = ref()
// 切换

const getData = async () => {
  console.log('调用')

  if (!state.domainId) {
    message.warning('No Domain ID!')
    return
  }
  try {
    state.loading = true
    const { code, data } = await _getDomainInfo({ domainId: state.domainId })
    state.loading = false
    if (code === 200) {
      domainInfo.value = {
        domainName: data.domainName,
        id: state.domainId,
        domainRegistrar: data.domainRegistrar,
        status: data.status,
        dnsStatus: data.dnsStatus,
        dnsStatusReason: data.dnsStatusReason,
        domainDnsServer: data.domainDnsServer,
        cloudDnsServer: data.cloudDnsServer,
        remark: data.remark,
        ttl: data.ttl,
        lockStatus: data.lockStatus,
        lockPwd: data.lockPwd,
        parseCount: data.parseCount,
        xOptimize: data.xOptimize,
        sensitivity: data.sensitivity,
        maxReturn: data.maxReturn,
      } as any
      // 是否显示error-box
      // emit("show-error-box", Boolean(data.dnsStatus === 2));
    }
  } catch (error) {
    state.loading = false
    console.log('error', error)
  }
}

onMounted(() => {
  const { name, id } = route.query as any
  state.domainId = id
  getData()
  events.on('refesh-domain-info', () => {
    console.log('重新验证')
    getData()
  })
})
defineExpose({
  getData: getData,
})

onUnmounted(() => {
  events.off('refesh-domain-info')
})
</script>

<style scoped lang="scss">
.domains-set {
  /* padding: 0 20px; */

  /* margin: -20px; */

  .domains-set-tab {
    /* padding: 20px 0; */
    display: flex;
    width: 100%;
    padding-bottom: 20px;
    background-color: #f2f4f8;
  }

  .domains-set-content {
    padding: 20px 20px 0;
  }
}
</style>
