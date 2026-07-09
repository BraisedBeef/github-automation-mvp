<template>
  <div>
    <el-row v-loading="loading" :gutter="20">
      <el-col :span="16">
        <el-card shadow="never" class="page-box mb20" :body-style="bodyStyle">
          <div class="tit mb20">
            {{ t('ins.info.insInfo') }}
          </div>
          <table class="detail-wrap mb20 w-full">
            <tbody>
              <tr>
                <td class="pr20">
                  <!-- 实例ID -->
                  <div class="item mb20">
                    <div class="key-wrap">
                      {{ t('ins.info.insId') }}
                    </div>
                  </div>
                </td>
                <td class="pr20 w-50">
                  <div class="item mb20">
                    <div class="value">
                      {{ detail.insUuid || '-' }}
                    </div>
                  </div>
                </td>
                <td class="pr20">
                  <!-- 实例名称 -->
                  <div class="item mb20">
                    <div class="key-wrap">
                      {{ t('ins.info.insName') }}
                    </div>
                  </div>
                </td>
                <td class="w-50">
                  <div class="item mb20">
                    <div class="value df">
                      <span class="mr4">{{ detail.instanceName || '_' }}</span>
                      <SvgIcon
                        v-if="checkPermission(permMap.ins.RENAME_VM)"
                        name="edit"
                        class="edit-icon pointer"
                        @click="changeShow(setNameRef)"
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="pr20">
                  <!-- 地域 -->
                  <div class="item mb20">
                    <div class="key-wrap">
                      {{ t('ins.info.region') }}
                    </div>
                  </div>
                </td>
                <td class="pr20 w-50">
                  <div class="item mb20">
                    <div class="value">
                      {{ detail.regionName || '-' }}
                    </div>
                  </div>
                </td>
                <td class="pr20">
                  <!-- 可用区 -->
                  <div class="item mb20">
                    <div class="key-wrap">
                      {{ t('ins.info.zone') }}
                    </div>
                  </div>
                </td>
                <td class="w-50">
                  <div class="item mb20">
                    <div class="value">
                      {{ detail.zoneName || '_' }}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="pr20">
                  <!-- 操作系统-->
                  <div class="item mb20">
                    <div class="key-wrap">
                      {{ t('ins.info.sys') }}
                    </div>
                  </div>
                </td>
                <td class="pr20 w-50">
                  <div class="item mb20">
                    <div class="value">
                      <span>{{ detail.imageInfo?.imageName || '-' }}</span>
                      <span
                        v-if="checkPermission(permMap.ins.RESET_VM_SYSTEM) && isSetSystem(detail.state)"
                        class="ml20 text-primary cursor-pointer"
                        @click="changeShow(setSystemRef)"
                        >{{ t('ins.info.reinstallSys') }}</span
                      >
                    </div>
                  </div>
                </td>
                <td class="pr20">
                  <!-- 实例配置  -->
                  <div class="item mb20">
                    <div class="key-wrap">
                      {{ t('ins.info.insConfig') }}
                    </div>
                  </div>
                </td>
                <td class="w-50">
                  <div class="item mb20">
                    <div class="value">
                      <span>{{ insConfig }}</span>
                      <span
                        v-if="checkPermission(permMap.ins.RESET_VM_UNIT) && isSetConfig(detail.state)"
                        class="ml20 text-primary cursor-pointer"
                        @click="changeShow(setConfigRef)"
                        >{{ t('ins.info.setConfig') }}</span
                      >
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="pr20">
                  <!-- 所属项目-->
                  <div class="item">
                    <div class="key-wrap">
                      {{ t('ins.info.project') }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="item">
                    <div class="value">
                      {{ detail.projectName || '_' }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </el-card>

        <el-card shadow="never" class="page-box" :body-style="bodyStyle">
          <div class="tit mb20">
            {{ t('ins.info.costInfo') }}
          </div>

          <el-row class="detail-wrap mb20 w-full">
            <el-col :span="24">
              <div class="df">
                <div class="detail-wrap-left">
                  <!-- 实例计费模式 -->
                  <div class="item mb20">
                    <div class="key-wrap">
                      {{ t('ins.info.insCostType') }}
                    </div>
                  </div>
                  <!-- 创建时间 -->
                  <div class="item mb20">
                    <div class="key-wrap df ac">
                      <span>{{ t('ins.info.createTime') }}</span>
                      <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                        <SvgIcon name="cat-cdn-help" class="ml10" />
                      </el-tooltip>
                    </div>
                  </div>
                  <!-- 网络计费模式-->
                  <div class="item mb20">
                    <div class="key-wrap">
                      {{ t('ins.info.netCostType') }}
                    </div>
                  </div>
                  <!-- 到期时间-->
                  <div class="item">
                    <div class="key-wrap df ac">
                      <span>{{ t('ins.info.expiredTime') }}</span>
                      <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                        <SvgIcon name="cat-cdn-help" class="ml10" />
                      </el-tooltip>
                    </div>
                  </div>
                </div>
                <div class="detail-wrap-right">
                  <div class="item mb20">
                    <div class="value">
                      {{ COST_TYPE_MAP[detail.instanceChargeType] }}
                    </div>
                  </div>
                  <div class="item mb20">
                    <div class="value">
                      {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
                    </div>
                  </div>
                  <div class="item mb20">
                    <div class="value">
                      <span>{{ networkChangeType }}</span>
                      <!-- 修改计费模式 -->
                      <span
                        v-if="checkPermission(permMap.ins.CVM_UPDATE_NETWORK)"
                        class="ml20 cursor-pointer"
                        :class="isEditNetWork ? 'text-primary' : 'disabled-text'"
                        @click="isEditNetWork ? changeShow(setNetworkRef) : () => {}"
                        >{{ t('ins.info.setNetCostType') }}</span
                      >
                    </div>
                  </div>
                  <div class="item">
                    <div class="value">
                      {{ detail.expiresTime ? maoYunDayJs(detail.expiresTime).format(FORMAT_TIME) : '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8" class="h-full">
        <el-card shadow="never" class="page-box" :body-style="bodyStyle">
          <div class="config-wrap h-full">
            <div class="status-wrap df ac" style="margin-bottom: 8px">
              <div class="lt df ac">
                <SvgIcon
                  style="width: 24px; height: 24px; margin-right: 10px"
                  :name="INS_STATE_SVG_MAP[detail.state] || ''"
                />
                <StatusGroup :dot="false" :list="INS_STATE_ARR_MAP" :value="detail.state" />
              </div>
              <div class="ml10 mr10 line" />
              <div class="rt df ac">
                <StatusGroup
                  :list="[
                    {
                      text: t('ins.info.monitoring'),
                      color: '#02DE6D',
                      value: 1,
                    },
                  ]"
                  :value="1"
                />
              </div>
            </div>
            <!-- 云硬盘 -->
            <Disk v-if="diskList.length" :list="diskList" @expans="changeShow(expansRef)" />
            <!-- 网卡 -->
            <NetworkCard v-if="networkList.length" :list="networkList" />
            <!-- 弹性公网IP -->
            <Ip v-if="ipList.length" :list="ipList" />
            <!-- 安全组 -->
            <SecurityGroup v-if="securityGroupList.length" :list="securityGroupList" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 重装系统 -->
    <SetSystem ref="setSystemRef" :ins-list="[detail]" :type="detail.state" @success="getDetail" />
    <!-- 调整配置 -->
    <SetConfig ref="setConfigRef" :ins-list="[detail]" :type="detail.state" @success="getDetail" />
    <!-- 云硬盘扩容 -->
    <Expans ref="expansRef" :ins-list="[detail]" @success="getDetail" />
    <!-- 修改名称 -->
    <SetName ref="setNameRef" :ins-list="[detail]" @success="getDetail" />
    <!-- 调整网络 -->
    <SetNetwork ref="setNetworkRef" :ins-list="[detail]" @success="getDetail" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import SetSystem from '@/views/cvm/ins/list/components/set-system/index.vue'
import SetConfig from '@/views/cvm/ins/list/components/set-config/index.vue'
import Expans from '@/views/cvm/ins/list/components/expans/index.vue'
import SetName from '@/views/cvm/ins/list/components/set-name/index.vue'
import SetNetwork from '@/views/cvm/ins/list/components/set-network/index.vue'
import Disk from './disk.vue'
import NetworkCard from './network-card.vue'
import Ip from './ip.vue'
import SecurityGroup from './security-group.vue'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import {
  INS_STATE_ARR_MAP,
  INS_NETWORK_CHANGE_TYPE_MAP,
  COST_TYPE_MAP,
  isSetConfig,
  isSetSystem,
  INS_STATE_SVG_MAP,
} from '@/views/cvm/ins/config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'

interface PropType {
  detail: any
  loading: boolean
}

const props = withDefaults(defineProps<PropType>(), {
  detail: () => ({}),
  loading: false,
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const bodyStyle = { height: '100%' }

const setSystemRef = ref<InstanceType<typeof SetSystem>>() // 重装操作系统
const setConfigRef = ref<InstanceType<typeof SetConfig>>() // 调整配置
const expansRef = ref<InstanceType<typeof Expans>>() // 云硬盘扩容
const setNameRef = ref<InstanceType<typeof SetName>>() // 修改名称
const setNetworkRef = ref<InstanceType<typeof SetNetwork>>() // 调整网络

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const insConfig = computed(() => {
  return `${props.detail.specificationInfo?.typeName} ${t('ins.config.cores', [props.detail.specificationInfo?.vcpus])} ${props.detail.specificationInfo?.ram}GB`
})

// 网络计费模式
const networkChangeType = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1) // 主网卡

  return res ? INS_NETWORK_CHANGE_TYPE_MAP[res.networkChangeType] || '-' : '-'
})

// 硬盘集合
const diskList = computed(() => {
  const diskInfos = props.detail.diskInfos || []
  const sysDisks = diskInfos.filter(el => el.type === 1)
  const dataDisks = diskInfos.filter(el => el.type === 2)
  return [...sysDisks, ...dataDisks]
})

// 网卡
const networkList = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const mainNetworks = networkInfos.filter(el => el.primaryType === 1)
  const subNetworks = networkInfos.filter(el => el.primaryType !== 1)
  return [...mainNetworks, ...subNetworks]
})

// ip
const ipList = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const mainNetwork = networkInfos.find(el => el.primaryType === 1)
  return mainNetwork?.eips || []
})

// 安全组
const securityGroupList = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const mainNetwork = networkInfos.find(el => el.primaryType === 1)
  return mainNetwork?.securityGroups || []
})

// 是否能点击修改计费模式
const isEditNetWork = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1) // 主网卡
  return res?.eipBindFlag
})

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const getDetail = () => {
  emits('success')
}
</script>

<style lang="scss" scoped>
.tit {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #000;
}

.detail-wrap {
  .detail-wrap-left {
    margin-right: 20px;
  }

  .item {
    .key-wrap {
      // width: 125px;

      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
      white-space: nowrap;
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
  }
}

.config-wrap {
  /* flex-direction: column; */

  .status-wrap {
    margin-bottom: 8px;

    .lt {
      // placeholder
    }

    .rt {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #000;
    }
  }

  .line {
    width: 1px;
    height: 17px;
    background: #ddd;
  }
}

.edit-icon {
  position: relative;
  top: 4px;
}

.disabled-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #0063ff;
  cursor: not-allowed;
  opacity: 0.5;
}

.pr20 {
  padding-right: 20px;
}

.w-50 {
  width: 50%;
}
</style>
