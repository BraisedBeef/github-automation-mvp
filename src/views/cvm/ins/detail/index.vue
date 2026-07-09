<template>
  <div v-if="detail?.id">
    <PageHeader
      :title="`${route.params.uuid}(${route.params.name})`"
      :back-title="t('ins.detail.backTitle')"
      back-name="ins"
    >
      <template #right>
        <div class="btn-wrap pd0-20">
          <!-- 开机 -->
          <el-button
            v-if="checkPermission(permMap.ins.START_VM)"
            :disabled="!isPowerOn(detail.state)"
            @click="changeShow(powerOnRef)"
          >
            {{ t('ins.detail.powerOn') }}
          </el-button>
          <!-- 关机 -->
          <el-button
            v-if="checkPermission(permMap.ins.STOP_VM)"
            :disabled="!isShutdown(detail.state)"
            @click="changeShow(shutdownRef)"
          >
            {{ t('ins.detail.shutdown') }}
          </el-button>
          <!-- 重启 -->
          <el-button
            v-if="checkPermission(permMap.ins.REBOOT_VM)"
            :disabled="!isRestart(detail.state)"
            @click="changeShow(restartRef)"
          >
            {{ t('ins.detail.restart') }}
          </el-button>
          <!-- 重置密码 -->
          <el-button
            v-if="checkPermission(permMap.ins.RESET_VM_PWD)"
            :disabled="!isSetPwd(detail.state)"
            @click="changeShow(setPwdRef)"
          >
            {{ t('ins.detail.setPwd') }}
          </el-button>
          <!-- 销毁/退还 -->
          <el-button
            v-if="checkPermission(permMap.ins.DELETE_VM)"
            :disabled="!isDestruction(detail.state)"
            @click="changeShow(destructionRef)"
          >
            {{ t('ins.detail.destruction') }}
          </el-button>
          <!-- 更多操作 -->
          <Select
            v-if="insMoreList.length"
            class="ml10"
            :one-menu-width="moreSelectOneMenuWidth"
            :select-width="moreSelectOneMenuWidth"
            :list="insMoreList"
            two-menu-align="lt"
            :ph="t('ins.list.more')"
            @opt-click="moreOptClickFn"
          />
        </div>
      </template>
    </PageHeader>

    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="active" class="tabs" :tabs="tabs" @change="changeTab" />
      </div>
    </div>

    <div style="padding: 20px">
      <!-- 基本信息 -->
      <Info v-if="active === 1" :detail="detail" :loading="loading" @success="listInstanceDetailFn" />
      <Log v-if="active === 2" :detail="detail" :operate-type="1" />
      <Disk v-if="active === 3" :detail="detail" @success="listInstanceDetailFn" />
      <NetworkCard v-if="active === 4" :detail="detail" @success="listInstanceDetailFn" />
      <PublicIp v-if="active === 5" :detail="detail" @success="listInstanceDetailFn" />
      <Monitor v-if="active === 6" :detail="detail" @success="listInstanceDetailFn" />
      <!-- <SecurityGroup v-if="active === 6" :detail="detail" @success="listInstanceDetailFn" /> -->
      <AssociateSecurityGroup v-if="active === 7" :eni-id="eniId" />
    </div>

    <!-- 开机 -->
    <PowerOn ref="powerOnRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 关机 -->
    <Shutdown ref="shutdownRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 续费 -->
    <Renew ref="renewRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 重启 -->
    <Restart ref="restartRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 重置密码 -->
    <SetPwd ref="setPwdRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 销毁/退还 -->
    <Destruction ref="destructionRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 修改名称 -->
    <SetName ref="setNameRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 设置自动续费 -->
    <SetAutoRenew ref="setAutoRenewRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 设置定时快照策略 -->
    <SetSnapshotPolicy ref="setSnapshotRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 加入安全组 -->
    <JoinSecurityGroup ref="joinSecurityGroupRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 加载密钥 -->
    <SetSshKey
      ref="setSshKeyRef"
      :ins-list="setSshKeyConfig.list"
      :type="setSshKeyConfig.type"
      @success="listInstanceDetailFn"
    />
    <!-- 分配至项目 -->
    <SetProject ref="setProjectRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 调整配置 -->
    <SetConfig ref="setConfigRef" :ins-list="[detail]" :type="setSshKeyConfig.type" @success="listInstanceDetailFn" />
    <!-- 调整网络 -->
    <SetNetwork ref="setNetworkRef" :ins-list="[detail]" @success="listInstanceDetailFn" />
    <!-- 按量转包年包月 -->
    <FlowToTime ref="flowToTimeRef" :ins-list="[detail]" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore, useCvmStore } from '@/store'
import Info from './components/info/index.vue'
import Disk from './components/disk/index.vue'
import NetworkCard from './components/network-card/index.vue'
import PublicIp from './components/public-ip/index.vue'
import Monitor from './components/monitor/index.vue'
import Log from '@/views/cvm/disk/detail/components/log.vue'
import AssociateSecurityGroup from '@/views/network/network-card/detail/components/associate-security-group/index.vue'
import {
  INS_MORE_OPTS,
  isSetName,
  isSetProject,
  isSetAutoRenew,
  isSetSshKey,
  isSetConfig,
  isPowerOn,
  isShutdown,
  isRestart,
  isDestruction,
  isSetPwd,
  isSetNetwork,
  isSetPrivateNetwork,
  isJoinSecurityGroup,
  isFlowToTime,
} from '@/views/cvm/ins/config'
import PowerOn from '../list/components/power-on/index.vue'
import Shutdown from '../list/components/shutdown/index.vue'
import Renew from '../list/components/renew/index.vue'
import Restart from '../list/components/restart/index.vue'
import SetPwd from '../list/components/set-pwd/index.vue'
import Destruction from '../list/components/destruction/index.vue'
import SetName from '../list/components/set-name/index.vue'
import SetAutoRenew from '../list/components/set-auto-renew/index.vue'
import SetSnapshotPolicy from '../list/components/set-snapshot-policy/index.vue'
import JoinSecurityGroup from '../list/components/join-security-group/index.vue'
import SetSshKey from '../list/components/set-ssh-key/index.vue'
import SetProject from '../list/components/set-project/index.vue'
import SetNetwork from '../list/components/set-network/index.vue'
import SetConfig from '../list/components/set-config/index.vue'
import FlowToTime from '../list/components/flow-to-time/index.vue'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { isDataDisk } from '@/views/cvm/disk/config'
import { useIns } from '@/views/cvm/hooks/use-ins'

import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { replaceRoute } from '@/utils/router-jump'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const moreSelectOneMenuWidthMap = {
  [ja]: 300,
  [en]: 260,
  [zh]: 200,
}
const moreSelectOneMenuWidth = useI18nStyle(moreSelectOneMenuWidthMap)
const route = useRoute()
const { listInstanceDetail, loading } = useIns()

const v = route.query.active as string

const active = ref(v ? Number(v) : 1)
const tabs = [
  { label: t('ins.detail.base'), value: 1 }, // 基本信息
  { label: t('ins.detail.log'), value: 2 }, // 操作日志
  { label: t('ins.detail.disk'), value: 3 }, // 云硬盘
  { label: t('ins.detail.netCard'), value: 4 }, // 弹性网卡
  { label: t('ins.detail.eip'), value: 5 }, // 弹性公网IP
  { label: t('ins.detail.monitor'), value: 6 }, // 监控
  { label: t('ins.detail.securityGroup'), value: 7 }, // 安全组
]
const id = ref<string>(route.params.id as string) // id
const detail = ref<any>({}) // 详情
const eniId = ref<number>(0) // 实例主网卡id

//加载密钥配置
const setSshKeyConfig = reactive<{
  type: 'STOPPED' | 'RUNNING'
  list: any[]
}>({
  list: [],
  type: 'STOPPED',
})

//调整配置
const setConfig = reactive<{
  type: 'STOPPED' | 'RUNNING'
  list: any[]
}>({
  type: 'STOPPED',
  list: [],
})

const powerOnRef = ref<InstanceType<typeof PowerOn>>() // 开机
const shutdownRef = ref<InstanceType<typeof Shutdown>>() // 关机
const renewRef = ref<InstanceType<typeof Renew>>() // 续费
const restartRef = ref<InstanceType<typeof Restart>>() // 重启
const setPwdRef = ref<InstanceType<typeof SetPwd>>() // 重置密码
const destructionRef = ref<InstanceType<typeof Destruction>>() // 销毁
const setNameRef = ref<InstanceType<typeof SetName>>() // 修改名称
const setAutoRenewRef = ref<InstanceType<typeof SetAutoRenew>>() // 设置自动续费
const setSnapshotRef = ref<InstanceType<typeof SetSnapshotPolicy>>() // 设置定时快照策略
const joinSecurityGroupRef = ref<InstanceType<typeof JoinSecurityGroup>>() // 加入安全组
const setSshKeyRef = ref<InstanceType<typeof SetSshKey>>() // 加载密钥
const setProjectRef = ref<InstanceType<typeof SetProject>>() // 分配至项目
const setNetworkRef = ref<InstanceType<typeof SetNetwork>>() // 调整网络
const setConfigRef = ref<InstanceType<typeof SetConfig>>() // 调整配置
const flowToTimeRef = ref<InstanceType<typeof FlowToTime>>() // 按量转包年包月

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 更多操作list
const insMoreList = computed(() => {
  const mapCb = el => {
    // 递归处理 children
    if (el.children) {
      const item = el.children.map(child => mapCb(child))
      return {
        ...el,
        children: item, // 将处理后的子元素赋值给 children
      }
    } else {
      return {
        ...el,
        disabled: selectOptDisabled(el),
      }
    }
  }

  const filterCb = el => {
    // 递归过滤 children
    if (el.children) {
      el.children = el.children.filter(filterCb)
      // 移除为空的 children
      return el.children.length > 0
    } else {
      // 判断不同厂商支持的功能
      if (el.perm) {
        return checkPermission(el.perm)
      } else {
        return true
      }
    }
  }

  return INS_MORE_OPTS.map(mapCb).filter(filterCb)
})

const changeTab = tab => {
  console.log(`changeTab===>`, tab)

  replaceRoute({
    name: 'ins_detail',
    query: {
      active: tab.value,
    },
  })
}

// select opt disabled 更多操作
const selectOptDisabled = (v: any) => {
  // console.log(`selectOptDisabled===>`, v)

  // 修改名称
  if (v.value === 'setName') {
    return !isSetName(detail.value.state)
  }

  // 分配至项目
  if (v.value === 'setProject') {
    return !isSetProject(detail.value.state)
  }

  // 设置自动续费
  if (v.value === 'setAutoRenew') {
    return !isSetAutoRenew(detail.value.instanceChargeType, detail.value.state)
  }

  // 设置定时快照策略
  if (v.value === 'setSnapshot') {
    const diskInfos = detail.value.diskInfos || []
    // return !isSetSnapshot(diskInfos.map(el => el.state))
    return diskInfos.filter(el => isDataDisk(el.type)).length ? false : true
  }

  // 加载密钥
  if (v.value === 'setSshKey') {
    return !isSetSshKey(detail.value.state, detail.value.imageInfo?.platform)
  }

  // 调整配置
  if (v.value === 'setResource') {
    return !isSetConfig(detail.value.state)
  }

  // 调整网络
  if (v.value === 'setNetwork') {
    const networkInfo = (detail.value?.networkInfos || []).find(item => item.primaryType === 1)
    return !isSetNetwork(detail.value.state, networkInfo)
  }

  // 切换私有网络
  if (v.value === 'setPrivateNetwork') {
    return !isSetPrivateNetwork()
  }

  // 加入安全组
  if (v.value === 'joinSecurityGroup') {
    return !isJoinSecurityGroup(detail.value.state)
  }

  // 按量转包年包月
  if (v.value === 'flowToTime') {
    return !isFlowToTime(detail.value.instanceChargeType, detail.value.state)
  }

  return true
}

// 点击更多操作opt
const moreOptClickFn = (item: any) => {
  switch (item.value) {
    // 修改名称
    case 'setName':
      changeShow(setNameRef.value)
      break
    // 分配至项目
    case 'setProject':
      changeShow(setProjectRef.value)
      break
    // 设置自动续费
    case 'setAutoRenew':
      changeShow(setAutoRenewRef.value)
      break
    // 设置定时快照策略
    case 'setSnapshot':
      changeShow(setSnapshotRef.value)
      break
    // 加载密钥
    case 'setSshKey':
      setSshKeyConfig.type = detail.value.state
      setSshKeyConfig.list = [detail.value]
      changeShow(setSshKeyRef.value)
      break
    // 加入安全组
    case 'joinSecurityGroup':
      changeShow(joinSecurityGroupRef.value)
      break
    // 调整配置
    case 'setConfig':
      setConfig.type = detail.value.state
      setConfig.list = [detail.value]
      changeShow(setConfigRef.value)
      break
    // 调整网络
    case 'setNetwork':
      changeShow(setNetworkRef.value)
      break
    // 按量转包年包月
    case 'flowToTime':
      changeShow(flowToTimeRef.value)
      break
    default:
      break
  }
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 获取服务器详细信息
const listInstanceDetailFn = () => {
  const params = {
    instanceId: id.value,
  }

  const cb = (res: any) => {
    if (res.success) {
      detail.value = res.data?.[0] || {}
      getEniId()
    }
  }

  listInstanceDetail(params, cb)
}

// 获取实例主网卡id
const getEniId = () => {
  const networkInfos = detail.value.networkInfos
  // 获取主网卡
  const item = networkInfos.find(item => item.primaryType === 1)
  if (item) {
    eniId.value = item.eniId
  }
}

provide('listInstanceDetailFn', listInstanceDetailFn)

onMounted(async () => {
  useTempStore().setPageHeader(false)
  listInstanceDetailFn()
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

/* .select-opts {
  :deep(.el-select-dropdown__wrap) {
    max-height: 500px !important;
  }
} */
</style>
