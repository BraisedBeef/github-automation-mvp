<template>
  <div>
    <PageHeader :title="state.detail?.eniUuid || ''" :back-title="t('networkCard.networkCard')">
      <template #right>
        <div />
      </template>
    </PageHeader>
    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="state.pageActive" class="tabs" :tabs="pageTabs" @change="() => {}" />
      </div>
    </div>

    <div style="padding: 20px">
      <!-- 基本信息 -->
      <BasicIformation
        v-if="state.pageActive === 1"
        ref="basicIformationRef"
        :eni-id="state.eniId"
        @get-detail="getDetail"
      />
      <!-- IPv4地址管理 -->
      <IpManagement v-if="state.pageActive === 2" ref="ipManagementRef" :eni-id="state.eniId" :detail="state.detail" />
      <!-- 关联安全组 -->
      <AssociateSecurityGroup v-if="state.pageActive === 3" ref="associateSecurityGroupRef" :eni-id="state.eniId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaseStore, useTempStore } from '@/store'
import t from '@/utils/i18n'
import BasicIformation from './components/basic-iformation/index.vue'
import IpManagement from './components/ip-management/index.vue'
import AssociateSecurityGroup from './components/associate-security-group/index.vue'
import { pageTabs } from './config'

const route = useRoute()

const state = reactive<{
  pageActive: number
  eniId: number
  detail: any
}>({
  pageActive: 1,
  eniId: 0,
  detail: {},
})

const basicIformationRef = ref<InstanceType<typeof BasicIformation>>() // 基本信息
const ipManagementRef = ref<InstanceType<typeof IpManagement>>() // IPv4地址管理
const associateSecurityGroupRef = ref<InstanceType<typeof AssociateSecurityGroup>>() // 关联安全组

const getDetail = detail => {
  state.detail = detail
}

onBeforeMount(() => {
  if (route.query?.id) {
    state.eniId = Number(route.query.id)
  }
})

onMounted(() => {
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.tabs-wrap {
  /* margin-left: -20px; */

  /* width: calc(100% + 40px); */

  /* margin-top: -20px; */
  box-sizing: border-box;
  background: #fff;

  :deep(.cat-tabs__header) {
    /* padding-left: 8px; */
    border-color: transparent;
  }
}

.tit {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #000;
}

.item {
  .key-wrap {
    width: 125px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #999;
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--primary-text);
    overflow-wrap: break-word; /* 在必要时单词内部断行 */
    overflow-wrap: anywhere;
    white-space: normal; /* 允许换行 */
  }

  .value-wrap {
    height: 40px;
    padding: 0 16px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    line-height: 40px;
    color: #000;
    background: #f1f7ff;
  }
}

.mt-negative-6 {
  margin-top: -6.5px;
}

.mb13 {
  margin-bottom: 13px;
}

.mb12 {
  margin-bottom: 12px;
}

.flex1 {
  flex: 1;
}

.ml20 {
  margin-left: 20px;
}

.mx10 {
  margin: 0 10px;
}

.w-100 {
  width: 100%;
}

.mr10 {
  margin-right: 10px;
}
</style>
