<template>
  <div>
    <!-- <PageHeader :title="`（${route.query.name}-${route.query.uuid}）`" :back-title="t('securityGroup.securityGroup')"> -->
    <PageHeader :title="`${route.query.uuid}`" :back-title="t('securityGroup.securityGroup')">
      <template #right>
        <div />
      </template>
    </PageHeader>
    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="state.pageActive" class="tabs" :tabs="pageTabs" @change="changeTab" />
      </div>
    </div>

    <div style="padding: 20px">
      <!-- 安全组规格 -->
      <SecurityGroupRule
        v-if="state.pageActive === 1"
        ref="securityGroupRuleRef"
        :detail-id="state.detailId"
        :ins-number="state.insNumber"
      />
      <!-- 关联实例 -->
      <InstanceAssociation v-else ref="instanceAssociationRef" :detail-id="state.detailId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useBaseStore, useTempStore } from '@/store'
import { pageTabs } from './config'
import SecurityGroupRule from './components/security-group-rule/index.vue'
import InstanceAssociation from './components/instance-association/index.vue'
import { getSecurityGroupInstancesList } from '@/apis/network/security-group'

const route = useRoute()

const state = reactive<{
  pageActive: number // 当前显示页面tab 1:安全组规则，2:关联实例
  detailId: number // 安全组id
  insNumber: number // 安全组关联实例数量
  uuid: string
}>({
  pageActive: Number(route.query?.type) || 1,
  detailId: Number(route.query?.id || 0),
  uuid: (route.query?.uuid as string) || '',
  insNumber: 0,
})

const securityGroupRuleRef = ref<InstanceType<typeof SecurityGroupRule>>()
const instanceAssociationRef = ref<InstanceType<typeof InstanceAssociation>>()

const changeTab = () => {
  if (state.pageActive === 1) {
    nextTick(() => {
      securityGroupRuleRef.value?.changeRuleTabs()
    })
  }
}

// 获取关联实例列表 为了获取安全组关联实例数量 删除安全组规则时要用
const getInstancesList = async () => {
  const params = {
    groupId: state.detailId,
    pageSize: 10,
    pageIndex: 1,
  }
  try {
    const res = await getSecurityGroupInstancesList(params)
    if (res.success) {
      state.insNumber = res.data?.recordCnt || 0
    }
  } catch (err) {
    console.log('error', err)
  }
}

onMounted(async () => {
  console.log(route.query)

  useTempStore().setPageHeader(false)
  if (state.pageActive === 1) {
    securityGroupRuleRef.value?.changeRuleTabs()
  }
  getInstancesList()
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

.py11 {
  padding: 11px 0;
}

.table {
  .select-tr {
    margin-left: -12px;

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none !important;

      .el-input__inner {
        &::placeholder {
          color: var(--primary-color) !important;
        }

        color: var(--primary-color) !important;
      }
    }
  }
}
</style>
