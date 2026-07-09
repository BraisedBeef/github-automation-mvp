<template>
  <div>
    <PageHeader :title="title" :back-title="t('disk.detail.backTitle')" back-name="disk">
      <template #right>
        <div class="btn-wrap pd0-20">
          <!-- 续费 -->
          <el-button
            v-if="checkPermission(permMap.disk.HD_RENEWAL)"
            :disabled="!isRenew(detail.type, detail.costType, detail.state)"
            @click="changeShow(renewRef)"
          >
            {{ t('disk.detail.renew') }}
          </el-button>
          <!-- 创建快照 -->
          <el-button
            v-if="checkPermissionSnapshot(permMap.snapshot.CREATE_HD_SNAPSHOT)"
            :disabled="!isCreateSnapshot(detail.type, detail.state)"
            @click="changeShow(createSnapshotRef)"
          >
            {{ t('disk.detail.createSnapshot') }}
          </el-button>
          <!-- 开启数据备份 -->
          <!-- <el-button :type="'primary'" :disabled="true" @click="() => {}">{{ t('开启数据备份') }}</el-button> -->
          <!-- 更多操作 -->
          <el-select
            v-if="diskMoreList(detail.costType).length"
            ref="moreOptsRef"
            :teleported="true"
            class="ml10 select-opts"
            :model-value="''"
            :placeholder="t('disk.detail.more')"
            @change="
              v => {
                handleOperatechange(v, detail)
              }
            "
          >
            <el-option
              v-for="item in diskMoreList(detail.costType)"
              :key="item.value"
              :value="item.value"
              :label="item.label"
              :disabled="selectOptDisabled(item, detail)"
            />
          </el-select>
        </div>
      </template>
    </PageHeader>

    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="active" class="tabs" :tabs="tabs" @change="() => {}" />
      </div>
    </div>

    <div style="padding: 20px">
      <Info v-if="active === 1" :detail="detail" :loading="loading" @success="getDetail" />
      <Log v-if="active === 2" :detail="detail" :operate-type="8" />
      <Snapshot v-if="active === 3" :detail="detail" @success="getDetail" />
      <Backups v-if="active === 4" />
      <Monitor v-if="active === 5" :detail="detail" />
    </div>

    <!-- 挂载 -->
    <Mount ref="mountRef" :disk-list="[detail]" @success="getDetail" />
    <!-- 卸载 -->
    <Uninstall ref="uninstallRef" :disk-list="[detail]" @success="getDetail" />
    <!-- 销毁/退还 -->
    <Destruction ref="destructionRef" :disk-list="[detail]" @success="getDetail" />
    <!-- 续费 -->
    <Renew ref="renewRef" :disk="detail" @success="getDetail" />
    <!-- 创建快照 -->
    <CreateSnapshot ref="createSnapshotRef" :disk="detail" @success="getDetail" />
    <!-- 分配至项目 -->
    <SetProject ref="setProjectRef" :disk="detail" @success="getDetail" />
    <!-- 自动续费 -->
    <SetAutoRenew ref="setAutoRenewRef" :disk="detail" @success="getDetail" />
    <!-- 取消自动续费 -->
    <CancelAutoRenew ref="cancelAutoRenewRef" :disk="detail" @success="getDetail" />
    <!-- 重新初始化云硬盘 -->
    <!-- <Init ref="initRef" /> -->
    <!-- 按量转包年包月 -->
    <FlowToTime ref="flowToTimeRef" :disk="detail" />
    <!-- 包年包月转按量 -->
    <!-- <TimeToAmount ref="timeToAmountRef" /> -->
    <!-- 云硬盘扩容 -->
    <Expans ref="expansRef" :disk="detail" @success="getDetail" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore, useCvmStore } from '@/store'
import Info from './components/info.vue'
import Backups from './components/backups.vue'
import Log from './components/log.vue'
import Monitor from './components/monitor/index.vue'
import Snapshot from './components/snapshot.vue'
import CreateSnapshot from '../list/components/create-snapshot.vue'
import SetProject from '../list/components/set-project.vue'
import Mount from '../list/components/mount.vue'
import SetAutoRenew from '../list/components/set-auto-renew.vue'
import CancelAutoRenew from '../list/components/cancel-auto-renew.vue'
import Destruction from '../list/components/destruction.vue'
import Uninstall from '../list/components/uninstall.vue'
// import Init from '../list/components/init.vue'
import Renew from '../list/components/renew.vue'
import FlowToTime from '../list/components/flow-to-time.vue'
// import TimeToAmount from '../list/components/time-to-amount.vue'
import Expans from '../list/components/expans.vue'
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

const route = useRoute()
const cvmStore = useCvmStore()

const v = route.query.active as string

const active = ref(v ? Number(v) : 1)
const tabs = [
  { label: t('disk.detail.base'), value: 1 }, // 基本信息
  { label: t('disk.detail.log'), value: 2 }, // 操作日志
  { label: t('disk.detail.snapshot'), value: 3 }, // 快照
  // { label: '备份', value: 4 }, // 备份
  { label: t('disk.detail.monitor'), value: 5 }, // 监控
]
const id = ref<string>(route.params.id as string) // id
const detail = ref<any>({}) // 详情
const loading = ref<boolean>(false)

const createSnapshotRef = ref<InstanceType<typeof CreateSnapshot>>() // 创建快照
const setProjectRef = ref<InstanceType<typeof SetProject>>() // 分配至项目
const mountRef = ref<InstanceType<typeof Mount>>() // 挂载云硬盘
const setAutoRenewRef = ref<InstanceType<typeof SetAutoRenew>>() // 自动续费
const cancelAutoRenewRef = ref<InstanceType<typeof CancelAutoRenew>>() // 取消自动续费
const destructionRef = ref<InstanceType<typeof Destruction>>() // 销毁
const uninstallRef = ref<InstanceType<typeof Uninstall>>() // 卸载
// const initRef = ref<InstanceType<typeof Init>>() // 重新初始化云硬盘
const renewRef = ref<InstanceType<typeof Renew>>() // 续费
const flowToTimeRef = ref<InstanceType<typeof FlowToTime>>() // 按量转包年包月
// const timeToAmountRef = ref<InstanceType<typeof TimeToAmount>>() // 包年包月转按量
const expansRef = ref<InstanceType<typeof Expans>>() // 云硬盘扩容

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.disk,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)
// 厂商权限配置
const permConfigSnapshot = reactive({
  moduleId: moduleMap.snapshot,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission: checkPermissionSnapshot } = useCvmAndNetworkPermission(permConfigSnapshot)

const title = computed(() => {
  return `${detail.value.diskId || '-'}(${detail.value.diskName || '-'})`
})

// 更多操作list
const diskMoreList = (costType: number) => {
  const filterCb = el => {
    // 判断不同厂商和不同计费模式支持的功能
    if (el.perm) {
      return checkPermission(el.perm) && el.costType.includes(costType)
    } else {
      return el.costType.includes(costType)
    }
  }

  return DISK_MORE_OPTS.filter(filterCb)
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// select opt disabled
const selectOptDisabled = (v: any, row: any) => {
  // 扩容
  if (v.value === 'expans') {
    return !isExpans(row.state)
  }

  // 挂载
  if (v.value === 'mount') {
    return !isMount(row.type, row.state)
  }

  // 卸载
  if (v.value === 'uninstall') {
    return !isUninstall(row.type, row.state)
  }

  // 自动续费
  if (v.value === 'setAutoRenew') {
    return !isSetAutoRenew(row.type, row.costType, row.state)
  }

  // 销毁/退还
  if (v.value === 'destruction') {
    return !isDestruction(row.type, row.state)
  }

  // 分配至项目
  if (v.value === 'setProject') {
    return !isSetProject(row.state)
  }

  // 按量转包年包月
  if (v.value === 'flowToTime') {
    return !isFlowToTime(row.type, row.costType, row.state)
  }
}

// 操作
const handleOperatechange = (v: any, row: any) => {
  // console.log(`handleOperatechange===>`, v, row)

  // 扩容
  if (v === 'expans') {
    if (isExpans(row.state)) {
      changeShow(expansRef.value)
    }
  }

  // 挂载
  if (v === 'mount') {
    if (isMount(row.type, row.state)) {
      changeShow(mountRef.value)
    }
  }

  // 卸载
  if (v === 'uninstall') {
    if (isUninstall(row.type, row.state)) {
      changeShow(uninstallRef.value)
    }
  }

  // 销毁/退还
  if (v === 'destruction') {
    if (isDestruction(row.type, row.state)) {
      changeShow(destructionRef.value)
    }
  }

  // 自动续费
  if (v === 'setAutoRenew') {
    if (isSetAutoRenew(row.type, row.costType, row.state)) {
      changeShow(row.renewFlag === 1 ? cancelAutoRenewRef.value : setAutoRenewRef.value)
    }
  }

  // 分配至项目
  if (v === 'setProject') {
    if (isSetProject(row.state)) {
      changeShow(setProjectRef.value)
    }
  }

  // 按量转包年包月
  if (v === 'flowToTime') {
    if (isFlowToTime(row.type, row.costType, row.state)) {
      changeShow(flowToTimeRef.value)
    }
  }
}

// 硬盘详情
const getDetail = async () => {
  try {
    loading.value = true

    const res = await _getDetail({
      id: id.value,
    })

    // console.log(`_getDetail===>`, res)

    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
  getDetail()
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

.detail-wrap {
  /* margin-top: 40px; */
  margin-bottom: 40px;

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
    }
  }
}

.select-opts {
  :deep(.el-select-dropdown__wrap) {
    max-height: 500px !important;
  }
}
</style>
