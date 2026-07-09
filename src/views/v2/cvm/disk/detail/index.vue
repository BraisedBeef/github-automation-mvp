<template>
  <div v-if="detail?.id" class="cvm-disk-detail-v2">
    <section class="cvm-disk-detail-v2__header">
      <PageBreadcrumbToolbar
        :items="[t('disk.list.disk'), detail.diskId || '-', `(${detail.diskName || '-'})`]"
        @doc="openHelpDoc"
      >
        <template #right>
          <div class="cvm-disk-detail-v2__actions">
            <el-button
              v-if="checkPermission(permMap.disk.HD_RENEWAL)"
              :disabled="!isRenew(detail.type, detail.costType, detail.state)"
              @click="changeShow(renewRef)"
            >
              {{ t('disk.detail.renew') }}
            </el-button>
            <el-button
              v-if="checkPermissionSnapshot(permMap.snapshot.CREATE_HD_SNAPSHOT)"
              :disabled="!isCreateSnapshot(detail.type, detail.state)"
              @click="changeShow(createSnapshotRef)"
            >
              {{ t('disk.detail.createSnapshot') }}
            </el-button>
            <Select
              v-if="diskMoreList(detail.costType).length"
              class="cvm-disk-detail-v2__more"
              :one-menu-width="180"
              :select-width="120"
              :list="moreList"
              two-menu-align="lt"
              :ph="t('disk.detail.more')"
              @opt-click="moreOptClickFn"
            />
          </div>
        </template>
      </PageBreadcrumbToolbar>

      <section class="cvm-disk-detail-v2__tabs">
        <CatTabs v-model="active" class="cvm-disk-detail-v2__tabs-inner" :tabs="tabs" @change="changeTab" />
      </section>
    </section>

    <section class="cvm-disk-detail-v2__content">
      <Info v-if="active === 1" :detail="detail" :loading="loading" @success="getDetail" />
      <Log v-if="active === 2" :detail="detail" :operate-type="8" />
      <Snapshot v-if="active === 3" :detail="detail" @success="getDetail" />
      <Backups v-if="active === 4" />
      <Monitor v-if="active === 5" :detail="detail" />
    </section>

    <Mount ref="mountRef" :disk-list="[detail]" @success="getDetail" />
    <Uninstall ref="uninstallRef" :disk-list="[detail]" @success="getDetail" />
    <Destruction ref="destructionRef" :disk-list="[detail]" @success="getDetail" />
    <Renew ref="renewRef" :disk="detail" @success="getDetail" />
    <CreateSnapshot ref="createSnapshotRef" :disk="detail" @success="getDetail" />
    <SetProject ref="setProjectRef" :disk="detail" @success="getDetail" />
    <SetAutoRenew ref="setAutoRenewRef" :disk="detail" @success="getDetail" />
    <CancelAutoRenew ref="cancelAutoRenewRef" :disk="detail" @success="getDetail" />
    <FlowToTime ref="flowToTimeRef" :disk="detail" />
    <Expans ref="expansRef" :disk="detail" @success="getDetail" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore, useCvmStore } from '@/store'
import Info from '@/views/v2/cvm/disk/detail/components/info/index.vue'
import Backups from '@/views/cvm/disk/detail/components/backups.vue'
import Log from '@/views/v2/cvm/disk/detail/components/log/index.vue'
import Monitor from '@/views/v2/cvm/disk/detail/components/monitor/index.vue'
import Snapshot from '@/views/v2/cvm/disk/detail/components/snapshot/index.vue'
import CreateSnapshot from '@/views/cvm/disk/list/components/create-snapshot.vue'
import SetProject from '@/views/cvm/disk/list/components/set-project.vue'
import Mount from '@/views/cvm/disk/list/components/mount.vue'
import SetAutoRenew from '@/views/cvm/disk/list/components/set-auto-renew.vue'
import CancelAutoRenew from '@/views/cvm/disk/list/components/cancel-auto-renew.vue'
import Destruction from '@/views/cvm/disk/list/components/destruction.vue'
import Uninstall from '@/views/cvm/disk/list/components/uninstall.vue'
import Renew from '@/views/cvm/disk/list/components/renew.vue'
import FlowToTime from '@/views/cvm/disk/list/components/flow-to-time.vue'
import Expans from '@/views/cvm/disk/list/components/expans.vue'
import { _getDetail } from '@/apis/cvm/disk'
import {
  DISK_MORE_OPTS,
  isMount,
  isRenew,
  isExpans,
  isUninstall,
  isDestruction,
  isSetAutoRenew,
  isSetProject,
  isCreateSnapshot,
  isFlowToTime,
} from '@/views/cvm/disk/config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import { documentUrl } from '@/config/base-config'
import { replaceRoute } from '@/utils/router-jump'

const route = useRoute()
const cvmStore = useCvmStore()

const v = route.query.active as string
const active = ref(v ? Number(v) : 1)
const tabs = [
  { label: t('disk.detail.base'), value: 1 },
  { label: t('disk.detail.log'), value: 2 },
  { label: t('disk.detail.snapshot'), value: 3 },
  { label: '备份', value: 4 },
  { label: t('disk.detail.monitor'), value: 5 },
]
const id = ref<string>(route.params.id as string)
const detail = ref<any>({})
const loading = ref(false)

const createSnapshotRef = ref<InstanceType<typeof CreateSnapshot>>()
const setProjectRef = ref<InstanceType<typeof SetProject>>()
const mountRef = ref<InstanceType<typeof Mount>>()
const setAutoRenewRef = ref<InstanceType<typeof SetAutoRenew>>()
const cancelAutoRenewRef = ref<InstanceType<typeof CancelAutoRenew>>()
const destructionRef = ref<InstanceType<typeof Destruction>>()
const uninstallRef = ref<InstanceType<typeof Uninstall>>()
const renewRef = ref<InstanceType<typeof Renew>>()
const flowToTimeRef = ref<InstanceType<typeof FlowToTime>>()
const expansRef = ref<InstanceType<typeof Expans>>()

const permConfig = reactive({
  moduleId: moduleMap.disk,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const permConfigSnapshot = reactive({
  moduleId: moduleMap.snapshot,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission: checkPermissionSnapshot } = useCvmAndNetworkPermission(permConfigSnapshot)

const diskMoreList = (costType: number) => {
  const filterCb = el => {
    if (el.perm) {
      return checkPermission(el.perm) && el.costType.includes(costType)
    }
    return el.costType.includes(costType)
  }

  return DISK_MORE_OPTS.filter(filterCb)
}

const selectOptDisabled = (v: any, row: any) => {
  if (v.value === 'expans') return !isExpans(row.state)
  if (v.value === 'mount') return !isMount(row.type, row.state)
  if (v.value === 'uninstall') return !isUninstall(row.type, row.state)
  if (v.value === 'setAutoRenew') return !isSetAutoRenew(row.type, row.costType, row.state)
  if (v.value === 'destruction') return !isDestruction(row.type, row.state)
  if (v.value === 'setProject') return !isSetProject(row.state)
  if (v.value === 'flowToTime') return !isFlowToTime(row.type, row.costType, row.state)
  return false
}

const moreList = computed(() => {
  return diskMoreList(detail.value.costType).map(item => ({
    ...item,
    disabled: selectOptDisabled(item, detail.value),
  }))
})

const changeTab = tab => {
  replaceRoute({
    name: 'disk_detail',
    query: {
      active: tab.value,
    },
  })
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const moreOptClickFn = (item: any) => {
  switch (item.value) {
    case 'expans':
      changeShow(expansRef.value)
      break
    case 'mount':
      changeShow(mountRef.value)
      break
    case 'uninstall':
      changeShow(uninstallRef.value)
      break
    case 'destruction':
      changeShow(destructionRef.value)
      break
    case 'setAutoRenew':
      changeShow(detail.value.renewFlag === 1 ? cancelAutoRenewRef.value : setAutoRenewRef.value)
      break
    case 'setProject':
      changeShow(setProjectRef.value)
      break
    case 'flowToTime':
      changeShow(flowToTimeRef.value)
      break
    default:
      break
  }
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const getDetail = async () => {
  try {
    loading.value = true
    const res = await _getDetail({
      id: id.value,
    })
    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  useTempStore().setPageHeader(false)
  getDetail()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style scoped lang="scss">
.cvm-disk-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cvm-disk-detail-v2__header {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

.cvm-disk-detail-v2__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.cvm-disk-detail-v2__tabs {
  // padding: 0 28px;
  background: #fff;
  border-bottom: 1px solid #eef2f8;
}

.cvm-disk-detail-v2__tabs-inner {
  :deep(.cat-tabs__header) {
    border-color: transparent;
  }
}

.cvm-disk-detail-v2__content {
  display: flex;
  flex-direction: column;
}
</style>
